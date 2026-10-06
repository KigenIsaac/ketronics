import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type JsonObject = { [key: string]: Json | undefined };

function asObject(value: Json): JsonObject | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : null;
}

function asString(value: Json | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNumber(value: Json | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256',
): boolean {
  if (!payload || !signature || !secret) return false;
  const normalized = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  const expected = createHmac(algorithm, secret).update(payload, 'utf8').digest('hex');
  const received = Buffer.from(normalized, 'utf8');
  const actual = Buffer.from(expected, 'utf8');
  return received.length === actual.length && timingSafeEqual(received, actual);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-signature') || headersList.get('x-hub-signature');
    const secret = process.env.GENERAL_WEBHOOK_SECRET;

    if (!verifyWebhookSignature(body, signature || '', secret || '')) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const eventType = headersList.get('x-event-type') || headersList.get('x-github-event');
    const userAgent = headersList.get('user-agent') || '';

    console.log('General webhook received:', {
      eventType,
      userAgent,
      hasSignature: !!signature,
      bodyLength: body.length,
      timestamp: new Date().toISOString(),
    });

    let payload: Json;
    try {
      payload = JSON.parse(body) as Json;
    } catch {
      payload = body;
    }

    const { data: loggedEvent, error: logError } = await supabase
      .from('webhook_events')
      .insert({
        event_type: eventType || 'unknown',
        payload,
        signature,
        user_agent: userAgent,
        processed: false,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (logError) {
      console.error('Webhook logging error:', logError);
    }

    if (userAgent.includes('GitHub')) {
      await handleGitHubWebhook(payload, eventType);
    } else if (eventType?.includes('order') || eventType?.includes('payment')) {
      await handleCommerceWebhook(payload, eventType);
    } else {
      await handleGenericWebhook(payload, eventType);
    }

    if (!logError && loggedEvent) {
      await supabase
        .from('webhook_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', loggedEvent.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (err: unknown) {
    console.error('General webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleGitHubWebhook(payload: Json, eventType: string | null) {
  const object = asObject(payload);
  if (!object) return;

  console.log('Processing GitHub webhook:', eventType);

  switch (eventType) {
    case 'push': {
      const repository = asObject(object.repository ?? null);
      const commits = Array.isArray(object.commits) ? object.commits : [];
      console.log('GitHub push:', {
        repo: repository ? asString(repository.full_name) : undefined,
        commits: commits.length,
      });
      break;
    }
    case 'pull_request': {
      const pullRequest = asObject(object.pull_request ?? null);
      console.log('GitHub PR:', {
        action: asString(object.action),
        pr: pullRequest ? asNumber(pullRequest.number) : undefined,
      });
      break;
    }
    case 'release': {
      const release = asObject(object.release ?? null);
      console.log('GitHub release:', release ? asString(release.tag_name) : undefined);
      break;
    }
    default:
      console.log('Unhandled GitHub event:', eventType);
  }
}

async function handleCommerceWebhook(payload: Json, eventType: string | null) {
  console.log('Processing commerce webhook:', eventType);

  if (eventType?.includes('inventory')) {
    await handleInventoryUpdate(payload);
  } else if (eventType?.includes('customer')) {
    await handleCustomerUpdate(payload);
  } else if (eventType?.includes('subscription')) {
    await handleSubscriptionEvent(payload);
  }
}

async function handleGenericWebhook(payload: Json, eventType: string | null) {
  console.log('Processing generic webhook:', eventType);

  const { error } = await supabase
    .from('generic_webhooks')
    .insert({
      event_type: eventType,
      payload,
      processed: false,
      created_at: new Date().toISOString(),
    });

  if (error) console.error('Generic webhook storage error:', error);
}

async function handleInventoryUpdate(payload: Json) {
  const object = asObject(payload);
  if (!object) return;

  const productId = asString(object.product_id);
  const quantity = asNumber(object.quantity);
  const location = asString(object.location);

  const { error } = await supabase
    .from('inventory_updates')
    .insert({
      product_id: productId,
      quantity_change: quantity,
      location,
      source: 'webhook',
      created_at: new Date().toISOString(),
    });

  if (error) console.error('Inventory update error:', error);
}

async function handleCustomerUpdate(payload: Json) {
  const object = asObject(payload);
  if (!object) return;

  const customerId = asString(object.customer_id);
  const updates = object.updates ?? null;

  const { error } = await supabase
    .from('customer_updates')
    .insert({
      customer_id: customerId,
      updates,
      source: 'webhook',
      created_at: new Date().toISOString(),
    });

  if (error) console.error('Customer update error:', error);
}

async function handleSubscriptionEvent(payload: Json) {
  const object = asObject(payload);
  if (!object) return;

  const subscriptionId = asString(object.subscription_id);
  const event = asString(object.event);
  const customerId = asString(object.customer_id);

  const { error } = await supabase
    .from('subscription_events')
    .insert({
      subscription_id: subscriptionId,
      event_type: event,
      customer_id: customerId,
      payload,
      created_at: new Date().toISOString(),
    });

  if (error) console.error('Subscription event error:', error);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (eventId) {
      const { data: event, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Webhook event not found' }, { status: 404 });
      }

      return NextResponse.json({ event });
    }

    const { data: events, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch webhook events' }, { status: 500 });
    }

    return NextResponse.json({ events });
  } catch (err: unknown) {
    console.error('Webhook status GET error:', err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}
