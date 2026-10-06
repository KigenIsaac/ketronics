import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyStripeWebhookSignature } from '@/lib/payments/stripeWebhook';

type StripePaymentIntent = {
  id: string;
  amount?: number;
  currency?: string;
  last_payment_error?: {
    message?: string;
    code?: string;
    type?: string;
  } | null;
};

type StripeCheckoutSession = {
  id: string;
  payment_status?: string;
  amount_total?: number | null;
};

type StripeWebhookEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: StripePaymentIntent | StripeCheckoutSession;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!verifyStripeWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(body) as StripeWebhookEvent;
    const object = event.data?.object;

    if (!event.id || !event.type || !object) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const { data: claimed, error: claimError } = await getSupabaseAdmin().rpc(
      'claim_stripe_webhook_event',
      { p_event_id: event.id, p_event_type: event.type },
    );

    if (claimError) throw claimError;

    if (!claimed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(object as StripePaymentIntent, event.id);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(object as StripePaymentIntent, event.id);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(object as StripeCheckoutSession, event.id);
        break;
      default:
        break;
    }

    const { error: completionError } = await getSupabaseAdmin().rpc(
      'complete_stripe_webhook_event',
      { p_event_id: event.id },
    );

    if (completionError) throw completionError;

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function findPayment(column: string, value: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('payments')
    .select('id, order_id, status, amount, currency')
    .eq(column, value)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function amountsMatch(expected: unknown, receivedCents: unknown) {
  if (expected == null || receivedCents == null) return true;
  const received = Number(receivedCents) / 100;
  return Number.isFinite(received) && Math.abs(Number(expected) - received) < 0.01;
}

async function markOrderPaid(orderId: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabaseAdmin()
    .from('orders')
    .update({ status: 'paid', payment_date: now, updated_at: now })
    .eq('id', orderId)
    .neq('status', 'paid');

  if (error) throw error;
}

async function handlePaymentIntentSucceeded(intent: StripePaymentIntent, eventId: string) {
  const payment = await findPayment('payment_intent_id', intent.id);
  if (!payment) throw new Error('Stripe payment intent is not linked to an existing payment');

  if (!amountsMatch(payment.amount, intent.amount)) {
    throw new Error('Stripe payment amount does not match the recorded payment');
  }

  if (payment.status === 'completed' || payment.status === 'success') return;

  const now = new Date().toISOString();
  const { error } = await getSupabaseAdmin().from('payments').update({
    status: 'completed',
    transaction_id: intent.id,
    amount: Number(intent.amount) / 100,
    currency: intent.currency,
    metadata: { event_id: eventId, provider: 'stripe' },
    updated_at: now,
  }).eq('id', payment.id);

  if (error) throw error;
  if (payment.order_id) await markOrderPaid(payment.order_id);
}

async function handlePaymentIntentFailed(intent: StripePaymentIntent, eventId: string) {
  const payment = await findPayment('payment_intent_id', intent.id);
  if (!payment) throw new Error('Stripe failed payment is not linked to an existing payment');

  if (payment.status === 'completed' || payment.status === 'success') return;

  const { error } = await getSupabaseAdmin().from('payments').update({
    status: 'failed',
    metadata: {
      event_id: eventId,
      provider: 'stripe',
      error: intent.last_payment_error ?? null,
    },
    updated_at: new Date().toISOString(),
  }).eq('id', payment.id);

  if (error) throw error;
}

async function handleCheckoutCompleted(session: StripeCheckoutSession, eventId: string) {
  const payment = await findPayment('checkout_session_id', session.id);
  if (!payment) throw new Error('Stripe checkout session is not linked to an existing payment');

  if (session.payment_status !== 'paid') {
    if (payment.status === 'completed' || payment.status === 'success') return;
    return;
  }

  if (!amountsMatch(payment.amount, session.amount_total)) {
    throw new Error('Stripe checkout amount does not match the recorded payment');
  }

  if (payment.status === 'completed' || payment.status === 'success') return;

  const now = new Date().toISOString();
  const { error } = await getSupabaseAdmin().from('payments').update({
    status: 'completed',
    transaction_id: session.id,
    metadata: { event_id: eventId, provider: 'stripe' },
    updated_at: now,
  }).eq('id', payment.id);

  if (error) throw error;
  if (payment.order_id) await markOrderPaid(payment.order_id);
}
