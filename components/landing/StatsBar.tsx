"use client";

import React from "react";
import { Zap, ShieldCheck, Layers, Cpu } from "lucide-react";

export function StatsBar() {
  const stats = [
    {
      icon: Zap,
      value: "< 1s",
      label: "Démarrage instantané",
      description: "Fast-integrity SHA-256 et décompression Zstd streaming",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Code source protégé",
      description: "Compilation bytecode (.pyc/.jsc) avec destruction des sources",
    },
    {
      icon: Layers,
      value: "0",
      label: "Dépendance système",
      description: "Embarque le runtime et les bibliothèques dans l'archive .box",
    },
    {
      icon: Cpu,
      value: "3-en-1",
      label: "Écosystème unifié",
      description: "Binaire Rust natif, Registre Next.js et Runner Android Kotlin",
    },
  ];

  return (
    <section className="relative z-10 border-y border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-md py-10 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="group relative rounded-xl border border-black/8 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 transition-all duration-200 hover:border-orange-500/40 hover:shadow-md"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-orange-400 group-hover:text-orange-500 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-950 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {stat.label}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
