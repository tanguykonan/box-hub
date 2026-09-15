"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  Download,
  Terminal,
  Layers,
  ArrowUpDown,
  Sparkles,
  Bot,
  Server,
  Wrench,
  BrainCircuit,
  SlidersHorizontal,
  X,
  Copy,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

interface CatalogBoxItem {
  id: string;
  name: string;
  author: string;
  authorAvatar?: string | null;
  authorTier?: string;
  version: string;
  tag: string;
  size: string;
  pulls: string;
  pullsCount: number;
  stars: number;
  runtime: {
    type: "python" | "node";
    version: string;
    runtimeName: string;
  };
  language?: string;
  protected: boolean;
  category: string;
  tags?: string[];
  description: string;
  updatedAt: string;
}

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRuntime, setSelectedRuntime] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyProtected, setOnlyProtected] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"stars" | "pulls">("stars");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [boxes, setBoxes] = useState<CatalogBoxItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCatalog = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedRuntime !== "all") params.set("runtime", selectedRuntime);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (onlyProtected) params.set("protected", "true");
      params.set("sortBy", sortBy);
      params.set("limit", "50");

      const res = await fetch(`/api/v1/packages/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.packages)) {
        setBoxes(data.packages);
      }
    } catch (err) {
      console.error("Erreur chargement catalogue:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRuntime, selectedCategory, onlyProtected, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCatalog]);

  const handleCopyCmd = (e: React.MouseEvent, id: string, cmd: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: "all", label: "Toutes les catégories", icon: Layers },
    { id: "bots", label: "Bots et Automatisation", icon: Bot },
    { id: "api", label: "Services et APIs", icon: Server },
    { id: "tools", label: "Outils et Utilitaires", icon: Wrench },
    { id: "ai", label: "Intelligence Artificielle", icon: BrainCircuit },
  ];

  const runtimes = [
    { id: "all", label: "Tous les runtimes" },
    { id: "python", label: "Python" },
    { id: "node", label: "Node.js" },
  ];

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRuntime("all");
    setSelectedCategory("all");
    setOnlyProtected(false);
    setSortBy("stars");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedRuntime !== "all" ||
    selectedCategory !== "all" ||
    onlyProtected ||
    sortBy !== "stars";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header Breadcrumb et Titre */}
        <div className="space-y-3 border-b border-black/8 dark:border-white/10 pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="font-bold text-zinc-900 dark:text-white">Catalogue</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-mono">
                Catalogue des Applications
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Explorez l'écosystème des paquets autonomes scellés au format <code className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">.box</code>. Téléchargez et exécutez des outils conçus par d'autres développeurs.
              </p>
            </div>

            <div className="text-xs font-mono text-zinc-500 shrink-0">
              <span className="font-bold text-zinc-950 dark:text-white text-sm">
                {boxes.length}
              </span>{" "}
              paquet{boxes.length > 1 ? "s" : ""} disponible{boxes.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Search and Filter Toolbar */}
        <div className="space-y-4">
          
          {/* Main Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une application, un outil conçu par d'autres..."
              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-950/80 pl-11 pr-10 py-3.5 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Chips and Sorting Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            
            {/* Left: Category and Runtime Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Runtime Pill Selector */}
              <div className="flex items-center p-1 rounded-xl border border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono">
                {runtimes.map((rt) => (
                  <button
                    key={rt.id}
                    onClick={() => setSelectedRuntime(rt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedRuntime === rt.id
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>

              {/* Bytecode Protection Filter Toggle */}
              <button
                onClick={() => setOnlyProtected(!onlyProtected)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  onlyProtected
                    ? "border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs"
                    : "border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                <span>Bytecode protégé</span>
              </button>
            </div>

            {/* Right: Sorting Dropdown */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500 flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Trier par :</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="stars">Popularité (Étoiles)</option>
                <option value="pulls">Téléchargements (Pulls)</option>
              </select>
            </div>

          </div>

          {/* Category Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none border-b border-black/5 dark:border-white/5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                      : "bg-zinc-100/70 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Boxes Grid or Loading / Empty State */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-xs font-mono text-zinc-500">Chargement du catalogue...</span>
          </div>
        ) : boxes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {boxes.map((box) => {
              const pullCmd = `box pull ${box.author}/${box.name}:${box.tag}`;
              const isCopied = copiedId === box.id;

              return (
                <div
                  key={box.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 backdrop-blur-md shadow-xs transition-all duration-200 hover:border-black/25 dark:hover:border-white/25 hover:shadow-md"
                >
                  {/* Top Meta: Author, Name and Tags */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/box/${box.author}/${box.name}`}
                        className="group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                      >
                        <span className="text-xs font-mono text-zinc-500">
                          {box.author} /
                        </span>
                        <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white tracking-tight leading-snug">
                          {box.name}
                        </h3>
                      </Link>

                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 shrink-0">
                        {box.tag}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {box.description}
                    </p>
                  </div>

                  {/* Badges and Metrics Row */}
                  <div className="pt-5 space-y-3.5 border-t border-black/6 dark:border-white/8 mt-5">
                    
                    {/* Runtime and Protection Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium">
                        {box.runtime.type === "python" ? "Python" : "Node.js"} {box.runtime.version}
                      </span>

                      {box.protected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-medium">
                          <ShieldCheck className="h-3 w-3 text-white" />
                          <span>Bytecode</span>
                        </span>
                      )}

                      <span className="text-zinc-400 ml-auto">
                        {box.size}
                      </span>
                    </div>

                    {/* Stats (Stars and Pulls) + CLI Pull Action */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      
                      {/* Pulls and Stars Counts */}
                      <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{box.stars}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{box.pulls}</span>
                        </span>
                      </div>

                      {/* Pull Command Copy Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyCmd(e, box.id, pullCmd)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${
                          isCopied
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-semibold"
                            : "border-black/10 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white"
                        }`}
                        title={pullCmd}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span>Copié</span>
                          </>
                        ) : (
                          <>
                            <Terminal className="h-3 w-3 text-zinc-400" />
                            <span>box pull</span>
                          </>
                        )}
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 bg-zinc-50/50 dark:bg-zinc-950/50 p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                Aucun paquet trouvé
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                Aucune application Box ne correspond à votre recherche <span className="font-mono text-zinc-900 dark:text-white">« {searchQuery} »</span> avec les filtres sélectionnés.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Réinitialiser tous les filtres</span>
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
