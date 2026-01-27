import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

// SMS delivery status callback (from Twilio, Africa's Talking, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();

    console.log('SMS callback received:', {
      body,
      userAgent: headersList.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    // Handle different SMS providers
    const userAgent = headersList.get('user-agent') || '';

    if (userAgent.includes('Twilio')) {
      await handleTwilioCallback(body);
    } else if (userAgent.includes('Africa\'s Talking') || userAgent.includes('AfricasTalking')) {
      await handleAfricasTalkingCallback(body);
    } else {
      // Generic SMS callback processing
      await handleGenericSMSCallback(body);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('SMS callback error:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

async function handleTwilioCallback(body: any) {
  const {
    MessageSid,
    MessageStatus,
    To,
    From,
    ErrorCode,
    ErrorMessage,
    user_id,
    order_id
  } = body;

  // Log SMS event
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
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Twilio SMS event logging error:', error);
  }

  // Handle delivery failures
  if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
    await handleSMSDeliveryFailure(To, ErrorMessage || 'Delivery failed');
  }

  console.log('Twilio SMS status:', { MessageSid, MessageStatus, To });
}

async function handleAfricasTalkingCallback(body: any) {
  const {
    id, // Africa's Talking message ID
    status, // Sent, Delivered, Failed, Rejected
    phoneNumber,
    networkCode,
    failureReason,
    retryCount,
    user_id,
    order_id
  } = body;

  // Log SMS event
  const { error } = await supabase
    .from('sms_events')
    .insert({
      phone_number: phoneNumber,
      status: status.toLowerCase(),
      provider: 'africas_talking',
      provider_message_id: id,
      network_code: networkCode,
      error_message: failureReason,
      retry_count: retryCount,
      user_id,
      order_id,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Africa\'s Talking SMS event logging error:', error);
  }

  // Handle delivery failures
  if (status === 'Failed' || status === 'Rejected') {
    await handleSMSDeliveryFailure(phoneNumber, failureReason || 'Delivery failed');
  }

  console.log('Africa\'s Talking SMS status:', { id, status, phoneNumber });
}

async function handleGenericSMSCallback(body: any) {
  const events = Array.isArray(body) ? body : [body];

  for (const event of events) {
    const {
      phone,
      status,
      messageId,
      error,
      user_id,
      order_id
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
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Generic SMS event logging error:', insertError);
    }

    // Handle delivery failures
    if (status === 'failed' || status === 'undelivered') {
      await handleSMSDeliveryFailure(phone, error || 'Delivery failed');
    }
  }
}

async function handleSMSDeliveryFailure(phoneNumber: string, reason: string) {
  console.log('SMS delivery failed:', { phoneNumber, reason });

  // Update user profile to track SMS delivery issues
  const { error } = await supabase
    .from('profiles')
    .update({
      sms_delivery_failed: true,
      sms_failure_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('phone', phoneNumber);

  if (error) {
    console.error('SMS failure update error:', error);
  }

  // Optionally send alternative notification (email) if SMS fails
  // This would require finding the user by phone number and sending email
}

// GET method for SMS status checks
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

  } catch (err: any) {
    console.error('SMS status GET error:', err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}