import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { queryStkPush } from '@/lib/mpesa';

type MpesaMetadataItem = {
  Name?: string;
  Value?: string | number | null;
};

type MpesaCallback = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResultCode?: number;
  ResultDesc?: string;
  CallbackMetadata?: {
    Item?: MpesaMetadataItem[];
  };
};

function extractCallback(body: unknown): MpesaCallback | null {
  if (typeof body !== 'object' || body === null) return null;
  const root = body as { Body?: unknown };
  if (typeof root.Body !== 'object' || root.Body === null) return null;
  const callback = (root.Body as { stkCallback?: unknown }).stkCallback;
  return typeof callback === 'object' && callback !== null ? callback as MpesaCallback : null;
}

function getMetadataValue(items: MpesaMetadataItem[], name: string): string | number | null {
  return items.find((item) => item.Name === name)?.Value ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const callback = extractCallback(body);

    if (
      !callback?.MerchantRequestID ||
      !callback.CheckoutRequestID ||
      !Number.isInteger(callback.ResultCode)
    ) {
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

    const items = callback.CallbackMetadata?.Item ?? [];
    const amount = callback.ResultCode === 0 ? getMetadataValue(items, 'Amount') : null;
    const transactionId = callback.ResultCode === 0 ? getMetadataValue(items, 'MpesaReceiptNumber') : null;
    const phoneNumber = callback.ResultCode === 0 ? getMetadataValue(items, 'PhoneNumber') : null;

    // Daraja callbacks are not treated as cryptographically authenticated.
    // Independently query the provider before changing financial state.
    const verification = await queryStkPush(callback.CheckoutRequestID);

    if (callback.ResultCode === 0) {
      if (verification.resultCode !== '0') {
        return NextResponse.json(
          { error: 'Payment provider verification did not confirm success' },
          { status: 409 },
        );
      }

      if (amount == null || transactionId == null) {
        return NextResponse.json({ error: 'Successful callback is missing payment metadata' }, { status: 400 });
      }

      if (payment.amount != null && Math.abs(Number(payment.amount) - Number(amount)) >= 0.01) {
        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
      }
    } else if (verification.resultCode === '0') {
      // Never let an unverified failure callback cancel a payment that the
      // provider reports as successful. Wait for the success callback/retry.
      return NextResponse.json(
        { error: 'Payment provider verification reports success' },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const metadata = {
      merchant_request_id: callback.MerchantRequestID,
      checkout_request_id: callback.CheckoutRequestID,
      result_code: callback.ResultCode,
      result_desc: callback.ResultDesc ?? null,
      callback_received_at: now,
    };

    if (callback.ResultCode === 0) {
      const { data: applied, error: applyError } = await getSupabaseAdmin().rpc(
        'apply_payment_success',
        {
          p_payment_id: payment.id,
          p_transaction_id: String(transactionId),
          p_status: 'success',
          p_amount: Number(amount),
          p_currency: 'KES',
          p_metadata: { ...metadata, phone_number: phoneNumber == null ? null : String(phoneNumber) },
        },
      );

      if (applyError) throw applyError;
      if (!applied) {
        return NextResponse.json(
          { error: 'Payment is not in a payable state' },
          { status: 409 },
        );
      }
    } else {
      const { error: updateError } = await getSupabaseAdmin()
        .from('payments')
        .update({
          status: 'failed',
          transaction_id: null,
          phone_number: null,
          metadata,
          updated_at: now,
        })
        .eq('id', payment.id)
        .in('status', ['requested', 'pending']);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true, message: 'Callback processed successfully' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

