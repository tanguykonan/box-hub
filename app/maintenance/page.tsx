"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import logoImg from "../../public/logo.jpg";

export default function MaintenancePage() {
  const router = useRouter();
  const [isMaintenanceActive, setIsMaintenanceActive] = useState<boolean | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  useEffect(() => {
    const checkMaintenance = () => {
      const active = localStorage.getItem("boxhub_maintenance_mode") === "true";
      if (!active) {
        router.replace("/");
      } else {
        setIsMaintenanceActive(true);
      }
    };

    checkMaintenance();
    window.addEventListener("storage", checkMaintenance);
    window.addEventListener("boxhub_maintenance_change", checkMaintenance);

    return () => {
      window.removeEventListener("storage", checkMaintenance);
      window.removeEventListener("boxhub_maintenance_change", checkMaintenance);
    };
  }, [router]);

  const handleCopyCli = () => {
    navigator.clipboard.writeText("box run <application.box>");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  // Prevent flash of content if maintenance is inactive and redirection is in progress
  if (!isMaintenanceActive) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-950 dark:text-white transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
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

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Maintenance en cours
            </span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center space-y-6">
        
        {/* Main Maintenance Card */}
        <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
          
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="h-14 w-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Wrench className="h-7 w-7" />
            </div>

            <div className="space-y-2 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Plateforme en maintenance
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                La plateforme Box Hub est temporairement inaccessible. Les services seront rétablis dans les plus brefs délais.
              </p>
            </div>
          </div>

          {/* Offline CLI Reminder */}
          <div className="pt-5 border-t border-black/5 dark:border-white/5 space-y-3">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Vos applications <code className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded text-orange-600 dark:text-orange-400 font-bold">.box</code> déjà présentes sur votre machine continuent de s'exécuter localement sans connexion.
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-950 text-white border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 overflow-x-auto">
                <Terminal className="h-4 w-4 text-orange-500 shrink-0" />
                <code>box run &lt;application.box&gt;</code>
              </div>

              <button
                type="button"
                onClick={handleCopyCli}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white cursor-pointer transition-colors shrink-0"
              >
                {copiedCli ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Box Hub. Tous droits réservés.</span>
          <div className="flex items-center gap-4 flex-wrap">
            <LanguageSelector />
            <span>•</span>
            <Link href="/privacy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Politique de confidentialité
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
