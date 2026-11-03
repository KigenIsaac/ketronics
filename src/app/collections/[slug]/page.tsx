import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalogPage } from '@/lib/public-catalog';
import { collections,isCollection } from '@/lib/collections';
import { parseCatalogQuery,PAGE_SIZE } from '@/lib/catalog-query';
import { CatalogPagination } from '@/components/products/CatalogPagination';
import { pageMetadata,breadcrumbs,jsonLd,absoluteUrl } from '@/lib/seo';
import { StorePage,PageHero,EmptyState } from '@/components/store-ui';
import { ProductCard } from '@/components/products/ProductCard';
type Props={params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
export const revalidate=300;
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{
 const {slug}=await params;if(!isCollection(slug))return {title:'Collection not found',robots:{index:false}};
 const collection=collections[slug];const query={...parseCatalogQuery({page:(await searchParams).page}),category:slug};const {total}=await getCatalogPage(query);
 return {...pageMetadata(collection.title,collection.description,`/collections/${slug}${query.page>1?"?page="+query.page:""}`),...(!total?{robots:{index:false,follow:true,googleBot:{index:false,follow:true}}}:{})};
}
export default async function CollectionPage({params,searchParams}:Props){
 const {slug}=await params;if(!isCollection(slug))notFound();const collection=collections[slug];
 const query={...parseCatalogQuery({page:(await searchParams).page}),category:slug};const {products,total}=await getCatalogPage(query);if(query.page>1&&!products.length)notFound();
 const schema=[breadcrumbs([{name:'Home',path:'/'},{name:'Products',path:'/products'},{name:collection.title,path:`/collections/${slug}`}]),{'@context':'https://schema.org','@type':'CollectionPage',name:collection.title,description:collection.description,url:absoluteUrl(`/collections/${slug}${query.page>1?"?page="+query.page:""}`),mainEntity:{'@type':'ItemList',numberOfItems:products.length,itemListElement:products.map((p,i)=>({'@type':'ListItem',position:(query.page-1)*PAGE_SIZE+i+1,url:absoluteUrl(`/products/${p.id}`),name:p.name}))}}];
 return <StorePage><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/><nav aria-label="Breadcrumb" className="product-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/products">Products</Link><span>/</span><span>{collection.title}</span></nav><PageHero eyebrow="THE KETRONICS COLLECTION" title={collection.title} description={collection.intro}/>{products.length?<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.map(product=><ProductCard key={product.id} product={product}/>)}</div>:<EmptyState title="Ask us about current availability" description="There are no products listed in this collection right now. Contact our team to discuss what you need." action={<Link href="/contact" className="text-link">Contact Ketronics</Link>}/>}<CatalogPagination query={{...query,category:''}} total={total} path={`/collections/${slug}`}/><section className="mt-12 rounded-xl border border-border bg-card p-6 sm:p-8"><h2 className="text-2xl font-semibold">Before you choose</h2><ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground">{collection.tips.map(tip=><li key={tip}>{tip}</li>)}</ul><p className="mt-6 text-sm leading-7">Visit Ketronics at AA Building, first floor, room F6A, Eldoret, or <Link href={`/contact?subject=${encodeURIComponent(collection.title)}`} className="text-primary underline">ask for advice</Link>. Prices and availability are confirmed when your order is placed.</p></section><nav aria-label="Explore other collections" className="mt-8 flex flex-wrap gap-5">{Object.entries(collections).filter(([key])=>key!==slug).map(([key,c])=><Link key={key} href={`/collections/${key}`} className="text-link">{c.title}</Link>)}</nav></StorePage>;
}
