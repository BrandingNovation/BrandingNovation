# Systrum USB checkout fix

Live host: `https://usb.dmgdistro.com` (YKIDR — *Y'all Know I Don't Rap*).

USB app source is **not** in an accessible BrandingNovation git repo (only a redirect stub at `DMG-Label-distribution-stack/sites/lilbru/usb/index.html`). Patches here are meant to be baked into the deployed USB static files (Hermes / host deploy).

## Checkout 404 — cause

1. `js/paywall.js` POSTs to `/checkout-api/create-session`.
2. CRM requires Cloudflare Turnstile for that POST → WebViews often fail → error UX.
3. `/api/*` on the USB host SPA-fallbacks to `index.html` (plan item: `/api/*` not SPA-fallback).

## Fix

1. Switch paywall checkout to navigational `GET /checkout-api/go?p=...` (see `paywall.checkout-go.patch.js`) — same pattern as Lil Bru `sites/lilbru/checkout.html`.
2. Caddy: `handle /api/*` and `handle /checkout-api/*` must `reverse_proxy` before any `try_files` / SPA fallback.
3. Bump SW cache to `systrum-usb-v38-ykidr` (or next) after baking.

## Stripe

Use **test mode** keys only until Kenneth connects live Stripe. Local scaffold: `packages/systrum-store` `npm run stripe:dev`.
