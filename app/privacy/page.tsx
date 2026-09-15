"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  Key,
  FileCheck,
  UserCheck,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Breadcrumb et En-tête */}
        <div className="space-y-4 border-b border-black/8 dark:border-white/10 pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="font-bold text-zinc-900 dark:text-white">Confidentialité</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-mono font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
              <span>Protection des Données et Respect de la Vie Privée</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-mono">
              Politique de Confidentialité
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-mono">
              Dernière mise à jour : 11 Septembre 2026
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-950/70 p-6 sm:p-8 space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Chez <strong>Box Hub</strong>, la sécurité de vos paquets logiciels, la souveraineté de vos codes sources et la confidentialité de vos informations personnelles constituent nos priorités absolues.
          </p>
          <p>
            Cette politique de confidentialité détaille les principes régissant la collecte, l'utilisation, le stockage et la protection de vos données lorsque vous utilisez la plateforme web Box Hub, le registre applicatif ou la CLI Box.
          </p>
        </div>

        {/* Section 1 : Données collectées */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <UserCheck className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              1. Données que nous collectons
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Nous adhérons au principe de <strong>minimisation stricte des données</strong>. Seules les données strictement indispensables au bon fonctionnement du registre sont collectées :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Données de compte :</strong> Votre pseudonyme de développeur, votre adresse e-mail de contact et vos jetons d'accès API générés par <code className="font-mono text-xs">box token</code>.
              </li>
              <li>
                <strong>Métadonnées de paquets :</strong> Le nom du paquet, la version, la visibilité, le fichier modèle <code className="font-mono text-xs">.env.example</code>, la documentation <code className="font-mono text-xs">README</code> et l'empreinte cryptographique SHA-256 scellée dans le manifeste <code className="font-mono text-xs">boxconfig.yml</code>.
              </li>
              <li>
                <strong>Logs techniques de registre :</strong> Les requêtes de téléchargement (<code className="font-mono text-xs">box pull</code>) et de publication (<code className="font-mono text-xs">box push</code>) sont journalisées pour le suivi des statistiques et la prévention des abus.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2 : Propriété intellectuelle et Paquets Privés */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              2. Secret de vos algorithmes et Paquets Privés
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Votre code source vous appartient exclusivement :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-2">
                <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                  Paquets Privés cloisonnés
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Les archives publiées avec la visibilité Privé sont strictement isolées par contrôle d'accès : elles ne sont accessibles et téléchargeables que par leur auteur via son jeton personnel d'authentification.
                </p>
              </div>

              <div className="rounded-xl border border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-2">
                <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                  Zéro entraînement d'IA
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Nous n'utilisons jamais vos codes sources, vos archives compilées ni vos données d'application pour entraîner des modèles d'intelligence artificielle ou des outils tiers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 : Sécurité et Chiffrement */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <Server className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              3. Sécurité et Intégrité
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Box Hub applique des standards de sécurité stricts pour préserver votre environnement :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Chiffrement en transit :</strong> Toutes les communications entre le CLI Box et le registre central sont obligatoirement chiffrées en HTTPS (TLS) avec des certificats validés.
              </li>
              <li>
                <strong>Intégrité cryptographique SHA-256 :</strong> Chaque paquet dispose d'une empreinte cryptographique SHA-256 garantissant qu'aucune altération du binaire n'est possible lors du téléchargement.
              </li>
              <li>
                <strong>Secrets d'environnement :</strong> Box Hub ne conserve jamais vos valeurs réelles de secrets d'exécution. Seules les clés modèles sans valeurs réelles (<code className="font-mono text-xs">.env.example</code>) sont hébergées pour la documentation.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 : Vos Droits */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <FileCheck className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              4. Vos droits (Accès, Rectification, Suppression)
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Conformément aux principes de protection des données personnelles :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Droit de suppression :</strong> Vous pouvez supprimer vos paquets et révoquer vos jetons d'accès API directement depuis votre tableau de bord, ou demander la suppression définitive de votre compte développeur par e-mail à <a href="mailto:ulrich@tanguykonan.dev" className="text-orange-600 dark:text-orange-400 hover:underline font-mono text-xs">ulrich@tanguykonan.dev</a>.
              </li>
              <li>
                <strong>Droit d'accès et de rectification :</strong> Vos informations de profil, vos paquets publiés et vos clés d'API sont directement consultables et modifiables dans votre console développeur.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5 : Contact */}
        <section className="space-y-4 border-t border-black/8 dark:border-white/10 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              5. Nous contacter
            </h2>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits de protection des données, vous pouvez contacter notre équipe :
            </p>
            <div className="pt-2 font-mono text-xs text-zinc-900 dark:text-white">
              <span className="text-zinc-500">E-mail de contact : </span>
              <a href="mailto:ulrich@tanguykonan.dev" className="text-orange-600 dark:text-orange-400 hover:underline">
                ulrich@tanguykonan.dev
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
