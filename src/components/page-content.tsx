"use client";

import { useEffect, useState } from "react";
import { Page, PageSection } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { LoadingPage } from "@/components/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageContentProps {
  slug: string;
}

export function PageContent({ slug }: PageContentProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

async function fetchPageContent(pageSlug: string) {
  const { data: pageData, error: pageError } = await supabase.from('pages').select('*').eq('slug', pageSlug).eq('is_published', true).single();
  if (pageError) throw pageError;
  const { data: sectionsData, error: sectionsError } = await supabase.from('page_sections').select('*').eq('page_id', pageData.id).eq('is_active', true).order('sort_order');
  if (sectionsError) throw sectionsError;
  return { page: pageData, sections: sectionsData || [] };
}

  useEffect(() => {
    let active = true;
    void fetchPageContent(slug)
      .then((result) => { if (active) { setPage(result.page); setSections(result.sections); } })
      .catch((error) => console.error('Error fetching page content:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);