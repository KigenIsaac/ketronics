import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async redirects() {
    return [{source:'/:path*',has:[{type:'host' as const,value:'ketronics.co.ke'}],destination:'https://www.ketronics.co.ke/:path*',permanent:true}];
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }, ...['admin','auth','cart','checkout','dashboard','orders','profile','settings'].map(path=>({source:`/${path}/:path*`,headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]})), {source:'/api/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]}, ...(process.env.VERCEL_ENV==='preview'?[{source:'/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]}]:[])];
  },
};

export default nextConfig;
