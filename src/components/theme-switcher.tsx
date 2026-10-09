"use client";

import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { Sun, Moon, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";


const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getMountedServerSnapshot);
  const [expanded, setExpanded] = useState(false);

  if (!mounted) return null;

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setExpanded(true)}
      >
        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Theme</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-1 mb-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("system")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}