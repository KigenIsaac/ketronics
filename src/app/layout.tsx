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

export const metadata: Metadata = {
  title: "Ketronics LTD - Tech Products & Services",
  description: "Shop for laptops, printers, TVs, PCs and more. Expert tech services including maintenance, repairs, CCTV installation, and network setup.",
};

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
            {/* Header - full width */}
            <Header />

            <div className="flex flex-1 min-h-0">
              {/* Sidebar - positioned between header and footer on desktop */}
              <Sidebar className="hidden lg:flex w-auto flex-shrink-0" />

              {/* Main content */}
              <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
                {/* Scrolling Banner */}
                <ScrollingBanner />

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


