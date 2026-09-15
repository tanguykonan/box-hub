"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-8 items-center rounded-lg border border-black/10 dark:border-white/15 bg-zinc-100/60 dark:bg-zinc-900/60 p-0.5 w-[62px]">
        <div className="h-6 w-6 rounded-md bg-transparent" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      role="radiogroup"
      aria-label="Sélecteur de thème"
      className="relative flex items-center rounded-lg border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 p-0.5 backdrop-blur-md shadow-sm"
    >
      {/* Light Mode Switch */}
      <button
        type="button"
        onClick={() => {
          if (isDark) toggleTheme();
        }}
        className={`relative flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all duration-200 cursor-pointer ${
          !isDark
            ? "bg-white text-zinc-950 shadow-sm border border-black/10 font-semibold scale-100"
            : "text-zinc-400 hover:text-zinc-700 hover:scale-105 active:scale-95"
        }`}
        title="Activer le thème clair"
        aria-checked={!isDark}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      {/* Dark Mode Switch */}
      <button
        type="button"
        onClick={() => {
          if (!isDark) toggleTheme();
        }}
        className={`relative flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all duration-200 cursor-pointer ${
          isDark
            ? "bg-black text-orange-400 shadow-sm border border-white/20 font-semibold scale-100"
            : "text-zinc-400 hover:text-zinc-200 hover:scale-105 active:scale-95"
        }`}
        title="Activer le thème sombre"
        aria-checked={isDark}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
