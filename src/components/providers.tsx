"use client";

import { ThemeProvider } from "next-themes";
import { useUserStore } from "@/lib/stores/userStore";
import { Toaster } from "sonner";
import React, { createContext, useContext, useState } from "react";
import { ClientThemeSwitcher } from "@/components/client-theme-switcher";
import { Sidebar } from "@/components/sidebar";

// Mobile sidebar context
const MobileSidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}

function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      {/* Mobile Sidebar - rendered at root level for proper overlay */}
      <Sidebar
        className="lg:hidden"
        isOpen={isOpen}
        onToggle={setIsOpen}
      />
    </MobileSidebarContext.Provider>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore((state) => state.fetchUser);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <MobileSidebarProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
            visibleToasts={5}
          />
          <ClientThemeSwitcher />
        </MobileSidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}