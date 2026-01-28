"use client";

import { useState } from "react";
import { useUserStore } from "@/lib/stores/userStore";
import { useCartStore } from "@/lib/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Settings, ShoppingCart, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { useMobileSidebar } from "@/components/providers";

export function Header() {
  const { user, logout } = useUserStore();
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();
  const { isOpen: isMobileMenuOpen, setIsOpen: setIsMobileMenuOpen } = useMobileSidebar();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="container mx-auto px-4 flex h-14 items-center">
        {/* Mobile menu toggle on the left */}
        <div className="lg:hidden mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="h-9 w-9 p-0"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Logo/Brand in the center on mobile, left on desktop */}
        <div className="flex-1 lg:flex-none">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Ketronics LTD</span>
          </Link>
        </div>

        {/* Desktop navigation and user menu on the right */}
        <nav className="flex items-center space-x-2 ml-auto">
          <Button variant="ghost" size="sm" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.full_name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.role === 'manager' && (
                    <DropdownMenuItem asChild>
                      <a href="/admin">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <a href="/dashboard">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/auth/login">Login</a>
                </Button>
                <Button size="sm" asChild>
                  <a href="/auth/signup">Sign Up</a>
                </Button>
              </div>
            )}
          </nav>
      </div>
    </header>
  );
}