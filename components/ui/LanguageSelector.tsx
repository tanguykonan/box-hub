"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

export type Language = "fr" | "en";

interface LanguageOption {
  code: Language;
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>("fr");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/fr\/(\w+)/);
    if (match && (match[1] === "en" || match[1] === "fr")) {
      setCurrentLang(match[1] as Language);
      localStorage.setItem("boxhub_lang", match[1]);
    } else {
      const saved = localStorage.getItem("boxhub_lang") as Language | null;
      if (saved === "fr" || saved === "en") {
        setCurrentLang(saved);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setCurrentLang(code);
    localStorage.setItem("boxhub_lang", code);
    setIsOpen(false);

    if (code === "en") {
      document.cookie = `googtrans=/fr/en; path=/;`;
      document.cookie = `googtrans=/fr/en; path=/; domain=.${window.location.hostname};`;
      
      const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (selectElem) {
        selectElem.value = "en";
        selectElem.dispatchEvent(new Event("change"));
      } else {
        window.location.reload();
      }
    } else {
      // Pour le Français : on désactive complètement le traducteur pour afficher le texte original intact
      const domains = [
        window.location.hostname,
        `.${window.location.hostname}`,
        window.location.hostname.replace(/^[^.]+\./, "."),
        ""
      ];
      const paths = ["/", "/catalog", "/cli", "/docs", "/mobile", "/dashboard", "/admin"];

      for (const d of domains) {
        for (const p of paths) {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p};${d ? ` domain=${d};` : ""}`;
        }
      }

      window.location.reload();
    }
  };

  const currentLabel =
    LANGUAGES.find((lang) => lang.code === currentLang)?.label || "Français";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer shadow-xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
        <span>{currentLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Flyout Menu (opens upwards since it is in the footer) */}
      {isOpen && (
        <div className="absolute bottom-full right-0 sm:right-auto sm:left-0 mb-2 w-36 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-orange-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
