'use client';

import { Product } from '@/types/product';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Get display attributes (assuming attributes are key-value and we show a few)
  const displayAttributes = Object.entries(product.attributes || {})
    .slice(0, 3) // Show first 3 attributes
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');

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
    <Card className="w-full group hover:shadow-lg transition-shadow duration-300 border shadow-sm">
      <CardHeader className="p-0">
        {product.images.length > 0 && (
          <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.discount && product.discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-xs">
                -{product.discount}%
              </Badge>
            )}
          </div>
        )}
        <div className="p-3">
          <CardTitle className="text-base font-semibold line-clamp-1">{product.name}</CardTitle>
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 h-8">
          {product.description}
        </p>
        {displayAttributes && (
          <p className="text-xs text-blue-600 font-medium mb-2 line-clamp-1">
            {displayAttributes}
          </p>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-green-600">
            Ksh. {discountedPrice.toFixed(2)}
          </span>
          {product.discount && product.discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              Ksh. {product.price.toFixed(2)}
            </span>
          )}
        </div>
        {product.category && (
          <Badge variant="outline" className="text-xs">
            {product.category.name}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        <Button asChild size="sm" className="w-full text-xs">
          <Link href={`/products/${product.id}`}>
            View Details
          </Link>
        </Button>
        <Button onClick={handleAddToCart} variant="outline" size="sm" className="w-full text-xs">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}