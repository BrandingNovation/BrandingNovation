# IPFS node path (Systrum)

## Why Kubo

Free, self-hosted, no API key. Enough for the testnet first slice.

## Run

1. Download Kubo `v0.32.1+` for your OS from [ipfs/kubo releases](https://github.com/ipfs/kubo/releases).
2. `ipfs init`
3. `ipfs daemon` (API `127.0.0.1:5001`, gateway `127.0.0.1:8080`)
4. From `packages/systrum-store`: `npm run ipfs:upload -- /path/to/album`

## Album layout

```
album/
  audio/*.mp3
  artwork/*.jpg
  metadata/album.json
```

## Durability

Local pin is lost if the node disk is wiped. For longer retention: keep the daemon on a BN host, or pin the CID to a pinning service Kenneth chooses later. Still no mainnet / paid requirement for this slice.
