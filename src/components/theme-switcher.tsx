"use client";

import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { Sun, Moon, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";


const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getMountedServerSnapshot);
  const [expanded, setExpanded] = useState(false);

  if (!mounted) return null;

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[60] shadow-md"
        onClick={() => setExpanded(true)}
        aria-label="Open theme settings"
        title="Theme settings"
      >
        {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[60] flex flex-col items-end space-y-2">
      <div className="min-w-[176px] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl backdrop-blur-md">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Theme</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(false)}
            aria-label="Close theme settings"
            title="Close theme settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-1 mb-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            aria-label="Use light theme"
            title="Light theme"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            aria-label="Use dark theme"
            title="Dark theme"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="sm"
            aria-label="Use system theme"
            title="System theme"
            onClick={() => setTheme("system")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}