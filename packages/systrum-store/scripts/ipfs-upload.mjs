#!/usr/bin/env node
/**
 * Upload a local album folder to a running Kubo IPFS node (API :5001).
 *
 * Usage:
 *   node scripts/ipfs-upload.mjs /path/to/album
 *   YKIDR_DIR=/tmp/ykidr-album npm run ipfs:upload
 *
 * Runnable node path (documented):
 *   1. Install Kubo: https://docs.ipfs.tech/install/command-line/
 *   2. ipfs init && ipfs daemon
 *   3. npm run ipfs:upload -- /path/to/album
 */

import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const albumDir = resolve(
  process.argv[2] || process.env.YKIDR_DIR || "/tmp/ykidr-album"
);

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || `${cmd} failed`);
    process.exit(r.status || 1);
  }
  return r.stdout.trim();
}

if (!existsSync(albumDir)) {
  console.error(
    `Album directory missing: ${albumDir}\n` +
      "Place YKIDR audio under audio/ and artwork under artwork/, or set YKIDR_DIR."
  );
  process.exit(2);
}

const doctor = spawnSync("ipfs", ["id"], { encoding: "utf8" });
if (doctor.status !== 0) {
  console.error(
    "IPFS daemon not reachable. Start Kubo first:\n" +
      "  curl -fsSL https://raw.githubusercontent.com/ipfs/kubo/master/install.sh | bash\n" +
      "  ipfs init && ipfs daemon\n"
  );
  process.exit(1);
}

console.log(`Uploading ${albumDir} ...`);
const cid = run("ipfs", ["add", "-r", "--cid-version=1", "--quieter", albumDir]);
console.log(`CID: ${cid}`);
console.log(`Local gateway: http://127.0.0.1:8080/ipfs/${cid}`);
console.log(`Public gateway: https://ipfs.io/ipfs/${cid}`);

const outDir = join(root, "deployments");
mkdirSync(outDir, { recursive: true });
const record = {
  album: "YKIDR",
  title: "Y'all Know I Don't Rap",
  artist: "Lil Bru",
  cid,
  uploaded_at: new Date().toISOString(),
  source_dir: albumDir,
  note: "Pinned on local Kubo node. Keep daemon running or re-pin / use a pinning service for durability.",
};
writeFileSync(join(outDir, "ykidr-ipfs.json"), JSON.stringify(record, null, 2));
console.log(`Wrote deployments/ykidr-ipfs.json`);
