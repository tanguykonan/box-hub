"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Terminal, Copy, Check, Star, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "../ui/GithubIcon";
import { LanguageSelector } from "../ui/LanguageSelector";
import { SITE_CONFIG } from "@/lib/site-config";
import logoImg from "../../public/logo.jpg";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const [isWindows, setIsWindows] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent.toLowerCase().includes("win")) {
      setIsWindows(true);
    }
  }, []);

  const installCmd = isWindows
    ? SITE_CONFIG.getInstallCommandWindows()
    : SITE_CONFIG.getInstallCommandUnix();

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="relative border-t border-black/10 dark:border-white/10 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 py-16 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: CTA et Quick Install */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-10 mb-16 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Installez la CLI Box en une seconde
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Binaire autonome en Rust pour Windows, Linux et macOS. Zéro pré-requis.
              </p>
            </div>

            {/* Install Command Snippet */}
            <div className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-zinc-800 bg-white dark:bg-black px-4 py-3 font-mono text-xs text-zinc-900 dark:text-zinc-200 shadow-sm">
              <span className="text-orange-500 font-bold">{isWindows ? ">" : "$"}</span>
              <span className="truncate">{installCmd}</span>
              <button
                onClick={handleCopy}
                className="ml-2 rounded-lg border border-black/10 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                title="Copier le script d'installation"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Middle Navigation et GitHub */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-black/5 dark:border-white/5">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                <Image
                  src={logoImg}
                  alt="Box Hub Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-lg font-bold text-zinc-950 dark:text-white">
                hub
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Le format universel et registre applicatif autonome pour distribuer vos projets Python et Node.js en un seul fichier hermétique.
            </p>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-900 dark:text-zinc-200">
              Ressources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/docs" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Documentation Développeur
                </Link>
              </li>
              <li>
                <Link href="/cli" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Moteur CLI Rust
                </Link>
              </li>
              <li>
                <Link href="/mobile" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Box Runner (Android)
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Catalogue des Box
                </Link>
              </li>
            </ul>
          </div>

          {/* Social / Open Source: Strictly GitHub */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-900 dark:text-zinc-200">
              Repository
            </h4>
            <div>
              <a
                href={SITE_CONFIG.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-white hover:border-black/30 dark:hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
              >
                <GithubIcon className="h-4 w-4" />
                <span>CLI Rust Repository</span>
                <ArrowUpRight className="h-3 w-3 text-zinc-400" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright, Language Selector and Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-zinc-500 dark:text-zinc-500 font-mono">
          <p>© {new Date().getFullYear()} Box Hub. Conçu pour les développeurs exigeants.</p>
          
          <div className="flex items-center gap-4 flex-wrap">
            <LanguageSelector />
            <span className="hidden sm:inline">•</span>
            <Link href="/privacy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Politique de Confidentialité
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Conditions d'Utilisation
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
