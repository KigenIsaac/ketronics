import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

// Webhook signature verification utility
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): boolean {
  // In production, use proper crypto verification
  // For now, return true for development
  return true;
}

// General webhook handler for custom integrations
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-signature') || headersList.get('x-hub-signature');
    const eventType = headersList.get('x-event-type') || headersList.get('x-github-event');
    const userAgent = headersList.get('user-agent') || '';

    console.log('General webhook received:', {
      eventType,
      userAgent,
      hasSignature: !!signature,
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    });

    // Parse JSON body
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      // If not JSON, treat as raw text
      payload = body;
    }

    // Log webhook event
    const { error: logError } = await supabase
      .from('webhook_events')
      .insert({
        event_type: eventType || 'unknown',
        payload,
        signature,
        user_agent: userAgent,
        processed: false,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Webhook logging error:', logError);
    }

    // Process based on event type or user agent
    if (userAgent.includes('GitHub')) {
      await handleGitHubWebhook(payload, eventType);
    } else if (eventType?.includes('order') || eventType?.includes('payment')) {
      await handleCommerceWebhook(payload, eventType);
    } else {
      // Generic webhook processing
      await handleGenericWebhook(payload, eventType);
    }

    // Mark as processed
    if (!logError) {
      await supabase
        .from('webhook_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('event_type', eventType || 'unknown')
        .eq('created_at', new Date().toISOString());
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (err: any) {
    console.error('General webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleGitHubWebhook(payload: any, eventType: string | null) {
  console.log('Processing GitHub webhook:', eventType);

  switch (eventType) {
    case 'push':
      // Handle code pushes
      const { repository, commits } = payload;
      console.log('GitHub push:', {
        repo: repository?.full_name,
        commits: commits?.length
      });
      break;

    case 'pull_request':
      // Handle PR events
      const { action, pull_request } = payload;
      console.log('GitHub PR:', { action, pr: pull_request?.number });
      break;

    case 'release':
      // Handle releases
      const { release } = payload;
      console.log('GitHub release:', release?.tag_name);
      break;

    default:
      console.log('Unhandled GitHub event:', eventType);
  }
}

async function handleCommerceWebhook(payload: any, eventType: string | null) {
  console.log('Processing commerce webhook:', eventType);

  // Handle various e-commerce related webhooks
  if (eventType?.includes('inventory')) {
    // Inventory updates
    await handleInventoryUpdate(payload);
  } else if (eventType?.includes('customer')) {
    // Customer data updates
    await handleCustomerUpdate(payload);
  } else if (eventType?.includes('subscription')) {
    // Subscription events
    await handleSubscriptionEvent(payload);
  }
}

async function handleGenericWebhook(payload: any, eventType: string | null) {
  console.log('Processing generic webhook:', eventType);

  // Store the webhook data for manual processing
  const { error } = await supabase
    .from('generic_webhooks')
    .insert({
      event_type: eventType,
      payload,
      processed: false,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Generic webhook storage error:', error);
  }
}

async function handleInventoryUpdate(payload: any) {
  const { product_id, quantity, location } = payload;

  const { error } = await supabase
    .from('inventory_updates')
    .insert({
      product_id,
      quantity_change: quantity,
      location,
      source: 'webhook',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Inventory update error:', error);
  }
}

async function handleCustomerUpdate(payload: any) {
  const { customer_id, updates } = payload;

  const { error } = await supabase
    .from('customer_updates')
    .insert({
      customer_id,
      updates,
      source: 'webhook',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Customer update error:', error);
  }
}

async function handleSubscriptionEvent(payload: any) {
  const { subscription_id, event, customer_id } = payload;

  const { error } = await supabase
    .from('subscription_events')
    .insert({
      subscription_id,
      event_type: event,
      customer_id,
      payload,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Subscription event error:', error);
  }
}

// GET method for webhook status checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (eventId) {
      // Get specific webhook event
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

    // Get recent webhook events
    const { data: events, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch webhook events' }, { status: 500 });
    }

    return NextResponse.json({ events });

  } catch (err: any) {
    console.error('Webhook status GET error:', err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}