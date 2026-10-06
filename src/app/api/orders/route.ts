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

    const productIds = [...new Set(items.map((item) => item.productId))];

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, images, status')
      .in('id', productIds)
      .eq('status', 'active');

    if (productsError) {
      console.error('Checkout product lookup failed:', productsError);
      return NextResponse.json(
        { error: 'Unable to validate products' },
        { status: 500 }
      );
    }

    const productMap = new Map((products ?? []).map((product) => [product.id, product]));

    if (productMap.size !== productIds.length) {
      const missingProductIds = productIds.filter((id) => !productMap.has(id));
      return NextResponse.json(
        {
          error: 'One or more products are unavailable',
          productIds: missingProductIds,
        },
        { status: 409 }
      );
    }

    const pricedItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(`Invalid price configured for product ${product.id}`);
      }

      return {
        order_id: '',
        product_id: product.id,
        product_name: product.name,
        product_image:
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : null,
        quantity: item.quantity,
        price: unitPrice,
        attributes: item.attributes,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const total = Math.round(
      pricedItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100
    ) / 100;

    if (!Number.isFinite(total) || total < 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total,
        shipping_address: shippingInfo,
        payment_method: paymentMethod,
      })
      .select('id, total, status, created_at')
      .single();

    if (orderError || !order) {
      console.error('Checkout order creation failed:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const orderItems = pricedItems.map(({ lineTotal: _lineTotal, ...item }) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.error('Checkout order item creation failed:', orderItemsError);

      // Best-effort compensation until order creation is moved into a
      // database transaction/RPC in a later hardening step.
      await supabase.from('orders').delete().eq('id', order.id);

      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

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
