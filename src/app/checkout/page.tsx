'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Smartphone, Truck, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Kenya',
  });

  const total = getTotal();

  if (items.length === 0) {
    const handleStkPush = async () => {
    setLoading(true);
    try {
      const orderResponse = await fetch('/api/orders/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId || item.id, quantity: item.quantity, attributes: item.attributes || {} })),
          shippingInfo: { ...shippingInfo, email },
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const orderResult = await orderResponse.json();
      if (!orderResponse.ok || !orderResult?.order) throw new Error(orderResult?.error || 'Unable to create order');

      const paymentResponse = await fetch('/api/payments/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderResult.order.id, checkoutToken: orderResult.order.checkout_token, phone: shippingInfo.phone }),
      });
      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(paymentResult?.error || 'Unable to start M-Pesa payment');

      clearCart();
      toast.success(paymentResult.message || 'M-Pesa payment prompt sent to your phone.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start M-Pesa payment');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const handleWhatsAppOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            attributes: item.attributes || {},
          })),
          shippingInfo: { ...shippingInfo, email },
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.order) {
        throw new Error(result?.error || 'Unable to create order');
      }

      const order = result.order;
      const lines = [
        'Hello Ketronics LTD, I would like to place an order.',
        '',
        'ORDER REFERENCE: ' + order.id.slice(-8).toUpperCase(),
        '',
        'ORDER DETAILS',
        ...items.flatMap((item, index) => {
          const attributes = item.attributes && Object.keys(item.attributes).length > 0
            ? '\\n   Options: ' + Object.entries(item.attributes).map(([key, value]) => key + ': ' + value).join(', ')
            : '';
          return [
            (index + 1) + '. ' + item.name,
            '   Quantity: ' + item.quantity,
            '   Unit price: Ksh. ' + item.price.toFixed(2),
            '   Subtotal: Ksh. ' + (item.price * item.quantity).toFixed(2) + attributes,
          ];
        }),
        '',
        'TOTAL: Ksh. ' + Number(order.total).toFixed(2),
        '',
        'CUSTOMER / DELIVERY DETAILS',
        'Name: ' + shippingInfo.name,
        'Email: ' + email,
        'Phone: ' + shippingInfo.phone,
        'Address: ' + shippingInfo.address,
        'City: ' + shippingInfo.city,
        'Country: ' + shippingInfo.country,
        '',
        'PAYMENT: M-Pesa',
        'M-Pesa number: 0721 142 723',
        'Please confirm the order and payment instructions on WhatsApp.',
      ];

      const message = encodeURIComponent(lines.join('\\n'));
      window.open('https://wa.me/254721142723?text=' + message, '_blank', 'noopener,noreferrer');
      clearCart();
      toast.success('Order created. WhatsApp message prepared.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold">Ksh. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Ksh. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checkout Form */}
        <div>
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, country: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Direct M-Pesa STK Push */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Pay directly with M-Pesa</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">We create your order and send an M-Pesa STK prompt to the phone number above. Approve it on your phone.</p>
                <Button type="button" size="lg" className="w-full" disabled={loading} onClick={handleStkPush}>
                  {loading ? 'Starting M-Pesa...' : 'Pay with M-Pesa STK Push'}
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp / M-Pesa Ordering */
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Order & Pay via M-Pesa</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="font-semibold">M-Pesa: 0721 142 723</p>
                  <p className="text-sm text-muted-foreground mt-1">Tap WhatsApp Order below. We will receive your complete order, confirm it with you, and provide the payment instructions.</p>
                </div>
                <Button type="button" size="lg" className="w-full" disabled={loading} onClick={handleWhatsAppOrder}><MessageCircle className="mr-2 h-5 w-5" />{loading ? 'Preparing WhatsApp...' : 'Order via WhatsApp'}</Button>
                <Button type="button" size="lg" variant="outline" className="w-full" asChild><a href="tel:+254721142723"><Phone className="mr-2 h-5 w-5" />Call to Order — 0721 142 723</a></Button>
                <p className="text-xs text-center text-muted-foreground">Your WhatsApp message includes every item, quantity, selected options, total, and delivery details.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}