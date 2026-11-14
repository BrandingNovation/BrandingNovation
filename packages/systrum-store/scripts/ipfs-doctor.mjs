#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const deploy = join(__dirname, "..", "deployments", "ykidr-ipfs.json");

const id = spawnSync("ipfs", ["id", "--format=<id>"], { encoding: "utf8" });
if (id.status !== 0) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        ipfs: "not_running",
        howto: [
          "Install Kubo from https://github.com/ipfs/kubo/releases",
          "ipfs init",
          "ipfs daemon",
          "npm run ipfs:upload -- /path/to/ykidr-album",
        ],
      },
      null,
      2
    )
  );
  process.exit(1);
}

let ykidr = null;
if (existsSync(deploy)) {
  ykidr = JSON.parse(readFileSync(deploy, "utf8"));
}

console.log(
  JSON.stringify(
    {
      ok: true,
      peer_id: id.stdout.trim(),
      api: "http://127.0.0.1:5001",
      gateway: "http://127.0.0.1:8080",
      ykidr,
    },
    null,
    2
  )
);
