import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendOrderNotification } from "@/lib/mail";

const schema = z.object({
  trackingNumber: z.string().trim().min(1).max(100),
  status: z.string().trim().min(1).max(50),
  location: z.string().trim().max(200).optional(),
  timestamp: z.string().datetime().optional(),
  orderId: z.string().uuid().optional(),
  carrier: z.string().trim().max(100).optional(),
  estimatedDelivery: z.string().trim().max(100).optional(),
  signature: z.string().trim().max(500).optional(),
  photos: z.array(z.string().url().max(2000)).max(20).optional(),
});

const statusMapping: Record<string, "shipped" | "delivered" | "returned"> = {
  picked_up: "shipped",
  in_transit: "shipped",
  out_for_delivery: "shipped",
  delivered: "delivered",
  returned: "returned",
};

export async function POST(request: NextRequest) {
  const secret = process.env.SHIPPING_CALLBACK_SECRET;
  if (!secret || request.headers.get("x-callback-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid shipping callback" }, { status: 400 });
    }

    const input = parsed.data;
    let orderId = input.orderId;

    if (!orderId) {
      const { data: order, error } = await getSupabaseAdmin()
        .from("orders")
        .select("id")
        .eq("tracking_number", input.trackingNumber)
        .maybeSingle();

      if (error) throw error;
      orderId = order?.id;
    }

    if (!orderId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { error: insertError } = await getSupabaseAdmin()
      .from("shipping_updates")
      .insert({
        order_id: orderId,
        tracking_number: input.trackingNumber,
        status: input.status,
        location: input.location || null,
        carrier: input.carrier || null,
        estimated_delivery: input.estimatedDelivery || null,
        signature: input.signature || null,
        photos: input.photos || null,
        timestamp: input.timestamp || now,
        created_at: now,
      });

    if (insertError) throw insertError;

    const nextStatus = statusMapping[input.status];

    if (nextStatus) {
      const { error: transitionError } = await getSupabaseAdmin().rpc(
        "transition_order_status",
        {
          p_order_id: orderId,
          p_next_status: nextStatus,
          p_tracking_number: input.trackingNumber,
          p_carrier: input.carrier || null,
          p_estimated_delivery: input.estimatedDelivery || null,
          p_notes: `Shipping provider status: ${input.status}`,
        },
      );

      if (transitionError) {
        if (transitionError.message.includes("Invalid order transition")) {
          return NextResponse.json(
            { error: transitionError.message },
            { status: 409 },
          );
        }
        throw transitionError;
      }
    } else {
      const { error: updateError } = await getSupabaseAdmin()
        .from("orders")
        .update({
          tracking_number: input.trackingNumber,
          shipping_carrier: input.carrier || undefined,
          estimated_delivery: input.estimatedDelivery || undefined,
          updated_at: now,
        })
        .eq("id", orderId);

      if (updateError) throw updateError;
    }

    const { data: order } = await getSupabaseAdmin()
      .from("orders")
      .select("id, total, status, customer_email, shipping_address, order_items(product_name, quantity, price)")
      .eq("id", orderId)
      .single();

    if (order && (input.status === "delivered" || input.status === "out_for_delivery")) {
      try {
        await sendOrderNotification({
          orderId: order.id,
          total: Number(order.total),
          status: order.status,
          customerName: order.shipping_address?.name,
          customerEmail: order.customer_email,
          customerPhone: order.shipping_address?.phone,
          items: (order.order_items || []).map((item: { product_name: string; quantity: number; price: number }) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
          trackingNumber: input.trackingNumber,
          carrier: input.carrier,
          estimatedDelivery: input.estimatedDelivery,
        });
      } catch (notificationError) {
        console.error("Delivery notification failed:", notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Shipping update processed successfully",
      order: { id: orderId, status: order?.status },
    });
  } catch (error) {
    console.error("Shipping callback failed:", error);
    return NextResponse.json({ error: "Callback processing failed" }, { status: 500 });
  }
}
