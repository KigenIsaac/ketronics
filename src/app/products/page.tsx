'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { categoryAliases, selectProducts, type CatalogSort } from '@/lib/catalog';
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
 const [sort,setSort]=useState<CatalogSort>('newest'); const [inStock,setInStock]=useState(false); const [limit,setLimit]=useState(20);
 const [products,setProducts]=useState<Product[]>([]); const [categories,setCategories]=useState<Category[]>([]); const [search,setSearch]=useState(queryParam); const [category,setCategory]=useState(categoryParam); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{let cancelled=false;void Promise.all([supabase.from('categories').select('id,name').order('name'),supabase.from('products').select('*,category:categories(*),subcategory:subcategories(*)').eq('status','active').order('created_at',{ascending:false})]).then(([cr,pr])=>{if(cr.error)throw cr.error;if(pr.error)throw pr.error;if(cancelled)return;setCategories(cr.data||[]);setProducts(pr.data||[]);}).catch(()=>{if(!cancelled)setError('We could not load the catalog right now.');}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[]);
 const filtered=useMemo(()=>selectProducts(products,{search,category,sort,inStock}),[products,search,category,sort,inStock]);
 const selectedName=categories.find(c=>c.id===category)?.name||categoryAliases[category.toLowerCase()]?.title||category;
 const clear=()=>{setSearch('');setCategory('');setInStock(false);setSort('newest');setLimit(20);};
 if(loading)return <StorePage><PageHero eyebrow="SHOP KETRONICS" title="Find the right technology." description="Quality devices, components and accessories for work, home and business."/><LoadingGrid count={8} className="grid-cols-2 lg:grid-cols-4"/></StorePage>;
 if(error)return <StorePage><EmptyState title="Catalog unavailable" description={error} action={<Button onClick={()=>window.location.reload()}>Try again</Button>}/></StorePage>;
 return <StorePage>
   <PageHero eyebrow="SHOP KETRONICS" title={selectedName||'Technology, selected for you.'} description="Explore our current catalog of laptops, displays, printers, components and everyday tech." action={<div className="hidden rounded-full bg-white/10 px-4 py-2 text-xs font-semibold sm:block">{products.length} products</div>}/>
   <div className="mb-7 rounded-2xl border border-black/[.06] bg-white p-3 shadow-[0_8px_30px_rgba(16,24,40,.04)]">
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35"/><Input aria-label="Search catalog" value={search} onChange={e=>{setSearch(e.target.value);setLimit(20);}} placeholder="Search products, brands, features..." className="h-12 rounded-xl border-0 bg-[#f5f5f3] pl-11 shadow-none focus-visible:ring-1 focus-visible:ring-orange-400"/></div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[58%]">{[{id:'',name:'All products'},...categories].map(c=><button key={c.id} aria-pressed={category===c.id} onClick={()=>{setCategory(c.id);setLimit(20);}} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${category===c.id?'border-black bg-black text-white':'border-black/[.08] bg-white text-black/60 hover:border-black/20 hover:text-black'}`}>{c.name}</button>)}</div>
      {(search||category)&&<Button variant="ghost" className="h-12 shrink-0 rounded-xl" onClick={clear}><X className="mr-2 h-4 w-4"/>Clear</Button>}
    </div>
   </div>
   <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
     <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={inStock} onChange={e=>{setInStock(e.target.checked);setLimit(20);}} className="h-4 w-4 accent-orange-600"/>Hide out-of-stock products</label>
     <label className="flex items-center gap-3 text-sm">Sort by<select value={sort} onChange={e=>{setSort(e.target.value as CatalogSort);setLimit(20);}} className="min-h-11 rounded-xl border border-border bg-card px-3"><option value="newest">Newest arrivals</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label>
   </div>
   <div role="status" className="sr-only">{filtered.length} products found</div>
   <SectionHeader eyebrow="CATALOG" title={filtered.length ? filtered.length + ' products' : 'No matches'} description={(search||category)?'Showing filtered results.':'Browse everything currently available.'}/>
   {filtered.length?<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{filtered.slice(0,limit).map(p=><ProductCard key={p.id} product={p}/>)}</div>:<EmptyState title="Nothing matched your search" description="Try another product name or clear your filters." action={<Button onClick={clear} className="rounded-full bg-orange-500 hover:bg-orange-600"><SlidersHorizontal className="mr-2 h-4 w-4"/>Reset filters</Button>}/>}
   {filtered.length>limit&&<div className="mt-10 text-center"><p className="mb-3 text-sm text-muted-foreground">Showing {Math.min(limit,filtered.length)} of {filtered.length} products</p><Button variant="outline" onClick={()=>setLimit(n=>n+20)}>Show more products</Button></div>}
 </StorePage>
}
function ProductsRoute(){const params=useSearchParams();return <ProductsContent key={params.toString()}/>;}
export default function ProductsPage(){return <Suspense fallback={<StorePage><LoadingGrid count={8}/></StorePage>}><ProductsRoute/></Suspense>}
