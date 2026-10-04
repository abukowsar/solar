# ছাদে সোলার · সংযোগ ডেস্ক (BD Rooftop Solar ↔ Solset)

Next.js app for Bangladesh's National Rooftop Solar Programme. Rooftop owners submit setup requests, service providers register by district, and a matching board connects the two. Each provider's leads then export into their [Solset AI](https://solset.ai) workspace.

## Source data (`docs/`)
| File | Used for |
|---|---|
| `fe3b2074-…pdf` — Power Division notification, 01-09-2026 | ৳10.50/unit net-metering tariff (৳8 cost cap + 20% profit + 11.25% premium), install-by 28-02-2027, paid until 28-02-2030, quarterly bank payout, BSTI/SREDA standards → `lib/data/policy.ts` |
| `tender_27083_0.pdf` — BPDB invitation 27.11.1500.750.4.21.2026-385 | Chattogram-division district offices, eligibility, ৳500 form / ৳5,000 registration fees, closing 27-09-2026 15:00, contact official → `lib/data/tender.ts` |

## Run
```bash
npm install
npm run dev        # http://localhost:3000
```
QR targets: owner poster → `/request?src=QR-B`, provider poster → `/provider`.

## Pages
- `/` overview and live stats · `/request` owner form with an earnings estimate · `/provider` registration with an eligibility check
- `/board` matching board (contact details unmask only for providers who express interest)
- `/solset` Solset CSV export and an optional webhook push · `/policy` the data from both documents

## Admin panel (`/admin`)
Sign in with `ADMIN_PASSWORD` from `.env.local`. Sessions are HMAC-signed, HttpOnly cookies that last 8 hours, and login is rate-limited to 5 failures per 10 minutes. Every admin page and every `/api/admin/*` route checks the session on the server.
- **ড্যাশবোর্ড:** totals, requests by district and stage, recent requests, audit log
- **সেটআপ অনুরোধ:** search and filter, full unmasked details, change stage, delete, CSV / Solset CSV export
- **প্রোভাইডার:** verify enlistment status, see declared documents and leads, delete, CSV
- **ডিজাইন:** Solset sync status, retry the push to Solset, delete, CSV
- **সাবস্ক্রাইবার:** filter by channel, role and district, delete, CSV for an SMS gateway or email tool
- **সেটিংস:** edit the notice ticker, the announcement banner and the header helpline (live on the site), and see which integrations are configured

## Solset integration
Solset has no public lead API. It imports leads by CSV (and via Zoho, WhatsApp and ad forms), so:
- `GET /api/solset/export?provider=<id>` returns a Solset-ready CSV of the leads that provider has taken interest in (`&format=json` gives a preview).
- `POST /api/solset/push {provider}` forwards the same leads as JSON to `SOLSET_WEBHOOK_URL`, for example a Zoho/Zapier flow into Solset.

See `.env.example` for `DATA_FILE`, `ADMIN_TOKEN` and `SOLSET_WEBHOOK_URL`.

## Before production
- Storage is a JSON file (`data/db.json`). This is fine on one server but not on serverless hosts; switch `lib/store.ts` to Postgres/SQLite.
- "Acting as provider" has no authentication. Add OTP login for providers before going live, because it controls who can see owners' phone numbers.
