import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/dashboard', '/orders', '/profile', '/settings', '/checkout', '/cart', '/auth/']},
    sitemap: 'https://ketronics.co.ke/sitemap.xml',
  };
}
