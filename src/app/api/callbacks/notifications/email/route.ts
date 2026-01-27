import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

// Email delivery status callback (from SendGrid, Mailgun, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();

    console.log('Email callback received:', {
      body,
      userAgent: headersList.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    // Handle different email providers
    const userAgent = headersList.get('user-agent') || '';

    if (userAgent.includes('SendGrid')) {
      await handleSendGridCallback(body);
    } else if (userAgent.includes('Mailgun')) {
      await handleMailgunCallback(body);
    } else {
      // Generic email callback processing
      await handleGenericEmailCallback(body);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Email callback error:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

async function handleSendGridCallback(events: any[]) {
  for (const event of events) {
    const {
      email,
      event: eventType,
      reason,
      sg_event_id,
      sg_message_id,
      timestamp,
      user_id,
      order_id
    } = event;

    // Log email event
    const { error } = await supabase
      .from('email_events')
      .insert({
        email,
        event_type: eventType,
        reason,
        provider: 'sendgrid',
        provider_event_id: sg_event_id,
        provider_message_id: sg_message_id,
        user_id,
        order_id,
        timestamp: new Date(timestamp * 1000).toISOString(), // Convert Unix timestamp
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('SendGrid event logging error:', error);
    }

    // Handle specific events
    switch (eventType) {
      case 'bounce':
      case 'dropped':
        await handleEmailBounce(email, reason);
        break;
      case 'complaint':
        await handleEmailComplaint(email);
        break;
      case 'unsubscribe':
        await handleEmailUnsubscribe(email);
        break;
    }
  }
}

async function handleMailgunCallback(body: any) {
  const {
    event: eventType,
    recipient,
    reason,
    'message-id': messageId,
    timestamp,
    user_id,
    order_id
  } = body;

  // Log email event
  const { error } = await supabase
    .from('email_events')
    .insert({
      email: recipient,
      event_type: eventType,
      reason,
      provider: 'mailgun',
      provider_message_id: messageId,
      user_id,
      order_id,
      timestamp: new Date(timestamp * 1000).toISOString(),
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Mailgun event logging error:', error);
  }

  // Handle specific events similar to SendGrid
  switch (eventType) {
    case 'bounced':
    case 'dropped':
      await handleEmailBounce(recipient, reason);
      break;
    case 'complained':
      await handleEmailComplaint(recipient);
      break;
    case 'unsubscribed':
      await handleEmailUnsubscribe(recipient);
      break;
  }
}

async function handleGenericEmailCallback(body: any) {
  // Handle generic email callbacks
  const events = Array.isArray(body) ? body : [body];

  for (const event of events) {
    const { email, event: eventType, reason, user_id, order_id } = event;

    const { error } = await supabase
      .from('email_events')
      .insert({
        email,
        event_type: eventType,
        reason,
        provider: 'generic',
        user_id,
        order_id,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Generic email event logging error:', error);
    }
  }
}

async function handleEmailBounce(email: string, reason: string) {
  console.log('Email bounced:', { email, reason });

  // Update user profile to mark email as bounced
  const { error } = await supabase
    .from('profiles')
    .update({
      email_bounced: true,
      email_bounce_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('email', email);

  if (error) {
    console.error('Email bounce update error:', error);
  }
}

async function handleEmailComplaint(email: string) {
  console.log('Email complaint received:', email);

  // Mark user as having complained about emails
  const { error } = await supabase
    .from('profiles')
    .update({
      email_complaint: true,
      updated_at: new Date().toISOString()
    })
    .eq('email', email);

  if (error) {
    console.error('Email complaint update error:', error);
  }
}

async function handleEmailUnsubscribe(email: string) {
  console.log('Email unsubscribe:', email);

  // Update user preferences to not receive marketing emails
  const { error } = await supabase
    .from('profiles')
    .update({
      marketing_emails: false,
      updated_at: new Date().toISOString()
    })
    .eq('email', email);

  if (error) {
    console.error('Email unsubscribe update error:', error);
  }
}