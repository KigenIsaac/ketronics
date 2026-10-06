import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

function parseStripeSignatureHeader(header: string) {
  let timestamp: number | null = null; const signatures: string[] = [];
  for (const part of header.split(",")) {
    const separator = part.indexOf("="); if (separator === -1) continue;
    const key = part.slice(0, separator).trim(); const value = part.slice(separator + 1).trim();
    if (key === "t") { const parsed = Number(value); if (Number.isSafeInteger(parsed) && parsed > 0) timestamp = parsed; }
    else if (key === "v1" && value) signatures.push(value);
  }
  return timestamp && signatures.length ? { timestamp, signatures } : null;
}

export function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string | undefined, toleranceSeconds = DEFAULT_TOLERANCE_SECONDS): boolean {
  if (!signatureHeader || !secret) return false; const parsed = parseStripeSignatureHeader(signatureHeader);
  if (!parsed) return false; const age = Math.abs(Math.floor(Date.now() / 1000) - parsed.timestamp);
  if (age > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${parsed.timestamp}.${rawBody}`, "utf8").digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return parsed.signatures.some((signature) => { const received = Buffer.from(signature, "utf8"); return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer); });
}
