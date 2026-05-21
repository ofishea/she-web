# SHE Web — Paystack Transparency Portal

A single-page public dashboard for **Sangotedo Housing Estate** that displays Paystack transactions grouped by dedicated virtual account (DVA). Visitors can select an account and browse its payment history without signing in.

## How it works

Paystack does not expose a “transactions for DVA X” endpoint. This app:

1. Lists all **dedicated virtual accounts** on your integration (`GET /dedicated_account`)
2. Lists **successful transactions** (`GET /transaction?status=success`)
3. Assigns each transaction to a DVA using:
   - `authorization.receiver_bank_account_number` (primary), or
   - Customer ID for `dedicated_nuban` / `bank_transfer` channels
4. Puts unmatched transactions under **Other transactions** (card, USSD, etc.)
5. Loads **Paystack balance** (`GET /balance`) and **outgoing transfers** (`GET /transfer`)

The Paystack **secret key** is used only in Next.js Route Handlers (`/api/transparency`), so it never ships to the browser.

Visitors switch between **Incoming payments** (by DVA) and **Outgoing transfers** using tabs below the stats bar.

## Setup

```bash
cd she-web
cp .env.example .env.local
# Edit .env.local and set PAYSTACK_SECRET_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Yes | Paystack secret key (`sk_live_…` or `sk_test_…`) |
| `PAYSTACK_MAX_TRANSACTION_PAGES` | No | Max transaction API pages (default `20` × 100 rows) |
| `PAYSTACK_MAX_TRANSFER_PAGES` | No | Max transfer API pages (default `20` × 100 rows) |
| `NEXT_PUBLIC_SITE_NAME` | No | Header title (default: Sangotedo Housing Estate) |

## Deploy

Works on Vercel, Netlify, or any Node host that supports Next.js:

1. Set the same environment variables in the host dashboard
2. `npm run build && npm start`

## Security note

This portal is meant for **transparency**, not for hiding data. Anyone with the URL can see transaction summaries. Do not commit `.env.local` or share your secret key publicly.
