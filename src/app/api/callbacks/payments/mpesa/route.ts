import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function extractCallback(body: any) {
  return body?.Body?.stkCallback ?? null;
}

function getMetadataValue(items: any[], name: string) {
  return items.find((item) => item?.Name === name)?.Value ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callback = extractCallback(body);

    if (!callback?.MerchantRequestID || !callback?.CheckoutRequestID || !Number.isInteger(callback.ResultCode)) {
      return NextResponse.json({ error: 'Invalid M-Pesa callback' }, { status: 400 });
    }

    const { data: payment, error: lookupError } = await getSupabaseAdmin()
      .from('payments')
      .select('id, order_id, status, amount')
      .eq('merchant_request_id', callback.MerchantRequestID)
      .eq('checkout_request_id', callback.CheckoutRequestID)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!payment) {
      return NextResponse.json({ error: 'Unknown payment callback' }, { status: 404 });
    }

    if (payment.status === 'completed' || payment.status === 'success') {
      return NextResponse.json({ success: true, message: 'Callback already processed' });
    }

    const items = callback.CallbackMetadata?.Item ?? [];
    const amount = callback.ResultCode === 0 ? getMetadataValue(items, 'Amount') : null;
    const transactionId = callback.ResultCode === 0 ? getMetadataValue(items, 'MpesaReceiptNumber') : null;
    const phoneNumber = callback.ResultCode === 0 ? getMetadataValue(items, 'PhoneNumber') : null;

    if (callback.ResultCode === 0) {
      if (amount == null || transactionId == null) {
        return NextResponse.json({ error: 'Successful callback is missing payment metadata' }, { status: 400 });
      }

      if (payment.amount != null && Math.abs(Number(payment.amount) - Number(amount)) >= 0.01) {
        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    const status = callback.ResultCode === 0 ? 'success' : 'failed';

    const { error: updateError } = await getSupabaseAdmin().from('payments').update({
      status,
      transaction_id: transactionId,
      phone_number: phoneNumber,
      metadata: { merchant_request_id: callback.MerchantRequestID, checkout_request_id: callback.CheckoutRequestID, result_code: callback.ResultCode, result_desc: callback.ResultDesc ?? null },
      updated_at: now,
    }).eq('id', payment.id);

    if (updateError) throw updateError;

    if (callback.ResultCode === 0 && payment.order_id) {
      const { error: orderError } = await getSupabaseAdmin()
        .from('orders')
        .update({ status: 'paid', payment_date: now, updated_at: now })
        .eq('id', payment.order_id)
        .neq('status', 'paid');
      if (orderError) throw orderError;
    }

    return NextResponse.json({ success: true, message: 'Callback processed successfully' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const transactionId = new URL(request.url).searchParams.get('transaction_id');
  if (!transactionId) {
    return NextResponse.json({ error: 'transaction_id is required' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('payments')
    .select('status, transaction_id')
    .eq('transaction_id', transactionId)
    .maybeSingle();

  if (error) {
    console.error('M-Pesa status lookup error:', error);
    return NextResponse.json({ error: 'Status lookup failed' }, { status: 500 });
  }

  return NextResponse.json({ status: data?.status ?? 'unknown', transaction_id: data?.transaction_id ?? transactionId });
}
