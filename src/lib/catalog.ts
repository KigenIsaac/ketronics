import type { Product } from '../types/product.ts';

export const categoryAliases: Record<string, { categories: string[]; subcategories: string[]; title: string }> = {
  laptops: { categories: ['Laptops'], subcategories: ['Laptop', 'Laptops'], title: 'Laptops' },
  phones: { categories: ['Phones', 'Phones & Tablets'], subcategories: ['Phones', 'Tablets'], title: 'Phones & Tablets' },
  tvs: { categories: ['TVs', 'TVs & Displays', 'Displays'], subcategories: ['TVs', 'Digital TVs', 'Smart TVs'], title: 'TVs & Displays' },
  pcs: { categories: ['Computing', 'PCs & Components'], subcategories: ['Desktop', 'Desktops', 'PCs', 'Components'], title: 'PCs & Components' },
  printers: { categories: ['Printers'], subcategories: ['Printer', 'Printers'], title: 'Printers' },
  accessories: { categories: ['Accessories'], subcategories: ['Accessories', 'Extension Cable', 'Input Device', 'Cleaning', 'Cat6 Cable'], title: 'Accessories' },
};
export type CatalogSort = 'newest' | 'price-low' | 'price-high' | 'name';
export function salePrice(product: Pick<Product, 'price' | 'discount'>) {
  const price = Number(product.price);
  const discount = Math.min(100, Math.max(0, Number(product.discount) || 0));
  return Math.round(price * (1 - discount / 100) * 100) / 100;
}
const normalize = (value?: string) => (value || '').trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ');
export function selectProducts(products: Product[], {search = '', category = '', sort = 'newest', inStock = false}: {search?: string; category?: string; sort?: CatalogSort; inStock?: boolean}) {
  const words = normalize(search).split(' ').filter(Boolean);
  const alias = categoryAliases[category.toLowerCase()];
  const selected = products.filter(p => {
    if (inStock && p.track_inventory && Number(p.stock_quantity || 0) <= 0) return false;
    const matches = !category || p.category_id === category || p.category?.id === category || normalize(p.category?.name) === normalize(category) || normalize(p.subcategory?.name) === normalize(category) || (alias && (alias.categories.some(n=>normalize(n)===normalize(p.category?.name)) || alias.subcategories.some(n=>normalize(n)===normalize(p.subcategory?.name))));
    const text = normalize([p.name, p.description, p.brand, p.category?.name, p.subcategory?.name, ...Object.entries(p.attributes || {}).flatMap(([key,value])=>[key,String(value ?? '')])].join(' '));
    return matches && words.every(word => text.includes(word));
  });
  return selected.sort((a,b) => sort === 'price-low' ? salePrice(a)-salePrice(b) : sort === 'price-high' ? salePrice(b)-salePrice(a) : sort === 'name' ? a.name.localeCompare(b.name) : b.created_at.localeCompare(a.created_at));
}
