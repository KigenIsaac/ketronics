import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollingBanner } from "@/components/scrolling-banner";
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

export const metadataBase = new URL("https://ketronics.co.ke");

export const metadata: Metadata = {
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
  openGraph: {
    title: "Ketronics LTD - Tech Products & Services in Kenya",
    description:
      "Shop laptops, printers, TVs, PCs and expert tech services in Kenya with Ketronics LTD.",
    url: "https://ketronics.co.ke",
    siteName: "Ketronics LTD",
    type: "website",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ketronics LTD - Tech Products & Services",
    description:
      "Premium tech products and expert services in Kenya, including laptops, printers, TVs, PCs, CCTV, and network setup.",
  },
};

const structuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Ketronics LTD",
  description:
    "Ketronics LTD offers laptops, printers, TVs, PCs, CCTV installation, network setup, repairs, and expert tech services across Kenya.",
  url: "https://ketronics.co.ke",
  telephone: "+254 700 000 000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "AA building floor room F6A",
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
  sameAs: [
    "https://facebook.com/ketronics",
    "https://twitter.com/ketronics",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            {/* Scrolling Banner */}
            <ScrollingBanner />
            
            {/* Header - full width */}
            <Header />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: structuredData }}
            />

            <div className="flex flex-1 min-h-0">
              {/* Sidebar - positioned between header and footer on desktop */}
              <Sidebar className="hidden lg:flex w-auto flex-shrink-0" />

              {/* Main content */}
              <div className="flex-1 flex flex-col min-w-0 lg:ml-0">

                {/* Mobile header spacing for sidebar toggle */}
                <div className="lg:hidden h-14" />

                {/* Page content */}
                <main className="flex-1 lg:px-6 lg:py-6 px-4 py-4">
                  {children}
                </main>
              </div>
            </div>

            {/* Footer - full width */}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}


