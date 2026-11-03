import assert from 'node:assert/strict';
const base=process.env.SEO_BASE_URL||'http://127.0.0.1:3000';
const canonical='https://www.ketronics.co.ke';
const pages=['/','/products','/about-us','/services','/support','/contact','/faq','/privacy-policy','/terms-and-conditions'];
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;/g,"'");
const attr=(tag,name)=>{const match=tag.match(new RegExp(`\\b${name}="([^"]*)"`));return match?decode(match[1]):''};
const meta=(html,name)=>{const tag=[...html.matchAll(/<meta\b[^>]*>/g)].map(x=>x[0]).find(t=>attr(t,'name')===name||attr(t,'property')===name);return tag?attr(tag,'content'):''};
const canonicalOf=html=>{const tag=[...html.matchAll(/<link\b[^>]*>/g)].map(x=>x[0]).find(t=>attr(t,'rel')==='canonical');return tag?attr(tag,'href'):''};
async function get(path){const res=await fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(30000)});return {res,html:await res.text()};}
function validate(html,path){
 const title=decode(html.match(/<title>([^<]+)<\/title>/)?.[1]||'');assert.ok(title.length>10,`${path}: missing title`);
 assert.ok(meta(html,'description').length>40,`${path}: missing description`);
 assert.equal(new URL(canonicalOf(html)).href,new URL(canonical+path).href,`${path}: canonical`);
 assert.equal(new URL(meta(html,'og:url')).href,new URL(canonical+path).href,`${path}: OG URL`);
 assert.ok(meta(html,'og:image'),`${path}: missing sharing image`);
 assert.ok(meta(html,'twitter:image'),`${path}: missing Twitter image`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${path}: expected one H1`);
 for(const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
 return title;
}
const titles=new Set();
for(const path of pages){const {res,html}=await get(path);assert.equal(res.status,200,path);const title=validate(html,path);assert.ok(!titles.has(title),`${path}: duplicated title`);titles.add(title);assert.ok(!meta(html,'robots').includes('noindex'),`${path}: public page noindex`);console.log(`PASS metadata ${path}`);}
for(const path of ['/auth/login','/auth/signup','/cart','/checkout','/orders','/profile','/settings']){const {res,html}=await get(path);assert.equal(res.status,200);assert.ok(meta(html,'robots').includes('noindex'),`${path}: missing noindex`);assert.ok(res.headers.get('x-robots-tag')?.includes('noindex'),`${path}: missing noindex header`);console.log(`PASS noindex ${path}`);}
const robots=await get('/robots.txt');assert.equal(robots.res.status,200);assert.ok(robots.html.includes(canonical+'/sitemap.xml'));assert.ok(!robots.html.includes('Disallow: /auth'));assert.ok(robots.html.includes('Disallow: /api/'));
const sitemap=await get('/sitemap.xml');assert.equal(sitemap.res.status,200);const urls=[...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>decode(x[1]));assert.equal(new Set(urls).size,urls.length);assert.ok(urls.every(u=>u.startsWith(canonical+'/')));assert.ok(!urls.some(u=>/\/(admin|auth|cart|checkout|profile|settings|orders)(\/|$)/.test(u)));
const image=await fetch(base+'/social-image');assert.equal(image.status,200);assert.ok(image.headers.get('content-type')?.includes('image/png'));assert.ok((await image.arrayBuffer()).byteLength>5000);
const invalid=await get('/collections/not-a-real-category');assert.equal(invalid.res.status,404);
const search=await get('/products?search=test');assert.ok(meta(search.html,'robots').includes('noindex'));
const legacy=await get('/products?category=laptops');assert.equal(legacy.res.status,308);assert.equal(legacy.res.headers.get('location'),'/collections/laptops');
if(process.env.SEO_LIVE==='1'){
 const products=urls.filter(u=>u.includes('/products/'));assert.ok(products.length>0,'Live sitemap has no products');
 const catalog=await get('/products');assert.ok(/href="\/products\/[0-9a-f-]+"/.test(catalog.html),'Products missing from server-rendered HTML');
 for(let i=0;i<products.length;i+=5)await Promise.all(products.slice(i,i+5).map(async url=>{const path=new URL(url).pathname;const {res,html}=await get(path);assert.equal(res.status,200,path);validate(html,path);assert.ok(html.includes('"@type":"Product"'),`${path}: missing Product schema`);}));
 for(const url of urls.filter(u=>u.includes('/collections/'))){const path=new URL(url).pathname;const {res,html}=await get(path);assert.equal(res.status,200,path);validate(html,path);assert.ok(!meta(html,'robots').includes('noindex'));}
 console.log(`PASS all ${products.length} live products and indexed collections`);
}
console.log(`SEO audit PASS: ${urls.length} sitemap URLs; metadata, canonicals, schema parsing, noindex, redirects, robots, social image and 404 checks`);
