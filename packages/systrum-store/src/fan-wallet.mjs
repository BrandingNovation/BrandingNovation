/**
 * Custodial fan wallets for Systrum.
 *
 * Fans sign in with email only. A deterministic wallet is derived server-side
 * from FAN_WALLET_SECRET + email. Seed phrases / private keys are NEVER
 * returned to API responses that face the fan UI.
 */

import { createHash, createHmac } from "node:crypto";
import { Wallet } from "ethers";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE_PATH =
  process.env.FAN_WALLET_STORE_PATH ||
  join(__dirname, "..", "deployments", "fan-wallets.test.json");

function secret() {
  const s = process.env.FAN_WALLET_SECRET || "systrum-dev-only-change-me";
  if (s === "systrum-dev-only-change-me") {
    console.warn(
      "[fan-wallet] Using DEV secret. Set FAN_WALLET_SECRET before any shared deploy."
    );
  }
  return s;
}

function emailHash(email) {
  return createHash("sha256")
    .update(String(email).trim().toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

function loadStore() {
  if (!existsSync(STORE_PATH)) return { wallets: {} };
  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf8"));
  } catch {
    return { wallets: {} };
  }
}

function saveStore(data) {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

/**
 * @returns {{ address: string, emailHash: string, created: boolean }}
 * Private key is persisted server-side only; never included in return value.
 */
export async function ensureFanWallet(email) {
  const normalized = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Valid email required for fan wallet.");
  }

  const hash = emailHash(normalized);
  const db = loadStore();
  if (db.wallets[hash]?.address) {
    return { address: db.wallets[hash].address, emailHash: hash, created: false };
  }

  const material = createHmac("sha256", secret())
    .update(`systrum:fan:${normalized}`)
    .digest("hex");
  const wallet = new Wallet(`0x${material}`);

  db.wallets[hash] = {
    address: wallet.address,
    // Encrypted-at-rest would be better; for testnet scaffold we store HMAC material ref only.
    pk_ref: `hmac:${hash}`,
    created_at: new Date().toISOString(),
    chain: "base-sepolia",
  };
  // Store private key in a separate secrets file when FAN_WALLET_PERSIST_KEYS=1 (local test only).
  if (process.env.FAN_WALLET_PERSIST_KEYS === "1") {
    const secretsPath = STORE_PATH.replace(/\.json$/, ".secrets.json");
    let secrets = {};
    if (existsSync(secretsPath)) {
      try {
        secrets = JSON.parse(readFileSync(secretsPath, "utf8"));
      } catch {
        secrets = {};
      }
    }
    secrets[hash] = wallet.privateKey;
    writeFileSync(secretsPath, JSON.stringify(secrets, null, 2), { mode: 0o600 });
  }

  saveStore(db);
  return { address: wallet.address, emailHash: hash, created: true };
}

/** Relayer helper — server only. */
export function loadFanPrivateKey(email) {
  if (process.env.FAN_WALLET_PERSIST_KEYS !== "1") {
    const material = createHmac("sha256", secret())
      .update(`systrum:fan:${String(email).trim().toLowerCase()}`)
      .digest("hex");
    return `0x${material}`;
  }
  const hash = emailHash(email);
  const secretsPath = STORE_PATH.replace(/\.json$/, ".secrets.json");
  const secrets = JSON.parse(readFileSync(secretsPath, "utf8"));
  return secrets[hash];
}

if (process.argv.includes("--demo")) {
  const demo = await ensureFanWallet("fan@example.com");
  console.log(
    JSON.stringify(
      {
        note: "Demo only — address for custodial fan; no seed phrase shown",
        ...demo,
      },
      null,
      2
    )
  );
}
