'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

export function HomeCatalog({initialProducts}:{initialProducts:Product[]|null}) {
  const [products, setProducts] = useState<Product[]>(initialProducts||[]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(initialProducts?'ready':'loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if(initialProducts&&attempt===0)return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let mounted = true;
    void (async () => {
      try {
        const { data, error } = await supabase.from('products').select('*,category:categories(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(8).abortSignal(controller.signal);
        if (error) throw error;
        if (mounted) { setProducts(data || []); setState('ready'); }
      } catch { if (mounted) setState('error'); }
      finally { clearTimeout(timeout); }
    })();
    return () => { mounted = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt,initialProducts]);
  return <section className="home-catalog py-12 sm:py-16" aria-labelledby="catalog-title"><div className="home-wrap">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="home-eyebrow text-muted-foreground">FRESH FROM THE CATALOG</p><h2 id="catalog-title" className="home-heading mt-2">Discover your next upgrade.</h2></div><Link href="/products" className="home-text-link">Browse the collection <ArrowRight size={16}/></Link></div>
    {state === 'loading' ? <div role="status" aria-label="Loading products" className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:4},(_,i)=><div key={i} className="animate-pulse"><div className="aspect-square rounded-2xl bg-muted"/><div className="mt-4 h-4 w-3/4 rounded bg-muted"/><div className="mt-3 h-4 w-1/2 rounded bg-muted"/></div>)}</div> : state === 'error' ? <div role="status" className="home-catalog-state"><Package className="mx-auto text-muted-foreground" size={30}/><h3 className="mt-4 text-lg font-semibold">The catalog is taking a moment.</h3><p className="mt-2 text-sm text-muted-foreground">Please try again, or contact our team for product availability.</p><button onClick={()=>{setState("loading");setAttempt(n=>n+1);}} className="home-button mt-5 border border-border"><RefreshCw size={16}/> Try again</button></div> : products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">{products.map(product=><ProductCard key={product.id} product={product}/>)}</div> : <div className="home-catalog-state"><h3 className="text-lg font-semibold">New possibilities are on the way.</h3><p className="mt-2 text-sm text-muted-foreground">Contact us to check availability or discuss what you’re looking for.</p><Link href="/contact" className="home-text-link mt-5">Ask our team <ArrowRight size={16}/></Link></div>}
  </div></section>;
}
