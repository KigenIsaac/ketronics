import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

type StripeSignature = {
  timestamp: number;
  signatures: string[];
};

function parseStripeSignatureHeader(header: string): StripeSignature | null {
  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;

    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (key === "t") {
      const parsed = Number(value);
      if (Number.isSafeInteger(parsed) && parsed > 0) {
        timestamp = parsed;
      }
    } else if (key === "v1" && value) {
      signatures.push(value);
    }
  }

  if (timestamp === null || signatures.length === 0) {
    return null;
  }

  return { timestamp, signatures };
}

/**
 * Verifies a Stripe webhook using the raw request body.
 *
 * Stripe signs: ${timestamp}.${rawBody}
 * and sends the resulting HMAC-SHA256 as one or more v1 signatures.
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
): boolean {
  if (!signatureHeader || !secret) return false;

  const parsed = parseStripeSignatureHeader(signatureHeader);
  if (!parsed) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - parsed.timestamp);
  if (age > toleranceSeconds) return false;

  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");

  return parsed.signatures.some((signature) => {
    const receivedBuffer = Buffer.from(signature, "utf8");

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer);
  });
}
