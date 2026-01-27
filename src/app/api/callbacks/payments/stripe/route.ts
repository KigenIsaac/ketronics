import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

// Stripe webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = (await headersList).get('stripe-signature');

    // Verify Stripe webhook signature (in production)
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    // For development, parse the body directly
    const event = JSON.parse(body);

    console.log('Stripe webhook received:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    });

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const { id, amount, currency, metadata } = paymentIntent;

  // Update payment record
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      transaction_id: id,
      amount: amount / 100, // Convert from cents
      currency,
      metadata: paymentIntent,
      updated_at: new Date().toISOString()
    })
    .eq('payment_intent_id', id);

  if (error) {
    console.error('Payment success update error:', error);
    return;
  }

  // Update order status if order_id is in metadata
  if (metadata?.order_id) {
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', metadata.order_id);

    console.log('Order payment confirmed:', metadata.order_id);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  const { id, last_payment_error } = paymentIntent;

  // Update payment record with failure
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      metadata: { ...paymentIntent, error: last_payment_error },
      updated_at: new Date().toISOString()
    })
    .eq('payment_intent_id', id);

  if (error) {
    console.error('Payment failure update error:', error);
  }

  console.log('Payment failed:', id, last_payment_error?.message);
}

async function handleCheckoutComplete(session: any) {
  const { id, payment_status, metadata } = session;

  // Update payment record
  const { error } = await supabase
    .from('payments')
    .update({
      status: payment_status === 'paid' ? 'completed' : 'pending',
      transaction_id: id,
      metadata: session,
      updated_at: new Date().toISOString()
    })
    .eq('checkout_session_id', id);

  if (error) {
    console.error('Checkout complete update error:', error);
    return;
  }

  // Update order status
  if (metadata?.order_id && payment_status === 'paid') {
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', metadata.order_id);
  }
}