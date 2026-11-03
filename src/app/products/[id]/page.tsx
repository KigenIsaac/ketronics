import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight,Truck,MessageCircle,Package,ArrowUpRight } from 'lucide-react';
import { getPublicCatalog } from '@/lib/public-catalog';
import { pageMetadata,plainDescription,productSchema,breadcrumbs,jsonLd } from '@/lib/seo';
import type { Product } from '@/types/product';
import { salePrice } from '@/lib/catalog';
import { AddToCartButton } from '@/components/AddToCartButton';
import ProductGallery from '@/components/products/ProductGallery';
import { ProductCard } from '@/components/products/ProductCard';
import { StorePage,SectionHeader } from '@/components/store-ui';
interface Props {params:Promise<{id:string}>}
const getProduct=cache(async(id:string):Promise<Product|null>=>{if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id))return null;const {products}=await getPublicCatalog();return products.find(p=>p.id===id)||null;});
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {id}=await params;const product=await getProduct(id);
 if(!product)return {title:'Product unavailable',robots:{index:false,follow:true,googleBot:{index:false,follow:true}}};
 const description=plainDescription(product.description||`Explore ${product.name} at Ketronics in Eldoret, Kenya. Check current pricing, specifications and availability with our team.`);
 return pageMetadata(product.name,description,`/products/${id}`,product.images?.[0]||'/social-image');
}
export default async function ProductPage({params}:Props){
 const {id}=await params;const product=await getProduct(id);if(!product)notFound();const price=salePrice(product);const out=Boolean(product.track_inventory&&Number(product.stock_quantity||0)<=0);const attributes=Object.entries(product.attributes||{}).filter(([,v])=>v!==null&&v!==undefined&&v!=='');let related:Product[]=[];
 if(product.category_id){const catalog=await getPublicCatalog();related=catalog.products.filter(p=>p.category_id===product.category_id&&p.id!==id).slice(0,4);}
 const schema=[productSchema(product),breadcrumbs([{name:'Home',path:'/'},{name:'Products',path:'/products'},{name:product.name,path:`/products/${id}`}])];
 return <StorePage><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/><nav className="product-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={13}/><Link href="/products">Collection</Link>{product.category&&<><ChevronRight size={13}/><Link href={`/products?category=${product.category.id}`}>{product.category.name}</Link></>}</nav><div className="product-detail-layout"><ProductGallery name={product.name} images={product.images||[]}/><div className="product-detail-copy"><p className="eyebrow">{product.brand||'KETRONICS COLLECTION'}</p><h1>{product.name}</h1><p className="detail-availability"><span className={out?'bg-muted-foreground':'bg-primary'}/>{out?'Currently out of stock':product.track_inventory?'In stock':'Contact us to confirm availability'}</p><div className="detail-price"><strong>KSh {price.toLocaleString('en-KE',{maximumFractionDigits:2})}</strong>{Number(product.discount)>0&&<del>KSh {Number(product.price).toLocaleString('en-KE')}</del>}</div>{attributes.length>0&&<dl className="quick-specs">{attributes.slice(0,4).map(([key,value])=><div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{typeof value==='boolean'?(value?'Yes':'No'):String(value)}</dd></div>)}</dl>}<div className="mt-7"><AddToCartButton product={product}/></div><Link href={`/contact?subject=${encodeURIComponent('Enquiry: '+product.name)}`} className="detail-enquiry"><MessageCircle size={17}/>Ask about this product <ArrowUpRight size={16}/></Link><div className="detail-promises"><div><Truck size={19}/><p><strong>Delivery, made clear</strong><span>Our team confirms costs and timing for your location.</span></p></div><div><Package size={19}/><p><strong>Advice before you buy</strong><span>Ask about compatibility, setup and warranty details.</span></p></div></div></div></div><div className="product-information"><section><SectionHeader eyebrow="GET TO KNOW IT" title="Product overview"/><p className="whitespace-pre-line text-sm leading-8 text-muted-foreground">{product.description||'Contact our team for more information about this product.'}</p></section>{attributes.length>0&&<section><SectionHeader eyebrow="THE DETAILS" title="Technical specifications"/><dl className="specification-list">{attributes.map(([key,value])=><div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{typeof value==='boolean'?(value?'Yes':'No'):String(value)}</dd></div>)}</dl></section>}</div>{related.length>0&&<section className="mt-14"><SectionHeader eyebrow="KEEP EXPLORING" title="More in this collection" href={`/products?category=${product.category_id}`}/><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{related.map(p=><ProductCard key={p.id} product={p}/>)}</div></section>}</StorePage>;
}
