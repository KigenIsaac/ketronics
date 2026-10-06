-- M-Pesa STK Push payment records.

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  provider TEXT NOT NULL DEFAULT 'mpesa',
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  phone_number TEXT,
  merchant_request_id TEXT,
  checkout_request_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS order_id UUID,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS merchant_request_id TEXT,
  ADD COLUMN IF NOT EXISTS checkout_request_id TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_checkout_request_id
  ON payments(checkout_request_id)
  WHERE checkout_request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_merchant_request_id
  ON payments(merchant_request_id)
  WHERE merchant_request_id IS NOT NULL;
