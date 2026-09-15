"use client";

import React from "react";
import { ShieldCheck, Lock, Binary, KeyRound, CheckCircle2 } from "lucide-react";

export function SecuritySection() {
  const securityPillars = [
    {
      icon: Binary,
      title: "100% Bytecode Compilé",
      tag: "protect: true",
      description:
        "Le code source (.py, .js, .ts) est compilé en bytecode binaire hermétique (.pyc, .jsc V8) puis définitivement détruit lors de l'assemblage de l'archive.",
    },
    {
      icon: ShieldCheck,
      title: "Intégrité Cryptographique SHA-256",
      tag: "Fast Integrity",
      description:
        "Chaque bloc et manifest boxfile.yml est scellé cryptographiquement. Toute tentative de corruption ou d'altération bloque l'exécution instantanément.",
    },
    {
      icon: KeyRound,
      title: "Isolation Étendue des Secrets",
      tag: "Android KeyStore et .env.local",
      description:
        "Vos clés secrètes (.env.local) ne sont jamais incluses dans le .box. Sur mobile, elles sont chiffrées au niveau matériel via le KeyStore Android.",
    },
  ];

  return (
    <section className="relative py-16 md:py-24 border-t border-black/8 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 mb-3">
            <Lock className="h-3.5 w-3.5" />
            <span>Securite et Propriete Intellectuelle</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Distribuez votre code en toute confiance
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-3">
            Box intègre une protection native pensée pour les développeurs, ingénieurs et éditeurs de logiciels.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-sm hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {p.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight mb-2">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
