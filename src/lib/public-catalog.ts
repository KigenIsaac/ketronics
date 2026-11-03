import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { Product } from '@/types/product';
import { categoryAliases,salePrice } from './catalog';
import { PAGE_SIZE,SITEMAP_SIZE,searchWords,type CatalogQuery } from './catalog-query';
const fields='id,name,description,price,discount,brand,images,attributes,category_id,subcategory_id,track_inventory,stock_quantity,created_at,updated_at,category:categories(id,name),subcategory:subcategories(id,name)';
const cardFields='id,name,price,discount,brand,images,attributes,category_id,track_inventory,stock_quantity,created_at,updated_at,category:categories(id,name)';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function client(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key||url.includes('ci-build.invalid'))return null;return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
export const getTaxonomy=unstable_cache(async()=>{
 const db=client();if(!db)return {categories:[],subcategories:[]} as {categories:{id:string;name:string}[];subcategories:{id:string;name:string}[]};
 const [c,s]=await Promise.all([db.from('categories').select('id,name').order('name').abortSignal(AbortSignal.timeout(10000)),db.from('subcategories').select('id,name').abortSignal(AbortSignal.timeout(10000))]);
 if(c.error||s.error)throw new Error('Categories unavailable');return {categories:c.data,subcategories:s.data};
},['catalog-taxonomy-v2'],{revalidate:300});
const normalize=(s:string)=>s.trim().toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,' ');
async function filtered(selection:string,q:CatalogQuery,count=false){
 const db=client();if(!db)return null;
 let query=db.from('products').select(selection,count?{count:'exact'}:undefined).eq('status','active');
 if(q.category){
  if(uuid.test(q.category))query=query.eq('category_id',q.category);
  else {const taxonomy=await getTaxonomy();const alias=categoryAliases[q.category.toLowerCase()];
   const categories=taxonomy.categories.filter(c=>(alias?.categories||[q.category]).some(n=>normalize(n)===normalize(c.name))).map(c=>c.id);
   const subcategories=taxonomy.subcategories.filter(c=>(alias?.subcategories||[q.category]).some(n=>normalize(n)===normalize(c.name))).map(c=>c.id);
   const clauses=[...(categories.length?[`category_id.in.(${categories.join(',')})`]:[]),...(subcategories.length?[`subcategory_id.in.(${subcategories.join(',')})`]:[])];
   query=clauses.length?query.or(clauses.join(',')):query.eq('id','00000000-0000-0000-0000-000000000000');
  }
 }
 if(q.inStock)query=query.or('track_inventory.is.null,track_inventory.eq.false,stock_quantity.gt.0');
 for(const word of searchWords(q.search))query=query.or(`name.ilike.%${word}%,brand.ilike.%${word}%,description.ilike.%${word}%`);
 return {query};
}
// Price ordering uses a compact ID/price projection, never thousands of product bodies.
// This preserves discounted-price ordering without requiring a new database function.
const priceOrder=unstable_cache(async(q:CatalogQuery)=>{
 const rows:{id:string;price:number;discount:number}[]=[];
 for(let offset=0;;offset+=500){const f=await filtered('id,price,discount',q);if(!f)break;const {data,error}=await f.query.order('id').range(offset,offset+499).abortSignal(AbortSignal.timeout(10000));if(error)throw new Error('Prices unavailable');rows.push(...data as unknown as typeof rows);if(data.length<500)break;}
 return rows.sort((a,b)=>(q.sort==='price-high'?salePrice(b)-salePrice(a):salePrice(a)-salePrice(b))||a.id.localeCompare(b.id)).map(p=>p.id);
},['catalog-price-order-v2'],{revalidate:300});
export const getCatalogPage=unstable_cache(async(q:CatalogQuery)=>{
 const start=(q.page-1)*PAGE_SIZE;
 if(q.sort==='price-low'||q.sort==='price-high'){
  const ids=await priceOrder({...q,page:1});const selected=ids.slice(start,start+PAGE_SIZE);const db=client();if(!db||!selected.length)return {products:[] as Product[],total:ids.length};
  const {data,error}=await db.from('products').select(cardFields).eq('status','active').in('id',selected).abortSignal(AbortSignal.timeout(10000));if(error)throw new Error('Products unavailable');
  const products=data as unknown as Product[];return {products:selected.flatMap(id=>products.find(p=>p.id===id)||[]),total:ids.length};
 }
 const f=await filtered(cardFields,q,true);if(!f)return {products:[] as Product[],total:0};
 let query=f.query;query=q.sort==='name'?query.order('name'):query.order('created_at',{ascending:false});
 const {data,count,error}=await query.order('id').range(start,start+PAGE_SIZE-1).abortSignal(AbortSignal.timeout(10000));if(error)throw new Error('Products unavailable');return {products:data as unknown as Product[],total:count||0};
},['catalog-page-v2'],{revalidate:300});
export const getPublicProduct=unstable_cache(async(id:string):Promise<Product|null>=>{
 const db=client();if(!db||!uuid.test(id))return null;const {data,error}=await db.from('products').select(fields).eq('status','active').eq('id',id).abortSignal(AbortSignal.timeout(10000)).maybeSingle();if(error)throw new Error('Product unavailable');return data as unknown as Product|null;
},['public-product-v2'],{revalidate:300});
export const getRelatedProducts=unstable_cache(async(category:string,id:string)=>{
 const db=client();if(!db)return [] as Product[];const {data,error}=await db.from('products').select(cardFields).eq('status','active').eq('category_id',category).neq('id',id).order('created_at',{ascending:false}).order('id').limit(4).abortSignal(AbortSignal.timeout(10000));if(error)throw new Error('Related products unavailable');return data as unknown as Product[];
},['related-products-v2'],{revalidate:300});
export const getFeaturedProducts=unstable_cache(async()=>{
 const db=client();if(!db)return [] as Product[];const {data,error}=await db.from('products').select(cardFields).eq('status','active').order('created_at',{ascending:false}).order('id').limit(8).abortSignal(AbortSignal.timeout(10000));if(error)throw new Error('Products unavailable');return data as unknown as Product[];
},['featured-products-v2'],{revalidate:300});
export const getProductCount=unstable_cache(async()=>{const db=client();if(!db)return 0;const {count,error}=await db.from('products').select('id',{count:'exact',head:true}).eq('status','active').abortSignal(AbortSignal.timeout(10000));if(error)throw new Error('Product count unavailable');return count||0;},['product-count-v2'],{revalidate:300});
export const getSitemapProducts=unstable_cache(async(page:number)=>{const db=client();if(!db)return [] as {id:string;updated_at:string;images:string[]}[];const {data,error}=await db.from('products').select('id,updated_at,images').eq('status','active').order('id').range(page*SITEMAP_SIZE,(page+1)*SITEMAP_SIZE-1).abortSignal(AbortSignal.timeout(10000));if(error)throw new Error('Sitemap products unavailable');return data;},['sitemap-products-v2'],{revalidate:300});
