import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100),
  attributes: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean()])
    )
    .optional()
    .default({}),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(100),
  shippingInfo: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(7).max(30),
    address: z.string().trim().min(3).max(300),
    city: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),
  }),
  paymentMethod: z.enum(['cash_on_delivery', 'mpesa', 'card']),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const rawBody = await request.json();
    const parsed = checkoutSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid checkout data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, shippingInfo, paymentMethod } = parsed.data;

    const { data: orders, error: orderError } = await supabase.rpc(
      'create_order_atomic',
      {
        p_items: items,
        p_shipping_address: shippingInfo,
        p_payment_method: paymentMethod,
      }
    );

    if (orderError || !orders?.[0]) {
      console.error('Atomic checkout failed:', orderError);
      const message =
        orderError?.message?.includes('Product is unavailable')
          ? 'One or more products are unavailable'
          : orderError?.message?.includes('Invalid quantity')
            ? 'One or more quantities are invalid'
            : 'Failed to create order';

      return NextResponse.json(
        { error: message },
        { status: message === 'Failed to create order' ? 500 : 409 }
      );
    }

    const order = orders[0];
    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
