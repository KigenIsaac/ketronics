import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.slice(0, 64) || "unknown";
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().rpc(
    "consume_api_rate_limit",
    {
      p_rate_key: createHash("sha256").update(key).digest("hex"),
      p_limit: limit,
      p_window_seconds: windowSeconds,
    },
  );

  if (error) {
    console.error("Rate-limit check failed:", error);
    return false;
  }

  return data === true;
}
