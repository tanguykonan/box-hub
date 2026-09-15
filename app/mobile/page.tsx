"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  Download,
  Server,
  HardDrive,
  Cpu,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Wifi,
  Bell,
} from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { GithubIcon } from "../../components/ui/GithubIcon";
import { SITE_CONFIG } from "@/lib/site-config";

export default function MobilePage() {
  const essentials = [
    {
      title: "Environnement Hermétique",
      desc: "L'application charge et exécute le paquet .box avec son runtime isolé (Python, Node.js). Aucune installation système ni dépendance hôte n'est requise.",
      icon: ShieldCheck,
    },
    {
      title: "Variables d'Environnement Isolées",
      desc: "Chaque application dispose de son propre espace de variables .env pour injecter clés d'API et paramètres de configuration sans modifier le paquet.",
      icon: KeyRound,
    },
    {
      title: "Volumes Persistants Optionnels",
      desc: "Si une application a besoin de conserver des données ou une base locale, vous pouvez lui associer un volume de stockage persistant.",
      icon: HardDrive,
    },
    {
      title: "Exécution Continue en Arrière-Plan",
      desc: "Les services restent actifs en continu. L'interface permet de contrôler directement le cycle de vie de chaque application (démarrage, arrêt, redémarrage).",
      icon: RefreshCw,
    },
    {
      title: "Contrôle de l'Empreinte Système",
      desc: "Suivi en direct de la consommation de mémoire vive (RAM), de l'utilisation processeur (CPU) et de l'impact batterie pour chaque service actif.",
      icon: Cpu,
    },
    {
      title: "Autonomie et Self-Hosting",
      desc: "Transformez un appareil mobile en serveur local permanent sans dépendance envers une infrastructure cloud payante.",
      icon: Server,
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
            <span className="font-bold text-zinc-900 dark:text-white">Box Runner</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-mono">
            Box Runner pour Android
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Client mobile pour exécuter des applications Box en continu sur smartphone, sans serveur externe.
          </p>
        </div>

        {/* Hero Download Card */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-950/70 p-6 sm:p-10 backdrop-blur-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200">
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile Self-Hosting</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight">
              Installer Box Runner
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Téléchargez le package APK pour installer le runner et exécuter vos applications en local sur votre appareil.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => window.open(SITE_CONFIG.apkDownloadUrl, "_blank")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-5 py-2.5 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Télécharger l'APK</span>
            </button>
            <a
              href={SITE_CONFIG.apkGithubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-black/30 dark:hover:border-white/30 transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Code Source</span>
            </a>
          </div>
        </div>

        {/* Cas d'usage concrets */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
            Cas d'Usage
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
                <Wifi className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white font-mono">
                Microservice de Réseau Local
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Exposez une interface HTTP ou un service utilitaire accessible aux autres appareils connectés sur votre réseau Wi-Fi local.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white font-mono">
                Surveillance et Alertes Continues
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Exécutez vos scripts de monitoring ou de vérification d'état 24h/24 pour détecter et relayer instantanément les anomalies.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white font-mono">
                Traitement de Flux et Tâches de Fond
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Déléguez l'exécution de workers, calculs ou files d'attente à votre appareil mobile sans mobiliser votre ordinateur de travail.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture et Points Cles */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
            Fonctionnement et Points Clés
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essentials.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white font-mono">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
