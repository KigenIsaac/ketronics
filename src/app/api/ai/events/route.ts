import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { consumeRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  event: z.enum(["ai_recommendation_shown", "ai_recommendation_clicked", "add_to_cart"]),
  sessionId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  source: z.enum(["ai_assistant", "product_page", "cart"]).default("ai_assistant"),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid conversion event." }, { status: 400 });

  const ip = getClientIp(request);
  const allowed = await consumeRateLimit(`ai:conversion-events:${ip}`, 40, 60);
  if (!allowed) return NextResponse.json({ error: "Too many events." }, { status: 429, headers: { "Retry-After": "60" } });

  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("ai_conversion_events").insert({
      event_type: parsed.data.event,
      session_id: parsed.data.sessionId,
      product_id: parsed.data.productId ?? null,
      source: parsed.data.source,
      user_id: user?.id ?? null,
    });
    if (error) {
      console.error("AI conversion event insert failed:", error.message);
      return NextResponse.json({ error: "Event could not be recorded." }, { status: 503 });
    }
    return NextResponse.json({ recorded: true }, { status: 202 });
  } catch (error) {
    console.error("AI conversion event failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Event could not be recorded." }, { status: 503 });
  }
}
