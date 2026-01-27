"use client";

import { ThemeProvider } from "next-themes";
import { useUserStore } from "@/lib/stores/userStore";
import { Toaster } from "sonner";
import React from "react";
import { ClientThemeSwitcher } from "@/components/client-theme-switcher";

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
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          visibleToasts={5}
        />
        <ClientThemeSwitcher />
      </AuthProvider>
    </ThemeProvider>
  );
}