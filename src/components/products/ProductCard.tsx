'use client';

import { Product } from '@/types/product';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ArrowUpRight } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cartStore';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/status-badge';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = Number(product.discount || 0);
  const price = discount > 0 ? product.price * (1 - discount / 100) : product.price;
  const image = product.images?.[0];
  const outOfStock = product.track_inventory && Number(product.stock_quantity || 0) <= 0;

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) return;
    addItem({ productId: product.id, name: product.name, price, image: image || '', attributes: product.attributes });
    toast.success('Added to cart');
  };

  return (
    <article className="group min-w-0">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[1/1.02] overflow-hidden rounded-2xl border border-black/[.05] bg-white">
          {image ? (
            <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.045] sm:p-6" />
          ) : <div className="flex h-full items-center justify-center text-sm text-black/35">No image</div>}
          {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white">-{discount}%</span>}
          {outOfStock && <span className="absolute inset-x-3 bottom-3 rounded-full bg-black/75 px-3 py-1.5 text-center text-[10px] font-bold text-white">Out of stock</span>}
          <button onClick={handleAdd} disabled={outOfStock} aria-label={outOfStock ? 'Out of stock' : 'Add to cart'} className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-black shadow-lg opacity-100 transition-all hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
        <div className="px-1 pt-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[.16em] text-black/40">{product.brand || product.category?.name || 'Ketronics'}</span>
            {product.status && <StatusBadge status={product.status} />}
          </div>
          <h3 className="line-clamp-2 min-h-[2.8rem] text-sm font-semibold leading-5 tracking-[-.01em] group-hover:text-orange-600">{product.name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold">KSh {price.toLocaleString('en-KE', { maximumFractionDigits: 0 })}</span>
            {discount > 0 && <span className="text-xs text-black/35 line-through">KSh {product.price.toLocaleString('en-KE', { maximumFractionDigits: 0 })}</span>}
          </div>
          <span className="mt-2 inline-flex items-center text-[11px] font-semibold text-black/45 group-hover:text-orange-600">View product <ArrowUpRight className="ml-1 h-3 w-3" /></span>
        </div>
      </Link>
    </article>
  );
}
