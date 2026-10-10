"use client";

import dynamic from "next/dynamic";

const ThemeSwitcher = dynamic(
  () => import("@/components/theme-switcher").then((mod) => mod.ThemeSwitcher),
  { ssr: false },
);

export function ClientThemeSwitcher() {
  // Keep the floating theme control available on every route, including the homepage.
  return <ThemeSwitcher />;
}
