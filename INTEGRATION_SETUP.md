# BAITANDSTRIKE production integration

The storefront ships in `mock` mode. Set the hosted environment variables below only after the DOKU and Mabang credentials have been issued.

## Runtime configuration

- `INTEGRATION_MODE=production`
- `STORE_PUBLIC_URL=https://baitandstrike.fachry25y.chatgpt.site`
- `DOKU_BASE_URL`
- `DOKU_CLIENT_ID`
- `DOKU_SECRET_KEY`
- `DOKU_NOTIFICATION_TOKEN`
- `MABANG_BASE_URL`
- `MABANG_APP_KEY`
- `MABANG_APP_SECRET`
- `MABANG_ORDER_ENDPOINT`
- `MABANG_WEBHOOK_TOKEN`

## Callback URLs

- DOKU notification: `/api/webhooks/doku`
- Mabang order, inventory, fulfillment, AWB and tracking callback: `/api/webhooks/mabang`
- Readiness check: `/api/integrations/status`

Before enabling production, confirm the final Mabang request field names, signing method, and endpoint path against the API access granted to the merchant account. J&T remains connected through Mabang; the storefront receives the resulting AWB and tracking updates from Mabang.
