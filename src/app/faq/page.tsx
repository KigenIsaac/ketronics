import { pageMetadata } from '@/lib/seo';
export const metadata=pageMetadata('Frequently Asked Questions','Find answers to common questions about Ketronics products, orders, payments, delivery and technical support in Kenya.','/faq');
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { PageHero,StorePage } from "@/components/store-ui";
import FAQBrowser from "./FAQBrowser";
export default async function FAQPage(){const supabase=await createSupabaseServerClient();const{data}=await supabase.from("faqs").select("*").eq("is_published",true).order("sort_order");return <StorePage><PageHero eyebrow="HELP CENTER" title="Answers, without the wait." description="Search common questions about products, orders, payments and support."/><div className="mx-auto max-w-4xl"><FAQBrowser faqs={data||[]}/></div></StorePage>}