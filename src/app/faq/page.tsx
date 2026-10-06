"use client";

import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");  const filteredFaqs = searchTerm.trim() === "" ? faqs : faqs.filter((faq) => {
    const term = searchTerm.toLowerCase();
    return faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term) || Boolean(faq.category?.toLowerCase().includes(term));
  });

}