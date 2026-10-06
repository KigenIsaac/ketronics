import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendOrderNotification } from '@/lib/mail';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned']),
  trackingNumber: z.string().trim().max(100).optional(),
  carrier: z.string().trim().max(100).optional(),
  estimatedDelivery: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

const allowedTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  shipped: ['delivered'],
  delivered: ['returned'],
  cancelled: ['refunded'],
  refunded: [],
  returned: [],
};

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const auth = await createSupabaseServerClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { data: profile } = await auth.from('profiles').select('role, is_active').eq('id', user.id).maybeSingle();
    if (!profile?.is_active || !['manager', 'admin'].includes(profile.role)) {
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
    if (next !== order.status && !(allowedTransitions[order.status] || []).includes(next)) {
      return NextResponse.json({ error: `Invalid transition from ${order.status} to ${next}` }, { status: 409 });
    }

    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = { status: next, updated_at: now };
    if (parsed.data.trackingNumber) updateData.tracking_number = parsed.data.trackingNumber;
    if (parsed.data.carrier) updateData.shipping_carrier = parsed.data.carrier;
    if (parsed.data.estimatedDelivery) updateData.estimated_delivery = parsed.data.estimatedDelivery;
    if (parsed.data.notes) updateData.notes = parsed.data.notes;
    if (next === 'shipped') updateData.shipped_date = now;
    if (next === 'delivered') updateData.delivered_date = now;

    const { error: updateError } = await supabaseAdmin.from('orders').update(updateData).eq('id', id);
    if (updateError) throw updateError;

    await supabaseAdmin.from('order_status_history').insert({
      order_id: id,
      status: next,
      tracking_number: parsed.data.trackingNumber || null,
      carrier: parsed.data.carrier || null,
      notes: parsed.data.notes || null,
      created_at: now,
    });

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
