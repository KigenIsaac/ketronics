"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ThemeSwitcher = dynamic(
  () => import("@/components/theme-switcher").then((mod) => mod.ThemeSwitcher),
  { ssr: false },
);

export function ClientThemeSwitcher() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <ThemeSwitcher />;
}
