"use client";

import { useEffect, useState } from "react";
import { ContactInfo } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Clock,
  Shield,
  Truck,
  Headphones
} from "lucide-react";
import Link from "next/link";

const iconMap = {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Clock,
};

export function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const [contactRes, settingsRes] = await Promise.all([
        supabase
          .from('contact_info')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['site_name', 'contact_email', 'contact_phone', 'business_hours'])
      ]);

      if (contactRes.data) setContactInfo(contactRes.data);
      if (settingsRes.data) {
        const settingsMap = settingsRes.data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);
        setSiteSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    return iconMap[iconName as keyof typeof iconMap] || null;
  };

  const groupContactInfo = (type: string) => {
    return contactInfo.filter(info => info.type === type);
  };

  if (loading) {
    return (
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{siteSettings.site_name || 'Ketronics LTD'}</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for technology products and services in Kenya.
              We offer expert maintenance, repairs, and installation services.
            </p>
            <div className="flex space-x-2">
              {groupContactInfo('social').map((social) => {
                const Icon = getIcon(social.icon);
                return Icon ? (
                  <Button key={social.id} variant="ghost" size="sm" asChild>
                    <a href={social.value} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null;
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/products" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Products
              </Link>
              <Link href="/about-us" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/support" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
              <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Services</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Expert Repairs</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-blue-500" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Headphones className="h-4 w-4 text-purple-500" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Quick Installation</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact Info</h4>
            <div className="space-y-3">
              {groupContactInfo('email').map((email) => {
                const Icon = getIcon(email.icon);
                return (
                  <div key={email.id} className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {Icon && <Icon className="h-4 w-4" />}
                    <a href={`mailto:${email.value}`} className="hover:text-foreground transition-colors">
                      {email.label}
                    </a>
                  </div>
                );
              })}
              {groupContactInfo('phone').map((phone) => {
                const Icon = getIcon(phone.icon);
                return (
                  <div key={phone.id} className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {Icon && <Icon className="h-4 w-4" />}
                    <a href={`tel:${phone.value}`} className="hover:text-foreground transition-colors">
                      {phone.label}
                    </a>
                  </div>
                );
              })}
              {groupContactInfo('address').map((address) => {
                const Icon = getIcon(address.icon);
                return (
                  <div key={address.id} className="flex items-start space-x-2 text-sm text-muted-foreground">
                    {Icon && <Icon className="h-4 w-4 mt-0.5" />}
                    <span>{address.value}</span>
                  </div>
                );
              })}
              {siteSettings.business_hours && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{siteSettings.business_hours}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteSettings.site_name || 'Ketronics LTD'}. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}