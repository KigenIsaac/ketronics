'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname,useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, UserRound, ArrowUpRight, LogOut, Settings, LayoutDashboard, Phone, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cartStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useMobileSidebar } from '@/components/providers';
import { isStaffRole } from '@/lib/roles';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription,SheetTrigger,SheetClose } from '@/components/ui/sheet';

const links=[['Store','/products'],['Services','/services'],['About us','/about-us'],['Support','/support']];
const categories=[['Laptops','laptops'],['Phones & tablets','phones'],['TVs & displays','tvs'],['PCs & components','pcs'],['Printers','printers'],['Accessories','accessories']];
export function Header(){
 const pathname=usePathname();const router=useRouter();const {user,logout}=useUserStore();const count=useCartStore(s=>s.getItemCount());const [query,setQuery]=useState('');const [searchOpen,setSearchOpen]=useState(false);const {isOpen,setIsOpen}=useMobileSidebar();
 const workspace=pathname.startsWith('/admin');const checkout=pathname==='/checkout';
 const search=(event:React.FormEvent)=>{event.preventDefault();router.push(query.trim()?`/products?search=${encodeURIComponent(query.trim())}`:'/products');setSearchOpen(false);};
 return <header className="site-header">
  {!workspace&&!checkout&&<div className="utility-bar"><div className="site-container flex items-center justify-between gap-4"><span>Technology. Advice. Local expertise.</span><a href="tel:+254728097922" className="flex items-center gap-2"><Phone size={12}/><span>0728 097 922</span><span className="hidden sm:inline">· Eldoret, Kenya</span></a></div></div>}
  <div className="site-container header-main">
   {workspace&&<button className="icon-button lg:hidden" onClick={()=>setIsOpen(!isOpen)} aria-label="Toggle workspace menu" aria-expanded={isOpen}>{isOpen?<X size={20}/>:<Menu size={20}/>}</button>}
   <Link href="/" className="brand-lockup"><Image src="/ketronics-logo.png" alt="" width={38} height={38} priority/><span>ketronics<span className="brand-subtitle">SOLUTIONS LTD</span></span></Link>
   {workspace?<span className="workspace-label">Workspace</span>:checkout?<span className="ml-auto text-sm text-muted-foreground">Order checkout</span>:<nav aria-label="Main navigation" className="desktop-navigation">{links.map(([label,href])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined}>{label}</Link>)}</nav>}
   <div className="header-actions">
    {!workspace&&!checkout&&<button className="icon-button" aria-label="Search products" aria-expanded={searchOpen} aria-controls="header-search" onClick={()=>setSearchOpen(!searchOpen)}>{searchOpen?<X size={19}/>:<Search size={19}/>}</button>}
    <ThemeSwitcher/>
    {!workspace&&<Link href="/cart" className="icon-button cart-link" aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={19}/>{count>0&&<span className="cart-count">{count>99?'99+':count}</span>}</Link>}
    <DropdownMenu><DropdownMenuTrigger asChild><button className="icon-button" aria-label="Account menu"><UserRound size={19}/></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56">{user?<><div className="truncate border-b border-border px-2 py-3 text-sm font-semibold">{user.full_name||user.email}</div>{isStaffRole(user.role)&&<DropdownMenuItem asChild><Link href="/admin"><LayoutDashboard size={16}/>Workspace</Link></DropdownMenuItem>}<DropdownMenuItem asChild><Link href="/dashboard"><UserRound size={16}/>My account</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/settings"><Settings size={16}/>Preferences</Link></DropdownMenuItem><DropdownMenuItem onClick={()=>void logout()}><LogOut size={16}/>Sign out</DropdownMenuItem></>:<><DropdownMenuItem asChild><Link href="/auth/login">Sign in</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/auth/signup">Create an account</Link></DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>
    {!workspace&&!checkout&&<><Link href="/contact" className="header-contact">Let’s talk <ArrowUpRight size={15}/></Link><Sheet><SheetTrigger asChild><button className="icon-button lg:hidden" aria-label="Open navigation"><Menu size={21}/></button></SheetTrigger><SheetContent side="right" className="w-[min(360px,90vw)] overflow-y-auto p-6"><SheetHeader className="px-0"><SheetTitle>Explore Ketronics</SheetTitle><SheetDescription>Products, services and support.</SheetDescription></SheetHeader><nav className="mobile-navigation" aria-label="Mobile navigation">{[['Home','/'],...links,['Contact','/contact']].map(([label,href])=><SheetClose asChild key={href}><Link href={href} aria-current={pathname===href?'page':undefined}>{label}<ArrowUpRight size={16}/></Link></SheetClose>)}</nav><p className="eyebrow mt-8 mb-3">SHOP BY CATEGORY</p><div className="flex flex-col">{categories.map(([label,value])=><SheetClose asChild key={value}><Link href={`/products?category=${value}`} className="py-3 text-sm text-muted-foreground">{label}</Link></SheetClose>)}</div><a href="tel:+254728097922" className="mt-7 flex items-center gap-3 border-t border-border pt-6 text-sm"><Phone size={16}/>0728 097 922</a></SheetContent></Sheet></>}
   </div>
  </div>
  {searchOpen&&!workspace&&<form id="header-search" onSubmit={search} className="header-search site-container"><Search size={20}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search products" placeholder="Search laptops, printers, brands and more…"/><button type="submit" className="text-link">Search <ArrowUpRight size={16}/></button></form>}
  {!workspace&&!checkout&&<div className="category-navigation"><nav className="site-container" aria-label="Product categories"><Link href="/products" className="font-semibold">All products <ChevronDown size={13}/></Link>{categories.map(([label,value])=><Link key={value} href={`/products?category=${value}`}>{label}</Link>)}</nav></div>}
 </header>;
}
