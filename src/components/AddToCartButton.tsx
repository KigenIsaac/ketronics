'use client';

import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cartStore';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

function trackAddToCart(productId: string) {
  try {
    const key = 'ketronics-ai-session';
    let sessionId = window.sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = window.crypto.randomUUID();
      window.sessionStorage.setItem(key, sessionId);
    }
    void fetch('/api/ai/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'add_to_cart', productId, sessionId, source: 'product_page' }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Analytics must never block adding an item to the cart.
  }
}

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const discountedPrice = product.discount && product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
  const outOfStock = product.track_inventory && Number(product.stock_quantity || 0) <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem({ productId: product.id, name: product.name, price: discountedPrice, image: product.images?.[0] || '', attributes: product.attributes });
    trackAddToCart(product.id);
    toast.success('Added to cart');
  };

  return <Button size="lg" className="h-12 w-full rounded-full bg-orange-500 font-bold hover:bg-orange-600" onClick={handleAddToCart} disabled={outOfStock}><ShoppingCart className="mr-2 h-4 w-4" />{outOfStock ? 'Out of stock' : 'Add to cart'}</Button>;
}
