-- Durable Stripe webhook idempotency with recovery for abandoned processing attempts.

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'processed')),
  processing_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION public.claim_stripe_webhook_event(
  p_event_id TEXT,
  p_event_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_started_at TIMESTAMPTZ;
BEGIN
  SELECT status, processing_started_at
    INTO v_status, v_started_at
    FROM public.stripe_webhook_events
    WHERE event_id = p_event_id
    FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.stripe_webhook_events (
      event_id, event_type, status, processing_started_at
    )
    VALUES (p_event_id, p_event_type, 'processing', NOW());
    RETURN TRUE;
  END IF;

  IF v_status = 'processed' THEN
    RETURN FALSE;
  END IF;

  IF v_started_at < NOW() - INTERVAL '10 minutes' THEN
    UPDATE public.stripe_webhook_events
    SET event_type = p_event_type,
        status = 'processing',
        processing_started_at = NOW(),
        processed_at = NULL
    WHERE event_id = p_event_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_stripe_webhook_event(p_event_id TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.stripe_webhook_events
  SET status = 'processed',
      processed_at = NOW()
  WHERE event_id = p_event_id;
$$;

REVOKE ALL ON FUNCTION public.claim_stripe_webhook_event(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_stripe_webhook_event(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_stripe_webhook_event(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_stripe_webhook_event(TEXT) TO service_role;
