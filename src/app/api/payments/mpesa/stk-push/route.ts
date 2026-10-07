import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, consumeRateLimit } from '@/lib/rateLimit';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { initiateStkPush, isMpesaConfigured } from '@/lib/mpesa';

const schema = z.object({
  orderId: z.string().uuid(),
  checkoutToken: z.string().uuid(),
  phone: z.string().trim().min(9).max(20),
});

export async function POST(request: NextRequest) {
  try {
    if (!isMpesaConfigured()) {
      return NextResponse.json({ error: 'M-Pesa STK Push is not configured on this deployment' }, { status: 503 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payment request' }, { status: 400 });

    const { orderId, checkoutToken, phone } = parsed.data;
    const ipAllowed = await consumeRateLimit(`mpesa-stk-ip:${getClientIp(request)}`, 8, 600);
    const orderAllowed = await consumeRateLimit(`mpesa-stk-order:${orderId}`, 3, 600);
    if (!ipAllowed || !orderAllowed) {
      return NextResponse.json({ error: 'Too many payment attempts. Please try again later.' }, { status: 429 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, total, status, checkout_token, payment_method')
      .eq('id', orderId)
      .eq('checkout_token', checkoutToken)
      .single();

    if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status === 'paid') return NextResponse.json({ error: 'Order is already paid' }, { status: 409 });

    if (order.payment_method !== 'mpesa') return NextResponse.json({ error: 'Order is not an M-Pesa order' }, { status: 409 });

    const amount = Number(order.total);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: 'M-Pesa payments require a whole-number KES order total' },
        { status: 422 },
      );
    }

    const existing = await supabaseAdmin
      .from('payments')
      .select('id, status, checkout_request_id')
      .eq('order_id', order.id)
      .eq('provider', 'mpesa')
      .in('status', ['pending', 'requested'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing.data?.status === 'pending' || existing.data?.status === 'requested') {
      return NextResponse.json({ error: 'A payment request is already in progress' }, { status: 409 });
    }

    const payment = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: order.id,
        provider: 'mpesa',
        amount,
        currency: 'KES',
        status: 'requested',
        phone_number: phone,
        metadata: {},
      })
      .select('id')
      .single();

    if (payment.error || !payment.data) {
      if (payment.error?.code === '23505') {
        return NextResponse.json(
          { error: 'A payment request is already in progress' },
          { status: 409 },
        );
      }
      throw payment.error || new Error('Payment record creation failed');
    }

    try {
      const result = await initiateStkPush({
        amount,
        phone,
        accountReference: order.id.replace(/-/g, '').slice(-12),
        transactionDesc: 'Ketronics order',
      });

      await supabaseAdmin.from('payments').update({
        status: 'pending',
        merchant_request_id: result.merchantRequestId,
        checkout_request_id: result.checkoutRequestId,
        updated_at: new Date().toISOString(),
      }).eq('id', payment.data.id);

      return NextResponse.json({
        success: true,
        message: result.customerMessage || 'STK Push sent to your phone',
        checkoutRequestId: result.checkoutRequestId,
      });
    } catch (error) {
      await supabaseAdmin.from('payments').update({
        status: 'failed',
        metadata: { error: error instanceof Error ? error.message : 'STK Push failed' },
        updated_at: new Date().toISOString(),
      }).eq('id', payment.data.id);
      throw error;
    }
  } catch (error) {
    console.error('M-Pesa STK initiation failed:', error);
    return NextResponse.json(
      { error: 'M-Pesa payment could not be initiated' },
      { status: 502 },
    );
  }
}
