-- Run stale-order cleanup inside Postgres so inventory release does not depend
-- on Vercel/HTTP scheduler availability.
--
-- Supabase exposes pg_cron as a managed extension.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
DECLARE
  v_job_id BIGINT;
BEGIN
  SELECT jobid
    INTO v_job_id
    FROM cron.job
    WHERE jobname = 'ketronics-expire-stale-orders';

  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;

  PERFORM cron.schedule(
    'ketronics-expire-stale-orders',
    '*/10 * * * *',
    $$SELECT public.expire_stale_pending_orders(30);$$
  );
END;
$$;
