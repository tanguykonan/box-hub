"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Terminal,
  Smartphone,
  BookOpen,
  Star,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { GithubIcon } from "../ui/GithubIcon";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useSession } from "next-auth/react";
import { SITE_CONFIG } from "@/lib/site-config";
import logoImg from "../../public/logo.jpg";

export function Navbar() {
  const { data: session } = useSession();
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [githubStars, setGithubStars] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/github/stars")
      .then((r) => r.json())
      .then((data) => {
        if (data?.formatted) {
          setGithubStars(data.formatted);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const checkMaintenance = () => {
      setIsMaintenance(localStorage.getItem("boxhub_maintenance_mode") === "true");
    };
    checkMaintenance();
    window.addEventListener("storage", checkMaintenance);
    window.addEventListener("boxhub_maintenance_change", checkMaintenance);
    return () => {
      window.removeEventListener("storage", checkMaintenance);
      window.removeEventListener("boxhub_maintenance_change", checkMaintenance);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsResourcesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsResourcesOpen(false);
    }, 150);
  };

  const resourceItems = [
    {
      title: "Documentation",
      description: "Guide complet, fichier boxconfig.yml et commandes CLI.",
      href: "/docs",
      icon: BookOpen,
    },
    {
      title: "CLI Rust",
      description: "Moteur binaire natif, compilation bytecode et téléchargements.",
      href: "/cli",
      icon: Terminal,
    },
    {
      title: "Box Runner (Android)",
      description: "Exécution autonome de vos applications Box sur Android.",
      href: "/mobile",
      icon: Smartphone,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/8 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors duration-300">
      {isMaintenance && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center shadow-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            Mode Maintenance Actif : Les services de publication et de téléchargement sont restreints.
          </span>
          <Link
            href="/maintenance"
            className="underline font-bold hover:text-zinc-100 transition-colors inline-flex items-center gap-1"
          >
            <span>Voir l'état des services</span>
            <span>→</span>
          </Link>
        </div>
      )}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo et Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105">
              <Image
                src={logoImg}
                alt="Box Hub Logo"
                width={36}
                height={36}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              hub
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/catalog"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Catalogue
            </Link>

            {/* Modern "Ressources" Flyout Dropdown Menu */}
            <div
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative"
            >
              <button
                type="button"
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer py-2 ${
                  isResourcesOpen
                    ? "text-zinc-950 dark:text-white font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <span>Ressources</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isResourcesOpen ? "rotate-180 text-orange-500" : "text-zinc-400"
                  }`}
                />
              </button>

              {/* Flyout Menu Card */}
              {isResourcesOpen && (
                <div className="absolute top-full left-0 w-80 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1">
                  {resourceItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsResourcesOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 group-hover:border-orange-500/40 group-hover:text-orange-500 transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-sm font-semibold text-zinc-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Quick Search + GitHub + Se Connecter + S'inscrire + Theme Toggle + Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search Shortcut */}
          <button
            onClick={() => {
              const el = document.getElementById("hero-search-input");
              if (el) {
                el.focus();
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="hidden lg:flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/80 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 hover:border-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Rechercher...</span>
            <kbd className="rounded border border-black/10 dark:border-white/15 bg-white dark:bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
              Ctrl K
            </kbd>
          </button>

          {/* GitHub Repository (Hidden on mobile phones, visible on sm and up) */}
          <a
            href={SITE_CONFIG.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-black/30 dark:hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
            title="GitHub Repository"
          >
            <GithubIcon className="h-4 w-4" />
            <div className="flex items-center gap-1 border-l border-zinc-300 dark:border-zinc-700 pl-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{githubStars !== null ? githubStars : "0"}</span>
            </div>
          </a>

          {/* Authenticated / Guest Actions */}
          {session?.user ? (
            <div className="flex items-center gap-2">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-white hover:scale-105 active:scale-95 transition-all shadow-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span>Admin</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-3 py-1.5 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md overflow-hidden bg-orange-600 text-white text-[10px] font-bold">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.username || "Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    session.user.username ? session.user.username[0].toUpperCase() : "U"
                  )}
                </div>
                <span className="max-w-[100px] truncate">{session.user.username || "Console"}</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Direct Link to Login Page */}
              <Link
                href="/auth?mode=login"
                className="hidden sm:inline-flex items-center rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 hover:border-black/30 dark:hover:border-white/30 px-3.5 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Se connecter</span>
              </Link>

              {/* Direct Link to Register Page */}
              <Link
                href="/auth?mode=register"
                className="inline-flex items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>S'inscrire</span>
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-black/8 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-4 space-y-4">
          <Link
            href="/catalog"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
          >
            Catalogue
          </Link>

          <div className="border-t border-black/5 dark:border-white/5 pt-3 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Ressources
            </span>
            {resourceItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                >
                  <Icon className="h-4 w-4 text-orange-500" />
                  <span>{item.title}</span>
                </Link>
              );
            })}

            <a
              href={SITE_CONFIG.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
            >
              <div className="flex items-center gap-3">
                <GithubIcon className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                <span>Code Source GitHub</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{githubStars !== null ? githubStars : "0"}</span>
              </div>
            </a>
          </div>

          {/* Auth options in mobile drawer */}
          <div className="border-t border-black/5 dark:border-white/5 pt-4 flex flex-col gap-2">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold rounded-xl bg-orange-600 text-white"
                >
                  Espace Développeur ({session.user.username})
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-medium rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                  >
                    Console d'Administration
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/auth?mode=login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth?mode=register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
