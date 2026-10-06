import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyStripeWebhookSignature } from './stripeWebhook';

describe('verifyStripeWebhookSignature', () => {
  const secret = 'whsec_test'; const body = '{"id":"evt_test"}';
  function signature(timestamp: number) {
    return createHmac('sha256', secret).update(String(timestamp) + '.' + body).digest('hex');
  }
  it('accepts a valid signature', () => {
    const timestamp = Math.floor(Date.now() / 1000);
    expect(verifyStripeWebhookSignature(body, 't=' + timestamp + ',v1=' + signature(timestamp), secret)).toBe(true);
  });
  it('rejects forged signatures', () => {
    const timestamp = Math.floor(Date.now() / 1000);
    expect(verifyStripeWebhookSignature(body, 't=' + timestamp + ',v1=forged', secret)).toBe(false);
  });
  it('rejects stale signatures', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 3600;
    expect(verifyStripeWebhookSignature(body, 't=' + timestamp + ',v1=' + signature(timestamp), secret)).toBe(false);
  });
  it('fails closed without a secret', () => {
    expect(verifyStripeWebhookSignature(body, null, undefined)).toBe(false);
  });
});