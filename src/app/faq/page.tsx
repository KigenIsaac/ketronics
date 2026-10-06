"use client";

import { useEffect, useMemo, useState } from "react";
import { FAQ } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/loading";
import { Search, HelpCircle } from "lucide-react";

async function fetchFAQs() {
  const { data, error } = await supabase.from('faqs').select('*').eq('is_published', true).order('sort_order');
  if (error) throw error;
  return data || [];
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const filteredFaqs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return faqs;
    return faqs.filter((faq) =>
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      Boolean(faq.category?.toLowerCase().includes(term)),
    );
  }, [faqs, searchTerm]);

}