import type { CatalogSort } from './catalog.ts';
export const PAGE_SIZE=24;
export const SITEMAP_SIZE=500;
export type CatalogQuery={page:number;search:string;category:string;sort:CatalogSort;inStock:boolean};
export function parseCatalogQuery(params:Record<string,string|string[]|undefined>):CatalogQuery{
 const value=(key:string)=>typeof params[key]==='string'?params[key] as string:'';
 const page=Number(value('page'));
 return {page:Number.isSafeInteger(page)&&page>0?Math.min(page,100000):1,search:value('search').slice(0,120).trim(),category:value('category').slice(0,100),sort:['newest','price-low','price-high','name'].includes(value('sort'))?value('sort') as CatalogSort:'newest',inStock:value('stock')==='1'};
}
export function catalogHref(query:CatalogQuery,changes:Partial<CatalogQuery>={},path='/products'){
 const q={...query,...changes};const params=new URLSearchParams();
 if(q.search)params.set('search',q.search);if(q.category)params.set('category',q.category);if(q.sort!=='newest')params.set('sort',q.sort);if(q.inStock)params.set('stock','1');if(q.page>1)params.set('page',String(q.page));
 return path+(params.size?'?'+params.toString():'');
}
export function searchWords(search:string){return search.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/).filter(Boolean).slice(0,8);}
export function pageWindow(page:number,total:number){const start=Math.max(1,Math.min(page-2,total-4));return Array.from({length:Math.min(5,total)},(_,i)=>start+i);}
