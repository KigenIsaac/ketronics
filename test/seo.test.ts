import test from 'node:test';
import assert from 'node:assert/strict';
import { absoluteUrl, pageMetadata, privateMetadata, productSchema, jsonLd, plainDescription, breadcrumbs } from '../src/lib/seo.ts';
import type { Product } from '../src/types/product.ts';
const product={id:'sample',name:'Laptop </script><script>alert(1)</script>',description:'A laptop',price:10000,discount:10,images:[],attributes:{},created_at:'2026-01-01',updated_at:'2026-01-01'} as Product;
test('metadata and schema share the final canonical host',()=>{
 const metadata=pageMetadata('Laptops','Browse laptops','/collections/laptops');
 assert.equal(metadata.alternates?.canonical,'https://www.ketronics.co.ke/collections/laptops');
 assert.equal(absoluteUrl('/'), 'https://www.ketronics.co.ke/');
 assert.equal(breadcrumbs([{name:'Products',path:'/products'}]).itemListElement[0].item,absoluteUrl('/products'));
});
test('JSON-LD cannot close its script element and preserves content',()=>{
 const encoded=jsonLd(productSchema(product));assert.ok(!encoded.includes('<'));assert.equal(JSON.parse(encoded).name,product.name);
});
test('product offers use discounted KES price without invented availability or ratings',()=>{
 const schema=productSchema(product);assert.equal(schema.offers?.price,'9000.00');assert.equal(schema.offers?.priceCurrency,'KES');assert.ok(!('availability' in schema.offers!));assert.ok(!('aggregateRating' in schema));
 assert.equal(productSchema({...product,track_inventory:true,stock_quantity:0}).offers?.availability,'https://schema.org/OutOfStock');
 assert.equal(productSchema({...product,track_inventory:true,stock_quantity:2}).offers?.availability,'https://schema.org/InStock');
 assert.equal(productSchema({...product,price:NaN}).offers,undefined);
});
test('descriptions are plain, bounded text and private pages disallow indexing',()=>{
 assert.equal(plainDescription('<p>Hello</p>   world'), 'Hello world');
 assert.ok(plainDescription('long description '.repeat(30)).length<=160);
 assert.equal((privateMetadata.robots as {index:boolean}).index,false);
});
