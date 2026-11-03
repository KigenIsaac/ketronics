import { getProductCount } from '@/lib/public-catalog';
import { absoluteUrl } from '@/lib/seo';
import { SITEMAP_SIZE } from '@/lib/catalog-query';
import { sitemapIndex,xmlHeaders } from '@/lib/sitemap-xml';
export const revalidate=300;
export async function GET(){const count=await getProductCount();return new Response(sitemapIndex([absoluteUrl('/sitemaps/pages.xml'),...Array.from({length:Math.ceil(count/SITEMAP_SIZE)},(_,i)=>absoluteUrl(`/sitemaps/products/${i}.xml`))]),{headers:xmlHeaders});}
