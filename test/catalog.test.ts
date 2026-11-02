import test from 'node:test';
import assert from 'node:assert/strict';
import { salePrice, selectProducts } from '../src/lib/catalog.ts';
import type { Product } from '../src/types/product.ts';
const product = (id: string, overrides: Partial<Product> = {}): Product => ({id, name: 'HP laptop', description: 'Work computer', price: 1000, images: [], attributes: { RAM: '16 GB' }, created_at: '2026-01-01', updated_at: '2026-01-01', ...overrides});
test('multi-word search spans name and attributes in any order', () => {
 assert.equal(selectProducts([product('1')], { search: '16 HP' }).length, 1);
 assert.equal(selectProducts([product('1')], { search: 'HP 32' }).length, 0);
});
test('sort uses discounted price without mutating the source', () => {
 const rows = [product('1',{price:1000}),product('2',{price:1500,discount:50})];
 assert.deepEqual(selectProducts(rows,{sort:'price-low'}).map(p=>p.id),['2','1']);
 assert.deepEqual(rows.map(p=>p.id),['1','2']);
});
test('inventory filter retains untracked items and hides tracked empty items', () => {
 assert.deepEqual(selectProducts([product('1',{track_inventory:true,stock_quantity:0}),product('2',{track_inventory:false}),product('3',{track_inventory:true,stock_quantity:2})],{inStock:true}).map(p=>p.id),['2','3']);
});
test('category aliases do not include every hardware product as an accessory', () => {
 const category={id:'hardware',name:'Hardware',created_at:'',updated_at:''};
 assert.equal(selectProducts([product('1',{category})],{category:'accessories'}).length,0);
 assert.equal(selectProducts([product('1',{category})],{category:'hardware'}).length,1);
});
test('price bounds and rounding', () => {
 assert.equal(salePrice({price:999,discount:15}),849.15);
 assert.equal(salePrice({price:100,discount:-5}),100);
 assert.equal(salePrice({price:100,discount:150}),0);
});
