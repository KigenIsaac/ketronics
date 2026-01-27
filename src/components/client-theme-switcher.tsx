"use client";

import dynamic from "next/dynamic";

export function ClientThemeSwitcher() {
  const ThemeSwitcher = dynamic(() => import("@/components/theme-switcher").then(mod => mod.ThemeSwitcher), {
    ssr: false,
  });

  return <ThemeSwitcher />;
}