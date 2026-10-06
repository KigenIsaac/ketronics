import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendOrderNotification } from '@/lib/mail';
import { z } from 'zod';
import { isStaffRole } from "@/lib/roles";

const schema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned']),
  trackingNumber: z.string().trim().max(100).optional(),
  carrier: z.string().trim().max(100).optional(),
  estimatedDelivery: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});


export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const auth = await createSupabaseServerClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { data: profile } = await auth.from('profiles').select('role, is_active').eq('id', user.id).maybeSingle();
    if (!profile?.is_active || !isStaffRole(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid status update', details: parsed.error.flatten() }, { status: 400 });

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, total, status, customer_email, shipping_address, order_items(product_name, quantity, price)')
      .eq('id', id)
      .single();

    if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const next = parsed.data.status;

    const { error: transitionError } = await supabaseAdmin.rpc(
      'transition_order_status',
      {
        p_order_id: id,
        p_next_status: next,
        p_tracking_number: parsed.data.trackingNumber || null,
        p_carrier: parsed.data.carrier || null,
        p_estimated_delivery: parsed.data.estimatedDelivery || null,
        p_notes: parsed.data.notes || null,
      },
    );

    if (transitionError) {
      if (transitionError.message.includes('Invalid order transition')) {
        return NextResponse.json(
          { error: transitionError.message },
          { status: 409 },
        );
      }
      throw transitionError;
    }

    
    try {
      await sendOrderNotification({
        orderId: order.id,
        total: Number(order.total),
        status: next,
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
      console.error('Order notification failed:', notificationError);
    }

    return NextResponse.json({ success: true, order: { id, status: next } });
  } catch (error) {
    console.error('Admin order status update failed:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
