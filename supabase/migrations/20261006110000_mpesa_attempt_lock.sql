-- Only one active M-Pesa attempt may exist for an order.
-- The application check remains useful for UX, while this index closes concurrent-request races.

CREATE UNIQUE INDEX IF NOT EXISTS payments_one_active_mpesa_per_order_uidx
  ON public.payments (order_id)
  WHERE provider = 'mpesa' AND status IN ('requested', 'pending');
