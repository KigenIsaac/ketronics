"use client";

import dynamic from "next/dynamic";

const ThemeSwitcher = dynamic(
  () => import("@/components/theme-switcher").then((mod) => mod.ThemeSwitcher),
  { ssr: false },
);

export function ClientThemeSwitcher() {
  return <ThemeSwitcher />;
}
