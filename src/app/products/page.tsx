import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import Catalog from './Catalog';
import { getPublicCatalog } from '@/lib/public-catalog';
import { pageMetadata, breadcrumbs, jsonLd } from '@/lib/seo';
import { categoryAliases } from '@/lib/catalog';
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
 const params=await searchParams;
 const metadata=pageMetadata('Shop Electronics, Laptops & Printers in Kenya','Browse laptops, smartphones, printers, networking equipment and accessories at Ketronics in Eldoret. Compare prices and ask our team for buying advice.','/products');
 if(params.search||params.category)metadata.robots={index:false,follow:true,googleBot:{index:false,follow:true}};
 return metadata;
}
export default async function ProductsPage({searchParams}:Props){
 const params=await searchParams;const search=typeof params.search==='string'?params.search:'';const category=typeof params.category==='string'?params.category:'';
 if(!search&&Object.hasOwn(categoryAliases,category))permanentRedirect(`/collections/${category}`);
 const catalog=await getPublicCatalog().catch(()=>null);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbs([{name:'Home',path:'/'},{name:'Products',path:'/products'}]))}}/><Catalog key={`${search}:${category}`} initialSearch={search} initialCategory={category} initialProducts={catalog?.products??null} initialCategories={catalog?.categories||[]}/></>;
}
