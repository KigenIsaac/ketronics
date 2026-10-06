-- Provider identifiers are unique per M-Pesa payment attempt.
-- These constraints make callback processing and STK initiation race-safe at the database boundary.

CREATE UNIQUE INDEX IF NOT EXISTS payments_checkout_request_id_uidx
  ON public.payments (checkout_request_id)
  WHERE checkout_request_id IS NOT NULL;

DROP INDEX IF EXISTS public.payments_transaction_id_uidx;

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_transaction_id_uidx
  ON public.payments (provider, transaction_id)
  WHERE transaction_id IS NOT NULL;
