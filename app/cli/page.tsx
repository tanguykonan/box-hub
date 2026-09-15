"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Cpu,
  Download,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { SITE_CONFIG } from "@/lib/site-config";

export default function CliPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedOs, setSelectedOs] = useState<"unix" | "windows">("unix");

  // Détection automatique de l'OS au chargement
  React.useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent.toLowerCase().includes("win")) {
      setSelectedOs("windows");
    }
  }, []);

  const installCmd = selectedOs === "windows"
    ? SITE_CONFIG.getInstallCommandWindows()
    : SITE_CONFIG.getInstallCommandUnix();

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const platforms = [
    {
      os: "Linux x86_64",
      arch: "x86_64 (glibc / musl)",
      size: "8.4 MB",
      filename: "box-linux-x86_64.tar.gz",
    },
    {
      os: "Linux ARM64",
      arch: "aarch64 (Raspberry Pi, AWS Graviton)",
      size: "7.9 MB",
      filename: "box-linux-aarch64.tar.gz",
    },
    {
      os: "macOS Apple Silicon",
      arch: "ARM64 (M1, M2, M3, M4)",
      size: "8.1 MB",
      filename: "box-darwin-arm64.tar.gz",
    },
    {
      os: "Windows x86_64",
      arch: "x86_64 (MSVC natif)",
      size: "9.2 MB",
      filename: "box-windows-x86_64.zip",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Header Breadcrumb et Titre */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="font-bold text-zinc-900 dark:text-white">CLI Rust</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-mono">
            Moteur CLI Rust Natif
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Un binaire autonome ultra-rapide, sans runtime Python ou Node.js requis sur la machine hôte. Conçu pour la performance brute et l'isolation hermétique.
          </p>
        </div>

        {/* Quick Install Terminal Box */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800 text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 font-semibold text-zinc-200">
                <Terminal className="h-4 w-4 text-orange-400" />
                <span>Installation en 1 ligne</span>
              </span>
              
              {/* OS Tabs */}
              <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedOs("unix")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedOs === "unix"
                      ? "bg-orange-600 text-white font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Linux / macOS
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOs("windows")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedOs === "windows"
                      ? "bg-orange-600 text-white font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Windows (PowerShell)
                </button>
              </div>
            </div>

            <button
              onClick={() => handleCopy("install", installCmd)}
              className="hover:text-white text-zinc-400 transition-colors cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
            >
              {copiedCode === "install" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-orange-400 overflow-x-auto text-sm leading-relaxed">
            {selectedOs === "windows" ? `> ${installCmd}` : `$ ${installCmd}`}
          </pre>
        </div>

        {/* 3 Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white font-mono">
              Démarrage en moins de 1s
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Décompression en flux continu via Zstandard et vérification d'intégrité globale instantanée sans extraction intégrale sur disque.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white font-mono">
              Compilation Bytecode
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Vos codes sources (.py, .js, .ts) sont traduits en bytecode binaire hermétique. Les sources texte sont définitivement purgées.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white font-mono">
              Zéro Dépendance Hôte
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              L'archive .box embarque le runtime isolé et toutes les bibliothèques requises. Fonctionne de manière identique sur n'importe quel système.
            </p>
          </div>
        </div>

        {/* Binaries Download Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
            Téléchargements Directs des Binaires
          </h2>

          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Plateforme</th>
                  <th className="py-3 px-4 font-semibold">Architecture</th>
                  <th className="py-3 px-4 font-semibold">Taille</th>
                  <th className="py-3 px-4 font-semibold text-right">Téléchargement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {platforms.map((p, idx) => (
                  <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">
                      {p.os}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">{p.arch}</td>
                    <td className="py-3 px-4 text-zinc-500">{p.size}</td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={SITE_CONFIG.getCliDownloadUrl(p.filename)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-xs font-medium hover:border-orange-500 hover:text-orange-500 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{p.filename}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
