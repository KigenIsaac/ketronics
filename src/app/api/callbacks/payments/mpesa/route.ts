import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

// M-Pesa/STK Push Callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();

    // Log the callback for debugging
    console.log('Payment callback received:', {
      body,
      headers: Object.fromEntries(headersList.entries()),
      timestamp: new Date().toISOString()
    });

    // Extract payment details based on provider
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = body.Body?.stkCallback || body;

    // M-Pesa specific processing
    if (MerchantRequestID && CheckoutRequestID) {
      const paymentData = {
        merchant_request_id: MerchantRequestID,
        checkout_request_id: CheckoutRequestID,
        result_code: ResultCode,
        result_description: ResultDesc,
        status: ResultCode === 0 ? 'success' : 'failed',
        transaction_id: null,
        amount: null,
        phone_number: null,
        timestamp: new Date().toISOString()
      };

      // Extract additional metadata if payment was successful
      if (ResultCode === 0 && CallbackMetadata?.Item) {
        const metadata = CallbackMetadata.Item;

        metadata.forEach((item: any) => {
          switch (item.Name) {
            case 'Amount':
              paymentData.amount = item.Value;
              break;
            case 'MpesaReceiptNumber':
              paymentData.transaction_id = item.Value;
              break;
            case 'TransactionDate':
              // M-Pesa timestamp format: 20240127120000
              const timestamp = item.Value.toString();
              const year = timestamp.substring(0, 4);
              const month = timestamp.substring(4, 6);
              const day = timestamp.substring(6, 8);
              const hour = timestamp.substring(8, 10);
              const minute = timestamp.substring(10, 12);
              const second = timestamp.substring(12, 14);
              paymentData.timestamp = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
              break;
            case 'PhoneNumber':
              paymentData.phone_number = item.Value;
              break;
          }
        });
      }

      // Update payment record in database
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: paymentData.status,
          transaction_id: paymentData.transaction_id,
          amount: paymentData.amount,
          phone_number: paymentData.phone_number,
          metadata: body,
          updated_at: new Date().toISOString()
        })
        .eq('merchant_request_id', MerchantRequestID)
        .eq('checkout_request_id', CheckoutRequestID);

      if (updateError) {
        console.error('Failed to update payment record:', updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // If payment was successful, update order status
      if (ResultCode === 0) {
        // Find the order associated with this payment
        const { data: paymentRecord } = await supabase
          .from('payments')
          .select('order_id')
          .eq('merchant_request_id', MerchantRequestID)
          .single();

        if (paymentRecord?.order_id) {
          // Update order status to paid
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentRecord.order_id);

          // Send order confirmation email/SMS
          console.log('Order payment confirmed:', paymentRecord.order_id);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment callback processed successfully'
      });
    }

    // Generic payment callback processing
    const { transaction_id, status, amount, order_id } = body;

    if (transaction_id) {
      const { error } = await supabase
        .from('payments')
        .update({
          status: status || 'completed',
          transaction_id,
          amount,
          metadata: body,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transaction_id);

      if (error) {
        console.error('Payment update error:', error);
        return NextResponse.json({ error: 'Payment update failed' }, { status: 500 });
      }

      // Update order status if provided
      if (order_id && status === 'completed') {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', order_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully'
    });

  } catch (err: any) {
    console.error('Payment callback error:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

// GET method for payment status checks or redirects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');

    if (transactionId && status) {
      // Update payment status
      const { error } = await supabase
        .from('payments')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);

      if (error) {
        console.error('Payment status update error:', error);
      }

      // Redirect based on status
      if (status === 'success') {
        return NextResponse.redirect(
          new URL(`/orders/${orderId}?payment=success`, request.url)
        );
      } else {
        return NextResponse.redirect(
          new URL(`/orders/${orderId}?payment=failed`, request.url)
        );
      }
    }

    return NextResponse.json({ error: 'Invalid callback parameters' }, { status: 400 });

  } catch (err: any) {
    console.error('Payment callback GET error:', err);
    return NextResponse.redirect(
      new URL('/?error=Payment processing failed', request.url)
    );
  }
}