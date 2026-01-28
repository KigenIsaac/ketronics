"use client";

import { useState } from "react";
import { useUserStore } from "@/lib/stores/userStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Package,
  ShoppingCart,
  User,
  Settings,
  HelpCircle,
  FileText,
  Phone,
  Info,
  Shield,
  Users,
  BarChart3,
  Tag,
  Truck,
  MessageSquare,
  ShoppingBag,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  url: string;
  icon: string;
  children?: NavigationItem[];
}

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function Sidebar({ className, isOpen = false, onToggle }: SidebarProps) {
  const { user } = useUserStore();
  const pathname = usePathname();

  // Define navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { label: "Home", url: "/", icon: "Home" },
      { label: "Products", url: "/products", icon: "Package" },
      { label: "About Us", url: "/about-us", icon: "Info" },
      { label: "Contact", url: "/contact", icon: "Phone" },
      { label: "Support", url: "/support", icon: "HelpCircle" },
      { label: "FAQ", url: "/faq", icon: "MessageSquare" },
    ];

    if (user) {
      // Customer navigation
      const customerItems: NavigationItem[] = [
        { label: "Cart", url: "/cart", icon: "ShoppingCart" },
        { label: "Orders", url: "/orders", icon: "ShoppingBag" },
        { label: "Profile", url: "/profile", icon: "User" },
        { label: "Settings", url: "/settings", icon: "Settings" },
      ];

      if (user.role === 'manager') {
        // Manager/Admin navigation - only show admin-specific items
        const adminItems: NavigationItem[] = [
          { label: "Dashboard", url: "/admin", icon: "User" },
          { label: "Categories", url: "/admin/categories", icon: "Tag" },
          { label: "Products", url: "/admin/products", icon: "Package" },
          { label: "Orders", url: "/admin/orders", icon: "ShoppingCart" },
        ];
        return adminItems;
      }

      return [...baseItems, ...customerItems];
    }

    // Guest navigation (no authenticated items)
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getIcon = (iconName: string) => {
    const iconMap = {
      Home,
      Package,
      ShoppingCart,
      ShoppingBag,
      User,
      Settings,
      HelpCircle,
      FileText,
      Phone,
      Info,
      Shield,
      Users,
      BarChart3,
      Tag,
      Truck,
      MessageSquare,
    };
    return iconMap[iconName as keyof typeof iconMap] || Home;
  };

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + '/');
  };

  const NavigationItemComponent = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = getIcon(item.icon);
    const active = isActive(item.url);

    return (
      <div>
        <Button
          variant={active ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-10 px-3",
            level > 0 && "ml-4 w-[calc(100%-1rem)]",
            active && "bg-secondary font-medium"
          )}
          onClick={() => {
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            } else {
              onToggle?.(false); // Close mobile sidebar
            }
          }}
          asChild={!hasChildren}
        >
          {hasChildren ? (
            <div className="flex items-center w-full">
              <Icon className="h-4 w-4 mr-3" />
              <span className="truncate flex-1">{item.label}</span>
              {hasChildren && (
                <span className="ml-auto">
                  {isExpanded ? "▼" : "▶"}
                </span>
              )}
            </div>
          ) : (
            <Link href={item.url} className="flex items-center">
              <Icon className="h-4 w-4 mr-3" />
              <span className="truncate">{item.label}</span>
            </Link>
          )}
        </Button>

        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children?.map((child) => (
              <NavigationItemComponent key={child.url} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay - render first so it appears behind sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-35 lg:hidden"
          onClick={() => onToggle?.(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:top-0 lg:bottom-0 lg:h-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full w-46">
          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <NavigationItemComponent key={item.url} item={item} />
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground text-center">
              Built by Isaac Kigen | <a href="tel:+254721142723" className="underline">+254 721 142 723</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}