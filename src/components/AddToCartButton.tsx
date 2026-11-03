'use client';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cartStore';
import { salePrice } from '@/lib/catalog';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
export function AddToCartButton({product}:{product:Product}){
 const addItem=useCartStore(s=>s.addItem);const router=useRouter();const out=Boolean(product.track_inventory&&Number(product.stock_quantity||0)<=0);
 const add=()=>{if(out)return;addItem({productId:product.id,name:product.name,price:salePrice(product),image:product.images?.[0]||'',attributes:product.attributes});toast.success('Added to your shopping bag',{action:{label:'View bag',onClick:()=>router.push('/cart')}})};
 return <Button size="lg" className="min-h-12 w-full" disabled={out} onClick={add}><ShoppingBag size={18}/>{out?'Currently unavailable':'Add to shopping bag'}</Button>;
}
