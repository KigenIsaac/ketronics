# Ketronics SEO

Canonical origin: https://www.ketronics.co.ke (the production redirect destination).

## Implemented

- Unique titles, descriptions, canonical URLs, Open Graph and Twitter metadata for all public landing pages, product pages and six curated collections.
- A 1200 × 630 sharing image at /social-image; product pages use their own product image when available.
- Anonymous, cookie-independent server-rendered catalogue data, cached for five minutes. Only public product fields are serialized. Paginated database reads prevent the default row limit from silently truncating the sitemap.
- /collections/laptops, phones, tvs, pcs, printers and accessories have useful buying guidance and crawlable product links. Empty collections are noindex and omitted from the sitemap. Old alias query links permanently redirect to these routes. Internal search and arbitrary category filters are noindex,follow.
- A single robots route; API paths are crawl-blocked. Publicly accessible account and transaction pages remain crawlable so robots can see their noindex directives. Authentication/authorization remains independent of SEO.
- Private-route noindex metadata and HTTP headers; API noindex headers; Vercel preview deployments receive a sitewide noindex header.
- Dynamic sitemap includes public pages, nonempty collections and all active products, real product modification dates and product images. Static pages do not invent modification dates. Database failures throw rather than intentionally replacing an established sitemap with an incomplete success response.
- ElectronicsStore, WebSite, Service, Product/Offer, CollectionPage/ItemList and breadcrumb JSON-LD. Prices use the same discounted-price calculation as the UI. Unknown inventory is not labelled in-stock; no fabricated reviews, ratings, shipping costs, return policies or GTINs.
- FAQ answers are included in initial HTML and remain expandable in the UI. No FAQ rich-result eligibility is claimed.
- Optional GOOGLE_SITE_VERIFICATION environment variable for an actual Search Console HTML-tag token.

## Validation

- npm run lint
- npm run test:all
- npm run build
- With the production server running: node scripts/smoke-routes.mjs and node scripts/seo-check.mjs
- Against production: SEO_BASE_URL=https://www.ketronics.co.ke SEO_LIVE=1 node scripts/seo-check.mjs

CI runs the SEO audit after building and starting the production server. CI's placeholder database intentionally has no products. Live mode additionally crawls every product in the sitemap and each indexed collection, checking metadata, structured-data parsing and server-rendered catalogue links.

## Account-level work

These steps require the verified owner's accounts; code deployment does not perform them:

1. Verify ketronics.co.ke as a Search Console domain property via DNS, or configure the real HTML-tag token for a URL-prefix property. Submit https://www.ketronics.co.ke/sitemap.xml and inspect the homepage, a collection and a product.
2. Check Page Indexing, Product snippets and Core Web Vitals reports. Google chooses indexing and rich-result display; submitting a sitemap does not guarantee either.
3. Confirm the Google Business Profile name, actual shop location, phone, hours and business categories. Add genuine store photos and request authentic customer reviews. Do not invent ratings or locations.
4. If using Merchant Center, configure verified business details and actual shipping/return policies before claiming merchant-listing completeness. This implementation does not invent those policies.
5. Review real mobile/desktop Core Web Vitals after sufficient field data exists. Passing metadata checks is not a Lighthouse or ranking score.

Keep product descriptions, stock and images accurate. Published product updates can take up to five minutes to refresh the public cache; checkout continues to validate current price and stock server-side.
