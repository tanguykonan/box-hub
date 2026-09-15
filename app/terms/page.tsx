"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Ban,
  Terminal,
  FileCode,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export default function TermsOfServicePage() {
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
            <span className="font-bold text-zinc-900 dark:text-white">Conditions</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-black text-[11px] font-mono font-semibold">
              <Scale className="h-3.5 w-3.5" />
              <span>Cadre Légal et Règles de la Plateforme</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-mono">
              Conditions d'Utilisation
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-mono">
              Dernière mise à jour : 11 Septembre 2026
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-950/70 p-6 sm:p-8 space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Les présentes Conditions d'Utilisation (les « <strong>Conditions</strong> ») définissent les règles d'accès et d'utilisation de la plateforme <strong>Box Hub</strong>, de son registre public et privé de paquets logiciels, ainsi que des outils de développement associés.
          </p>
          <p>
            En créant un compte développeur, en publiant une archive ou en utilisant le CLI Box, vous acceptez d'être lié par ces conditions.
          </p>
        </div>

        {/* Section 1 : Comptes et Authentification */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <Terminal className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              1. Compte Développeur et Jetons d'Accès
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              L'accès aux fonctionnalités de publication et de gestion d'applications requiert la création d'un compte développeur :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Responsabilité des identifiants :</strong> Vous êtes seul responsable de la confidentialité de vos mots de passe et des jetons d'accès API (<code className="font-mono text-xs">box token</code>) associés à votre compte.
              </li>
              <li>
                <strong>Activités du compte :</strong> Toute action effectuée via vos jetons ou identifiants (publication, suppression, mise à jour de paquets) est réputée avoir été réalisée par vous.
              </li>
              <li>
                <strong>Révocation d'urgence :</strong> En cas de compromission d'un jeton, vous devez immédiatement le révoquer depuis l'onglet Tokens d'accès de votre tableau de bord.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2 : Règles de Publication et Contenu Interdit */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <Ban className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              2. Règles de Publication et Usages Proscrits
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Afin de préserver l'intégrité et la fiabilité de l'écosystème Box Hub, les comportements suivants sont strictement interdits :
            </p>
            <div className="rounded-xl border border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Logiciels malveillants :</strong> Interdiction absolue de téléverser des virus, spywares, ransomwares, chevaux de Troie, mineurs furtifs de crypto-monnaie ou tout code visant à altérer ou espionner le système hôte de l'utilisateur.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Usurpation et typosquatting :</strong> Interdiction d'enregistrer intentionnellement des noms de paquets trompeurs ou imitant des projets officiels pour abuser de la confiance des utilisateurs.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Attaques par déni de service (DDoS) :</strong> Interdiction de saturer artificiellement le registre par du flood de requêtes ou des paquets volumineux vides.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 : Propriété Intellectuelle et Licences */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <FileCode className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              3. Propriété Intellectuelle et Licence de Distribution
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Conservation de vos droits :</strong> Vous conservez l'intégralité de la propriété intellectuelle et des droits d'auteur sur vos applications, algorithmes et codes hébergés.
              </li>
              <li>
                <strong>Licence technique concédée :</strong> En publiant un paquet sur Box Hub, vous nous accordez uniquement le droit technique mondial et non exclusif d'héberger, indexer, compresser et distribuer le paquet selon le paramètre de visibilité que vous avez sélectionné (Public ou Privé).
              </li>
              <li>
                <strong>Respect des licences tierces :</strong> Vous vous engagez à respecter les licences open source (MIT, Apache, GPL, etc.) des dépendances que vous embarquez dans vos archives <code className="font-mono text-xs">.box</code>.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 : Limitation de Responsabilité */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              4. Disponibilité du Service et Limitation de Responsabilité
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Box Hub s'efforce de maintenir une disponibilité maximale de son infrastructure de registre. Toutefois :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Fourniture en l'état (AS-IS) :</strong> La plateforme, le CLI et le registre sont fournis « en l'état » sans garantie expresse d'absence d'interruption temporaire pour maintenance.
              </li>
              <li>
                <strong>Exécution des applications :</strong> Les développeurs et utilisateurs finaux demeurent responsables de l'exécution, des dépendances et de la configuration des variables d'environnement de leurs applications.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5 : Résiliation et Suspension */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              5. Résiliation et Déréférencement
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Vous pouvez supprimer vos paquets et révoquer vos jetons à tout moment depuis votre tableau de bord, ou demander la clôture définitive de votre compte par e-mail à <a href="mailto:ulrich@tanguykonan.dev" className="text-orange-600 dark:text-orange-400 hover:underline font-mono text-xs">ulrich@tanguykonan.dev</a>. Box Hub se réserve le droit de suspendre l'accès ou de déréférencer tout paquet en cas de violation avérée des présentes Conditions ou de menace directe pour la sécurité du registre.
            </p>
          </div>
        </section>

        {/* Section 6 : Assistance et Litiges */}
        <section className="space-y-4 border-t border-black/8 dark:border-white/10 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              <HelpCircle className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white">
              6. Contact et Support
            </h2>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-11">
            <p>
              Pour toute question juridique ou signalement relatif aux conditions d'utilisation, veuillez contacter :
            </p>
            <div className="pt-2 font-mono text-xs text-zinc-900 dark:text-white">
              <span className="text-zinc-500">Contact légal : </span>
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
