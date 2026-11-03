import { SITE_URL, SITE_NAME, businessSchema, jsonLd } from '@/lib/seo';
import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {default: SITE_NAME, template: `%s | ${SITE_NAME}`},
  description: 'Laptops, phones, printers and technology services from Ketronics Solutions Ltd in Eldoret, Kenya.',
  robots: {index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  icons: {icon:'/ketronics-logo.png',apple:'/ketronics-logo.png'},
  verification: {google:process.env.GOOGLE_SITE_VERIFICATION || undefined},
};
const structuredData = jsonLd(businessSchema);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/ketronics-logo.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-5 focus:py-3">Skip to content</a>
        <Providers>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }}/>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}

