/**
 * USB checkout 404 / SPA-fallback fix (drop-in replacement for startCheckout body).
 *
 * Root cause on https://usb.dmgdistro.com:
 *  - Paywall POSTs to /checkout-api/create-session which requires Turnstile.
 *  - Failed/blocked fetch or HTML SPA fallback surfaces as checkout 404/unavailable.
 *  - Lil Bru checkout already uses navigational GET /checkout-api/go?p=... (no Turnstile).
 *
 * Apply: replace PaywallManager.startCheckout's fetch(/create-session) block with
 * goStripeOrFailover() below (or ship this file and call SystrumCheckout.startFromPaywall(this, tier)).
 *
 * Also ensure Caddy for usb.dmgdistro.com does NOT SPA-fallback /api/* or /checkout-api/*
 * (those must reverse_proxy to CRM). Live probe: GET /api/health currently returns index HTML.
 */

export function toB64Url(obj) {
  const s = JSON.stringify(obj);
  const b64 =
    typeof btoa === "function"
      ? btoa(unescape(encodeURIComponent(s)))
      : Buffer.from(s, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Prefer same-origin /go navigation (WebView-safe). Falls back to create-session fetch.
 */
export async function startCheckoutViaGo(paywall, tier, amountCents) {
  const tierInfo = paywall.constructor.TIERS[tier];
  const origin =
    window.location.origin +
    window.location.pathname.replace(/\/?index\.html$/, "/");
  const deviceId =
    (window.Analytics && Analytics.getOrCreateDeviceId()) ||
    localStorage.getItem("systrum_device_id") ||
    "";
  const focusTitle = (paywall._focusTrackTitle || "").trim();
  const lineTitle = focusTitle
    ? `${focusTitle} — ${tierInfo.name} access`
    : `${paywall.albumTitle} — ${tierInfo.name} access`;

  const payload = {
    items: [
      {
        id: `systrum-usb-${paywall.artistId}-${tier}`,
        title: lineTitle,
        amount_cents: amountCents,
        quantity: 1,
        product_type: "song",
        artist_id: paywall.artistId,
      },
    ],
    store: "systrum-usb",
    platform_fee_pct: 15,
    metadata: {
      tier,
      device_id: deviceId,
      artist_id: paywall.artistId,
      product: "systrum-usb",
      track_title: focusTitle || undefined,
      chain: "base-sepolia",
    },
    success_url: `${origin}?checkout=success&tier=${encodeURIComponent(tier)}&device_id=${encodeURIComponent(deviceId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}?checkout=cancel`,
  };

  const base = String(
    paywall.checkoutApi || `${window.location.origin}/checkout-api`
  ).replace(/\/$/, "");

  // Navigational path — matches CRM GET /v1/checkout/go (proxied as /checkout-api/go).
  window.location.href = `${base}/go?p=${encodeURIComponent(toB64Url(payload))}`;
}
