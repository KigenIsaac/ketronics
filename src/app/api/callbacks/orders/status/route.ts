import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendOrderNotification } from "@/lib/mail";

const schema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
    "returned",
  ]),
  trackingNumber: z.string().trim().max(100).optional(),
  carrier: z.string().trim().max(100).optional(),
  estimatedDelivery: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const secret = process.env.ORDER_STATUS_CALLBACK_SECRET;
  if (!secret || request.headers.get("x-callback-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order status callback" },
        { status: 400 },
      );
    }

    const { data: order, error: orderError } = await getSupabaseAdmin()
      .from("orders")
      .select("id, total, customer_email, shipping_address, status, order_items(product_name, quantity, price)")
      .eq("id", parsed.data.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { error: transitionError } = await getSupabaseAdmin().rpc(
      "transition_order_status",
      {
        p_order_id: parsed.data.orderId,
        p_next_status: parsed.data.status,
        p_tracking_number: parsed.data.trackingNumber || null,
        p_carrier: parsed.data.carrier || null,
        p_estimated_delivery: parsed.data.estimatedDelivery || null,
        p_notes: parsed.data.notes || null,
      },
    );

    if (transitionError) {
      if (
        transitionError.message.includes("Invalid order transition") ||
        transitionError.message.includes("Order not found")
      ) {
        return NextResponse.json({ error: transitionError.message }, { status: 409 });
      }
      throw transitionError;
    }

    try {
      await sendOrderNotification({
        orderId: order.id,
        total: Number(order.total),
        status: parsed.data.status,
        customerName: order.shipping_address?.name,
        customerEmail: order.customer_email,
        customerPhone: order.shipping_address?.phone,
        items: (order.order_items || []).map((item: { product_name: string; quantity: number; price: number }) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        trackingNumber: parsed.data.trackingNumber,
        carrier: parsed.data.carrier,
        estimatedDelivery: parsed.data.estimatedDelivery,
      });
    } catch (notificationError) {
      console.error("Order status notification failed:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: { id: parsed.data.orderId, status: parsed.data.status },
    });
  } catch (error) {
    console.error("Order status callback failed:", error);
    return NextResponse.json({ error: "Callback processing failed" }, { status: 500 });
  }
}
