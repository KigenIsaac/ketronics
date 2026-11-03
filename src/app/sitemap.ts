import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { getPublicCatalog } from '@/lib/public-catalog';
import { collections } from '@/lib/collections';
import { selectProducts } from '@/lib/catalog';
export const revalidate=300;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const {products}=await getPublicCatalog();
 const pages=['/','/products','/services','/about-us','/contact','/support','/faq','/privacy-policy','/terms-and-conditions'];
 return [...pages.map(path=>({url:absoluteUrl(path)})),
  ...Object.keys(collections).filter(slug=>selectProducts(products,{category:slug}).length>0).map(slug=>({url:absoluteUrl(`/collections/${slug}`)})),
  ...products.map(p=>({url:absoluteUrl(`/products/${p.id}`),...(p.updated_at&&!Number.isNaN(Date.parse(p.updated_at))?{lastModified:new Date(p.updated_at)}:{}),images:(p.images||[]).filter(url=>/^https:\/\//.test(url))}))];
}
