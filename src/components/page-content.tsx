"use client";

import { useEffect, useState } from "react";
import { Page, PageSection } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { LoadingPage } from "@/components/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

interface PageContentProps {
  slug: string;
}

export function PageContent({ slug }: PageContentProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, [slug]);

  const fetchPageContent = async () => {
    try {
      // Fetch page
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (pageError) throw pageError;

      setPage(pageData);

      // Fetch page sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('is_active', true)
        .order('sort_order');

      if (sectionsError) throw sectionsError;

      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading page content..." />;
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or is not published.</p>
        <Button asChild>
          <a href="/">Go Home</a>
        </Button>
      </div>
    );
  }

  const renderSection = (section: PageSection) => {
    switch (section.section_type) {
      case 'hero':
        return (
          <div className="text-center py-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            {section.image_url && (
              <img
                src={section.image_url}
                alt={section.title || ''}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            {section.title && <h2 className="text-3xl font-bold mb-4">{section.title}</h2>}
            {section.content && (
              <div
                className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
            {section.button_text && section.button_url && (
              <Button asChild>
                <a href={section.button_url}>{section.button_text}</a>
              </Button>
            )}
          </div>
        );

      case 'content':
        return (
          <Card>
            <CardContent className="pt-6">
              {section.title && <h3 className="text-xl font-semibold mb-4">{section.title}</h3>}
              {section.content && (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="pt-6">
              {section.title && <h3 className="text-xl font-semibold mb-4">{section.title}</h3>}
              {section.content && (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{page.title}</h1>
        {page.meta_description && (
          <p className="text-lg text-muted-foreground mt-4">{page.meta_description}</p>
        )}
      </div>

      {/* Page Content */}
      {page.content && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Page Sections */}
      {sections.length > 0 && (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id}>
              {renderSection(section)}
            </div>
          ))}
        </div>
      )}

      {/* Fallback for empty pages */}
      {!page.content && sections.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Content Coming Soon</h3>
            <p className="text-muted-foreground">
              This page is currently being updated. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}