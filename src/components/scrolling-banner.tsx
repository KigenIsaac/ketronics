"use client";

import { usePathname } from "next/navigation";

export function ScrollingBanner() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const bannerItems = [
    "📍 Eldoret, Kenya AA building 1st floor room F6A",
    "📞 Call us: +254 728 097 922 | +254 721 142 723",
    "✉️ Email: info@ketronics.co.ke | support@ketronics.co.ke",
    "🕒 Mon-Fri: 8AM-6PM | Sat: 9AM-4PM | Emergency Support: 24/7",
    "🚚 Free delivery within Eldoret CBD | Installation services available",
    "🛠️ Expert CCTV installation, network setup, and tech repairs",
  ];

  return (
    <div className="overflow-hidden border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-2">
      <div className="animate-scroll flex whitespace-nowrap">
        {[...bannerItems, ...bannerItems].map((item, index) => (
          <div key={index} className="mx-8 flex items-center text-sm font-medium">
            <span className="text-muted-foreground">{item}</span><span className="mx-4 text-muted-foreground">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
