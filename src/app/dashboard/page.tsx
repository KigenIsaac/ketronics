import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingBag, User, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { PageHero, SectionHeader, StorePage, Surface } from '@/components/store-ui';
export default async function DashboardPage(){
 const supabase=await createSupabaseServerClient(); const {data:{session}}=await supabase.auth.getSession(); if(!session)return redirect('/auth/login');
 const {data:{user},error}=await supabase.auth.getUser(); if(error||!user)return redirect('/auth/login');
 const {data:profile}=await supabase.from('profiles').select('full_name,is_active').eq('id',user.id).single(); if(!profile?.is_active)return redirect('/auth/login');
 const name=profile.full_name||user.email?.split('@')[0]||'there';
 const cards=[['Shop the catalog','Explore laptops, displays, printers and more.','/products',Package],['Your orders','Track purchases and view order history.','/orders',ShoppingBag],['Your profile','Keep your contact details up to date.','/profile',User],['Preferences','Manage notifications and account settings.','/settings',Settings]] as const;
 return <StorePage><PageHero eyebrow="MY KETRONICS" title={'Welcome back, '+name+'.'} description="Everything you need to shop, manage your account and keep track of your orders." action={<Sparkles className="hidden h-12 w-12 text-orange-400 sm:block"/>}/><SectionHeader eyebrow="QUICK ACCESS" title="Your account" description="Pick up where you left off."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([title,desc,href,Icon])=><Link href={href} key={href} className="group"><Surface className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon className="h-5 w-5"/></div><h3 className="font-bold">{title}</h3><p className="mt-2 min-h-10 text-sm leading-5 text-black/50">{desc}</p><span className="mt-5 inline-flex items-center text-xs font-bold text-black/45 group-hover:text-orange-600">Open <ArrowRight className="ml-1 h-3 w-3"/></span></Surface></Link>)}</div></StorePage>
}