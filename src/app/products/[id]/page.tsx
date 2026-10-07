import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Surface } from '@/components/store-ui';
import ProductGallery from '@/components/products/ProductGallery';
import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck, Truck } from 'lucide-react';

interface ProductPageProps { params: { id: string } }

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('products').select('*, category:categories(*), subcategory:subcategories(*)').eq('id', id).eq('status', 'active').single();
  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product not found | Ketronics LTD', robots: { index: false } };
  const description = product.description?.slice(0, 160) || `Shop ${product.name} from Ketronics LTD in Kenya.`;
  return { title: `${product.name} | Ketronics LTD`, description, openGraph: { title: product.name, description, images: product.images?.[0] ? [{ url: product.images[0], alt: product.name }] : undefined } };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const discount = Number(product.discount || 0);
  const price = discount > 0 ? product.price * (1 - discount / 100) : product.price;
  const outOfStock = product.track_inventory && Number(product.stock_quantity || 0) <= 0;
  const schema = { '@context':'https://schema.org', '@type':'Product', name:product.name, description:product.description, image:product.images || [], brand:{'@type':'Brand',name:product.brand || 'Ketronics LTD'}, offers:{'@type':'Offer',url:`https://ketronics.co.ke/products/${id}`,priceCurrency:'KES',price:price.toFixed(2),availability:outOfStock?'https://schema.org/OutOfStock':'https://schema.org/InStock'} };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />
    <div className="mx-auto w-full max-w-[1400px] py-2 sm:py-5">
      <Link href="/products" className="mb-5 inline-flex items-center text-sm font-semibold text-black/50 hover:text-orange-600"><ArrowLeft className="mr-2 h-4 w-4" /> Back to products</Link>
      <div className="grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
        <Surface className="p-3 sm:p-5"><ProductGallery name={product.name} images={product.images || []} /></Surface>
        <div className="lg:pt-3">
          <div className="mb-2 flex flex-wrap gap-2">{product.brand && <Badge variant="outline" className="rounded-full">{product.brand}</Badge>}{product.category && <Badge variant="outline" className="rounded-full">{product.category.name}</Badge>}</div>
          <h1 className="text-3xl font-bold tracking-[-.045em] sm:text-4xl">{product.name}</h1>
          <div className="mt-5 flex items-end gap-3"><span className="text-3xl font-bold">KSh {price.toLocaleString('en-KE',{maximumFractionDigits:0})}</span>{discount>0&&<span className="mb-1 text-sm text-black/40 line-through">KSh {product.price.toLocaleString('en-KE',{maximumFractionDigits:0})}</span>}{discount>0&&<Badge className="mb-1 rounded-full bg-orange-500">-{discount}%</Badge>}</div>
          <p className="mt-5 text-sm leading-7 text-black/55">{product.description}</p>
          {product.attributes && Object.keys(product.attributes).length > 0 && <Surface className="mt-6 overflow-hidden"><div className="border-b border-black/[.06] px-5 py-4"><h2 className="font-bold">Specifications</h2></div><div className="grid sm:grid-cols-2">{Object.entries(product.attributes).map(([key,value])=><div key={key} className="flex justify-between gap-4 border-b border-black/[.05] px-5 py-3 text-sm"><span className="font-medium capitalize text-black/65">{key.replaceAll('_',' ')}</span><span className="text-right text-black/45">{String(value)}</span></div>)}</div></Surface>}
          <div className="mt-6"><AddToCartButton product={product} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-black/45"><div className="rounded-xl bg-white p-3"><Truck className="mx-auto mb-1 h-4 w-4 text-orange-500" />Kenya delivery</div><div className="rounded-xl bg-white p-3"><ShieldCheck className="mx-auto mb-1 h-4 w-4 text-orange-500" />Secure checkout</div><div className="rounded-xl bg-white p-3"><Check className="mx-auto mb-1 h-4 w-4 text-orange-500" />Quality checked</div></div>
        </div>
      </div>
    </div>
  </>;
}
