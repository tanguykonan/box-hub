"use client";

import React, { useState } from "react";
import { Terminal, Globe, Smartphone, Check, ArrowRight, Shield, Cpu, HardDrive } from "lucide-react";

export function EcosystemShowcase() {
  const [activePillar, setActivePillar] = useState<number>(0);

  const pillars = [
    {
      id: 0,
      badge: "Moteur Core et CLI",
      title: "Performance Brute en Rust",
      subtitle: "Binaire natif autonome avec zéro dépendance hôte",
      tech: "Rust • Rayon • Zstandard • Fast-Integrity",
      icon: Terminal,
      color: "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white",
      accent: "text-zinc-900 dark:text-white",
      features: [
        "Un seul binaire exécutable sans Python ni Node pré-installé sur la machine",
        "Calcul SHA-256 parallèle et décompression Zstd à haute vitesse",
        "Compilation binaire bytecode avec destruction définitive des sources",
        "Gestionnaire de volumes de donnée persistants",
      ],
      codeSnippet: `# Construire une Box ultra-rapide
$ box build .

# Exécuter en montant un volume persistant
$ box run alex/discord-bot:latest -v db_data:data`,
    },
    {
      id: 1,
      badge: "Hub Web et Registre Cloud",
      title: "Registre Central Next.js",
      subtitle: "Découverte, versioning et documentation instantanée",
      tech: "Next.js 15 • PostgreSQL • Redis • Cloudflare R2",
      icon: Globe,
      color: "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white",
      accent: "text-zinc-900 dark:text-white",
      features: [
        "Espaces de nommage sécurisés <user>/<box_name>:<tag>",
        "Analyse automatique du manifest boxfile.yml et validation d'intégrité SHA-256",
        "Formulaire interactif des variables d'environnement (.env) requises",
        "Distribution sécurisée et téléchargement direct pour le CLI et l'application mobile",
      ],
      codeSnippet: `# Authentification et Publication
$ box login
$ box push alex/discord-bot:v1.2.0

# Dépôt direct Web en glisser-déposer disponible`,
    },
    {
      id: 2,
      badge: "Mobile Self-Hosting",
      title: "Box Runner pour Android",
      subtitle: "Exécution autonome de vos applications sur smartphone",
      tech: "Kotlin • Services • Volumes • Monitoring",
      icon: Smartphone,
      color: "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white",
      accent: "text-zinc-900 dark:text-white",
      features: [
        "Exécution continue de vos applications Box existantes 24h/24",
        "Zéro configuration serveur : environnement autonome embarqué",
        "Volumes persistants optionnels pour les besoins de stockage",
        "Observation en temps réel des ressources (CPU, RAM, batterie)",
      ],
      codeSnippet: `// 1. Déployer l'application sur Box Runner
// 2. Associer un volume si nécessaire
// 3. Exécution autonome 24h/24`,
    },
  ];

  return (
    <section id="ecosystem" className="relative py-16 md:py-24 border-t border-black/8 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-xs font-mono font-medium text-orange-600 dark:text-orange-400 mb-3">
            <Cpu className="h-3.5 w-3.5" />
            <span>Architecture et Écosystème</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Le Trio Technologique Officiel
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-3">
            Trois couches spécialisées et interconnectées pour une expérience développeur et utilisateur sans friction.
          </p>
        </div>

        {/* 3 Interactive Pillar Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {pillars.map((p) => {
            const Icon = p.icon;
            const isSelected = activePillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                className={`group flex flex-col justify-between text-left rounded-2xl border p-5 sm:p-6 transition-all duration-200 backdrop-blur-md cursor-pointer ${
                  isSelected
                    ? "border-orange-500 dark:border-orange-400 bg-white dark:bg-zinc-950 shadow-lg dark:shadow-orange-950/20 ring-1 ring-orange-500/20"
                    : "border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 hover:border-black/30 dark:hover:border-white/30 hover:bg-white dark:hover:bg-zinc-950 hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Integrated Header: Icon + Badge + Title */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${p.color} transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400">
                          {p.badge}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-zinc-400 dark:text-zinc-500">
                          0{p.id + 1}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight leading-snug">
                        {p.title}
                      </h3>
                    </div>
                  </div>

                  {/* Subtitle / Description */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                    {p.subtitle}
                  </p>
                </div>

                {/* Bottom Action Indicator */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className={isSelected ? p.accent : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"}>
                    {isSelected ? "Composant Actif" : "Afficher les détails"}
                  </span>
                  <ArrowRight
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isSelected ? "translate-x-1 text-orange-500" : "text-zinc-400 group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-white"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Selected Pillar Panel */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-950 text-white p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Features List (Left) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
                  {pillars[activePillar].badge}
                </span>
                <h4 className="text-2xl font-extrabold text-white tracking-tight">
                  {pillars[activePillar].title}
                </h4>
                <p className="text-xs font-mono text-zinc-400">
                  Stack : {pillars[activePillar].tech}
                </p>
              </div>

              <ul className="space-y-3">
                {pillars[activePillar].features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code / Workflow Terminal Preview (Right) */}
            <div className="lg:col-span-6 rounded-xl border border-zinc-800 bg-black p-5 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span>aperçu-technique</span>
              </div>
              <pre className="text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">
                <code>{pillars[activePillar].codeSnippet}</code>
              </pre>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
