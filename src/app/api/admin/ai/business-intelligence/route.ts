import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { consumeRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({ days: z.coerce.number().int().refine((n) => [7, 30, 90].includes(n)).default(30) });
const revenueStatuses = new Set(["paid", "shipped", "delivered"]);

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({ days: request.nextUrl.searchParams.get("days") ?? "30" });
  if (!parsed.success) return NextResponse.json({ error: "Choose a 7, 30 or 90 day window." }, { status: 400 });

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role,is_active").eq("id", user.id).single();
    if (profileError || !profile?.is_active || !["manager", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const [globalAllowed, staffAllowed] = await Promise.all([
      consumeRateLimit("agnes:global:business-intelligence", 30, 60),
      consumeRateLimit(`agnes:business-intelligence:${user.id}:${ip}`, 20, 60),
    ]);
    if (!globalAllowed || !staffAllowed) return NextResponse.json({ error: "Please wait before refreshing business intelligence." }, { status: 429, headers: { "Retry-After": "60" } });

    const days = parsed.data.days;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const [ordersResult, itemsResult, productsResult] = await Promise.all([
      supabase.from("orders").select("id,total,status,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
      supabase.from("order_items").select("order_id,product_id,product_name,quantity,price,created_at").gte("created_at", since).limit(10000),
      supabase.from("products").select("id,name,status,price,track_inventory,stock_quantity,low_stock_threshold").eq("status", "active").limit(5000),
    ]);
    if (ordersResult.error || itemsResult.error || productsResult.error) {
      console.error("Business intelligence query failed:", ordersResult.error?.message, itemsResult.error?.message, productsResult.error?.message);
      return NextResponse.json({ error: "Could not load the business metrics." }, { status: 503 });
    }

    const orders = ordersResult.data ?? [];
    const items = itemsResult.data ?? [];
    const products = productsResult.data ?? [];
    const recognizedOrders = orders.filter((order) => revenueStatuses.has(String(order.status)));
    const recognizedIds = new Set(recognizedOrders.map((order) => order.id));
    const revenue = recognizedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const paidItems = items.filter((item) => recognizedIds.has(item.order_id));
    const unitsByProduct = new Map<string, { name: string; units: number; revenueKes: number }>();
    for (const item of paidItems) {
      const key = item.product_id || item.product_name || "unknown";
      const existing = unitsByProduct.get(key) ?? { name: String(item.product_name || "Unknown product"), units: 0, revenueKes: 0 };
      existing.units += Number(item.quantity || 0);
      existing.revenueKes += Number(item.price || 0) * Number(item.quantity || 0);
      unitsByProduct.set(key, existing);
    }

    const today = new Date();
    const daily = new Map<string, { date: string; orders: number; revenueKes: number }>();
    for (let offset = days - 1; offset >= 0; offset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      daily.set(key, { date: key, orders: 0, revenueKes: 0 });
    }
    for (const order of recognizedOrders) {
      const key = String(order.created_at).slice(0, 10);
      const day = daily.get(key);
      if (day) { day.orders += 1; day.revenueKes += Number(order.total || 0); }
    }

    const lowStock = products.filter((product) => product.track_inventory && Number(product.stock_quantity ?? 0) <= Number(product.low_stock_threshold ?? 0))
      .slice(0, 20).map((product) => ({ id: product.id, name: product.name, stock: product.stock_quantity, threshold: product.low_stock_threshold }));
    return NextResponse.json({
      periodDays: days,
      generatedAt: new Date().toISOString(),
      summary: {
        revenueKes: revenue,
        recognizedOrders: recognizedOrders.length,
        pendingOrders: orders.filter((order) => order.status === "pending").length,
        cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
        averageOrderValueKes: recognizedOrders.length ? revenue / recognizedOrders.length : 0,
        activeProducts: products.length,
      },
      daily: [...daily.values()],
      topProducts: [...unitsByProduct.values()].sort((a, b) => b.units - a.units).slice(0, 10),
      lowStock,
      limitations: [
        "Metrics include at most 5,000 recent orders, 10,000 order items, and 5,000 active products.",
        "Revenue counts orders marked paid, shipped, or delivered; confirm these statuses match your accounting policy.",
        "Top-product units are calculated only from returned order items linked to those recognized orders; incomplete or truncated item data can understate units.",
        "Daily buckets use UTC dates."
      ],
    });
  } catch (error) {
    console.error("Business intelligence API failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Business intelligence is temporarily unavailable." }, { status: 503 });
  }
}
