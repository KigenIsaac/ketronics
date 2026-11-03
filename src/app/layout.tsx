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
  metadataBase: new URL("https://ketronics.co.ke"),
  title: {
    default: "Ketronics LTD",
    template: "%s | Ketronics LTD",
  },
  description:
    "Ketronics LTD offers laptops, printers, TVs, PCs, CCTV installation, network setup, and expert tech services across Kenya.",
  keywords: [
    "Ketronics LTD",
    "electronics store Kenya",
    "laptops Kenya",
    "printers Kenya",
    "TVs Kenya",
    "PCs Kenya",
    "CCTV installation",
    "network setup",
    "tech repairs",
    "smart home",
    "computer services",
  ],
  authors: [{ name: "Ketronics LTD" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/ketronics-logo.png",
    shortcut: "/ketronics-logo.png",
    apple: "/ketronics-logo.png",
  },
  openGraph: {
    title: "Ketronics LTD - Tech Products & Services in Kenya",
    description:
      "Shop laptops, printers, TVs, PCs and expert tech services in Kenya with Ketronics LTD.",
    url: "https://ketronics.co.ke",
    siteName: "Ketronics LTD",
    images: [
      {
        url: "/ketronics-logo.png",
        width: 512,
        height: 512,
        alt: "Ketronics LTD Logo",
      },
    ],
    type: "website",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ketronics LTD - Tech Products & Services",
    description:
      "Premium tech products and expert services in Kenya, including laptops, printers, TVs, PCs, CCTV, and network setup.",
    images: ["/ketronics-logo.png"],
  },
};

const structuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Ketronics LTD",
  description:
    "Ketronics LTD offers laptops, printers, TVs, PCs, CCTV installation, network setup, repairs, and expert tech services across Kenya.",
  url: "https://ketronics.co.ke",
  logo: "https://ketronics.co.ke/ketronics-logo.png",
  telephone: "+254728097922",
  address: {
    "@type": "PostalAddress",
    streetAddress: "AA building, 1st floor, room F6A",
    addressLocality: "Eldoret",
    addressRegion: "Kenya",
    addressCountry: "KE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "16:00",
    },
  ],
});

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

