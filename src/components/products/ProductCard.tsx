'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Package, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/stores/cartStore';
import { salePrice } from '@/lib/catalog';
import type { Product } from '@/types/product';
export function ProductCard({product}:{product:Product}){
 const router=useRouter();const addItem=useCartStore(s=>s.addItem);const [added,setAdded]=useState(false);const [imageFailed,setImageFailed]=useState(false);const price=salePrice(product);const discount=Math.min(100,Math.max(0,Number(product.discount)||0));const image=product.images?.[0];const unavailable=Boolean(product.track_inventory&&Number(product.stock_quantity||0)<=0);
 const add=()=>{if(unavailable)return;addItem({productId:product.id,name:product.name,price,image:image||'',attributes:product.attributes});setAdded(true);toast.success(`${product.name} added to your bag`,{action:{label:'View bag',onClick:()=>router.push('/cart')}});};
 return <article className="product-card"><Link href={`/products/${product.id}`} className="product-image" aria-label={`View ${product.name}`}>{image&&!imageFailed?<Image src={image} alt={product.name} fill sizes="(max-width:640px) 45vw, (max-width:1024px) 40vw, 300px" onError={()=>setImageFailed(true)} className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"/>:<div className="image-placeholder"><Package size={32} strokeWidth={1}/><span>Image coming soon</span></div>}{discount>0&&<span className="product-discount">Save {discount}%</span>}</Link><div className="product-copy"><p className="product-brand">{product.brand||product.category?.name||'Ketronics'}</p><Link href={`/products/${product.id}`}><h3>{product.name}</h3></Link><p className="product-stock">{unavailable?'Currently unavailable':product.track_inventory?'In stock':'Ask about availability'}</p><div className="product-bottom"><div><p className="product-price">KSh {price.toLocaleString('en-KE',{maximumFractionDigits:2})}</p>{discount>0&&<del className="text-xs text-muted-foreground">KSh {Number(product.price).toLocaleString('en-KE')}</del>}</div><button onClick={add} disabled={unavailable} aria-label={`Add ${product.name} to bag`} className="product-add">{added?<Check size={18}/>:<Plus size={18}/>}</button></div></div></article>;
}
