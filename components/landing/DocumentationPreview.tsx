"use client";

import React, { useState } from "react";
import { BookOpen, FileCode, Check, Copy, Terminal, HardDrive, ShieldAlert, ArrowUpRight } from "lucide-react";

export function DocumentationPreview() {
  const [activeTab, setActiveTab] = useState<string>("config");
  const [copied, setCopied] = useState<boolean>(false);

  const docs = {
    config: {
      title: "1. Déclarer son projet dans boxconfig.yml",
      description:
        "Le seul fichier à rédiger manuellement. Il configure le runtime, l'entrypoint, les dépendances et l'isolation.",
      filename: "boxconfig.yml",
      code: `name: discord-bot
version: 1.0.0

runtime:
  type: node
  version: "26.0.0"

entrypoint: src/bot.js

dependencies:
  - discord.js
  - dotenv

protect: true # Active la compilation en bytecode V8 (.jsc)

include:
  - src/
  - assets/`,
    },
    build: {
      title: "2. Packager l'archive hermétique avec box build",
      description:
        "Télécharge le runtime isolé, compile en bytecode binaire, calcule l'arbre SHA-256 et compresse en Zstandard.",
      filename: "terminal",
      code: `# Lancer le build depuis la racine du projet
$ box build .

# Sortie :
# [1/5] Détection runtime: Node.js 26.0.0
# [2/5] Isolation dépendances (discord.js)
# [3/5] Compilation bytecode (protect: true : format .jsc)
# [4/5] Destruction des sources texte .js
# [5/5] Compression Zstandard : discord-bot.box (14.2 MB)
# Archive .box scellée avec succès en 1.2s`,
    },
    run: {
      title: "3. Exécuter instantanément avec box run",
      description:
        "Extrait en mémoire, vérifie l'intégrité globale en une passe (Fast-Integrity) et charge .env.local de façon sécurisée.",
      filename: "terminal",
      code: `# Lancement nominal (< 1s)
$ box run discord-bot.box

# Lancement avec variables d'environnement personnalisées
$ box run discord-bot.box --env .env.production

# Audit d'intégrité approfondi bloc par bloc
$ box run discord-bot.box --verify-files`,
    },
    volumes: {
      title: "4. Persistance des données avec box volume",
      description:
        "Monter un Named Volume ou un dossier hôte pour persister les bases SQLite et fichiers générés entre deux lancements.",
      filename: "terminal",
      code: `# Monter un volume nommé géré par Box
$ box run discord-bot.box -v bot_db:data

# Gestion des volumes persistants
$ box volume ls
$ box volume inspect bot_db
$ box volume prune`,
    },
  };

  const currentDoc = docs[activeTab as keyof typeof docs];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDoc.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="docs" className="relative py-16 md:py-24 border-t border-black/8 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider font-semibold mb-2">
              <BookOpen className="h-4 w-4" />
              <span>Guide Développeur</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Prêt en 3 minutes chrono
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Une documentation claire et directe pour assembler votre premier paquet <code className="text-xs font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">.box</code>.
            </p>
          </div>

          <a
            href="/docs"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline self-start md:self-auto"
          >
            <span>Consulter la doc complète</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Interactive Documentation Box */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-xl overflow-hidden">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 p-2 gap-2">
            {[
              { id: "config", label: "boxconfig.yml", icon: FileCode },
              { id: "build", label: "box build", icon: Terminal },
              { id: "run", label: "box run", icon: Terminal },
              { id: "volumes", label: "box volume", icon: HardDrive },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-black text-zinc-950 dark:text-white shadow-sm border border-black/10 dark:border-white/15"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-orange-500" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Doc Body */}
          <div className="p-6 sm:p-8">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
                {currentDoc.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {currentDoc.description}
              </p>
            </div>

            {/* Code Snippet Box */}
            <div className="relative rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 text-zinc-100 p-4 sm:p-5 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-[11px] text-zinc-400">
                <span className="text-orange-400 font-semibold">{currentDoc.filename}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-600 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="overflow-x-auto text-xs leading-relaxed font-mono text-zinc-200">
                <code>{currentDoc.code}</code>
              </pre>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
