"use client";
import { isStaffRole } from "@/lib/roles";
import { useUserStore } from "@/lib/stores/userStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard,Package,ShoppingCart,Users,BarChart3,Tag,Settings,X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMobileSidebar } from "@/components/providers";

export function Sidebar({className}:{className?:string}){
 const{user}=useUserStore();const pathname=usePathname();const{isOpen,setIsOpen}=useMobileSidebar();if(!pathname.startsWith("/admin")||!isStaffRole(user?.role))return null;
 const items=[["Overview","/admin",LayoutDashboard],["Products","/admin/products",Package],["Categories","/admin/categories",Tag],["Orders","/admin/orders",ShoppingCart],["Users","/admin/users",Users],["Analytics","/admin/analytics",BarChart3],["Settings","/admin/settings",Settings]] as const;
 const nav=<nav className="space-y-1">{items.map(([label,href,Icon])=>{const active=pathname===href||pathname.startsWith(href+"/");return <Link key={href} href={href} onClick={()=>setIsOpen(false)} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold",active?"bg-orange-50 text-orange-700":"text-black/55 hover:bg-black/[.04] hover:text-black")}><Icon className="h-4 w-4"/>{label}</Link>})}</nav>;
 return <><div className={cn("hidden w-60 shrink-0 border-r border-black/[.06] bg-white lg:block",className)}><div className="sticky top-[107px] p-4"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-black/35">Workspace</p>{nav}</div></div>{isOpen&&<button type="button" aria-label="Close admin menu" className="fixed inset-0 z-40 cursor-default bg-black/40 lg:hidden" onClick={()=>setIsOpen(false)}/>}<aside className={cn("fixed inset-y-0 left-0 z-50 w-72 bg-white p-5 shadow-2xl transition-transform lg:hidden",isOpen?"translate-x-0":"-translate-x-full")}><div className="mb-8 flex items-center justify-between"><span className="font-black">Ketronics Admin</span><Button variant="ghost" size="sm" onClick={()=>setIsOpen(false)}><X/></Button></div><ScrollArea className="h-[calc(100vh-100px)]">{nav}</ScrollArea></aside></>;
}