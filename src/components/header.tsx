"use client";
import { useUserStore } from "@/lib/stores/userStore";
import { useCartStore } from "@/lib/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Settings, ShoppingCart, Menu, X, Search, ChevronDown, ShieldCheck } from "lucide-react";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMobileSidebar } from "@/components/providers";
import Image from "next/image";
import { isStaffRole } from "@/lib/roles";
import { usePathname,useRouter } from "next/navigation";
import { useState } from "react";

const navItems=[["Laptops","laptops"],["Phones & Tablets","phones"],["TVs & Displays","tvs"],["PCs & Components","pcs"],["Printers","printers"],["Accessories","accessories"]];
export function Header(){
 const{user,logout}=useUserStore();const count=useCartStore(s=>s.getItemCount());const{isOpen,setIsOpen}=useMobileSidebar();const pathname=usePathname();const router=useRouter();const[query,setQuery]=useState("");
 const submit=(e:React.FormEvent)=>{e.preventDefault();router.push(query.trim()?"/products?search="+encodeURIComponent(query.trim()):"/products")};
 const admin=pathname.startsWith("/admin");
 return <header className="sticky top-0 z-40 w-full border-b border-black/[.07] bg-[#fdfcf9]/95 text-[#171717] backdrop-blur-xl">
   <div className="border-b border-black/[.05] bg-[#f4f3ef]"><div className="mx-auto flex h-7 max-w-[1400px] items-center justify-between px-4 text-[10px] text-black/50 sm:px-6 lg:px-8"><span>Ketronics LTD · Technology for work, home & business</span><span className="hidden sm:block">Kenya · Secure checkout · M-Pesa available</span></div></div>
   <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:gap-7 lg:px-8">
     <Link href="/" className="flex shrink-0 items-center gap-2"><Image src="/ketronics-logo.png" alt="Ketronics LTD" width={42} height={42} priority/><span className="hidden text-lg font-black tracking-[-.045em] sm:block">Ketronics</span></Link>
     <form onSubmit={submit} className="hidden min-w-0 flex-1 md:block"><div className="flex h-11 items-center rounded-full border border-black/[.08] bg-[#f2f1ed] px-4 focus-within:border-black/20 focus-within:bg-white"><Search className="mr-3 h-4 w-4 text-black/35"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands and categories" className="w-full bg-transparent text-sm outline-none placeholder:text-black/35" aria-label="Search products"/></div></form>
     {admin&&<span className="hidden rounded-full bg-[#10152b] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-white lg:block">Admin</span>}
     <div className="ml-auto flex items-center gap-1"><Link href="/products" className="hidden rounded-full px-3 py-2 text-xs font-semibold hover:bg-black/5 md:block">Shop</Link><Link href="/contact" className="hidden rounded-full px-3 py-2 text-xs font-semibold hover:bg-black/5 lg:block">Services</Link><Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5" aria-label="Shopping cart"><ShoppingCart className="h-[18px] w-[18px]"/>{count>0&&<Badge className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px]">{count}</Badge>}</Link>
     {user?<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="hidden h-10 max-w-44 gap-1 rounded-full px-3 sm:flex"><User className="h-4 w-4"/><span className="truncate">{user.full_name||user.email}</span><ChevronDown className="h-3 w-3"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52">{isStaffRole(user.role)&&<DropdownMenuItem asChild><Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4"/>Admin panel</Link></DropdownMenuItem>}<DropdownMenuItem asChild><Link href="/dashboard"><User className="mr-2 h-4 w-4"/>My account</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4"/>Settings</Link></DropdownMenuItem><DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4"/>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>:<Link href="/auth/login" className="hidden rounded-full border border-black/10 px-4 py-2 text-xs font-bold sm:block">Sign in</Link>}
     <Button variant="ghost" size="sm" onClick={()=>setIsOpen(!isOpen)} className="h-10 w-10 rounded-full p-0 hover:bg-black/5 lg:hidden" aria-label={isOpen?"Close menu":"Open menu"} aria-expanded={isOpen}>{isOpen?<X className="h-5 w-5"/>:<Menu className="h-5 w-5"/>}</Button></div>
   </div>
   <div className="border-t border-black/[.05] px-4 py-3 md:hidden">
     <form onSubmit={submit} className="mx-auto max-w-[1400px]">
       <div className="flex h-11 items-center rounded-full border border-black/[.08] bg-[#f2f1ed] px-4 focus-within:border-orange-400 focus-within:bg-white">
         <Search className="mr-3 h-4 w-4 shrink-0 text-black/35"/>
         <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands and categories" className="w-full bg-transparent text-sm outline-none placeholder:text-black/35" aria-label="Search products"/>
       </div>
     </form>
   </div>
   {isOpen&&!admin&&<div className="border-t border-black/[.06] bg-white px-4 py-4 shadow-lg md:hidden">
     <nav className="grid grid-cols-2 gap-2">
       <Link href="/products" onClick={()=>setIsOpen(false)} className="rounded-xl bg-[#f5f4f0] px-3 py-3 text-sm font-bold">All products</Link>
       {navItems.map(([label,value])=><Link key={value} href={"/products?category="+value} onClick={()=>setIsOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-black/70 hover:bg-[#f5f4f0]">{label}</Link>)}
       <Link href="/contact" onClick={()=>setIsOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50">Contact & services</Link>
       {user?<><Link href="/dashboard" onClick={()=>setIsOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[#f5f4f0]">My account</Link><button type="button" onClick={()=>{setIsOpen(false);void logout();}} className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-black/65 hover:bg-[#f5f4f0]">Sign out</button></>:<Link href="/auth/login" onClick={()=>setIsOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[#f5f4f0]">Sign in / Register</Link>}
     </nav>
   </div>}
   <div className="hidden border-t border-black/[.05] lg:block"><nav className="mx-auto flex h-11 max-w-[1400px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8"><Link href="/products" className="text-xs font-bold">Shop by category</Link>{navItems.map(([label,value])=><Link key={value} href={"/products?category="+value} className="text-xs font-medium text-black/55 hover:text-black">{label}</Link>)}<Link href="/contact" className="text-xs font-bold text-orange-600">Need help? Talk to us</Link></nav></div>
 </header>;
}