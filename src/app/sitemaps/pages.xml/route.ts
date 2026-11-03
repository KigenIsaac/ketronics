import { getCatalogPage } from '@/lib/public-catalog';
import { absoluteUrl } from '@/lib/seo';
import { collections } from '@/lib/collections';
import { sitemapXml,xmlHeaders } from '@/lib/sitemap-xml';
export const revalidate=300;
export async function GET(){
 const pages=['/','/products','/services','/about-us','/contact','/support','/faq','/privacy-policy','/terms-and-conditions'];
 const categories=await Promise.all(Object.keys(collections).map(async category=>{const page=await getCatalogPage({page:1,category,search:'',inStock:false,sort:'newest'});return page.total?`/collections/${category}`:null;}));
 return new Response(sitemapXml([...pages,...categories.filter((x):x is string=>x!==null)].map(path=>({url:absoluteUrl(path)}))),{headers:xmlHeaders});
}
