"use client";

import React, { useState } from "react";
import { Search, Sparkles, Terminal, Copy, Check, Shield, Cpu, ArrowRight } from "lucide-react";
import { Cube3D } from "../background/Cube3D";

interface HeroSectionProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export function HeroSection({ onSearchChange, searchQuery }: HeroSectionProps) {
  const [copied, setCopied] = useState(false);

  const command = "box run alex/discord-bot:latest";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleTags = [
    "discord-bot",
    "fastapi-groq",
    "web-scraper",
    "telegram-bot",
    "ai-agent",
  ];

  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Floating 3D Cube as the Gravitational Singularity */}
        <div id="hero-cube-anchor" className="flex justify-center mb-6">
          <Cube3D />
        </div>

        {/* Announcement Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-zinc-950/70 px-3.5 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-semibold text-orange-600 dark:text-orange-400">Hub v1.0</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <span>Un projet</span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
              <span>Un fichier</span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
              <span>Exécution universelle</span>
            </div>
          </div>
        </div>

        {/* Main Hero Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
            L'Écosystème Universel des Applications{" "}
            <span className="text-orange-600 dark:text-orange-400">
              Autonomes
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Découvrez, publiez et exécutez des applications <strong className="text-zinc-950 dark:text-white font-semibold">Python</strong> et{" "}
            <strong className="text-zinc-950 dark:text-white font-semibold">Node.js</strong> scellées dans un seul fichier <code className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-mono text-sm">.box</code>.
          </p>
        </div>

        {/* Hero Interactive Split: Search Bar (Left) + Interactive Runner (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Left Column: Instant Hub Search */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider font-semibold">
                <Search className="h-4 w-4" />
                <span>Exploration Rapide</span>
              </div>

              <h2 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
                Recherchez parmi des milliers de Box prêtes à l'emploi
              </h2>

              {/* Main Search Input */}
              <div className="relative">
                <input
                  id="hero-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Rechercher une Box..."
                  className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-4 py-3.5 pl-11 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
                />
                <Search className="absolute left-4 top-4 h-4 w-4 text-zinc-400" />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-3 top-3.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {/* Popular Tag Pills */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Tags fréquents :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onSearchChange(tag)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-mono transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                        searchQuery === tag
                          ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold shadow-sm"
                          : "border-black/10 dark:border-white/10 bg-zinc-100/80 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:border-orange-500/50 hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-black/8 dark:border-white/8 text-xs">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Bytecode hermétique</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Cpu className="h-4 w-4 text-orange-500 shrink-0" />
                <span>Multi-architecture</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live CLI Terminal */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-950 text-white overflow-hidden shadow-2xl">
            
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-mono text-xs text-zinc-400">
                  terminal
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>box engine</span>
              </div>
            </div>

            {/* Terminal Content Body */}
            <div className="p-5 font-mono text-xs flex-1 flex flex-col justify-between bg-black">
              <div className="space-y-3">
                {/* Command Row */}
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold">$</span>
                    <span className="text-white font-medium">{command}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-zinc-400 hover:text-white hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                    title="Copier la commande"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Terminal Execution Logs */}
                <div className="space-y-1.5 text-zinc-300 text-[11px] leading-relaxed pt-1">
                  <p className="text-zinc-400">
                    [1/4] Téléchargement du paquet <span className="text-zinc-100 font-semibold">alex/discord-bot:latest</span> • 14.2 MB...
                  </p>
                  <p className="text-zinc-300 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Vérification intégrité SHA-256 (Fast-Integrity OK)</span>
                  </p>
                  <p className="text-zinc-300 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Runtime isolé Node.js 26.0.0 initialisé en mémoire</span>
                  </p>
                  <p className="text-zinc-300 flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Bytecode V8 scellé (.jsc)</span>
                  </p>
                  <p className="text-white flex items-center gap-2 pt-1 font-semibold">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Application démarrée et active</span>
                  </p>
                </div>
              </div>

              {/* Bottom Status bar */}
              <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-4 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Prêt en 0.8s</span>
                </span>
                <span className="text-zinc-400 font-mono">box v1.0.0-release</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
