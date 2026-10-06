import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

type TwilioCallback = {
  MessageSid?: string;
  MessageStatus?: string;
  To?: string;
  From?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  user_id?: string;
  order_id?: string;
};

type AfricasTalkingCallback = {
  id?: string;
  status?: string;
  phoneNumber?: string;
  networkCode?: string;
  failureReason?: string;
  retryCount?: number;
  user_id?: string;
  order_id?: string;
};

type GenericSmsEvent = {
  phone?: string;
  status?: string;
  messageId?: string;
  error?: string;
  user_id?: string;
  order_id?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const headersList = await headers();

    console.log('SMS callback received:', {
      body,
      userAgent: headersList.get('user-agent'),
      timestamp: new Date().toISOString(),
    });

    const userAgent = headersList.get('user-agent') || '';

    if (userAgent.includes('Twilio')) {
      await handleTwilioCallback(body as TwilioCallback);
    } else if (userAgent.includes("Africa's Talking") || userAgent.includes('AfricasTalking')) {
      await handleAfricasTalkingCallback(body as AfricasTalkingCallback);
    } else {
      await handleGenericSMSCallback(body as GenericSmsEvent | GenericSmsEvent[]);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('SMS callback error:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

async function handleTwilioCallback(body: TwilioCallback) {
  const {
    MessageSid,
    MessageStatus,
    To,
    ErrorCode,
    ErrorMessage,
    user_id,
    order_id,
  } = body;

  const { error } = await supabase
    .from('sms_events')
    .insert({
      phone_number: To,
      status: MessageStatus,
      provider: 'twilio',
      provider_message_id: MessageSid,
      error_code: ErrorCode,
      error_message: ErrorMessage,
      user_id,
      order_id,
      created_at: new Date().toISOString(),
    });

  if (error) console.error('Twilio SMS event logging error:', error);

  if (To && (MessageStatus === 'failed' || MessageStatus === 'undelivered')) {
    await handleSMSDeliveryFailure(To, ErrorMessage || 'Delivery failed');
  }

  console.log('Twilio SMS status:', { MessageSid, MessageStatus, To });
}

async function handleAfricasTalkingCallback(body: AfricasTalkingCallback) {
  const {
    id,
    status,
    phoneNumber,
    networkCode,
    failureReason,
    retryCount,
    user_id,
    order_id,
  } = body;

  const { error } = await supabase
    .from('sms_events')
    .insert({
      phone_number: phoneNumber,
      status: status?.toLowerCase(),
      provider: 'africas_talking',
      provider_message_id: id,
      network_code: networkCode,
      error_message: failureReason,
      retry_count: retryCount,
      user_id,
      order_id,
      created_at: new Date().toISOString(),
    });

  if (error) console.error("Africa's Talking SMS event logging error:", error);

  if (phoneNumber && (status === 'Failed' || status === 'Rejected')) {
    await handleSMSDeliveryFailure(phoneNumber, failureReason || 'Delivery failed');
  }

  console.log("Africa's Talking SMS status:", { id, status, phoneNumber });
}

async function handleGenericSMSCallback(body: GenericSmsEvent | GenericSmsEvent[]) {
  const events = Array.isArray(body) ? body : [body];

  for (const event of events) {
    const {
      phone,
      status,
      messageId,
      error,
      user_id,
      order_id,
    } = event;

    const { error: insertError } = await supabase
      .from('sms_events')
      .insert({
        phone_number: phone,
        status: status?.toLowerCase(),
        provider: 'generic',
        provider_message_id: messageId,
        error_message: error,
        user_id,
        order_id,
        created_at: new Date().toISOString(),
      });

    if (insertError) console.error('Generic SMS event logging error:', insertError);

    if (phone && (status === 'failed' || status === 'undelivered')) {
      await handleSMSDeliveryFailure(phone, error || 'Delivery failed');
    }
  }
}

async function handleSMSDeliveryFailure(phoneNumber: string, reason: string) {
  console.log('SMS delivery failed:', { phoneNumber, reason });

  const { error } = await supabase
    .from('profiles')
    .update({
      sms_delivery_failed: true,
      sms_failure_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('phone', phoneNumber);

  if (error) console.error('SMS failure update error:', error);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('message_id');
    const phone = searchParams.get('phone');

    if (!messageId && !phone) {
      return NextResponse.json({ error: 'Message ID or phone number required' }, { status: 400 });
    }

    let query = supabase
      .from('sms_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (messageId) {
      query = query.eq('provider_message_id', messageId);
    } else if (phone) {
      query = query.eq('phone_number', phone);
    }

    const { data: events, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'SMS events not found' }, { status: 404 });
    }

    return NextResponse.json({ events });
  } catch (err: unknown) {
    console.error('SMS status GET error:', err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}
