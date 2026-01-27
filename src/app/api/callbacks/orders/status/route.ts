import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Order status update callback (from shipping providers, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, trackingNumber, carrier, estimatedDelivery, notes } = body;

    console.log('Order status callback received:', {
      orderId,
      status,
      trackingNumber,
      carrier,
      timestamp: new Date().toISOString()
    });

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      'pending', 'confirmed', 'processing', 'shipped',
      'delivered', 'cancelled', 'refunded', 'returned'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Update order status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add shipping information if provided
    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (carrier) updateData.shipping_carrier = carrier;
    if (estimatedDelivery) updateData.estimated_delivery = estimatedDelivery;
    if (notes) updateData.notes = notes;

    // Set shipped date when status changes to shipped
    if (status === 'shipped') {
      updateData.shipped_date = new Date().toISOString();
    }

    // Set delivered date when status changes to delivered
    if (status === 'delivered') {
      updateData.delivered_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Order status update error:', error);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // Create order status history record
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status,
        tracking_number: trackingNumber,
        carrier,
        notes,
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('Order history creation error:', historyError);
      // Don't fail the request if history creation fails
    }

    // Send notifications based on status change
    await sendOrderStatusNotification(orderId, status, {
      trackingNumber,
      carrier,
      estimatedDelivery
    });

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (err: any) {
    console.error('Order status callback error:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

// GET method for status checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get current order status
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, tracking_number, shipping_carrier, estimated_delivery, updated_at')
      .eq('id', orderId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (err: any) {
    console.error('Order status GET error:', err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}

async function sendOrderStatusNotification(
  orderId: string,
  status: string,
  details: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  }
) {
  try {
    // Get order details with customer information
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
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed.',
      processing: 'Your order is now being prepared for shipment.',
      shipped: `Your order has been shipped! Tracking: ${details.trackingNumber || 'N/A'}`,
      delivered: 'Your order has been delivered successfully.',
      cancelled: 'Your order has been cancelled.',
      refunded: 'Your refund has been processed.'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Order status updated to: ${status}`;

    // Here you would integrate with your notification service
    // For example: SendGrid for email, Twilio for SMS, etc.

    console.log('Order status notification:', {
      orderId,
      customer: customer.email,
      status,
      message
    });

    // Example email notification (integrate with your email service)
    /*
    await sendEmail({
      to: customer.email,
      subject: `Order ${orderId} - Status Update`,
      template: 'order-status-update',
      data: {
        orderId,
        status,
        message,
        trackingNumber: details.trackingNumber,
        carrier: details.carrier,
        estimatedDelivery: details.estimatedDelivery
      }
    });
    */

  } catch (err: any) {
    console.error('Notification sending error:', err);
  }
}