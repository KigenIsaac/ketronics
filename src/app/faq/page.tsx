"use client";

import { useEffect, useMemo, useState } from "react";
import { FAQ } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/loading";
import { Search, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

async function fetchFAQs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('sort_order');

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void supabase.from('faqs').select('*').eq('is_published', true).order('sort_order')
      .then(({ data, error }) => {
        if (error) throw error;
        if (active) setFaqs(data || []);
      }).catch((error) => console.error('Error fetching FAQs:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);