/**
 * Systrum Store + USB Stripe Checkout (TEST MODE ONLY).
 *
 * Requires STRIPE_SECRET_KEY starting with sk_test_. Live keys are refused.
 * Fans pay with card / Apple Pay; no wallets shown in the UI.
 *
 * Endpoints:
 *   GET  /health
 *   POST /create-session   — JSON cart → Stripe Checkout URL
 *   GET  /go?p=<b64url>    — navigational checkout (USB WebView-safe; no Turnstile)
 *   POST /webhook/stripe   — optional; mints ownership pass after payment when wired
 */

import express from "express";
import Stripe from "stripe";
import { ensureFanWallet } from "./fan-wallet.mjs";

const PORT = Number(process.env.PORT || 3342);
const KEY = process.env.STRIPE_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const ALLOW_HOST_SUFFIXES = (process.env.CHECKOUT_REDIRECT_HOST_SUFFIXES ||
  "localhost,127.0.0.1,dmgdistro.com,skillitboss.com,brandingnovation.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function assertTestModeKey(key) {
  if (!key) {
    return { ok: false, error: "Set STRIPE_SECRET_KEY (sk_test_... only)." };
  }
  if (key.startsWith("sk_live_")) {
    return {
      ok: false,
      error:
        "REFUSED: live Stripe keys are blocked until Kenneth connects live Stripe. Use sk_test_ only.",
    };
  }
  if (!key.startsWith("sk_test_")) {
    return { ok: false, error: "STRIPE_SECRET_KEY must start with sk_test_." };
  }
  return { ok: true };
}

function hostAllowed(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    return ALLOW_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    );
  } catch {
    return false;
  }
}

function decodeGoPayload(p) {
  const raw = String(p || "").trim();
  if (!raw || raw.length > 8000) return null;
  try {
    const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - (raw.length % 4));
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const json = Buffer.from(b64, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function goErrorHtml(message, backHref) {
  const safe = String(message || "Checkout unavailable.")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const back = backHref
    ? `<p><a href="${String(backHref).replace(/"/g, "&quot;")}">Back</a></p>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Checkout</title>
<style>body{font-family:system-ui,sans-serif;background:#080808;color:#f0f0f0;padding:2rem;max-width:28rem;margin:0 auto}a{color:#c41e2a}</style></head>
<body><h1>Checkout</h1><p>${safe}</p>${back}</body></html>`;
}

async function createSession(body) {
  const gate = assertTestModeKey(KEY);
  if (!gate.ok) {
    const err = new Error(gate.error);
    err.statusCode = 503;
    throw err;
  }

  const stripe = new Stripe(KEY);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    const err = new Error('Missing or empty "items" array.');
    err.statusCode = 400;
    throw err;
  }
  const success_url = String(body.success_url || "");
  const cancel_url = String(body.cancel_url || "");
  if (!hostAllowed(success_url) || !hostAllowed(cancel_url)) {
    const err = new Error("Invalid success or cancel URL.");
    err.statusCode = 400;
    throw err;
  }

  const email = body.email || body.customer_email;
  // Custodial wallet behind email — never returned to the fan UI.
  let walletMeta = {};
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    const fan = await ensureFanWallet(String(email));
    walletMeta = {
      fan_wallet: fan.address,
      fan_email_hash: fan.emailHash,
    };
  }

  const feePct = Math.min(50, Math.max(0, Number(body.platform_fee_pct) ?? 15)) / 100;
  const storeId = body.store ? String(body.store).slice(0, 64) : "systrum-store";

  const line_items = items.map((item) => {
    const amount = Math.max(50, Math.round(Number(item.amount_cents) || 0));
    const quantity = Math.max(1, Math.min(99, Math.round(Number(item.quantity) || 1)));
    const title = (item.title && String(item.title).slice(0, 500)) || "Systrum item";
    return {
      price_data: {
        currency: "usd",
        unit_amount: amount,
        product_data: { name: title },
      },
      quantity,
    };
  });

  const metadata = {
    source: "systrum-store",
    store: storeId,
    mode: "test",
    platform_fee_pct: String(Math.round(feePct * 100)),
    artist_share_pct: String(Math.round((1 - feePct) * 100)),
    chain: "base-sepolia",
    ...walletMeta,
  };
  if (body.metadata && typeof body.metadata === "object") {
    for (const [k, v] of Object.entries(body.metadata)) {
      if (v == null) continue;
      metadata[String(k).slice(0, 40)] = String(v).slice(0, 500);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url,
    cancel_url,
    metadata,
    customer_email:
      email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))
        ? String(email)
        : undefined,
  });

  return { ok: true, url: session.url, id: session.id, mode: "test" };
}

const app = express();

app.get("/health", (_req, res) => {
  const gate = assertTestModeKey(KEY);
  res.json({
    ok: true,
    service: "systrum-store-checkout",
    stripe_configured: gate.ok,
    stripe_mode: "test",
    chain: "base-sepolia",
  });
});

app.get("/go", async (req, res) => {
  const packed = decodeGoPayload(String(req.query.p || ""));
  const body = packed || {};
  try {
    const result = await createSession(body);
    return res.redirect(303, result.url);
  } catch (err) {
    const code = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    return res
      .status(code)
      .type("html")
      .send(goErrorHtml(err.message, body.cancel_url));
  }
});

app.post("/create-session", express.json(), async (req, res) => {
  try {
    const result = await createSession(req.body || {});
    res.json(result);
  } catch (err) {
    const code = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    res.status(code).json({ ok: false, error: err.message || "Checkout failed." });
  }
});

app.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const gate = assertTestModeKey(KEY);
    if (!gate.ok) return res.status(503).send(gate.error);
    if (!WEBHOOK_SECRET) return res.status(503).send("STRIPE_WEBHOOK_SECRET not set.");

    const stripe = new Stripe(KEY);
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // Hook point: mint ownership pass on Base Sepolia via relayer using session.metadata.fan_wallet
      console.log(
        "[systrum] paid session",
        session.id,
        "fan_wallet=",
        session.metadata?.fan_wallet || "(none)",
        "tier=",
        session.metadata?.tier || ""
      );
    }
    res.json({ received: true });
  }
);

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("stripe-server.mjs")) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Systrum Stripe test checkout on :${PORT}`);
    const gate = assertTestModeKey(KEY);
    if (!gate.ok) console.warn("Stripe:", gate.error);
  });
}

export { app, createSession, assertTestModeKey };
