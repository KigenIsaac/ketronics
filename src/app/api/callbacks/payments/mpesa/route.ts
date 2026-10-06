import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// M-Pesa/STK Push Callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Never log the full callback: it can contain customer/payment data.
    console.log('M-Pesa callback received:', {
      hasBody: Boolean(body),
      timestamp: new Date().toISOString(),
    });

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = body.Body?.stkCallback || body;

    if (!MerchantRequestID || !CheckoutRequestID || typeof ResultCode !== 'number') {
      return NextResponse.json(
        { error: 'Invalid M-Pesa callback payload' },
        { status: 400 }
      );
    }

    const paymentData: {
      merchant_request_id: string;
      checkout_request_id: string;
      result_code: number;
      result_description: string | null;
      status: 'success' | 'failed';
      transaction_id: string | null;
      amount: number | null;
      phone_number: string | null;
      timestamp: string;
    } = {
      merchant_request_id: MerchantRequestID,
      checkout_request_id: CheckoutRequestID,
      result_code: ResultCode,
      result_description: ResultDesc ?? null,
      status: ResultCode === 0 ? 'success' : 'failed',
      transaction_id: null,
      amount: null,
      phone_number: null,
      timestamp: new Date().toISOString(),
    };

    if (ResultCode === 0 && CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        switch (item.Name) {
          case 'Amount':
            paymentData.amount =
              typeof item.Value === 'number' ? item.Value : Number(item.Value);
            break;
          case 'MpesaReceiptNumber':
            paymentData.transaction_id = String(item.Value);
            break;
          case 'TransactionDate': {
            const value = String(item.Value);
            if (/^\d{14}$/.test(value)) {
              const year = value.slice(0, 4);
              const month = value.slice(4, 6);
              const day = value.slice(6, 8);
              const hour = value.slice(8, 10);
              const minute = value.slice(10, 12);
              const second = value.slice(12, 14);
              paymentData.timestamp =
                `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
            }
            break;
          }
          case 'PhoneNumber':
            paymentData.phone_number = String(item.Value);
            break;
        }
      }
    }

    // The callback may only update a payment that our system initiated.
    // Do not create or update a payment from arbitrary transaction/order IDs.
    const { data: paymentRecord, error: lookupError } = await supabase
      .from('payments')
      .select('id, order_id, amount, status')
      .eq('merchant_request_id', MerchantRequestID)
      .eq('checkout_request_id', CheckoutRequestID)
      .maybeSingle();

    if (lookupError) {
      console.error('Failed to find M-Pesa payment:', lookupError);
      return NextResponse.json(
        { error: 'Payment lookup failed' },
        { status: 500 }
      );
    }

    if (!paymentRecord) {
      console.warn('M-Pesa callback has no matching initiated payment', {
        MerchantRequestID,
        CheckoutRequestID,
      });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Never allow a successful callback to silently change the expected amount.
    if (
      ResultCode === 0 &&
      paymentData.amount !== null &&
      paymentRecord.amount !== null &&
      Number(paymentRecord.amount) !== paymentData.amount
    ) {
      console.error('M-Pesa callback amount mismatch', {
        paymentId: paymentRecord.id,
        expected: paymentRecord.amount,
        received: paymentData.amount,
      });
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentData.status,
        transaction_id: paymentData.transaction_id,
        amount: paymentData.amount ?? paymentRecord.amount,
        phone_number: paymentData.phone_number,
        metadata: body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id);

    if (updateError) {
      console.error('Failed to update M-Pesa payment:', updateError);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    if (ResultCode === 0 && paymentRecord.order_id) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.order_id);

      if (orderError) {
        console.error('Failed to update paid order:', orderError);
        return NextResponse.json(
          { error: 'Order update failed' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'M-Pesa callback processed successfully',
    });
  } catch (err: unknown) {
    console.error('M-Pesa callback error:', err);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}

// GET is intentionally read-only. Payment state must only be changed by
// authenticated/provider callbacks, never by URL query parameters.
export async function GET(request: NextRequest) {
  try {
    const transactionId = new URL(request.url).searchParams.get('transaction_id');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'transaction_id is required' },
        { status: 400 }
      );
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .select('status, order_id')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (error) {
      console.error('Payment status lookup error:', error);
      return NextResponse.json(
        { error: 'Payment status lookup failed' },
        { status: 500 }
      );
    }

    if (!payment?.order_id) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const destination =
      payment.status === 'success' || payment.status === 'completed'
        ? 'success'
        : payment.status === 'failed'
          ? 'failed'
          : 'pending';

    return NextResponse.redirect(
      new URL(
        `/orders/${payment.order_id}?payment=${destination}`,
        request.url
      )
    );
  } catch (err: unknown) {
    console.error('M-Pesa payment status error:', err);
    return NextResponse.redirect(
      new URL('/?error=Payment status lookup failed', request.url)
    );
  }
}
