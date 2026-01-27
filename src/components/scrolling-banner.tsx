import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function ScrollingBanner() {
  const bannerItems = [
    {
      icon: MapPin,
      text: "📍 Eldoret, Kenya - Saito centre - 4th Floor",
      color: "text-blue-600"
    },
    {
      icon: Phone,
      text: "📞 Call us: +254 728 097 922 | +254 721 142 723",
      color: "text-green-600"
    },
    {
      icon: Mail,
      text: "✉️ Email: info@ketronics.co.ke | support@ketronics.co.ke",
      color: "text-purple-600"
    },
    {
      icon: Clock,
      text: "🕒 Mon-Fri: 8AM-6PM | Sat: 9AM-4PM | Emergency Support: 24/7",
      color: "text-orange-600"
    },
    {
      icon: MapPin,
      text: "🚚 Free delivery within Eldoret CBD | Installation services available",
      color: "text-red-600"
    },
    {
      icon: Phone,
      text: "🛠️ Expert CCTV installation, network setup, and tech repairs",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 py-2 overflow-hidden">
      <div className="animate-scroll flex whitespace-nowrap">
        {/* First set of items */}
        {bannerItems.map((item, index) => (
          <div
            key={`first-${index}`}
            className="flex items-center mx-8 text-sm font-medium"
          >
            <span className={`${item.color} mr-2`}>{item.text}</span>
            <span className="text-muted-foreground mx-4">•</span>
          </div>
        ))}
        {/* Duplicate set for seamless scrolling */}
        {bannerItems.map((item, index) => (
          <div
            key={`second-${index}`}
            className="flex items-center mx-8 text-sm font-medium"
          >
            <span className={`${item.color} mr-2`}>{item.text}</span>
            <span className="text-muted-foreground mx-4">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}