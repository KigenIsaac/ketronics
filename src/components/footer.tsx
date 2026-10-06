"use client";

import { useEffect, useState } from "react";
import { ContactInfo } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
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
import Image from "next/image";



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

async function fetchFooterData() {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    let active = true;
    void fetchFooterData()
      .then((result) => {
        if (!active || !result) return;
        setContactInfo(result.contactInfo);
        setSiteSettings(result.siteSettings);
      })
      .catch((error) => console.error('Error fetching footer data:', error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
