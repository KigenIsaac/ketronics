import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { Product } from '@/types/product';

// Anonymous, cookie-independent reads only. Never cache staff-only product fields.
const fields = 'id,name,description,price,discount,brand,images,attributes,category_id,subcategory_id,track_inventory,stock_quantity,created_at,updated_at,category:categories(id,name),subcategory:subcategories(id,name)';
export const getPublicCatalog = unstable_cache(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('ci-build.invalid')) return {products:[] as Product[],categories:[] as {id:string;name:string}[]};
  const client = createClient(url, key, {auth:{persistSession:false,autoRefreshToken:false}});
  const {data:categories,error} = await client.from('categories').select('id,name').order('name').abortSignal(AbortSignal.timeout(10000));
  if(error) throw new Error('Public categories unavailable');
  const products: Product[] = [];
  for(let offset=0;;offset+=500) {
    const {data,error} = await client.from('products').select(fields).eq('status','active').order('created_at',{ascending:false}).order('id').range(offset,offset+499).abortSignal(AbortSignal.timeout(10000));
    if(error) throw new Error('Public catalog unavailable');
    products.push(...(data as unknown as Product[]));
    if(data.length<500) break;
  }
  return {products,categories:categories||[]};
}, ['public-seo-catalog-v1'], {revalidate:300});
