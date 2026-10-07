# Ketronics LTD — E-Commerce Platform

Ketronics is a production-oriented Next.js e-commerce application for technology products and services in Kenya and East Africa.

## Stack

- **Next.js 16.3.8** + App Router
- **React 19.3**
- **TypeScript 5**
- **Tailwind CSS 4** + Radix/shadcn-style components
- **Supabase** Auth, PostgreSQL, RLS and Storage
- **Zustand** for client cart/session state
- **Zod** for API/input validation
- **M-Pesa Daraja** STK Push + provider-side verification
- **Stripe** webhook handling
- **Nodemailer** for server-side email
- **Vercel** / compatible Node hosting

## Core capabilities

- Product catalog, categories and inventory
- Persistent shopping cart
- Guest and authenticated checkout
- Atomic order creation with database-authoritative pricing
- Inventory reservation and stale-order release
- M-Pesa STK Push and callback processing
- Stripe webhook signature verification
- Customer accounts and order history
- Manager/admin administration
- Dynamic CMS pages, FAQs and contact information
- Supabase Storage product images
- Server-side authorization and database RLS
- Health endpoint and CI checks

## Architecture

Business-critical operations follow this pattern:

`Browser → Next.js server/API → Supabase/PostgreSQL`

Public catalogue reads may use Supabase directly where appropriate. Financial operations, administration, authentication-sensitive actions and provider callbacks are handled server-side.

The database is authoritative for:

- product prices
- inventory availability
- order totals
- payment state
- role authorization

Client-side cart values are never trusted for final order pricing.

## Repository layout

```
src/
├── app/
│   ├── admin/                  # manager/admin UI
│   ├── api/                    # authenticated/server endpoints
│   ├── auth/                   # authentication pages
│   ├── dashboard/              # customer dashboard
│   ├── orders/                 # order views
│   └── products/               # catalogue
├── components/                 # reusable UI
├── lib/
│   ├── stores/                 # Zustand state
│   ├── utils/                  # shared utilities
│   ├── mpesa.ts                # Daraja integration
│   ├── mail.ts                 # server-side email
│   ├── roles.ts                # centralized role checks
│   └── storage.ts              # hardened image storage
└── templates/                  # email templates

supabase/migrations/             # canonical database migrations
scripts/quality-check.mjs        # dependency-free regression checks
.github/workflows/ci.yml         # lint, checks and production build
```

## Database migrations

**Canonical migrations live in `supabase/migrations/`.**

Apply them in order with the Supabase CLI or your normal migration pipeline. Do not treat standalone SQL files as the source of truth for a new deployment.

Legacy SQL files are retained only for compatibility with older installations.

After migrations, verify:

1. RLS is enabled on sensitive tables.
2. Manager/admin policies are active.
3. Privileged functions are restricted to `service_role`.
4. Payment uniqueness constraints exist.
5. Storage policies restrict product image operations.

## Environment variables

### Required Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed as a `NEXT_PUBLIC_*` variable.

### M-Pesa

```env
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
MPESA_ENVIRONMENT=sandbox
```

Use `production` only after completing real Daraja verification and callback testing.

### Email

SMTP credentials are **not stored in the database**.

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_SECURE=false
SMTP_FROM=
CONTACT_RECIPIENT_EMAIL=
```

### Webhooks / operations

```env
STRIPE_WEBHOOK_SECRET=
GENERAL_WEBHOOK_SECRET=
SHIPPING_CALLBACK_SECRET=
ORDER_STATUS_CALLBACK_SECRET=
CRON_SECRET=
```

Only define callback secrets for endpoints that are enabled.

## Local development

Prerequisites:

- Node.js 20.9+ recommended for the current Next.js release
- npm
- Supabase project

Install and run:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run verify
npm run build
npm test
```

`npm run verify` contains dependency-free regression checks for critical security invariants. CI runs lint, verification checks and the production build.

The repository should eventually add full unit, integration and browser E2E coverage for checkout, authorization and payment flows; the current invariant checks are a safety net, not a replacement for those tests.

## Security model

### Authentication and authorization

- Supabase Auth provides identity.
- Active `manager` and `admin` accounts are treated consistently as staff.
- Role changes are protected by database logic.
- Customer self-promotion is rejected.
- Admin APIs perform server-side authorization.
- RLS provides a second authorization boundary.

### Payments

M-Pesa callbacks are not trusted solely because they arrive at the callback URL. Successful callbacks trigger an authenticated provider-side STK query before financial state is changed.

Payment provider identifiers are protected by database uniqueness constraints, and successful payment/order changes are applied atomically.

Stripe webhook signatures are verified against the raw request body.

### Inventory

Order creation reserves inventory atomically. Stale unpaid orders are eligible for automatic expiration and inventory release through the protected expiration endpoint.

### File uploads

Product images are limited to JPEG, PNG and WebP and to 5 MB. Object names use UUIDs rather than client-provided filenames.

## Production deployment

Before production:

1. Apply database migrations.
2. Configure all server-only secrets in the hosting provider.
3. Configure the M-Pesa callback URL with HTTPS.
4. Configure Stripe webhook signing.
5. Confirm Supabase `pg_cron` has scheduled stale-order and rate-limit cleanup jobs.
6. Verify RLS and storage policies.
7. Run lint, verification checks and a production build.
8. Test customer, manager and admin authorization.
9. Test duplicate checkout/payment callbacks.
10. Test failed, cancelled, paid and delivered order transitions.
11. Confirm monitoring and backups are available.

The expiration endpoint is intentionally protected by `CRON_SECRET`; do not make it publicly callable.

## Abuse protection

Public contact and guest-order endpoints use database-backed IP/email rate limits. Rate limiting fails closed if the limiter cannot be reached.

## Important production rule

Never put:

- Supabase service-role keys
- M-Pesa consumer secrets/passkeys
- SMTP passwords
- webhook signing secrets

in client-side code, public environment variables, database settings or source control.

## License

This project is proprietary software owned by Ketronics LTD.

---

**Built with care in Nairobi, Kenya.**


<!-- CI catalog verification marker -->
