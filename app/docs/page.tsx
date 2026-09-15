"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  FileCode,
  HardDrive,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  ChevronRight,
  Play,
  Layers,
  Cpu,
  Server,
  AlertCircle,
  HelpCircle,
  FolderTree,
  Database,
  Info,
  Globe,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { SITE_CONFIG } from "@/lib/site-config";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("quickstart");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isWindows, setIsWindows] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent.toLowerCase().includes("win")) {
      setIsWindows(true);
    }
  }, []);

  const cliInstallCmd = isWindows
    ? SITE_CONFIG.getInstallCommandWindows()
    : SITE_CONFIG.getInstallCommandUnix();

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const navItems = [
    { id: "quickstart", label: "Démarrage Rapide", icon: Terminal },
    { id: "config", label: "Configuration", icon: FileCode },
    { id: "build", label: "Compilation", icon: Layers },
    { id: "run", label: "Exécution", icon: Play },
    { id: "volumes", label: "Volumes Persistants", icon: HardDrive },
    { id: "env", label: "Variables d'Environnement", icon: KeyRound },
    { id: "security", label: "Protection Bytecode", icon: ShieldCheck },
    { id: "registry", label: "Registre et Publication", icon: Globe },
    { id: "inspect", label: "Inspection et Métadonnées", icon: Search },
    { id: "settings", label: "Paramètres Globaux", icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header Breadcrumb et Titre */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="font-bold text-zinc-900 dark:text-white">Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-mono">
            Documentation Technique
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Guide complet de référence pour concevoir, compiler, isoler et exécuter des applications autonomes au format <code className="text-zinc-900 dark:text-white font-semibold">.box</code>.
          </p>
        </div>

        {/* 2-Column Layout: Navigation Sidebar (Left) + Content (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-1 rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-950/70 p-3 backdrop-blur-md sticky top-24">
            <div className="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Sommaire
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </aside>

          {/* Content Pane */}
          <div className="lg:col-span-9 space-y-12">
            
            {/* 1. Quickstart */}
            {activeSection === "quickstart" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Démarrage Rapide
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Box regroupe votre code applicatif, son runtime et ses dépendances dans un fichier unique <code className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">.box</code> prêt à être exécuté sans installation préalable sur la machine cible.
                  </p>
                </div>

                {/* Concept: Pourquoi utiliser le format Box ? */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Pourquoi utiliser le format Box ?
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Le format Box permet de packager des applications Python et Node.js en archives autonomes scellées. L'objectif est de distribuer et faire tourner des projets sans avoir à configurer d'environnements virtuels, sans installer de paquets système et sans conflits de versions sur l'hôte.
                  </p>
                </div>

                {/* Step-by-Step Guide */}
                <div className="space-y-6">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Créer et exécuter votre première Box en 4 étapes
                  </h3>

                  {/* Step 1: Install */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">1</span>
                      <span>Installer le CLI Box</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Téléchargez et installez le binaire officiel sur votre système d'exploitation.
                    </p>
                    <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                      <span><span className="text-orange-500 font-bold">{isWindows ? ">" : "$"}</span> {cliInstallCmd}</span>
                      <button
                        onClick={() => handleCopy("install-cli", cliInstallCmd)}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier"
                      >
                        {copiedCode === "install-cli" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Config */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">2</span>
                      <span>Définir la configuration boxconfig.yml</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Créez un fichier déclaratif minimal <code className="font-mono text-zinc-900 dark:text-white">boxconfig.yml</code> spécifiant le runtime, la version, le fichier d'entrée et les dépendances.
                    </p>
                  </div>

                  {/* Step 3: Build */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">3</span>
                      <span>Compiler le paquet avec box build</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Lancez la compilation pour résoudre les dépendances, calculer les signatures SHA-256 et générer l'archive <code className="font-mono text-zinc-900 dark:text-white">mon-application.box</code>.
                    </p>
                    <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                      <span><span className="text-orange-500 font-bold">$</span> box build .</span>
                      <button
                        onClick={() => handleCopy("quick-build", "box build .")}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier"
                      >
                        {copiedCode === "quick-build" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 4: Run */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">4</span>
                      <span>Exécuter l'application avec box run</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Démarrez l'archive dans un environnement sandbox isolé.
                    </p>
                    <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                      <span><span className="text-orange-500 font-bold">$</span> box run mon-application.box</span>
                      <button
                        onClick={() => handleCopy("quick-run", "box run mon-application.box")}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier"
                      >
                        {copiedCode === "quick-run" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. boxconfig.yml Specification */}
            {activeSection === "config" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Configuration
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Le fichier <code className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">boxconfig.yml</code> est le manifeste central qui pilote le processus de construction et définit les paramètres d'exécution de votre application.
                  </p>
                </div>

                {/* Full YAML Example */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Exemple de configuration complète
                  </h3>
                  <div className="rounded-2xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-zinc-200">
                    <pre className="overflow-x-auto text-zinc-300 leading-relaxed">
{`# 1. Identité du paquet
name: auth-service
version: 1.0.0

# 2. Runtime d'exécution
runtime:
  type: python          # python ou node
  version: "3.12"       # version cible du runtime

# 3. Point d'entrée et structure
entrypoint: src/main.py # fichier exécuté au démarrage
workdir: src            # répertoire de travail interne (optionnel)
dependencies: requirements.txt # fichier de dépendances (requirements.txt ou package.json)

# 4. Fichiers et dossiers inclus
include:
  - src/
  - config.json

# 5. Protection du code source
protect: true           # compile en bytecode (.pyc/.jsc) et purge les sources en clair

# 6. Schema declaratif des variables d'environnement
env_schema: .env.example # chemin vers le fichier modele (les cles vides sont obligatoires)

# 7. Volumes persistants declares (nom_volume:chemin_interne)
volumes:
  - sqlite_data:data/db # volume persistant mappe sur le dossier interne data/db`}
                    </pre>
                  </div>
                </div>

                {/* Detailed Field Explanations */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Description exhaustive des champs
                  </h3>

                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 overflow-hidden text-xs">
                    <table className="w-full text-left font-mono">
                      <thead className="border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Champ</th>
                          <th className="py-3 px-4 font-semibold">Type</th>
                          <th className="py-3 px-4 font-semibold">Détails et Comportement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">name</td>
                          <td className="py-3 px-4 text-zinc-500">string</td>
                          <td className="py-3 px-4">Nom de l'application. Utilisé pour nommer l'archive générée (<code className="text-zinc-900 dark:text-zinc-200">name.box</code>).</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">version</td>
                          <td className="py-3 px-4 text-zinc-500">string</td>
                          <td className="py-3 px-4">Version sémantique du paquet (ex: <code className="text-zinc-900 dark:text-zinc-200">1.0.0</code>).</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">runtime.type</td>
                          <td className="py-3 px-4 text-zinc-500">python | node</td>
                          <td className="py-3 px-4">Définit l'adaptateur de runtime utilisé pour isoler et exécuter le code.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">entrypoint</td>
                          <td className="py-3 px-4 text-zinc-500">string</td>
                          <td className="py-3 px-4">Chemin relatif vers le script principal démarré à l'ouverture de la sandbox.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">dependencies</td>
                          <td className="py-3 px-4 text-zinc-500">string</td>
                          <td className="py-3 px-4">Fichier résolu par le build (<code className="text-zinc-900 dark:text-zinc-200">requirements.txt</code> via pip/uv, ou <code className="text-zinc-900 dark:text-zinc-200">package.json</code> via npm).</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">include</td>
                          <td className="py-3 px-4 text-zinc-500">list&lt;string&gt;</td>
                          <td className="py-3 px-4">Liste des motifs et dossiers à intégrer dans l'archive. Tout ce qui n'est pas listé est exclu.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">protect</td>
                          <td className="py-3 px-4 text-zinc-500">boolean</td>
                          <td className="py-3 px-4">Si <code className="text-zinc-900 dark:text-zinc-200">true</code>, compile les scripts en bytecode binaire et détruit les sources en clair avant compression.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">env_schema</td>
                          <td className="py-3 px-4 text-zinc-500">string</td>
                          <td className="py-3 px-4">Chemin vers le fichier modèle (ex: <code className="text-zinc-900 dark:text-zinc-200">.env.example</code>). Les clés sans valeur par défaut sont obligatoires au lancement.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">volumes</td>
                          <td className="py-3 px-4 text-zinc-500">list&lt;string&gt;</td>
                          <td className="py-3 px-4">Liste des volumes persistants sous la forme <code className="text-zinc-900 dark:text-zinc-200">nom_volume:chemin_interne</code> (ex: <code className="text-zinc-900 dark:text-zinc-200">sqlite_data:data/db</code>).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Compilation */}
            {activeSection === "build" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Compilation
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    La commande <code className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">box build</code> transforme un projet source en une archive scellée et optimisée pour la distribution.
                  </p>
                </div>

                {/* How build works */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Fonctionnement interne du pipeline de build
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 space-y-2">
                      <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">Étape 1 : Création de la zone de staging isolée</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Box crée un répertoire temporaire vierge (<code className="font-mono">box-build-XXXXXX</code>) et y copie uniquement les fichiers autorisés par la directive <code className="font-mono">include</code>. Les fichiers inutiles (comme <code className="font-mono">.git</code>, tests ou caches locaux) sont automatiquement ignorés.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 space-y-2">
                      <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">Étape 2 : Résolution hermétique des dépendances</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Pour Python, les paquets définis dans <code className="font-mono">requirements.txt</code> sont installés directement dans le dossier de staging via une commande pip/uv isolée. Pour Node.js, les modules de production de <code className="font-mono">package.json</code> sont résolus dans le dossier <code className="font-mono">node_modules</code> du staging.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 space-y-2">
                      <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">Étape 3 : Compilation Bytecode (si protect: true)</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Le moteur traduit les scripts sources en bytecode binaire hermétique (fichiers <code className="font-mono">.pyc</code> pour Python, bytecode V8 <code className="font-mono">.jsc</code> pour JavaScript/TypeScript). Tous les fichiers sources en clair (<code className="font-mono">.py</code>, <code className="font-mono">.js</code>, <code className="font-mono">.ts</code>) sont ensuite définitivement détruits du staging.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 space-y-2">
                      <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">Étape 4 : Indexation et Signature d'Intégrité SHA-256</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Chaque fichier de l'application reçoit une empreinte cryptographique SHA-256 unitaire. Un arbre global d'intégrité (<code className="font-mono">tree_sha256</code>) et une empreinte de charge utile (<code className="font-mono">payload_sha256</code>) sont calculés et scellés dans le manifeste interne <code className="font-mono">boxfile.yml</code>.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 space-y-2">
                      <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">Étape 5 : Compression Zstandard</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        L'archive TAR finale est compressée via l'algorithme Zstandard (niveau 3) pour garantir une vitesse de décompression quasi-instantanée au démarrage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Exécution */}
            {activeSection === "run" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Exécution
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    La commande <code className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">box run</code> instancie une sandbox éphémère, valide l'intégrité de l'archive, monte les volumes et démarre le runtime.
                  </p>
                </div>

                {/* Lifecycle of box run */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Cycle de vie d'une Sandbox éphémère
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Au lancement, Box ne pollue jamais votre système hôte :
                  </p>
                  <ol className="list-decimal list-inside text-xs text-zinc-600 dark:text-zinc-400 space-y-2 leading-relaxed pl-2 font-mono">
                    <li><strong className="text-zinc-900 dark:text-white">Extraction en mémoire :</strong> Le manifeste <code className="text-zinc-800 dark:text-zinc-200">boxfile.yml</code> est lu en tête d'archive sans décompresser la totalité du fichier sur disque.</li>
                    <li><strong className="text-zinc-900 dark:text-white">Vérification Fast-Integrity :</strong> La signature SHA-256 du flux de données est comparée à la signature scellée dans le manifeste (vérification en ~5 à 15 ms).</li>
                    <li><strong className="text-zinc-900 dark:text-white">Injection des variables d'environnement :</strong> Chargement du fichier <code className="text-zinc-800 dark:text-zinc-200">.env</code> et vérification de conformité avec <code className="text-zinc-800 dark:text-zinc-200">env_schema</code>.</li>
                    <li><strong className="text-zinc-900 dark:text-white">Montage des volumes :</strong> Rattachement des volumes persistants nommés ou dossiers hôtes aux points de montage internes.</li>
                    <li><strong className="text-zinc-900 dark:text-white">Exécution et Nettoyage :</strong> Le sous-processus est exécuté. Dès l'arrêt de l'application (SIGINT/SIGTERM ou terminaison normale), la sandbox éphémère est purgée du disque. Seuls les volumes persistants conservent leurs données.</li>
                  </ol>
                </div>

                {/* Options Table */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Flags et options de box run
                  </h3>
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 overflow-hidden text-xs">
                    <table className="w-full text-left font-mono">
                      <thead className="border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Flag</th>
                          <th className="py-3 px-4 font-semibold">Description</th>
                          <th className="py-3 px-4 font-semibold">Exemple</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">--env &lt;FILE&gt;</td>
                          <td className="py-3 px-4">Spécifie le fichier de variables d'environnement (par défaut : <code className="text-zinc-800 dark:text-zinc-200">.env.local</code>).</td>
                          <td className="py-3 px-4 text-zinc-500">--env .env.prod</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">-v, --volume &lt;spec&gt;</td>
                          <td className="py-3 px-4">Monte un volume persistant nommé (<code className="text-zinc-800 dark:text-zinc-200">nom:cible</code>) ou un dossier hôte (<code className="text-zinc-800 dark:text-zinc-200">./hote:cible</code>).</td>
                          <td className="py-3 px-4 text-zinc-500">-v db_volume:data</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">-p, --port &lt;PORT&gt;</td>
                          <td className="py-3 px-4">Définit le port d'écoute injecté dans l'environnement de l'application (<code className="text-zinc-800 dark:text-zinc-200">PORT</code>).</td>
                          <td className="py-3 px-4 text-zinc-500">-p 8080</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">-H, --host &lt;HOST&gt;</td>
                          <td className="py-3 px-4">Définit l'adresse d'hôte injectée dans l'environnement (<code className="text-zinc-800 dark:text-zinc-200">HOST</code>, défaut : 127.0.0.1).</td>
                          <td className="py-3 px-4 text-zinc-500">-H 0.0.0.0</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">-w, --workdir &lt;DIR&gt;</td>
                          <td className="py-3 px-4">Surcharge le répertoire de travail interne lors du lancement.</td>
                          <td className="py-3 px-4 text-zinc-500">-w app</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">--verify-files</td>
                          <td className="py-3 px-4">Active la vérification d'intégrité cryptographique stricte fichier par fichier.</td>
                          <td className="py-3 px-4 text-zinc-500">--verify-files</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Volumes Persistants */}
            {activeSection === "volumes" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Volumes Persistants
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Comprendre le fonctionnement du stockage persistant dans l'écosystème Box : comment conserver des données durables (bases SQLite, DuckDB, fichiers d'état) malgré la nature éphémère des sandboxes.
                  </p>
                </div>

                {/* Le Probleme et la Solution */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Le principe du stockage dans Box
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Chaque exécution <code className="font-mono text-xs">box run</code> s'effectue dans une sandbox temporaire isolée. À l'arrêt du processus, cette sandbox est intégralement supprimée pour ne laisser aucun déchet sur votre machine hôte.
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Pour les applications avec état (bases de données locales, fichiers téléversés, caches persistants), Box propose le système de <strong>volumes</strong>. Un volume crée un point de persistance permanent relié à la sandbox.
                  </p>
                </div>

                {/* 2 Types of Volumes */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Les deux types de volumes
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 space-y-3">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                        <Database className="h-4 w-4 text-zinc-500" />
                        <span>Volumes Nommés (Named Volumes)</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Gérés de manière centralisée par Box dans le magasin local de l'utilisateur (<code className="font-mono">~/.box/volumes/&lt;nom&gt;</code>). Idéal pour les bases SQLite ou DuckDB nécessitant une isolation propre sans encombrer votre répertoire de travail.
                      </p>
                      <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
                        <code>$ box run app.box -v db_store:data</code>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 space-y-3">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                        <FolderTree className="h-4 w-4 text-zinc-500" />
                        <span>Montages Répertoires Hôte (Bind Mounts)</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Relient directement un dossier existant sur votre machine hôte vers un dossier interne de l'application. Idéal pour partager des fichiers médias, des dossiers d'uploads ou des logs directement consultables depuis l'hôte.
                      </p>
                      <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
                        <code>$ box run app.box -v ./uploads:public/uploads</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step by Step Guide */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Guide pratique : Persister une base de données SQLite
                  </h3>

                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">1. Déclarer le volume et son point de montage dans boxconfig.yml :</span>
                      <p className="text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                        Lors du développement, vous associez le nom du volume au chemin interne où l'application écrit sa base ou ses fichiers :
                      </p>
                      <pre className="p-3 rounded-xl bg-zinc-950 text-zinc-300 overflow-x-auto">
{`volumes:
  - sqlite_data:data/db # nom_du_volume:dossier_interne (ex: écrit dans data/db/app.db)`}
                      </pre>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">2. Création et liaison automatiques à l'exécution :</span>
                      <p className="text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                        Dès que vous lancez la Box, le moteur détecte la déclaration et crée automatiquement un volume persistant dédié sans aucune intervention manuelle :
                      </p>
                      <pre className="p-3 rounded-xl bg-zinc-950 text-zinc-200 overflow-x-auto"><span className="text-orange-500 font-bold">$</span> box run backend-api.box</pre>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">3. Surcharge personnalisée (optionnel) :</span>
                      <p className="text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                        Si vous souhaitez lier un volume spécifique ou un dossier local de votre machine hôte, vous pouvez surcharger le point de montage avec le flag <code className="font-mono text-zinc-900 dark:text-white">-v</code> :
                      </p>
                      <pre className="p-3 rounded-xl bg-zinc-950 text-zinc-300 overflow-x-auto">
{`# Relier à un volume nommé personnalisé
$ box run backend-api.box -v mon_volume_perso:data/db

# Relier directement à un dossier local de votre machine
$ box run backend-api.box -v ./mes_donnees:data/db`}
                      </pre>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">4. Persistance effective :</span>
                      <p className="text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                        L'application écrit sa base SQLite dans <code className="font-mono">data/db/app.db</code>. Toutes les écritures sont conservées dans le volume persistant. À l'arrêt et à chaque redémarrage de la Box, vos tables, index et données restent intacts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Volume CLI Reference */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Commandes du gestionnaire de volumes (box volume)
                  </h3>

                  <div className="grid grid-cols-1 gap-3 text-xs font-mono">
                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box volume create &lt;nom&gt;</span>
                      <p className="text-zinc-500">Initialise un nouvel espace de stockage persistant nommé dans le gestionnaire local.</p>
                    </div>

                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box volume ls</span>
                      <p className="text-zinc-500">Liste tous les volumes existants avec leur nom, taille occupée sur disque et date de création.</p>
                    </div>

                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box volume inspect &lt;nom&gt;</span>
                      <p className="text-zinc-500">Affiche l'emplacement absolu sur l'hôte, le nombre de fichiers et la taille totale du volume.</p>
                    </div>

                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box volume rm &lt;nom&gt;</span>
                      <p className="text-zinc-500">Supprime définitivement un volume persistant et libère l'espace disque alloué.</p>
                    </div>

                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box volume prune</span>
                      <p className="text-zinc-500">Supprime tous les volumes non utilisés ou vides en une seule opération de nettoyage.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Variables d'Environnement */}
            {activeSection === "env" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Variables d'Environnement
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Box garantit la sécurité de vos clés et secrets en interdisant le codage en dur dans l'archive grâce à un système de validation déclarative de schéma.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Modèle de variables via env_schema
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Dans votre <code className="font-mono text-xs font-semibold">boxconfig.yml</code>, la directive <code className="font-mono text-xs font-semibold">env_schema</code> pointe vers un fichier de modèle (généralement <code className="font-mono text-xs">.env.example</code>) :
                  </p>

                  <div className="rounded-2xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-zinc-200 space-y-4">
                    <div className="space-y-1">
                      <span className="text-zinc-500">// 1. Déclaration dans boxconfig.yml</span>
                      <pre className="text-zinc-200">env_schema: .env.example</pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-zinc-500">// 2. Contenu du fichier .env.example</span>
                      <pre className="text-zinc-300 leading-relaxed">
{`# Variables obligatoires (laisser la valeur vide)
DATABASE_URL=
API_SECRET_KEY=

# Variables optionnelles (fournir la valeur par défaut de repli)
PORT=8000
DEBUG_MODE=false`}
                      </pre>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <Info className="h-4 w-4 text-zinc-500" />
                      <span>Comportement au lancement (Fail-Fast)</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Lorsque vous lancez <code className="font-mono">box run</code>, Box charge votre fichier local <code className="font-mono">.env.local</code> (ou le fichier passé via <code className="font-mono">--env</code>). Si une variable obligatoire sans valeur par défaut (comme <code className="font-mono">DATABASE_URL=</code>) est absente, le moteur stoppe immédiatement l'exécution avec une erreur explicite avant même de démarrer le code. Si une variable optionnelle est omise, sa valeur par défaut est automatiquement injectée.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Protection Bytecode */}
            {activeSection === "security" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Protection Bytecode
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Box intègre des mécanismes natifs pour garantir la non-altération des paquets et protéger vos algorithmes propriétaires.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Integrity */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                      Double vérification cryptographique SHA-256
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Chaque archive <code className="font-mono">.box</code> est scellée avec deux niveaux de contrôle :
                    </p>
                    <ul className="list-disc list-inside text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 leading-relaxed pl-2 font-mono">
                      <li><strong className="text-zinc-900 dark:text-white">payload_sha256 :</strong> Empreinte du flux global de données, vérifiée au vol à l'extraction en moins de 15 ms.</li>
                      <li><strong className="text-zinc-900 dark:text-white">tree_sha256 :</strong> Signature de l'arbre canonique des fichiers (chemins, tailles et empreintes unitaires), garantissant qu'aucun fichier n'a été inséré ou modifié après compilation.</li>
                    </ul>
                  </div>

                  {/* Bytecode Protection */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-4">
                    <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                      Protection du code source (protect: true)
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Lorsque l'option <code className="font-mono font-semibold text-zinc-900 dark:text-white">protect: true</code> est active, les sources originales ne sont jamais incluses dans l'archive distribuée :
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-2">
                        <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">Pour Python (CPython Bytecode)</span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          Tous les fichiers <code className="font-mono">.py</code> sont compilés en bytecode binaire <code className="font-mono">.pyc</code>. Les fichiers sources texte sont définitivement supprimés avant l'assemblage de l'archive.
                        </p>
                      </div>

                      <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-2">
                        <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">Pour Node.js / TypeScript (V8 Bytecode)</span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          Les scripts sont convertis en bytecode V8 autonome (<code className="font-mono">.jsc</code>). Le runtime exécute directement le cache compilé en mémoire sans exposer la logique JavaScript ou TypeScript en clair.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. Registre et Publication */}
            {activeSection === "registry" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Registre et Publication
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Box Cloud Registry permet de publier, versionner, partager et exécuter à distance vos paquets <code className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">.box</code> de manière publique ou privée.
                  </p>
                </div>

                {/* Workflow en 4 étapes */}
                <div className="space-y-6">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Publier et distribuer une Box sur le Registre
                  </h3>

                  {/* Étape 1 : Authentification */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">1</span>
                      <span>Authentifier le CLI avec un jeton d'accès (PAT)</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Générez un jeton d'accès personnel (Personal Access Token) depuis votre tableau de bord Box Hub, puis connectez votre machine hôte :
                    </p>
                    <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                      <span><span className="text-orange-500 font-bold">$</span> box login --token &lt;VOTRE_TOKEN&gt;</span>
                      <button
                        onClick={() => handleCopy("cli-login", "box login --token <VOTRE_TOKEN>")}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier"
                      >
                        {copiedCode === "cli-login" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Vous pouvez vérifier votre identité active à tout moment avec la commande <code className="text-zinc-900 dark:text-zinc-300">box whoami</code>.
                    </p>
                  </div>

                  {/* Étape 2 : Publication */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">2</span>
                      <span>Publier un paquet avec box push</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Téléversez votre archive sur le registre au format <code className="font-mono text-zinc-900 dark:text-white">&lt;utilisateur&gt;/&lt;paquet&gt;:&lt;version&gt;</code>. Par défaut, la visibilité est privée (utilisez <code className="font-mono text-zinc-900 dark:text-white">--public</code> pour rendre le paquet accessible à tous) :
                    </p>
                    <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                      <span><span className="text-orange-500 font-bold">$</span> box push mon-utilisateur/auth-service:1.0.0 --public</span>
                      <button
                        onClick={() => handleCopy("cli-push", "box push mon-utilisateur/auth-service:1.0.0 --public")}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier"
                      >
                        {copiedCode === "cli-push" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Étape 3 : Téléchargement et Pull */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">3</span>
                      <span>Télécharger avec box pull</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Récupérez une archive locale depuis le registre pour un déploiement hors ligne ou une inspection :
                    </p>
                    <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                      <span><span className="text-orange-500 font-bold">$</span> box pull mon-utilisateur/auth-service:1.0.0</span>
                      <button
                        onClick={() => handleCopy("cli-pull", "box pull mon-utilisateur/auth-service:1.0.0")}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier"
                      >
                        {copiedCode === "cli-pull" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Étape 4 : Exécution directe à distance (Auto-pull) */}
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px]">4</span>
                      <span>Exécution directe sans téléchargement préalable</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      La commande <code className="font-mono text-zinc-900 dark:text-white">box run</code> détecte automatiquement les balises distantes, télécharge l'archive en cache et lance la sandbox immédiatement :
                    </p>
                    <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                      <span><span className="text-orange-500 font-bold">$</span> box run mon-utilisateur/auth-service:latest -p 8080</span>
                      <button
                        onClick={() => handleCopy("cli-run-remote", "box run mon-utilisateur/auth-service:latest -p 8080")}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier"
                      >
                        {copiedCode === "cli-run-remote" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tableau des commandes de registre */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Référence des commandes de registre
                  </h3>
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 overflow-hidden text-xs">
                    <table className="w-full text-left font-mono">
                      <thead className="border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Commande</th>
                          <th className="py-3 px-4 font-semibold">Description</th>
                          <th className="py-3 px-4 font-semibold">Exemple</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">box login</td>
                          <td className="py-3 px-4">Authentifie le client avec un token PAT et enregistre la session dans la configuration locale.</td>
                          <td className="py-3 px-4 text-zinc-500">box login --token box_pat_xx</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">box whoami</td>
                          <td className="py-3 px-4">Affiche l'utilisateur actuellement authentifié et l'URL du registre actif.</td>
                          <td className="py-3 px-4 text-zinc-500">box whoami</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">box push &lt;tag&gt;</td>
                          <td className="py-3 px-4">Publie une archive locale sur le registre avec ses métadonnées et sa somme de contrôle SHA-256.</td>
                          <td className="py-3 px-4 text-zinc-500">box push user/app:1.0 --public</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">box pull &lt;tag&gt;</td>
                          <td className="py-3 px-4">Télécharge une archive depuis le registre vers le disque local.</td>
                          <td className="py-3 px-4 text-zinc-500">box pull user/app:1.0 -o app.box</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">box logout</td>
                          <td className="py-3 px-4">Supprime les identifiants enregistrés pour le registre spécifié.</td>
                          <td className="py-3 px-4 text-zinc-500">box logout</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 9. Inspection et Métadonnées */}
            {activeSection === "inspect" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Inspection et Métadonnées
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    La commande <code className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">box info</code> permet d'inspecter l'intégralité du contenu, des métadonnées, du schéma d'environnement et de la sécurité d'une archive sans jamais exécuter son code.
                  </p>
                </div>

                {/* Pourquoi inspecter */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Contrôle statique préalable
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Avant d'exécuter ou de déployer un paquet <code className="font-mono text-xs">.box</code> provenant d'un tiers, l'inspection statique permet de vérifier en une fraction de seconde la version de runtime requise, les ports réseau exposés, les volumes persistants déclarés et l'état de protection du bytecode.
                  </p>
                </div>

                {/* Exemple box info standard */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Inspection en ligne de commande
                  </h3>
                  <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                    <span><span className="text-orange-500 font-bold">$</span> box info auth-service.box</span>
                    <button
                      onClick={() => handleCopy("cli-info", "box info auth-service.box")}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Copier"
                    >
                      {copiedCode === "cli-info" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Sortie console formatée */}
                  <div className="rounded-2xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-zinc-200">
                    <div className="text-zinc-500 text-[11px] mb-2">// Sortie formatée retournée par le moteur CLI Rust :</div>
                    <pre className="overflow-x-auto text-zinc-300 leading-relaxed">
{`Package: auth-service 1.0.0 (4.12 MB)
------------------------------------------------------------
  Runtime:             python v3.12
  Entrypoint:          src/main.py (workdir: src)
  Protection:          [PROTECTED] Protected (Python Bytecode .pyc)
  Payload:             42 files packaged
  Payload SHA-256:     e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  Tree SHA-256:        a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e

Declared Persistent Volumes:
  • sqlite_data          -> data/db

Environment Schema Template (.env.example):
  DATABASE_URL=
  API_SECRET_KEY=
  PORT=8000
  DEBUG_MODE=false`}
                    </pre>
                  </div>
                </div>

                {/* Mode JSON pour l'automatisation CI/CD */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Sortie JSON pour l'automatisation CI/CD (--json)
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Le drapeau <code className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">--json</code> produit une sortie JSON structurée, idéale pour l'intégration dans vos pipelines de validation automatique, scripts de déploiement et tests d'intégration.
                  </p>

                  <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 flex items-center justify-between">
                    <span><span className="text-orange-500 font-bold">$</span> box info auth-service.box --json</span>
                    <button
                      onClick={() => handleCopy("cli-info-json", "box info auth-service.box --json")}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Copier"
                    >
                      {copiedCode === "cli-info-json" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-black/10 dark:border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-zinc-200">
                    <pre className="overflow-x-auto text-zinc-300 leading-relaxed">
{`{
  "name": "auth-service",
  "version": "1.0.0",
  "file": "auth-service.box",
  "size_bytes": 4320256,
  "runtime": {
    "type": "python",
    "version": "3.12"
  },
  "entrypoint": "src/main.py",
  "workdir": "src",
  "protected": true,
  "protection_type": "Protected (Python Bytecode .pyc)",
  "files_count": 42,
  "payload_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "tree_sha256": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "volumes": [
    "sqlite_data:data/db"
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* 10. Paramètres Globaux */}
            {activeSection === "settings" && (
              <div className="space-y-8">
                <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                    Paramètres Globaux
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Le CLI Box intègre un système de configuration hiérarchique et persistant permettant de personnaliser le registre cible, les répertoires de stockage, les miroirs de téléchargement et les performances de compression.
                  </p>
                </div>

                {/* Hiérarchie de configuration */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Priorité de résolution des paramètres
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    À chaque exécution, le moteur applique la priorité suivante :
                  </p>
                  <ol className="list-decimal list-inside text-xs text-zinc-600 dark:text-zinc-400 space-y-2 leading-relaxed pl-2 font-mono">
                    <li><strong className="text-zinc-900 dark:text-white">Variables d'environnement système :</strong> Les variables définies dans votre shell ou dans les fichiers <code className="text-zinc-800 dark:text-zinc-200">.env.local</code> / <code className="text-zinc-800 dark:text-zinc-200">.env</code> ont la priorité absolue.</li>
                    <li><strong className="text-zinc-900 dark:text-white">Fichier de configuration locale :</strong> Le fichier <code className="text-zinc-800 dark:text-zinc-200">~/.box/config.json</code> géré via la sous-commande <code className="text-zinc-800 dark:text-zinc-200">box config</code>.</li>
                    <li><strong className="text-zinc-900 dark:text-white">Valeurs par défaut intégrées :</strong> Les valeurs par défaut du moteur (ex: Hub officiel <code className="text-zinc-800 dark:text-zinc-200">https://boxhub.paxiz.org</code>, niveau de compression 3).</li>
                  </ol>
                </div>

                {/* Commandes box config */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Gestionnaire de configuration (box config)
                  </h3>

                  <div className="grid grid-cols-1 gap-3 text-xs font-mono">
                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box config list</span>
                      <p className="text-zinc-500">Affiche l'ensemble des clés de configuration définies et leurs valeurs actives.</p>
                    </div>

                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box config get &lt;cle&gt;</span>
                      <p className="text-zinc-500">Retourne la valeur d'une clé spécifique (ex: <code className="text-zinc-800 dark:text-zinc-200">box config get hub_url</code>).</p>
                    </div>

                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box config set &lt;cle&gt; &lt;valeur&gt;</span>
                      <p className="text-zinc-500">Définit et sauvegarde durablement un paramètre dans <code className="text-zinc-800 dark:text-zinc-200">~/.box/config.json</code>.</p>
                    </div>

                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 space-y-1.5">
                      <span className="font-bold text-zinc-950 dark:text-white">$ box config delete &lt;cle&gt;</span>
                      <p className="text-zinc-500">Supprime une clé de configuration et restaure son comportement par défaut.</p>
                    </div>
                  </div>
                </div>

                {/* Table exhaustive des variables et clés */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                    Variables d'environnement et clés reconnues
                  </h3>

                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 overflow-hidden text-xs">
                    <table className="w-full text-left font-mono">
                      <thead className="border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Variable d'Environnement</th>
                          <th className="py-3 px-4 font-semibold">Clé config.json</th>
                          <th className="py-3 px-4 font-semibold">Défaut</th>
                          <th className="py-3 px-4 font-semibold">Rôle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">BOX_HUB_URL</td>
                          <td className="py-3 px-4 text-zinc-500">hub_url</td>
                          <td className="py-3 px-4 text-zinc-500">https://boxhub.paxiz.org</td>
                          <td className="py-3 px-4 font-sans text-xs">URL du registre distant Box Hub pour les commandes push, pull et login.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">BOX_HOME</td>
                          <td className="py-3 px-4 text-zinc-500">-</td>
                          <td className="py-3 px-4 text-zinc-500">~/.box</td>
                          <td className="py-3 px-4 font-sans text-xs">Répertoire racine du gestionnaire local (stockage des runtimes, volumes et configurations).</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">BOX_RUNTIMES_DIR</td>
                          <td className="py-3 px-4 text-zinc-500">-</td>
                          <td className="py-3 px-4 text-zinc-500">~/.box/runtimes</td>
                          <td className="py-3 px-4 font-sans text-xs">Cache des runtimes autonomes téléchargés (Python CPython / Node.js).</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">BOX_VOLUMES_DIR</td>
                          <td className="py-3 px-4 text-zinc-500">-</td>
                          <td className="py-3 px-4 text-zinc-500">~/.box/volumes</td>
                          <td className="py-3 px-4 font-sans text-xs">Emplacement physique où sont créés et montés les volumes persistants nommés.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">BOX_COMPRESSION_LEVEL</td>
                          <td className="py-3 px-4 text-zinc-500">compression_level</td>
                          <td className="py-3 px-4 text-zinc-500">3</td>
                          <td className="py-3 px-4 font-sans text-xs">Niveau de compression Zstandard de 1 (le plus rapide) à 22 (compression maximale).</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">BOX_NETWORK_TIMEOUT</td>
                          <td className="py-3 px-4 text-zinc-500">network_timeout</td>
                          <td className="py-3 px-4 text-zinc-500">60</td>
                          <td className="py-3 px-4 font-sans text-xs">Délai d'expiration maximal (en secondes) pour les requêtes réseau vers le registre.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">BOX_PYTHON_MIRROR</td>
                          <td className="py-3 px-4 text-zinc-500">python_mirror</td>
                          <td className="py-3 px-4 text-zinc-500">python.org / github</td>
                          <td className="py-3 px-4 font-sans text-xs">URL d'un miroir alternatif pour le téléchargement des binaires Python autonomes.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">BOX_NODE_MIRROR</td>
                          <td className="py-3 px-4 text-zinc-500">node_mirror</td>
                          <td className="py-3 px-4 text-zinc-500">nodejs.org/dist</td>
                          <td className="py-3 px-4 font-sans text-xs">URL d'un miroir alternatif pour le téléchargement des binaires Node.js.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
