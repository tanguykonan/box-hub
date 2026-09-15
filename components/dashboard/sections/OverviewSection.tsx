"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Lock,
  Download,
  Search,
  Copy,
  Check,
  Terminal,
  Key,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";

interface OverviewSectionProps {
  onNavigateTab: (tabId: string) => void;
  onOpenPublishModal: () => void;
}

interface UserStats {
  publicBoxes: number;
  protectedBoxes: number;
  totalDownloads: number;
  storageUsedMB: number;
  storageLimitMB: number;
  percentage: number;
  tier: string;
}

interface CommunityBox {
  id: string;
  author: string;
  name: string;
  version: string;
  tag: string;
  size: string;
  pulls: string;
  runtime: string | { type: string; version: string; runtimeName: string };
  runtimeColor?: string;
  description: string;
}

function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR");
}

export function OverviewSection({
  onNavigateTab,
  onOpenPublishModal,
}: OverviewSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [stats, setStats] = useState<UserStats>({
    publicBoxes: 0,
    protectedBoxes: 0,
    totalDownloads: 0,
    storageUsedMB: 0,
    storageLimitMB: 500,
    percentage: 0,
    tier: "free",
  });
  const [communityPublicBoxes, setCommunityPublicBoxes] = useState<CommunityBox[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, searchRes] = await Promise.all([
          fetch("/api/v1/user/stats").then((r) => r.json()).catch(() => null),
          fetch("/api/v1/packages/search?limit=10").then((r) => r.json()).catch(() => null),
        ]);

        if (statsRes?.success && statsRes?.stats) {
          setStats(statsRes.stats);
        }
        if (searchRes?.success && Array.isArray(searchRes?.packages)) {
          setCommunityPublicBoxes(searchRes.packages);
        }
      } catch (err) {
        console.error("Erreur chargement vue d'ensemble:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 3 Solid Color KPI Cards
  const kpis = [
    {
      label: "Box Publiques",
      value: formatNumber(stats.publicBoxes),
      change: "Visibles et téléchargeables",
      icon: Globe,
      iconBg: "bg-emerald-600 text-white",
    },
    {
      label: "Box Privées",
      value: formatNumber(stats.protectedBoxes),
      change: "Visibles par vous uniquement",
      icon: Lock,
      iconBg: "bg-orange-600 text-white",
    },
    {
      label: "Téléchargements Globaux",
      value: formatNumber(stats.totalDownloads),
      change: "Pulls cumulés",
      icon: Download,
      iconBg: "bg-pink-600 text-white",
    },
  ];

  const filteredBoxes = communityPublicBoxes.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* 3 KPI Cards with Pure Solid Color Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs uppercase tracking-wider font-semibold">
                  {kpi.label}
                </span>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold shadow-xs ${kpi.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                  {isLoading ? "..." : kpi.value}
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">
                  {kpi.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left 8 Cols (Rechercher des Box Publiques) + Right 4 Cols (Déploiement Terminal) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (8 cols): Public Boxes Search Explorer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Rechercher des Box Publiques
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Explorez et téléchargez les Box partagées par la communauté.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab("boxes")}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer self-start sm:self-auto"
              >
                Gérer mes Box
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une Box publique..."
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 pl-10 text-xs text-zinc-950 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none transition-colors"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            </div>

            {/* Public Boxes List with Pure Solid Color Runtime Tags */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  <span>Chargement des Box publiques...</span>
                </div>
              ) : filteredBoxes.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                  Aucune Box ne correspond à votre recherche.
                </div>
              ) : (
                filteredBoxes.map((b) => {
                  const pullCmd = `box pull ${b.author}/${b.name}:${b.tag}`;
                  const isCopied = copiedId === b.id;

                  return (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-xl border border-black/8 dark:border-white/8 bg-zinc-50 dark:bg-zinc-900/60 p-4 transition-all hover:border-black/20 dark:hover:border-white/20"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/box/${b.author}/${b.name}`}
                            target="_blank"
                            className="font-bold text-xs text-zinc-950 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 hover:underline transition-colors inline-flex items-center gap-1 font-mono"
                          >
                            <span>{b.author}/{b.name}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </Link>
                          
                          {/* Solid Runtime Badge */}
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold shadow-xs text-white ${
                            (typeof b.runtime === "object" ? b.runtime.type === "python" : String(b.runtime).toLowerCase().includes("python"))
                              ? "bg-orange-600"
                              : "bg-emerald-600"
                          }`}>
                            {typeof b.runtime === "object" ? (b.runtime.type === "python" ? "Python" : "Node.js") : b.runtime}
                          </span>

                          <span className="rounded bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-800 dark:text-zinc-200">
                            {b.version}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1">
                          {b.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-medium">
                          <span>{b.pulls} pulls</span>
                          <span>•</span>
                          <span>{b.size}</span>
                        </div>
                      </div>

                      {/* Pull Command Snippet with 1-click copy */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <div
                          onClick={() => handleCopy(b.id, pullCmd)}
                          className="flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-zinc-800 bg-white dark:bg-black px-2.5 py-1.5 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 cursor-pointer hover:border-orange-500 transition-colors shadow-xs"
                          title="Copier la commande de téléchargement"
                        >
                          <span className="text-orange-500 font-bold">$</span>
                          <span className="truncate max-w-[140px] sm:max-w-[170px]">{pullCmd}</span>
                          <button className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white">
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Right (4 cols): Déploiement Terminal */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 text-zinc-950 dark:text-white font-bold text-sm">
                <Terminal className="h-4 w-4 text-orange-500" />
                <span>Déploiement Terminal</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Publiez vos paquets directement depuis votre CLI Box.
              </p>
            </div>

            {/* Code Block */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 font-mono text-[11px] text-zinc-300 space-y-2">
              <div>
                <p className="text-zinc-500 text-[10px]"># 1. Compiler votre projet</p>
                <p className="text-emerald-400 font-bold">$ box build .</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px]"># 2. Pousser vers le Hub</p>
                <p className="text-orange-400 font-bold">$ box push alex/mon-app:v1.0.0</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={onOpenPublishModal}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white py-2.5 text-xs font-bold shadow-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-center"
              >
                <Plus className="h-4 w-4" />
                <span>Publier une Box</span>
              </button>
              
              <button
                onClick={() => onNavigateTab("tokens")}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white py-1 transition-colors cursor-pointer font-semibold"
              >
                <Key className="h-3 w-3" />
                <span>Gérer les tokens d'accès</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
