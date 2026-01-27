import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Shipping provider callbacks (e.g., from courier services)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trackingNumber,
      status,
      location,
      timestamp,
      orderId,
      carrier,
      estimatedDelivery,
      signature,
      photos
    } = body;

    console.log('Shipping callback received:', {
      trackingNumber,
      status,
      location,
      orderId,
      carrier,
      timestamp: new Date().toISOString()
    });

    if (!trackingNumber || !status) {
      return NextResponse.json(
        { error: 'Tracking number and status are required' },
        { status: 400 }
      );
    }

    // Find order by tracking number if orderId not provided
    let orderIdToUpdate = orderId;
    if (!orderIdToUpdate && trackingNumber) {
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .single();

      orderIdToUpdate = order?.id;
    }

    if (!orderIdToUpdate) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create shipping update record
    const { error: insertError } = await supabase
      .from('shipping_updates')
      .insert({
        order_id: orderIdToUpdate,
        tracking_number: trackingNumber,
        status,
        location,
        carrier,
        estimated_delivery: estimatedDelivery,
        signature,
        photos,
        timestamp: timestamp || new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Shipping update insert error:', insertError);
      return NextResponse.json({ error: 'Failed to record shipping update' }, { status: 500 });
    }

    // Update order with latest shipping information
    const orderUpdate: any = {
      updated_at: new Date().toISOString()
    };

    if (carrier) orderUpdate.shipping_carrier = carrier;
    if (estimatedDelivery) orderUpdate.estimated_delivery = estimatedDelivery;

    // Update order status based on shipping status
    const statusMapping: { [key: string]: string } = {
      'picked_up': 'shipped',
      'in_transit': 'shipped',
      'out_for_delivery': 'shipped',
      'delivered': 'delivered',
      'failed_delivery': 'shipped', // Still shipped, just failed delivery attempt
      'returned': 'returned'
    };

    if (statusMapping[status]) {
      orderUpdate.status = statusMapping[status];

      if (status === 'delivered') {
        orderUpdate.delivered_date = timestamp || new Date().toISOString();
      }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(orderUpdate)
      .eq('id', orderIdToUpdate);

    if (updateError) {
      console.error('Order shipping update error:', updateError);
    }

    // Send delivery notifications
    if (status === 'delivered' || status === 'out_for_delivery') {
      await sendDeliveryNotification(orderIdToUpdate, status, {
        trackingNumber,
        location,
        estimatedDelivery
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Shipping update processed successfully'
    });

  } catch (err: any) {
    console.error('Shipping callback error:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

// GET method for tracking information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('tracking');

    if (!trackingNumber) {
      return NextResponse.json({ error: 'Tracking number is required' }, { status: 400 });
    }

    // Get shipping updates for this tracking number
    const { data: updates, error } = await supabase
      .from('shipping_updates')
      .select(`
        *,
        orders:order_id (
          id,
          status,
          estimated_delivery
        )
      `)
      .eq('tracking_number', trackingNumber)
      .order('timestamp', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Tracking information not found' }, { status: 404 });
    }

    return NextResponse.json({ updates });

  } catch (err: any) {
    console.error('Shipping tracking GET error:', err);
    return NextResponse.json({ error: 'Tracking lookup failed' }, { status: 500 });
  }
}

async function sendDeliveryNotification(
  orderId: string,
  status: string,
  details: {
    trackingNumber: string;
    location?: string;
    estimatedDelivery?: string;
  }
) {
  try {
    // Get order and customer details
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name,
          phone
        )
      `)
      .eq('id', orderId)
      .single();

    if (!order) return;

    const customer = order.profiles;

    if (status === 'out_for_delivery') {
      // Send "out for delivery" notification
      console.log('Order out for delivery:', {
        orderId,
        customer: customer.email,
        trackingNumber: details.trackingNumber,
        location: details.location
      });
    } else if (status === 'delivered') {
      // Send delivery confirmation
      console.log('Order delivered:', {
        orderId,
        customer: customer.email,
        trackingNumber: details.trackingNumber
      });
    }

    // Here you would integrate with notification services
    // SMS, email, push notifications, etc.

  } catch (err: any) {
    console.error('Delivery notification error:', err);
  }
}