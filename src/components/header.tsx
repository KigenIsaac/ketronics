"use client";

import { useUserStore } from "@/lib/stores/userStore";
import { useCartStore } from "@/lib/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Settings, ShoppingCart, Menu, X, Search, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMobileSidebar } from "@/components/providers";
import Image from "next/image";
import { isStaffRole } from "@/lib/roles";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Laptops", href: "/products?category=laptops" },
  { label: "Phones & Tablets", href: "/products?category=phones" },
  { label: "TVs & Displays", href: "/products?category=tvs" },
  { label: "PCs & Components", href: "/products?category=pcs" },
  { label: "Printers", href: "/products?category=printers" },
  { label: "Accessories", href: "/products?category=accessories" },
];

export function Header() {
  const { user, logout } = useUserStore();
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();
  const { isOpen: isMobileMenuOpen, setIsOpen: setIsMobileMenuOpen } = useMobileSidebar();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [query, setQuery] = useState("");

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) window.location.href = "/products?search=" + encodeURIComponent(trimmed);
    else window.location.href = "/products";
  };

  if (isHome) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white text-[#171717] shadow-[0_1px_0_rgba(0,0,0,.08)]">
        <div className="border-b bg-[#fafafa] text-[10px] text-black/55">
          <div className="mx-auto flex h-7 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <span>Ketronics LTD · Technology for work, home & business</span>
            <span className="hidden sm:block">Kenya · Secure checkout · M-Pesa available</span>
          </div>
        </div>
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/ketronics-logo.png" alt="Ketronics LTD" width={38} height={38} className="rounded-lg" priority />
            <span className="hidden text-lg font800 tracking-[-0.04em] sm:block">Ketronics</span>
          </Link>

          <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:block">
            <div className="flex h-11 items-center rounded-full border border-black/10 bg-[#f5f5f3] px-4 transition-colors focus-within:border-black/25 focus-within:bg-white">
              <Search className="mr-3 h-4 w-4 shrink-0 text-black/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands and categories"
                className="w-full bg-transparent text-sm outline-none placeholder:text-black/35"
                aria-label="Search products"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/products" className="hidden px-3 py-2 text-xs font-semibold md:block">Shop</Link>
            <Link href="/contact" className="hidden px-3 py-2 text-xs font-semibold lg:block">Services</Link>
            <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5" aria-label="Shopping cart">
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartItemCount > 0 && <Badge className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]">{cartItemCount}</Badge>}
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden h-10 gap-1 rounded-full px-3 sm:flex">
                    <User className="h-4 w-4" /> <span className="max-w-24 truncate">{user.full_name || user.email}</span><ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isStaffRole(user.role) && <DropdownMenuItem asChild><a href="/admin"><Settings className="mr-2 h-4 w-4" />Admin Panel</a></DropdownMenuItem>}
                  <DropdownMenuItem asChild><a href="/dashboard"><User className="mr-2 h-4 w-4" />Dashboard</a></DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login" className="hidden rounded-full border border-black/10 px-4 py-2 text-xs font-semibold sm:block">Login</Link>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="h-10 w-10 rounded-full p-0 lg:hidden" aria-label="Open menu">
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="hidden border-t border-black/[0.06] lg:block">
          <nav className="mx-auto flex h-11 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/products" className="flex items-center gap-1 text-xs font-bold">Shop by Category <ChevronDown className="h-3 w-3" /></Link>
            {navItems.map((item) => <Link key={item.label} href={item.href} className="text-xs font-medium text-black/60 transition-colors hover:text-black">{item.label}</Link>)}
            <Link href="/contact" className="text-xs font-bold text-orange-600">Need help? Talk to us</Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="h-9 w-9 p-0" aria-label="Open navigation menu">
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        <Link href="/" className="flex items-center space-x-2"><Image src="/ketronics-logo.png" alt="Ketronics LTD Logo" width={32} height={32} className="rounded" priority /><span className="hidden text-lg font-bold sm:inline">Ketronics LTD</span></Link>
        <nav className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild className="relative"><Link href="/cart" aria-label="Shopping cart"><ShoppingCart className="h-4 w-4" />{cartItemCount > 0 && <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs">{cartItemCount}</Badge>}</Link></Button>
          {user ? (
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><User className="mr-2 h-4 w-4" />{user.full_name || user.email}</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{isStaffRole(user.role) && <DropdownMenuItem asChild><a href="/admin"><Settings className="mr-2 h-4 w-4" />Admin Panel</a></DropdownMenuItem>}<DropdownMenuItem asChild><a href="/dashboard"><User className="mr-2 h-4 w-4" />Dashboard</a></DropdownMenuItem><DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          ) : <div className="flex gap-2"><Button variant="ghost" size="sm" asChild><Link href="/auth/login">Login</Link></Button><Button size="sm" asChild><Link href="/auth/signup">Sign Up</Link></Button></div>}
        </nav>
      </div>
    </header>
  );
}
