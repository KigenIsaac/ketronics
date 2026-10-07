"use client";

import { useEffect, useState } from "react";
import { isStaffRole } from "@/lib/roles";
import { useUserStore } from "@/lib/stores/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Headphones,
  Laptop,
  Monitor,
  Network,
  Printer,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";

const categories = [
  { title: "Laptops", description: "Work, create and play.", href: "/products?category=laptops", icon: Laptop, tag: "Performance" },
  { title: "Printers", description: "Reliable office printing.", href: "/products?category=printers", icon: Printer, tag: "Business" },
  { title: "TVs & Displays", description: "Sharper ways to see more.", href: "/products?category=tvs", icon: Monitor, tag: "Entertainment" },
  { title: "PCs & Components", description: "Built around your needs.", href: "/products?category=pcs", icon: Cpu, tag: "Custom" },
];

const services = [
  { icon: Wrench, title: "Repairs & maintenance", text: "Keep your devices reliable with practical technical support." },
  { icon: ShieldCheck, title: "CCTV & security", text: "Professional security solutions for homes and businesses." },
  { icon: Network, title: "Networks & connectivity", text: "Plan, install and troubleshoot dependable networks." },
  { icon: Headphones, title: "Technical support", text: "Get help choosing, setting up and maintaining your technology." },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { user, loading: userLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const loadFeaturedProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);
      if (!cancelled) {
        setFeaturedProducts(data ?? []);
        setProductsLoading(false);
      }
    };
    void loadFeaturedProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      const timer = window.setTimeout(() => {
        router.push(isStaffRole(user.role) ? "/admin" : "/dashboard");
      }, 900);
      return () => window.clearTimeout(timer);
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return (
      <main className="min-h-screen bg-[#080a0d] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          Loading your experience
        </div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-[#080a0d] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <Zap className="h-5 w-5" />
          </div>
          <p className="text-lg font-medium">Welcome back, {user.full_name || user.email}</p>
          <p className="mt-1 text-sm text-white/50">Taking you to your workspace…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="overflow-hidden bg-[#f7f7f5] text-[#101114]">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-3.5rem)] bg-[#080a0d] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-40 h-[620px] w-[620px] rounded-full bg-white/[0.06] blur-3xl" />
          <div className="absolute -bottom-48 left-1/3 h-[500px] w-[500px] rounded-full bg-amber-300/[0.08] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1400px] flex-col justify-between px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/45">
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Technology, thoughtfully supplied
            </span>
            <span className="hidden sm:block">Kenya · Ketronics LTD</span>
          </div>

          <div className="grid items-end gap-12 py-16 lg:grid-cols-[1.25fr_.75fr] lg:py-20">
            <div>
              <p className="mb-6 text-sm font-medium text-white/55">YOUR TECHNOLOGY PARTNER</p>
              <h1 className="max-w-5xl text-[clamp(3.5rem,9vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.07em]">
                Tech that
                <br />
                <span className="text-white/45">moves you</span>
                <br />
                forward.
              </h1>
              <p className="mt-9 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
                Discover dependable technology products and expert services—from everyday devices to the systems that keep your business connected.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="group inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
                >
                  Explore products
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-medium text-white transition-colors hover:bg-white/[0.09]"
                >
                  Talk to us
                </Link>
              </div>
            </div>

            <div className="lg:pb-3">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm sm:p-6">
                <div className="mb-10 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">Why Ketronics</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.7)]" />
                </div>
                <div className="space-y-5">
                  {[
                    "Curated technology products",
                    "M-Pesa-ready checkout",
                    "Technical services & support",
                    "Built for Kenyan customers",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 border-b border-white/8 pb-5 last:border-0 last:pb-0">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-white/70" />
                      <span className="text-sm text-white/75">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/35">
            <span>Scroll to explore</span>
            <span className="hidden sm:block">01 / 04</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">01 — What we do</p>
          </div>
          <div>
            <h2 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
              The right technology should feel simple.
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
              Ketronics brings products, technical expertise and after-sales support into one experience. Whether you need a new laptop or a complete technology setup, we help you make the right choice.
            </p>
            <Link href="/about-us" className="mt-8 inline-flex items-center text-sm font-semibold hover:gap-3 transition-all">
              Discover Ketronics <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">02 — Featured</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Good technology, chosen well.</h2>
          </div>
          <Link href="/products" className="inline-flex items-center text-sm font-medium text-black/55 transition-colors hover:text-black">
            Browse the full store <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[4/5] animate-pulse rounded-[1.5rem] bg-black/[0.05]" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const price = product.discount && product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : product.price;
              return (
                <Link
                  key={product.id}
                  href={"/products/" + product.id}
                  className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f1f1ee]">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-black/25">Ketronics</div>
                    )}
                    {product.discount && product.discount > 0 && (
                      <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-black/35">{product.brand || product.category?.name || "Technology"}</p>
                    <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-semibold leading-6 tracking-tight">{product.name}</h3>
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">KSh {price.toLocaleString("en-KE", { maximumFractionDigits: 0 })}</p>
                        {product.discount && product.discount > 0 && (
                          <p className="text-xs text-black/35 line-through">KSh {product.price.toLocaleString("en-KE", { maximumFractionDigits: 0 })}</p>
                        )}
                      </div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:translate-x-1">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-black/15 px-6 py-12 text-center">
            <p className="text-sm text-black/45">New products are being added to the store.</p>
            <Link href="/products" className="mt-4 inline-flex items-center text-sm font-semibold">
              Explore the store <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-[#111316] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">02 — Shop</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Technology for every setup.</h2>
            </div>
            <Link href="/products" className="inline-flex items-center text-sm text-white/60 hover:text-white">
              View all products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.title}
                  href={category.href}
                  className="group relative min-h-[300px] overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-7 transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.07] sm:p-9"
                >
                  <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/[0.025] transition-transform duration-700 group-hover:scale-150" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                        <Icon className="h-5 w-5 text-white/80" />
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/30">0{index + 1}</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/35">{category.tag}</span>
                      <h3 className="mt-2 text-3xl font-medium tracking-[-0.035em]">{category.title}</h3>
                      <p className="mt-2 text-sm text-white/45">{category.description}</p>
                      <span className="mt-6 inline-flex items-center text-sm font-medium text-white/65 group-hover:text-white">
                        Shop category <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">04 — Services</p>
            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl">
              More than a store.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-black/50">
              From installation to troubleshooting, our technical services help you get more from the technology you buy.
            </p>
            <Link href="/contact" className="mt-8 inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-medium text-white hover:bg-black/85">
              Request a service <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-black/10 border-y border-black/10">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="group grid gap-4 py-7 sm:grid-cols-[70px_1fr_auto] sm:items-center">
                  <span className="text-xs text-black/30">0{index + 1}</span>
                  <div className="flex items-start gap-4">
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-black/50" />
                    <div>
                      <h3 className="text-xl font-medium tracking-tight">{service.title}</h3>
                      <p className="mt-1 max-w-lg text-sm leading-6 text-black/45">{service.text}</p>
                    </div>
                  </div>
                  <ArrowRight className="hidden h-4 w-4 text-black/25 transition-transform group-hover:translate-x-1 sm:block" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-5 sm:px-8 lg:px-12 lg:pb-8">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#e8e8e3] px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/70 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">05 — Start here</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1] tracking-[-0.055em] sm:text-6xl">
              Ready to upgrade your technology?
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-black/50">
              Browse the store, tell us what you need, or speak with the Ketronics team.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white hover:bg-black/85">
                Shop now <ShoppingBag className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 px-6 text-sm font-semibold hover:bg-white/60">
                Contact Ketronics
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
