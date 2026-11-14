# Systrum Store (free / testnet slice)

Direct-to-fan ownership passes for Branding Novation / Kenneth.

## Hard rules

- **Chain:** Base **Sepolia only** (84532). No mainnet deploys.
- **Stripe:** `sk_test_` only. Live keys are refused in code.
- **Fans:** email login → custodial wallet behind the scenes. No seed phrases in the UI.
- **Split:** default **85% artist / 15% label**, configurable on-chain. Ownership transfers; ERC-2981 resale royalty to artist.

## Layout

| Path | Purpose |
|------|---------|
| `contracts/SystrumStore.sol` | Ownership pass, primary split, resale royalty |
| `script/DeployBaseSepolia.s.sol` | Sepolia-only deploy script |
| `src/stripe-server.mjs` | Stripe Checkout test scaffolding + `/go` |
| `src/fan-wallet.mjs` | Custodial email → wallet |
| `scripts/ipfs-*.mjs` | Kubo upload / doctor |
| `usb-app/` | USB checkout 404 fix notes + `/go` patch |
| `deployments/` | CIDs + Sepolia addresses |

## IPFS (YKIDR)

Runnable node:

```bash
# Kubo
curl -fsSL https://github.com/ipfs/kubo/releases/download/v0.32.1/kubo_v0.32.1_linux-amd64.tar.gz | tar -xz
sudo mv kubo/ipfs /usr/local/bin/
ipfs init && ipfs daemon
```

Upload album folder (`audio/`, `artwork/`, `metadata/`):

```bash
npm run ipfs:upload -- /path/to/ykidr-album
npm run ipfs:doctor
```

First YKIDR pin from this slice (local Kubo): see `deployments/ykidr-ipfs.json`.

## Contracts

```bash
forge test -vv
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export DEPLOYER_PRIVATE_KEY=0x...
export ARTIST_WALLET=0x...
export LABEL_WALLET=0x...
npm run deploy:base-sepolia
```

## Stripe test checkout

```bash
cp .env.example .env   # set sk_test_...
npm install
npm run stripe:dev     # :3342
```

Wire USB / store fronts at `/checkout-api` → this service (or CRM). Prefer `GET /go?p=` for in-app browsers.

## USB checkout 404

See `usb-app/README.md`. Live host `usb.dmgdistro.com` paywall should use `/checkout-api/go`; `/api/*` must not SPA-fallback.
