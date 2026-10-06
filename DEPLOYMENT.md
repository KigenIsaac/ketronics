# Ketronics production deployment checklist

## Database
- Apply Supabase migrations before deploying application code that depends on them.
- Verify RLS policies and privileged functions after migrations.
- Confirm backups/rollback procedures before schema changes.

## Required secrets
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only.
- `STRIPE_WEBHOOK_SECRET` — server-only.
- `SHIPPING_CALLBACK_SECRET` when a courier callback is enabled.
- `ORDER_STATUS_CALLBACK_SECRET` when an order-status callback is enabled.
- `GENERAL_WEBHOOK_SECRET` when the general webhook endpoint is enabled.
- `CRON_SECRET` is only needed if the optional HTTP expiration endpoint is used; the canonical cleanup runs through Supabase pg_cron.

## Payment verification
- Test Stripe signature rejection and successful processing.
- Test M-Pesa callback matching and amount validation.
- Confirm duplicate provider callbacks are harmless.
- Confirm Stripe event IDs are idempotent and recover after an interrupted processing attempt.
- Confirm M-Pesa success callbacks are independently verified against Daraja before payment state changes.
- Confirm a completed payment cannot be downgraded by a later failure event.

## Checkout
- Test a fresh customer checkout.
- Test duplicate submission/idempotency.
- Confirm product prices come from the database.
- Confirm unavailable products are rejected.
- Confirm cart is only cleared after successful order creation.
- Confirm public contact and guest-order rate limits reject repeated abuse.

## Authorization
- Test customer access to customer resources.
- Test customer rejection from admin resources.
- Test manager/admin access.
- Confirm customers cannot promote themselves by editing profiles.
- Confirm inactive users cannot access customer or admin dashboards.

## Rollback
Prefer rolling back the application build for application-only failures. If a database migration is involved, reconcile database state before deploying an older application version.
