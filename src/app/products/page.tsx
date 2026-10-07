'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingGrid } from '@/components/loading';
import { supabase } from '@/lib/supabase';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { EmptyState, PageHero, SectionHeader, StorePage } from '@/components/store-ui';

interface Category { id:string; name:string }

function ProductsContent(){
 const params=useSearchParams(); const categoryParam=params.get('category')||''; const queryParam=params.get('search')||'';
 const [products,setProducts]=useState<Product[]>([]); const [categories,setCategories]=useState<Category[]>([]); const [search,setSearch]=useState(queryParam); const [category,setCategory]=useState(categoryParam); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{void Promise.all([supabase.from('categories').select('id,name').order('name'),supabase.from('products').select('*,category:categories(*),subcategory:subcategories(*)').eq('status','active').order('created_at',{ascending:false})]).then(([cr,pr])=>{if(cr.error)throw cr.error;if(pr.error)throw pr.error;setCategories(cr.data||[]);setProducts(pr.data||[]);}).catch(()=>setError('We could not load the catalog right now.')).finally(()=>setLoading(false));},[]);
 const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return products.filter(p=>(!category||p.category?.id===category||p.category?.name.toLowerCase()===category.toLowerCase())&&(!q||[p.name,p.description,p.brand,p.category?.name,p.subcategory?.name].some(v=>v?.toLowerCase().includes(q))))},[products,search,category]);
 const selectedName=categories.find(c=>c.id===category)?.name||category;
 const clear=()=>{setSearch('');setCategory('');};
 if(loading)return <StorePage><PageHero eyebrow="SHOP KETRONICS" title="Find the right technology." description="Quality devices, components and accessories for work, home and business."/><LoadingGrid count={8} className="grid-cols-2 lg:grid-cols-4"/></StorePage>;
 if(error)return <StorePage><EmptyState title="Catalog unavailable" description={error} action={<Button onClick={()=>window.location.reload()}>Try again</Button>}/></StorePage>;
 return <StorePage>
   <PageHero eyebrow="SHOP KETRONICS" title={selectedName||'Technology, selected for you.'} description="Explore our current catalog of laptops, displays, printers, components and everyday tech." action={<div className="hidden rounded-full bg-white/10 px-4 py-2 text-xs font-semibold sm:block">{products.length} products</div>}/>
   <div className="mb-7 rounded-2xl border border-black/[.06] bg-white p-3 shadow-[0_8px_30px_rgba(16,24,40,.04)]">
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products, brands, features..." className="h-12 rounded-xl border-0 bg-[#f5f5f3] pl-11 shadow-none focus-visible:ring-1 focus-visible:ring-orange-400"/></div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[58%]">{[{id:'',name:'All products'},...categories].map(c=><button key={c.id} onClick={()=>setCategory(c.id)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${category===c.id?'border-black bg-black text-white':'border-black/[.08] bg-white text-black/60 hover:border-black/20 hover:text-black'}`}>{c.name}</button>)}</div>
      {(search||category)&&<Button variant="ghost" className="h-12 shrink-0 rounded-xl" onClick={clear}><X className="mr-2 h-4 w-4"/>Clear</Button>}
    </div>
   </div>
   <SectionHeader eyebrow="CATALOG" title={filtered.length ? filtered.length + ' products' : 'No matches'} description={(search||category)?'Showing filtered results.':'Browse everything currently available.'}/>
   {filtered.length?<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{filtered.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<EmptyState title="Nothing matched your search" description="Try another product name or clear your filters." action={<Button onClick={clear} className="rounded-full bg-orange-500 hover:bg-orange-600"><SlidersHorizontal className="mr-2 h-4 w-4"/>Reset filters</Button>}/>}
 </StorePage>
}
export default function ProductsPage(){return <Suspense fallback={<StorePage><LoadingGrid count={8}/></StorePage>}><ProductsContent/></Suspense>}
