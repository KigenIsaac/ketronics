'use client';

import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cartStore';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const discountedPrice = product.discount && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: discountedPrice,
      image: product.images[0] || '',
      attributes: product.attributes,
    });
    toast.success('Added to cart!');
  };

  return (
    <Button size="lg" className="w-full" onClick={handleAddToCart}>
      Add to Cart
    </Button>
  );
}