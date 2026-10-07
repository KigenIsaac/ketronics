"use client";

import { isStaffRole } from "@/lib/roles";
import { useState } from "react";
import { useUserStore } from "@/lib/stores/userStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Package, ShoppingCart, User, Settings, HelpCircle, FileText, Phone, Info, Shield, Users, BarChart3, Tag, Truck, MessageSquare, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationItem { label: string; url: string; icon: string; children?: NavigationItem[]; }
interface SidebarProps { className?: string; isOpen?: boolean; onToggle?: (isOpen: boolean) => void; }

export function Sidebar({ className, isOpen = false, onToggle }: SidebarProps) {
  const { user } = useUserStore();
  const pathname = usePathname();

  if (pathname === "/") return null;

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { label: "Home", url: "/", icon: "Home" }, { label: "Products", url: "/products", icon: "Package" },
      { label: "About Us", url: "/about-us", icon: "Info" }, { label: "Contact", url: "/contact", icon: "Phone" },
      { label: "Support", url: "/support", icon: "HelpCircle" }, { label: "FAQ", url: "/faq", icon: "MessageSquare" },
    ];
    if (!user) return baseItems;
    const customerItems: NavigationItem[] = [
      { label: "Cart", url: "/cart", icon: "ShoppingCart" }, { label: "Orders", url: "/orders", icon: "ShoppingBag" },
      { label: "Profile", url: "/profile", icon: "User" }, { label: "Settings", url: "/settings", icon: "Settings" },
    ];
    if (isStaffRole(user.role)) return [
      { label: "Dashboard", url: "/admin", icon: "User" }, { label: "Categories", url: "/admin/categories", icon: "Tag" },
      { label: "Products", url: "/admin/products", icon: "Package" }, { label: "Orders", url: "/admin/orders", icon: "ShoppingCart" },
    ];
    return [...baseItems, ...customerItems];
  };

  const getIcon = (iconName: string) => {
    const iconMap = { Home, Package, ShoppingCart, ShoppingBag, User, Settings, HelpCircle, FileText, Phone, Info, Shield, Users, BarChart3, Tag, Truck, MessageSquare };
    return iconMap[iconName as keyof typeof iconMap] || Home;
  };
  const navigationItems = getNavigationItems();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const NavigationItemComponent = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = !!item.children?.length;
    const Icon = getIcon(item.icon);
    const active = isActive(item.url);
    return (
      <div>
        <Button variant={active ? "secondary" : "ghost"} className={cn("h-10 w-full justify-start px-3", level > 0 && "ml-4 w-[calc(100%-1rem)]", active && "bg-secondary font-medium")} onClick={() => hasChildren ? setIsExpanded(!isExpanded) : onToggle?.(false)} asChild={!hasChildren}>
          {hasChildren ? <div className="flex w-full items-center"><Icon className="mr-3 h-4 w-4" /><span className="flex-1 truncate">{item.label}</span><span className="ml-auto">{isExpanded ? "▼" : "▶"}</span></div> : <Link href={item.url} className="flex items-center"><Icon className="mr-3 h-4 w-4" /><span className="truncate">{item.label}</span></Link>}
        </Button>
        {hasChildren && isExpanded && <div className="ml-4">{item.children?.map((child) => <NavigationItemComponent key={child.url} item={child} level={level + 1} />)}</div>}
      </div>
    );
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-35 bg-black/50 lg:hidden" onClick={() => onToggle?.(false)} />}
      <div className={cn("fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:bottom-0 lg:top-0 lg:h-auto lg:translate-x-0 lg:shadow-none", isOpen ? "translate-x-0" : "-translate-x-full", className)}>
        <div className="flex h-full w-46 flex-col">
          <ScrollArea className="flex-1 px-3 py-4"><nav className="space-y-1">{navigationItems.map((item) => <NavigationItemComponent key={item.url} item={item} />)}</nav></ScrollArea>
          <div className="border-t p-4"><div className="text-center text-xs text-muted-foreground">Built by Isaac Kigen | <a href="tel:+254721142723" className="underline">+254 721 142 723</a></div></div>
        </div>
      </div>
    </>
  );
}
