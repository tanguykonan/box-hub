"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  HardDrive,
  Activity,
  Package,
  Layers,
  Award,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface RuntimeDistribution {
  name: string;
  percentage: number;
  pulls: string;
  color: string;
}

interface TopPackageItem {
  name: string;
  tag: string;
  pulls: string;
  share: string;
  runtime: string;
  runtimeColor: string;
}

export function AnalyticsSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState<{
    totalDownloadsFormatted: string;
    storageUsedMB: number;
    storageLimitMB: number;
    percentage: number;
    tier: string;
    bandwidthFormatted: string;
    distributionByRuntime: RuntimeDistribution[];
    topPackages: TopPackageItem[];
  }>({
    totalDownloadsFormatted: "0",
    storageUsedMB: 0.0,
    storageLimitMB: 500,
    percentage: 0,
    tier: "free",
    bandwidthFormatted: "0 MB",
    distributionByRuntime: [
      { name: "Python (UV / FastEngine)", percentage: 0, pulls: "0 pulls", color: "bg-orange-600" },
      { name: "Node.js (Bun / TypeScript)", percentage: 0, pulls: "0 pulls", color: "bg-emerald-600" },
    ],
    topPackages: [],
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/v1/user/stats");
        const data = await res.json();
        if (data.success && data.stats) {
          setStatsData({
            totalDownloadsFormatted: data.stats.totalDownloadsFormatted || "0",
            storageUsedMB: data.stats.storageUsedMB || 0.0,
            storageLimitMB: data.stats.storageLimitMB || 500,
            percentage: data.stats.percentage || 0,
            tier: data.stats.tier || "free",
            bandwidthFormatted: data.stats.bandwidthFormatted || "0 MB",
            distributionByRuntime: data.stats.distributionByRuntime || [],
            topPackages: data.stats.topPackages || [],
          });
        }
      } catch (err) {
        console.error("Erreur chargement analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const tierLabels: Record<string, string> = {
    free: "Gratuit (500 MB)",
    tier_5: "Sponsor 5 € (10 Go)",
    tier_10: "Donateur 10 € (30 Go)",
    tier_20: "Supporter 20 € (100 Go)",
  };

  const stats = [
    {
      label: "Téléchargements Totaux",
      value: statsData.totalDownloadsFormatted,
      change: "Pulls cumulés",
      icon: Download,
      iconBg: "bg-orange-600 text-white",
    },
    {
      label: "Stockage Personnel",
      value: `${statsData.storageUsedMB} MB`,
      change: `sur ${statsData.storageLimitMB >= 1000 ? `${statsData.storageLimitMB / 1000} GB` : `${statsData.storageLimitMB} MB`} (${tierLabels[statsData.tier] || "Gratuit"})`,
      icon: Package,
      iconBg: "bg-pink-600 text-white",
    },
    {
      label: "Bande Passante Sortante",
      value: statsData.bandwidthFormatted,
      change: "Trafic mondial estimé",
      icon: HardDrive,
      iconBg: "bg-emerald-600 text-white",
    },
  ];

  return (
    <div className="space-y-6">
      
      <div>
        <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
          Statistiques de Téléchargement
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Suivi des téléchargements et de la popularité de vos paquets Box.
        </p>
      </div>

      {/* Top Metric Cards with Solid Color Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs uppercase tracking-wider font-semibold">
                  {s.label}
                </span>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold shadow-xs ${s.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                  {isLoading ? "..." : s.value}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <TrendingUp className="h-3 w-3" />
                  <span>{s.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution by Runtime et Top Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Runtime Breakdown */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Layers className="h-4 w-4 text-orange-500" />
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
              Répartition par Runtime
            </h4>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              <span>Calcul des métriques...</span>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {statsData.distributionByRuntime.map((r, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.name}
                    </span>
                    <span className="text-zinc-500 font-medium">
                      {r.pulls} ({r.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.color} transition-all duration-500`}
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Pulled Packages */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Award className="h-4 w-4 text-pink-500" />
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
              Paquets les Plus Téléchargés
            </h4>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
              <span>Chargement du classement...</span>
            </div>
          ) : statsData.topPackages.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-black/10 dark:border-white/10 rounded-xl">
              Aucun paquet publié pour le moment.
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {statsData.topPackages.map((box, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 hover:border-black/15 dark:hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-xs ${
                      i === 0 ? "bg-orange-600" : i === 1 ? "bg-emerald-600" : i === 2 ? "bg-pink-600" : "bg-zinc-800"
                    }`}>
                      {i + 1}
                    </span>
                    
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-950 dark:text-white font-mono truncate block">
                        {box.name}
                      </span>
                    </div>

                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold text-white shadow-xs ${box.runtimeColor}`}>
                      {box.runtime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-500 font-medium shrink-0">
                    <span className="font-bold text-zinc-950 dark:text-white">{box.pulls}</span>
                    <span className="rounded bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                      {box.share}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
