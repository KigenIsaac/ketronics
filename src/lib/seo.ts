import type { Metadata } from 'next';
import type { Product } from '../types/product.ts';
import { salePrice } from './catalog.ts';

export const SITE_URL = 'https://www.ketronics.co.ke';
export const SITE_NAME = 'Ketronics Solutions Ltd';
export const absoluteUrl = (path = '/') => new URL(path, SITE_URL).toString();
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
export function plainDescription(value: string, max = 160) {
  const text = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const end = text.lastIndexOf(' ', max - 1);
  return text.slice(0, end > max / 2 ? end : max - 1) + '…';
}
export function pageMetadata(title: string, description: string, path: string, image = '/social-image'): Metadata {
  return { title, description, alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: 'website', title: `${title} | ${SITE_NAME}`, description, url: absoluteUrl(path), siteName: SITE_NAME, locale: 'en_KE', images: [{url: absoluteUrl(image), alt: title}] },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description, images: [absoluteUrl(image)] } };
}
export const privateMetadata: Metadata = { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };
export function breadcrumbs(items: {name: string; path: string}[]) {
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:absoluteUrl(item.path)}))};
}
export function productSchema(product: Product) {
  const price = salePrice(product);
  return { '@context': 'https://schema.org', '@type': 'Product', '@id': absoluteUrl(`/products/${product.id}#product`),
    name: product.name, description: product.description || `Enquire about ${product.name} at Ketronics in Eldoret, Kenya.`,
    image: product.images, sku: product.id, ...(product.brand ? {brand:{'@type':'Brand',name:product.brand}} : {}),
    ...(Number.isFinite(price) && price > 0 ? { offers: {'@type':'Offer',url:absoluteUrl(`/products/${product.id}`),priceCurrency:'KES',price:price.toFixed(2),seller:{'@id':absoluteUrl('/#business')},
      ...(product.track_inventory ? {availability:Number(product.stock_quantity || 0)>0?'https://schema.org/InStock':'https://schema.org/OutOfStock'} : {})} } : {}) };
}
export const businessSchema = { '@context':'https://schema.org','@graph':[
  {'@type':'ElectronicsStore','@id':absoluteUrl('/#business'),name:SITE_NAME,url:SITE_URL,logo:absoluteUrl('/ketronics-logo.png'),image:absoluteUrl('/social-image'),telephone:'+254728097922',email:'info@ketronics.co.ke',
    address:{'@type':'PostalAddress',streetAddress:'AA Building, 1st floor, room F6A',addressLocality:'Eldoret',addressCountry:'KE'},
    openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'08:00',closes:'18:00'},{'@type':'OpeningHoursSpecification',dayOfWeek:['Saturday'],opens:'09:00',closes:'16:00'}]},
  {'@type':'WebSite','@id':absoluteUrl('/#website'),url:SITE_URL,name:SITE_NAME,inLanguage:'en-KE',publisher:{'@id':absoluteUrl('/#business')}}
] };
