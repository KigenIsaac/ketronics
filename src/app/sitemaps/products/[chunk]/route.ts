import { getSitemapProducts } from '@/lib/public-catalog';
import { absoluteUrl } from '@/lib/seo';
import { sitemapXml,xmlHeaders } from '@/lib/sitemap-xml';
export const revalidate=300;
export async function GET(_request:Request,{params}:{params:Promise<{chunk:string}>}){
 const {chunk}=await params;if(!/^(0|[1-9][0-9]{0,5})\.xml$/.test(chunk))return new Response('Not found',{status:404});
 const products=await getSitemapProducts(Number(chunk.slice(0,-4)));if(!products.length)return new Response('Not found',{status:404});
 return new Response(sitemapXml(products.map(p=>({url:absoluteUrl(`/products/${p.id}`),updated:p.updated_at,images:p.images}))),{headers:xmlHeaders});
}
