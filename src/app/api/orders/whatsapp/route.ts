import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendOrderNotification } from '@/lib/mail';
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit';

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().default({}),
});

const schema = z.object({
  items: z.array(itemSchema).min(1).max(100),
  shippingInfo: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(7).max(30),
    address: z.string().trim().min(3).max(300),
    city: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),
  }),
  idempotencyKey: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data', details: parsed.error.flatten() }, { status: 400 });
    }

    const ip = getClientIp(request);
    const email = parsed.data.shippingInfo.email.toLowerCase();

    const [ipAllowed, emailAllowed] = await Promise.all([
      consumeRateLimit(`guest-order:ip:${ip}`, 10, 600),
      consumeRateLimit(`guest-order:email:${email}`, 5, 600),
    ]);

    if (!ipAllowed || !emailAllowed) {
      return NextResponse.json(
        { error: 'Too many order attempts. Please try again later.' },
        { status: 429 },
      );
    }

    const { data, error } = await supabaseAdmin.rpc('create_guest_order_atomic', {
      p_items: parsed.data.items,
      p_shipping_address: parsed.data.shippingInfo,
      p_payment_method: 'mpesa',
      p_idempotency_key: parsed.data.idempotencyKey,
    });

    if (error || !data?.[0]) {
      const message = error?.message?.includes('Insufficient stock')
        ? 'One or more products do not have enough stock'
        : error?.message?.includes('Product is unavailable')
          ? 'One or more products are unavailable'
          : 'Unable to create order';
      return NextResponse.json({ error: message }, { status: message === 'Unable to create order' ? 500 : 409 });
    }

    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('product_name, quantity, price')
      .eq('order_id', data[0].id);

    try {
      await sendOrderNotification({
        orderId: data[0].id,
        total: Number(data[0].total),
        status: data[0].status,
        customerName: parsed.data.shippingInfo.name,
        customerEmail: parsed.data.shippingInfo.email,
        customerPhone: parsed.data.shippingInfo.phone,
        items: (orderItems || []).map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      });
    } catch (notificationError) {
      console.error('New order notification failed:', notificationError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: data[0].id,
        total: data[0].total,
        status: data[0].status,
        created_at: data[0].created_at,
        checkout_token: data[0].checkout_token,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('WhatsApp order creation failed:', error);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}
