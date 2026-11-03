import Link from 'next/link';
import { PAGE_SIZE,pageWindow,catalogHref,type CatalogQuery } from '@/lib/catalog-query';
export function CatalogPagination({query,total,path='/products'}:{query:CatalogQuery;total:number;path?:string}){
 const pages=Math.ceil(total/PAGE_SIZE);if(pages<2)return null;
 return <nav aria-label="Product pages" className="mt-10 flex flex-wrap items-center justify-center gap-3">{query.page>1&&<Link className="home-button border border-border" href={catalogHref(query,{page:query.page-1},path)}>Previous</Link>}{pageWindow(query.page,pages).map(page=><Link key={page} aria-current={query.page===page?'page':undefined} className={`home-button border border-border ${query.page===page?'bg-primary text-primary-foreground':''}`} href={catalogHref(query,{page},path)}>{page}</Link>)}{query.page<pages&&<Link className="home-button border border-border" href={catalogHref(query,{page:query.page+1},path)}>Next</Link>}<span className="w-full text-center text-xs text-muted-foreground">Page {query.page} of {pages} · {total.toLocaleString()} products</span></nav>;
}
