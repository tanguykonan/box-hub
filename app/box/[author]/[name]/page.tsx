"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Copy,
  Check,
  Terminal,
  Clock,
  Layers,
  Sliders,
  Pencil,
  Lock,
  ChevronDown,
  Tag,
  ArrowRight,
  Star,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "../../../../components/layout/Navbar";
import { Footer } from "../../../../components/layout/Footer";
import { EditBoxModal, EditableBoxData } from "../../../../components/dashboard/modals/EditBoxModal";
import { MarkdownViewer } from "../../../../components/ui/MarkdownViewer";
import { useToast } from "../../../../components/ui/Toast";

interface BoxVersionItem {
  id: string;
  tag: string;
  version: string;
  versionRaw?: string;
  date: string;
  dateRaw?: string;
  size: string;
  sizeBytes?: number;
  pulls: string;
  pullsCount?: number;
  checksumSha256?: string;
  targetArch?: string;
  readme?: string;
  envExample?: string;
}

interface DetailedBox {
  id: string;
  name: string;
  author: string;
  authorAvatar?: string | null;
  authorTier?: string;
  isOwner?: boolean;
  isPrivate?: boolean;
  isProtected?: boolean;
  tag: string;
  version: string;
  updatedAt: string;
  description: string;
  size: string;
  pulls: string;
  pullsCount?: number;
  stars: number;
  isStarred: boolean;
  runtime: {
    type: "python" | "node";
    version: string;
    runtimeName: string;
  };
  language?: string;
  protected?: boolean;
  category: string;
  tags?: string[];
  license?: string;
  boxConfig?: {
    entrypoint: string;
    network: string;
    volumes: string[];
    ports?: string[];
  };
  envExample: string;
  readme: string;
  versions: BoxVersionItem[];
}

export default function BoxDetailPage() {
  const params = useParams();
  const author = params?.author as string;
  const name = params?.name as string;
  const { showToast } = useToast();

  const [box, setBox] = useState<DetailedBox | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTag, setSelectedTag] = useState<string>("latest");
  const [activeTab, setActiveTab] = useState<"readme" | "env" | "versions">("readme");
  
  const [copiedPull, setCopiedPull] = useState(false);
  const [copiedRun, setCopiedRun] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedVersionCmd, setCopiedVersionCmd] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStarring, setIsStarring] = useState(false);

  useEffect(() => {
    if (!author || !name) return;

    const fetchBox = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/packages/${encodeURIComponent(author)}/${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.success && data.box) {
          setBox(data.box);
          setSelectedTag(data.box.tag || "latest");
        } else {
          setBox(null);
        }
      } catch (err) {
        console.error("Erreur chargement détail box:", err);
        setBox(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBox();
  }, [author, name]);

  const handleToggleStar = async () => {
    if (!box || isStarring) return;
    setIsStarring(true);
    try {
      const res = await fetch(`/api/v1/packages/${encodeURIComponent(author)}/${encodeURIComponent(name)}/star`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.status === 401) {
        showToast("Veuillez vous connecter pour aimer ce paquet.", "info");
        return;
      }
      if (data.success) {
        setBox((prev) =>
          prev
            ? {
                ...prev,
                isStarred: data.isStarred,
                stars: data.starsCount,
              }
            : null
        );
      }
    } catch {
      showToast("Erreur lors de la mise à jour de l'étoile.", "error");
    } finally {
      setIsStarring(false);
    }
  };

  const handleCopy = (text: string, type: "pull" | "run" | "env") => {
    navigator.clipboard.writeText(text);
    if (type === "pull") {
      setCopiedPull(true);
      setTimeout(() => setCopiedPull(false), 2000);
    } else if (type === "run") {
      setCopiedRun(true);
      setTimeout(() => setCopiedRun(false), 2000);
    } else {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  const handleCopyVersionCmd = (vTag: string) => {
    const cmd = `box pull ${box?.author}/${box?.name}:${vTag}`;
    navigator.clipboard.writeText(cmd);
    setCopiedVersionCmd(vTag);
    setTimeout(() => setCopiedVersionCmd(null), 2000);
  };

  const handleSaveBox = async (updated: EditableBoxData) => {
    try {
      const res = await fetch("/api/v1/user/packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          description: updated.description,
          visibility: updated.visibility,
          category: updated.category,
          readme: updated.readme,
          envExample: updated.envExample,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBox((prev) =>
          prev
            ? {
                ...prev,
                description: updated.description,
                isPrivate: updated.visibility === "Privé",
                category: updated.category || prev.category,
                readme: updated.readme || prev.readme,
                envExample: updated.envExample || prev.envExample,
              }
            : null
        );
        showToast("Modifications enregistrées.", "success");
      }
    } catch {
      showToast("Erreur lors de la sauvegarde.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-3" />
          <p className="text-xs font-mono text-zinc-500">Chargement de la Box...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!box) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 text-zinc-400">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold font-mono text-zinc-950 dark:text-white mb-2">
            Paquet introuvable ou privé
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
            Le paquet <span className="font-mono text-zinc-900 dark:text-white">{author}/{name}</span> n'existe pas ou est configuré en accès privé.
          </p>
          <Link
            href="/catalog"
            className="rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-semibold hover:scale-105 active:scale-95 transition-all"
          >
            Retourner au catalogue public
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Find active version data
  const currentVersionData: BoxVersionItem =
    box.versions.find((v) => v.tag === selectedTag) || box.versions[0] || {
      id: "latest",
      tag: box.tag,
      version: box.version,
      date: box.updatedAt,
      size: box.size,
      pulls: box.pulls,
    };

  const pullCmd = `box pull ${box.author}/${box.name}:${currentVersionData.tag}`;
  const runCmd = `box run ${box.author}/${box.name}:${currentVersionData.tag}`;
  const activeReadme = currentVersionData.readme || box.readme;
  const activeEnv = currentVersionData.envExample || box.envExample || "# Aucune variable requise.";
  const isOwner = Boolean(box.isOwner);

  const tierBadgeLabel: Record<string, string> = {
    free: "Gratuit",
    tier_5: "Sponsor",
    tier_10: "Donateur",
    tier_20: "Supporter",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Catalogue</span>
            </Link>
            <span>/</span>
            <span>{box.author}</span>
            <span>/</span>
            <span className="font-bold text-zinc-950 dark:text-white">{box.name}</span>
          </div>

          {isOwner && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer shadow-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Modifier</span>
            </button>
          )}
        </div>

        {/* Top Header Card with Interactive Version Switcher */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-950/70 p-6 sm:p-8 backdrop-blur-md shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            
            {/* Left Box Title, Interactive Version Selector et Description */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono text-zinc-500">
                  {box.author} /
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-mono">
                  {box.name}
                </h1>

                {/* Interactive Version / Tag Dropdown */}
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="appearance-none rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 pl-2.5 pr-7 py-1 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 hover:border-orange-500 focus:border-orange-500 focus:outline-none transition-colors cursor-pointer"
                    title="Changer de version"
                  >
                    {box.versions.map((v) => (
                      <option key={v.tag} value={v.tag}>
                        {v.tag === v.version ? v.tag : `${v.tag} • ${v.version}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-zinc-400" />
                </div>

                {/* Pure Solid Color Runtime Tag */}
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded shadow-xs text-white ${
                  box.runtime.type === "python" ? "bg-orange-600" : "bg-emerald-600"
                }`}>
                  {box.runtime.type === "python" ? "Python" : "Node.js"}
                </span>

                {box.protected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold shadow-xs">
                    <ShieldCheck className="h-3 w-3 text-white" />
                    <span>Bytecode</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
                {box.description}
              </p>

              {/* Dynamic specs for the selected version & Star button */}
              <div className="flex items-center gap-3 flex-wrap pt-1 text-xs font-mono text-zinc-500">
                <span className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  {box.runtime.runtimeName}
                </span>
                <span>•</span>
                
                {/* Interactive Star Button */}
                <button
                  type="button"
                  onClick={handleToggleStar}
                  disabled={isStarring}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    box.isStarred
                      ? "border-amber-400/50 bg-amber-400/10 text-amber-500 font-bold shadow-xs"
                      : "border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-amber-400 hover:text-amber-500"
                  }`}
                  title={box.isStarred ? "Retirer l'étoile" : "Ajouter une étoile"}
                >
                  <Star className={`h-3.5 w-3.5 ${box.isStarred ? "text-amber-400 fill-amber-400" : "text-zinc-400"}`} />
                  <span>{box.stars}</span>
                  <span className="text-[10px] opacity-80">Star</span>
                </button>

                <span>•</span>
                <span>{currentVersionData.pulls} pulls</span>
                <span>•</span>
                <span>{currentVersionData.size}</span>
                <span>•</span>
                <span>{currentVersionData.date}</span>
              </div>
            </div>

            {/* Right Pull et Run Commands for Selected Tag */}
            <div className="lg:w-96 shrink-0 space-y-2">
              <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-white dark:bg-black p-3.5 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 pb-1.5 border-b border-black/5 dark:border-zinc-800">
                  <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                    <Terminal className="h-3.5 w-3.5 text-orange-500" />
                    <span>Télécharger</span>
                  </span>
                  <button
                    onClick={() => handleCopy(pullCmd, "pull")}
                    className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    {copiedPull ? (
                      <span className="text-emerald-500 font-bold">Copié</span>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-zinc-800 dark:text-zinc-200 truncate"><span className="text-orange-500 font-bold">$</span> {pullCmd}</p>
              </div>

              <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-white dark:bg-black p-3.5 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 pb-1.5 border-b border-black/5 dark:border-zinc-800">
                  <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                    <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Exécuter</span>
                  </span>
                  <button
                    onClick={() => handleCopy(runCmd, "run")}
                    className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    {copiedRun ? (
                      <span className="text-emerald-500 font-bold">Copié</span>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-zinc-800 dark:text-zinc-200 truncate"><span className="text-orange-500 font-bold">$</span> {runCmd}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Content Layout: Clean Tabs (Left 8 Cols) + Minimal Sidebar (Right 4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Minimal Clean Tabs */}
            <div className="flex border-b border-black/10 dark:border-white/10 gap-6 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("readme")}
                className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "readme"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>README</span>
              </button>

              <button
                onClick={() => setActiveTab("env")}
                className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "env"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>.env</span>
              </button>

              <button
                onClick={() => setActiveTab("versions")}
                className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "versions"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Versions</span>
              </button>
            </div>

            {/* Tab 1: Formatted README (for active tag) */}
            {activeTab === "readme" && (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
                <MarkdownViewer content={activeReadme} />
              </div>
            )}

            {/* Tab 2: Clean .env view (for active tag) */}
            {activeTab === "env" && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 shadow-sm space-y-2">
                <div className="flex items-center justify-end pb-2 border-b border-zinc-800/80">
                  <button
                    onClick={() => handleCopy(activeEnv, "env")}
                    className="hover:text-white text-zinc-400 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                  >
                    {copiedEnv ? (
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
                <pre className="overflow-x-auto leading-relaxed text-zinc-300 font-mono text-xs selection:bg-cyan-500/30 p-2">
                  {activeEnv}
                </pre>
              </div>
            )}

            {/* Tab 3: Interactive Versions List */}
            {activeTab === "versions" && (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Tag</th>
                      <th className="py-3 px-4 font-semibold">Version</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Taille</th>
                      <th className="py-3 px-4 font-semibold">Pulls</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {box.versions.map((v) => {
                      const isCurrent = v.tag === selectedTag;
                      const isCopied = copiedVersionCmd === v.tag;

                      return (
                        <tr
                          key={v.tag}
                          onClick={() => setSelectedTag(v.tag)}
                          className={`transition-colors cursor-pointer ${
                            isCurrent
                              ? "bg-orange-500/5 dark:bg-orange-500/10"
                              : "hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-zinc-950 dark:text-white">
                            <span
                              className={`rounded px-1.5 py-0.5 ${
                                isCurrent
                                  ? "bg-orange-600 text-white font-semibold"
                                  : "bg-black/5 dark:bg-white/10"
                              }`}
                            >
                              {v.tag}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-500">{v.version}</td>
                          <td className="py-3 px-4 text-zinc-500">{v.date}</td>
                          <td className="py-3 px-4 text-zinc-500">{v.size}</td>
                          <td className="py-3 px-4 text-zinc-500">{v.pulls}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {isCurrent ? (
                                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold uppercase">
                                  Actif
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedTag(v.tag)}
                                  className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:underline cursor-pointer"
                                >
                                  Consulter
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCopyVersionCmd(v.tag)}
                                className="rounded border border-black/10 dark:border-white/10 p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-orange-500 cursor-pointer"
                                title={`Copier box pull ${box.author}/${box.name}:${v.tag}`}
                              >
                                {isCopied ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

          {/* Sidebar Area: Minimal Specs et Author */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Specs Card */}
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 backdrop-blur-md shadow-sm space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-zinc-500">Version active</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{currentVersionData.tag}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-zinc-500">Taille</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-200">{currentVersionData.size}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Pulls</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-200">{currentVersionData.pulls}</span>
              </div>
            </div>

            {/* Author Card */}
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono font-bold text-xs shadow-sm uppercase border border-black/10 dark:border-white/10">
                  {box.author[0]}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-950 dark:text-white font-mono">
                    {box.author}
                  </span>
                  {box.authorTier && box.authorTier !== "free" && (
                    <span className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 text-[9px] font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                      {tierBadgeLabel[box.authorTier] || "Supporter"}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Edit Modal for Owner */}
      {isOwner && (
        <EditBoxModal
          isOpen={isEditOpen}
          box={{
            id: box.id,
            name: box.name,
            author: box.author,
            version: currentVersionData.version,
            tag: currentVersionData.tag,
            visibility: box.isPrivate ? "Privé" : "Public",
            category: box.category,
            description: box.description,
            readme: activeReadme,
            envExample: activeEnv,
          }}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveBox}
        />
      )}

      <Footer />
    </div>
  );
}
