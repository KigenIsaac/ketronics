import type { Metadata } from 'next';
import { permanentRedirect,notFound } from 'next/navigation';
import Catalog from './Catalog';
import { getCatalogPage,getTaxonomy } from '@/lib/public-catalog';
import { pageMetadata, breadcrumbs, jsonLd } from '@/lib/seo';
import { parseCatalogQuery } from '@/lib/catalog-query';
import { categoryAliases } from '@/lib/catalog';
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
 const params=await searchParams;const query=parseCatalogQuery(params);
 const metadata=pageMetadata('Shop Electronics, Laptops & Printers in Kenya','Browse laptops, smartphones, printers, networking equipment and accessories at Ketronics in Eldoret. Compare prices and ask our team for buying advice.',query.page>1?`/products?page=${query.page}`:'/products');
 if(params.search||params.category||params.stock||query.sort!=='newest')metadata.robots={index:false,follow:true,googleBot:{index:false,follow:true}};
 return metadata;
}
export default async function ProductsPage({searchParams}:Props){
 const query=parseCatalogQuery(await searchParams);
 if(!query.search&&Object.hasOwn(categoryAliases,query.category)&&query.sort==='newest'&&!query.inStock)permanentRedirect(`/collections/${query.category}${query.page>1?'?page='+query.page:''}`);
 const [catalog,taxonomy]=await Promise.all([getCatalogPage(query),getTaxonomy()]);
 if(query.page>1&&!catalog.products.length)notFound();
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbs([{name:'Home',path:'/'},{name:'Products',path:'/products'}]))}}/><Catalog products={catalog.products} total={catalog.total} query={query} categories={taxonomy.categories}/></>;
}
