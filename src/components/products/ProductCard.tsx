'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/stores/cartStore';
import { StatusBadge } from '@/components/status-badge';
import type { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = Number(product.discount || 0);
  const price = discount > 0 ? product.price * (1 - discount / 100) : product.price;
  const image = product.images?.[0];
  const outOfStock = product.track_inventory && Number(product.stock_quantity || 0) <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price,
      image: image || '',
      attributes: product.attributes,
    });
    toast.success('Added to cart');
  };

  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block" aria-label={`View ${product.name}`}>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-black/[.05] bg-white">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.045] sm:p-5 lg:p-6"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-black/35 sm:text-sm">
                No image available
              </div>
            )}
            {discount > 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white sm:left-3 sm:top-3">
                -{discount}%
              </span>
            )}
            {outOfStock && (
              <span className="absolute inset-x-2 bottom-2 rounded-full bg-black/75 px-3 py-1.5 text-center text-[10px] font-bold text-white sm:inset-x-3 sm:bottom-3">
                Out of stock
              </span>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label={outOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md ring-1 ring-black/5 transition hover:bg-orange-500 hover:text-white focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      <Link href={`/products/${product.id}`} className="mt-3 block min-w-0 px-1">
        <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[.12em] text-black/45 sm:text-[11px]">
            {product.brand || product.category?.name || 'Ketronics'}
          </span>
          {product.status && <StatusBadge status={product.status} />}
        </div>
        <h3 className="line-clamp-2 min-h-10 text-[13px] font-semibold leading-5 tracking-[-.01em] text-[#171717] transition-colors group-hover:text-orange-600 sm:text-sm">
          {product.name}
        </h3>
        <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-bold sm:text-base">
            KSh {price.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
          </span>
          {discount > 0 && (
            <span className="text-[11px] text-black/35 line-through sm:text-xs">
              KSh {product.price.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>
        <span className="mt-2 inline-flex items-center text-[11px] font-semibold text-black/45 transition-colors group-hover:text-orange-600">
          View product <ArrowUpRight className="ml-1 h-3 w-3" />
        </span>
      </Link>
    </article>
  );
}
