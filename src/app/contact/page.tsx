"use client";

import { useEffect, useState } from "react";
import { ContactInfo } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingPage } from "@/components/loading";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  HelpCircle,
  Package
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const iconMap = {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
};

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

async function fetchContactData() {
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
          .in('key', ['contact_email', 'contact_phone', 'business_hours'])
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
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void Promise.all([
      supabase.from('contact_info').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('site_settings').select('key, value').in('key', ['contact_email', 'contact_phone', 'business_hours']),
    ]).then(([contactRes, settingsRes]) => {
      if (!active) return;
      if (contactRes.error) throw contactRes.error;
      if (settingsRes.error) throw settingsRes.error;
      const settingsMap = (settingsRes.data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      setContactInfo(contactRes.data || []);
      setSiteSettings(settingsMap);
    }).catch((error) => console.error('Error fetching contact data:', error)).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);