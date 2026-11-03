import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCatalogQuery,catalogHref,pageWindow,searchWords,PAGE_SIZE,SITEMAP_SIZE} from '../src/lib/catalog-query.ts';
import {sitemapXml,sitemapIndex} from '../src/lib/sitemap-xml.ts';
test('catalog query bounds malformed and unbounded input',()=>{
 const q=parseCatalogQuery({page:'-20',sort:'injected',search:'a'.repeat(500),stock:'1'});assert.equal(q.page,1);assert.equal(q.sort,'newest');assert.equal(q.search.length,120);assert.equal(q.inStock,true);
 assert.equal(parseCatalogQuery({page:'1.5'}).page,1);assert.equal(parseCatalogQuery({page:'Infinity'}).page,1);assert.equal(parseCatalogQuery({page:'500000'}).page,100000);assert.equal(PAGE_SIZE,24);
});
test('pagination preserves filters and generates bounded navigation',()=>{
 const q=parseCatalogQuery({search:'HP laptop',category:'abc',sort:'price-low',stock:'1',page:'2'});const href=catalogHref(q,{page:3});const url=new URL(href,'https://example.com');assert.equal(url.searchParams.get('page'),'3');assert.equal(url.searchParams.get('search'),'HP laptop');assert.equal(url.searchParams.get('stock'),'1');assert.deepEqual(pageWindow(1,420),[1,2,3,4,5]);assert.deepEqual(pageWindow(420,420),[416,417,418,419,420]);
});
test('search terms cannot alter PostgREST filter grammar',()=>{assert.deepEqual(searchWords('HP,price.gt.0%_(test)'),['hp','price','gt','0','test']);assert.ok(searchWords('word '.repeat(50)).length<=8);});
test('large sitemap index splits 10000 products into bounded documents',()=>{const count=10000;const chunks=Math.ceil(count/SITEMAP_SIZE);assert.equal(chunks,20);const xml=sitemapIndex(Array.from({length:chunks},(_,i)=>`https://example.com/${i}.xml`));assert.equal((xml.match(/<sitemap>/g)||[]).length,20);assert.ok(sitemapXml([{url:'https://example.com/?a=1&b=2',updated:'invalid'}]).includes('&amp;'));assert.ok(!sitemapXml([{url:'x',updated:'invalid'}]).includes('lastmod'));});
