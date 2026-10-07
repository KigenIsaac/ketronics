"use client";

import { useEffect, useMemo, useState } from "react";
import { isStaffRole } from "@/lib/roles";
import { useUserStore } from "@/lib/stores/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";
import {
  ArrowRight, ChevronLeft, ChevronRight, Heart, Laptop, Package,
  Phone, Printer, ShieldCheck, ShoppingBag, Smartphone, Star, Tag, Truck,
  Tv, Headphones, Cpu
} from "lucide-react";

const categories = [
  { title: "Laptops", icon: Laptop, href: "/products?category=laptops", tone: "from-orange-50 to-white" },
  { title: "Phones & Tablets", icon: Smartphone, href: "/products?category=phones", tone: "from-blue-50 to-white" },
  { title: "TVs & Displays", icon: Tv, href: "/products?category=tvs", tone: "from-violet-50 to-white" },
  { title: "PCs & Components", icon: Cpu, href: "/products?category=pcs", tone: "from-emerald-50 to-white" },
  { title: "Printers", icon: Printer, href: "/products?category=printers", tone: "from-amber-50 to-white" },
  { title: "Accessories", icon: Headphones, href: "/products?category=accessories", tone: "from-pink-50 to-white" },
];

function ProductTile({ product }: { product: Product }) {
  const price = product.discount && product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
  return (
    <Link href={"/products/" + product.id} className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f5f5f3]">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 50vw, 220px" className="object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
        ) : <div className="flex h-full items-center justify-center text-xs text-black/25">No image</div>}
        {product.discount && product.discount > 0 ? <span className="absolute left-2 top-2 rounded bg-orange-500 px-2 py-1 text-[9px] font-bold text-white">-{product.discount}%</span> : null}
        <button type="button" onClick={(e) => e.preventDefault()} aria-label="Add to wishlist" className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="px-1 pt-3">
        <p className="truncate text-[10px] uppercase tracking-[0.12em] text-black/35">{product.brand || product.category?.name || "Technology"}</p>
        <h3 className="mt-1 line-clamp-2 min-h-9 text-xs font-medium leading-4 text-black/80">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold">KSh {price.toLocaleString("en-KE", { maximumFractionDigits: 0 })}</span>
          {product.discount ? <span className="text-[10px] text-black/30 line-through">KSh {product.price.toLocaleString("en-KE", { maximumFractionDigits: 0 })}</span> : null}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[9px] text-amber-500"><Star className="h-3 w-3 fill-current" /> <span className="text-black/35">Featured pick</span></div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [slide, setSlide] = useState(0);
  const { user, loading: userLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      const { data } = await supabase.from("products").select("*, category:categories(*)").eq("status", "active").order("created_at", { ascending: false }).limit(16);
      if (!cancelled) setProducts(data ?? []);
    };
    void loadProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % 3), 5500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      const timer = window.setTimeout(() => router.push(isStaffRole(user.role) ? "/admin" : "/dashboard"), 900);
      return () => window.clearTimeout(timer);
    }
  }, [user, userLoading, router]);

  const heroProducts = useMemo(() => products.slice(0, 3), [products]);
  const firstProducts = products.slice(0, 4);
  const secondProducts = products.slice(4, 8);
  const thirdProducts = products.slice(8, 12);
  const fourthProducts = products.slice(12, 16);

  if (userLoading || user) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center"><div className="mx-auto mb-4 h-2.5 w-2.5 animate-pulse rounded-full bg-orange-500" /><p className="text-sm text-black/50">{user ? "Taking you to your workspace…" : "Loading Ketronics…"}</p></div>
      </main>
    );
  }

  const hero = heroProducts[slide];
  const heroTitle = ["Smart technology. Better everyday.", "Power your work. Upgrade your setup.", "Great tech, ready when you are."][slide];
  const heroSub = ["Shop laptops, phones, displays and accessories from Ketronics.", "Find dependable devices and components for home and business.", "Discover current products and practical technology services."][slide];

  return (
    <main className="-mx-4 -mt-6 -mb-4 overflow-hidden bg-[#fffdf9] text-[#151515] lg:-mx-6 lg:-mt-6 lg:-mb-6">
      {/* Promo strip */}
      <div className="bg-[#151515] px-4 py-2 text-center text-[10px] font-medium tracking-wide text-white sm:text-xs">
        <span className="text-orange-400">Special offers</span> · Shop technology with Ketronics · M-Pesa checkout available · <Link href="/contact" className="underline underline-offset-2">Need help?</Link>
      </div>

      {/* Hero carousel */}
      <section className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[#071a37] sm:min-h-[430px] lg:min-h-[470px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(35,118,255,.5),transparent_38%),linear-gradient(120deg,#071a37,#052f74_55%,#0a72bc)]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.15),transparent_55%)]" />
          <div className="relative grid min-h-[360px] items-center px-6 py-10 sm:min-h-[430px] sm:px-10 lg:min-h-[470px] lg:grid-cols-[.9fr_1.1fr] lg:px-14">
            <div className="z-10 max-w-xl text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">KETRONICS · FEATURED</p>
              <h1 className="mt-4 text-4xl font-bold leading-[.95] tracking-[-0.055em] sm:text-6xl">{heroTitle}</h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/70 sm:text-base">{heroSub}</p>
              <div className="mt-7 flex gap-3">
                <Link href="/products" className="inline-flex h-10 items-center rounded-full bg-orange-500 px-5 text-xs font-bold text-white hover:bg-orange-600">Shop now <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                <Link href="/contact" className="hidden h-10 items-center rounded-full border border-white/20 px-5 text-xs font-semibold text-white sm:inline-flex">Talk to an expert</Link>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex w-[58%] items-center justify-center lg:static lg:w-auto">
              {hero?.images?.[0] ? <Image src={hero.images[0]} alt={hero.name} width={600} height={500} priority className="max-h-[330px] w-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,.35)] transition-all duration-700 sm:max-h-[390px] lg:max-h-[430px]" /> : <div className="h-64 w-64 rounded-full bg-white/10" />}
            </div>
          </div>
          <div className="absolute bottom-5 left-6 flex gap-1.5 sm:left-10">
            {[0,1,2].map((index) => <button key={index} type="button" onClick={() => setSlide(index)} aria-label={"Show slide " + (index + 1)} className={"h-1.5 rounded-full transition-all " + (slide === index ? "w-8 bg-white" : "w-3 bg-white/30")} />)}
          </div>
        </div>
      </section>

      {/* Category row */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Shop by category</p><h2 className="mt-1 text-xl font-bold tracking-tight">Find your next essential</h2></div><Link href="/products" className="text-[11px] font-semibold text-orange-600">View all</Link></div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {categories.map((category) => { const Icon = category.icon; return <Link key={category.title} href={category.href} className={"group rounded-xl bg-gradient-to-b " + category.tone + " p-3 text-center ring-1 ring-black/5 transition-transform hover:-translate-y-1 sm:p-4"}><div className="mx-auto flex h-14 items-center justify-center sm:h-20"><Icon className="h-9 w-9 stroke-[1.4] text-black/70 transition-transform group-hover:scale-110" /></div><p className="truncate text-[10px] font-semibold sm:text-xs">{category.title}</p></Link>; })}
        </div>
      </section>

      {/* Product section 1 */}
      <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Trending now</p><h2 className="mt-1 text-xl font-bold tracking-tight">Check out today’s great deals</h2></div><Link href="/products" className="flex items-center text-[11px] font-semibold text-orange-600">See all <ArrowRight className="ml-1 h-3 w-3" /></Link></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{firstProducts.map((p) => <ProductTile key={p.id} product={p} />)}</div>
      </section>

      {/* Dark promo banner */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative min-h-[230px] overflow-hidden rounded-2xl bg-[#100c28] px-6 py-8 sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(139,92,246,.55),transparent_35%),linear-gradient(100deg,#100c28,#28105d)]" />
          <div className="relative z-10 max-w-md text-white"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/50">Smart device collection</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Grab the right tech for your day.</h2><p className="mt-3 text-xs leading-5 text-white/60">Everyday devices, entertainment and accessories selected for practical use.</p><Link href="/products" className="mt-6 inline-flex h-9 items-center rounded-full bg-orange-500 px-5 text-[11px] font-bold">Explore collection <ArrowRight className="ml-2 h-3 w-3" /></Link></div>
          {secondProducts[0]?.images?.[0] ? <Image src={secondProducts[0].images[0]} alt="" width={380} height={280} className="absolute bottom-[-30px] right-4 h-[270px] w-[300px] object-contain drop-shadow-2xl sm:right-10 sm:h-[320px] sm:w-[380px]" /> : null}
        </div>
      </section>

      {/* Product section 2 */}
      <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Popular picks</p><h2 className="mt-1 text-xl font-bold tracking-tight">Top technology for every setup</h2></div><Link href="/products" className="text-[11px] font-semibold text-orange-600">More products</Link></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{secondProducts.map((p) => <ProductTile key={p.id} product={p} />)}</div>
      </section>

      {/* Service / discovery banner */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-black/10 bg-[#f1efe9] lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-black/35">Ketronics services</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Discover more than products.</h2><p className="mt-3 max-w-md text-sm leading-6 text-black/55">Repairs, CCTV, network setup, installation and technical support from a team that understands the technology.</p><Link href="/contact" className="mt-6 inline-flex w-fit items-center rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white">Explore services <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></div>
          <div className="relative min-h-[260px] overflow-hidden bg-[#d8d5cd]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(255,255,255,.8),transparent_35%)]" />
            <div className="absolute left-[15%] top-[18%] h-28 w-28 rounded-[2rem] border border-white/50 bg-white/50 shadow-xl rotate-[-8deg]"><ShieldCheck className="m-auto mt-9 h-12 w-12 text-black/40" /></div>
            <div className="absolute right-[15%] bottom-[15%] h-36 w-36 rounded-full border border-white/60 bg-white/45 shadow-xl"><Package className="m-auto mt-11 h-14 w-14 text-black/35" /></div>
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-[10px] font-semibold"><Truck className="h-3.5 w-3.5" /> Delivery · Installation · Support</div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Just landed</p><h2 className="mt-1 text-xl font-bold tracking-tight">New arrival products</h2></div><div className="flex gap-1"><button type="button" aria-label="Previous products" className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Next products" className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10"><ChevronRight className="h-4 w-4" /></button></div></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{thirdProducts.map((p) => <ProductTile key={p.id} product={p} />)}</div>
      </section>

      {/* Sale banner */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#101010] px-6 py-9 text-white sm:px-10">
          <div className="absolute right-0 top-0 h-full w-2/3 bg-[radial-gradient(circle_at_65%_45%,rgba(255,255,255,.18),transparent_38%)]" />
          <div className="relative z-10 max-w-md"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/45">Better value, same ambition</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Great deals on all your tech essentials.</h2><p className="mt-3 text-xs text-white/55">Explore current prices and available discounts across the store.</p><Link href="/products" className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-[11px] font-bold text-black">Shop deals</Link></div>
          {fourthProducts[0]?.images?.[0] ? <Image src={fourthProducts[0].images[0]} alt="" width={340} height={260} className="absolute bottom-[-25px] right-3 h-64 w-72 object-contain sm:right-12" /> : null}
        </div>
      </section>

      {/* Best selling */}
      <section className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Customer favourites</p><h2 className="mt-1 text-xl font-bold tracking-tight">Explore best selling products</h2></div><Link href="/products" className="text-[11px] font-semibold text-orange-600">Shop all</Link></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{fourthProducts.map((p) => <ProductTile key={p.id} product={p} />)}</div>
      </section>

      {/* Trust row */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Secure checkout", ShieldCheck], ["Fast local support", Phone], ["Quality technology", Tag], ["Delivery available", Truck]].map(([label, Icon]) => {
            const I = Icon as typeof ShieldCheck;
            return <div key={label as string} className="flex items-center gap-3 rounded-xl border border-black/8 bg-white p-4"><I className="h-5 w-5 text-black/55" /><div><p className="text-xs font-bold">{label as string}</p><p className="mt-0.5 text-[9px] text-black/40">Ketronics service</p></div></div>;
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1400px] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#f0eee8] px-6 py-12 text-center sm:px-10"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-black/35">Need a recommendation?</p><h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Tell us what you’re trying to build.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/50">Our team can help you choose products, plan installations and find practical technology for your home or business.</p><div className="mt-6 flex justify-center gap-3"><Link href="/contact" className="rounded-full bg-orange-500 px-6 py-3 text-xs font-bold text-white">Contact Ketronics</Link><Link href="/products" className="rounded-full border border-black/10 bg-white px-6 py-3 text-xs font-bold">Browse store</Link></div></div>
      </section>
    </main>
  );
}
