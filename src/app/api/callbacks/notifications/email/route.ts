import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

type SendGridEvent = {
  email?: string;
  event?: string;
  reason?: string;
  sg_event_id?: string;
  sg_message_id?: string;
  timestamp?: number;
  user_id?: string;
  order_id?: string;
};

type MailgunEvent = {
  event?: string;
  recipient?: string;
  reason?: string;
  'message-id'?: string;
  timestamp?: number;
  user_id?: string;
  order_id?: string;
};

type GenericEmailEvent = {
  email?: string;
  event?: string;
  reason?: string;
  user_id?: string;
  order_id?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const headersList = await headers();

    console.log('Email callback received:', {
      body,
      userAgent: headersList.get('user-agent'),
      timestamp: new Date().toISOString(),
    });

    const userAgent = headersList.get('user-agent') || '';

    if (userAgent.includes('SendGrid')) {
      await handleSendGridCallback(body as SendGridEvent[]);
    } else if (userAgent.includes('Mailgun')) {
      await handleMailgunCallback(body as MailgunEvent);
    } else {
      await handleGenericEmailCallback(body as GenericEmailEvent | GenericEmailEvent[]);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Email callback error:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

async function handleSendGridCallback(events: SendGridEvent[]) {
  for (const event of events) {
    const {
      email,
      event: eventType,
      reason,
      sg_event_id,
      sg_message_id,
      timestamp,
      user_id,
      order_id,
    } = event;

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
        timestamp: new Date((timestamp ?? Date.now() / 1000) * 1000).toISOString(),
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('SendGrid event logging error:', error);
    }

    switch (eventType) {
      case 'bounce':
      case 'dropped':
        if (email) await handleEmailBounce(email, reason ?? 'Delivery failed');
        break;
      case 'complaint':
        if (email) await handleEmailComplaint(email);
        break;
      case 'unsubscribe':
        if (email) await handleEmailUnsubscribe(email);
        break;
    }
  }
}

async function handleMailgunCallback(body: MailgunEvent) {
  const {
    event: eventType,
    recipient,
    reason,
    'message-id': messageId,
    timestamp,
    user_id,
    order_id,
  } = body;

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
      timestamp: new Date((timestamp ?? Date.now() / 1000) * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Mailgun event logging error:', error);
  }

  switch (eventType) {
    case 'bounced':
    case 'dropped':
      if (recipient) await handleEmailBounce(recipient, reason ?? 'Delivery failed');
      break;
    case 'complained':
      if (recipient) await handleEmailComplaint(recipient);
      break;
    case 'unsubscribed':
      if (recipient) await handleEmailUnsubscribe(recipient);
      break;
  }
}

async function handleGenericEmailCallback(body: GenericEmailEvent | GenericEmailEvent[]) {
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
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Generic email event logging error:', error);
    }
  }
}

async function handleEmailBounce(email: string, reason: string) {
  console.log('Email bounced:', { email, reason });
  const { error } = await supabase
    .from('profiles')
    .update({
      email_bounced: true,
      email_bounce_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (error) console.error('Email bounce update error:', error);
}

async function handleEmailComplaint(email: string) {
  console.log('Email complaint received:', email);
  const { error } = await supabase
    .from('profiles')
    .update({
      email_complaint: true,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (error) console.error('Email complaint update error:', error);
}

async function handleEmailUnsubscribe(email: string) {
  console.log('Email unsubscribe:', email);
  const { error } = await supabase
    .from('profiles')
    .update({
      marketing_emails: false,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (error) console.error('Email unsubscribe update error:', error);
}
