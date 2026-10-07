"use client";

import { useUserStore } from "@/lib/stores/userStore";
import { useCartStore } from "@/lib/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Settings, ShoppingCart, Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMobileSidebar } from "@/components/providers";
import Image from "next/image";
import { isStaffRole } from "@/lib/roles";
import { usePathname } from "next/navigation";

export function Header() {
  const { user, logout } = useUserStore();
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();
  const { isOpen: isMobileMenuOpen, setIsOpen: setIsMobileMenuOpen } = useMobileSidebar();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={isHome ? "sticky top-0 z-30 w-full border-b border-white/10 bg-[#080a0d] text-white" : "sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"}>
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 lg:hidden">
          {!isHome && (
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="h-9 w-9 p-0" aria-label="Open navigation menu">
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="flex-1 lg:flex-none">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <Image src="/ketronics-logo.png" alt="Ketronics LTD Logo" width={32} height={32} className="rounded" priority />
            <span className="hidden text-lg font-bold sm:inline">Ketronics LTD</span>
          </Link>
        </div>
        <nav className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild className={isHome ? "relative text-white hover:bg-white/10 hover:text-white" : "relative"}>
            <Link href="/cart" aria-label={cartItemCount ? "Shopping cart, items in cart" : "Shopping cart"}>
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs">{cartItemCount}</Badge>}
            </Link>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={isHome ? "text-white hover:bg-white/10 hover:text-white" : ""}>
                  <User className="mr-2 h-4 w-4" />{user.full_name || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isStaffRole(user.role) && <DropdownMenuItem asChild><a href="/admin"><Settings className="mr-2 h-4 w-4" />Admin Panel</a></DropdownMenuItem>}
                <DropdownMenuItem asChild><a href="/dashboard"><User className="mr-2 h-4 w-4" />Dashboard</a></DropdownMenuItem>
                <DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" asChild className={isHome ? "text-white hover:bg-white/10 hover:text-white" : ""}><a href="/auth/login">Login</a></Button>
              <Button size="sm" asChild className={isHome ? "bg-white text-black hover:bg-white/90" : ""}><a href="/auth/signup">Sign Up</a></Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
