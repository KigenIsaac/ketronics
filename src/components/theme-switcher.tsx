"use client";

import { useTheme } from "next-themes";
import { useState, useSyncExternalStore, useEffect } from "react";
import { Sun, Moon, Monitor, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";


const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

function subscribeAccentColor(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAccentColorSnapshot() {
  return localStorage.getItem("accentColor") || "#191970";
}

function getAccentColorServerSnapshot() {
  return "#191970";
}

const colors = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Midnight Blue", value: "#191970" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getMountedServerSnapshot);
  const accentColor = useSyncExternalStore(subscribeAccentColor, getAccentColorSnapshot, getAccentColorServerSnapshot);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (mounted) {
      document.documentElement.style.setProperty("--primary", accentColor);
    }
  }, [accentColor, mounted]);

  const handleColorChange = (color: string) => {
    localStorage.setItem("accentColor", color);
    window.dispatchEvent(new Event("storage"));
  };

  if (!mounted) return null;

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setExpanded(true)}
      >
        <Palette className="h-4 w-4" />
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
        <div className="flex items-center space-x-2 mb-2">
          <Palette className="h-4 w-4" />
          <span className="text-sm font-medium">Accent Color</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              className={`w-8 h-8 rounded border-2 ${
                accentColor === color.value ? "border-foreground" : "border-muted"
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => handleColorChange(color.value)}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}