import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await getSupabaseAdmin().rpc(
      "expire_stale_pending_orders",
      { p_max_age_minutes: 30 },
    );

    if (error) {
      console.error("Failed to expire stale orders:", error);
      return NextResponse.json({ error: "Expiration job failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      releasedOrders: Number(data ?? 0),
    });
  } catch (error) {
    console.error("Stale-order expiration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
