"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Download,
  Users,
  HardDrive,
  Database,
  Layers,
  FolderTree,
  Loader2,
  Bot,
  Server,
  Wrench,
  BrainCircuit,
} from "lucide-react";
import { PlatformAnalytics } from "../../../lib/adminData";

const categoryIcons: Record<string, React.ElementType> = {
  bots: Bot,
  api: Server,
  tools: Wrench,
  ai: BrainCircuit,
};

export function AdminAnalyticsSection() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricView, setMetricView] = useState<"pulls" | "signups" | "bandwidth">("pulls");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement télémétrie:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !analytics) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* 4 Core Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-8 w-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="space-y-2">
                <div className="h-7 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 space-y-6">
          <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
        </div>

        {/* 2 Breakdown Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 space-y-4">
            <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-14 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 space-y-4">
            <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-14 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxPullValue = Math.max(...analytics.weeklyHistory.map((d) => d.pulls), 1);
  const maxSignupValue = Math.max(...analytics.weeklyHistory.map((d) => d.signups), 1);
  const maxBandwidthValue = Math.max(...analytics.weeklyHistory.map((d) => d.bandwidthGB), 1);

  const totalBoxesCount = analytics.categoryDistribution.reduce((acc, curr) => acc + curr.boxesCount, 0);

  return (
    <div className="space-y-8">
      
      {/* 4 Core Macro Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Pulls */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Pulls Globaux
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Download className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              {analytics.totalPulls.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <TrendingUp className="h-3 w-3" />
              <span>+{analytics.pullsGrowthPct}% ce mois</span>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Développeurs
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              {analytics.totalUsers}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <TrendingUp className="h-3 w-3" />
              <span>+{analytics.usersGrowthPct}% ce mois</span>
            </div>
          </div>
        </div>

        {/* Bandwidth */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Bande Passante
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              {analytics.bandwidthConsumedTB} <span className="text-base font-normal text-zinc-400">TB</span>
            </div>
            <span className="text-[11px] text-zinc-500 block font-medium">
              Trafic sortant CDN mondial
            </span>
          </div>
        </div>

        {/* Global Storage */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Stockage Global
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              {analytics.storageUsedGB} <span className="text-base font-normal text-zinc-400">/ {analytics.storageLimitGB} GB</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-1.5 flex-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-pink-600"
                  style={{ width: `${analytics.storageLimitGB > 0 ? Math.min(100, Math.round((analytics.storageUsedGB / analytics.storageLimitGB) * 100)) : 0}%` }}
                />
              </div>
              <span className="text-[11px] text-zinc-500 font-bold">
                {analytics.storageLimitGB > 0 ? Math.min(100, Math.round((analytics.storageUsedGB / analytics.storageLimitGB) * 100)) : 0}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Interactive Chart: Weekly Activity */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-6">
        
        {/* Chart Header & Metric Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Activité Hebdomadaire
            </h3>
            <p className="text-xs text-zinc-500">
              Téléchargements CLI, nouvelles inscriptions et bande passante.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 text-xs">
            <button
              type="button"
              onClick={() => setMetricView("pulls")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                metricView === "pulls"
                  ? "bg-white dark:bg-black text-zinc-950 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Pulls CLI
            </button>
            <button
              type="button"
              onClick={() => setMetricView("signups")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                metricView === "signups"
                  ? "bg-white dark:bg-black text-zinc-950 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Inscriptions
            </button>
            <button
              type="button"
              onClick={() => setMetricView("bandwidth")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                metricView === "bandwidth"
                  ? "bg-white dark:bg-black text-zinc-950 dark:text-white font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Bande passante (GB)
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-6 items-end h-52 px-2 sm:px-4">
            {analytics.weeklyHistory.map((point, index) => {
              const currentVal =
                metricView === "pulls"
                  ? point.pulls
                  : metricView === "signups"
                  ? point.signups
                  : point.bandwidthGB;

              const maxVal =
                metricView === "pulls"
                  ? maxPullValue
                  : metricView === "signups"
                  ? maxSignupValue
                  : maxBandwidthValue;

              const heightPercentage = Math.round((currentVal / maxVal) * 100);
              const isHovered = hoveredPoint === index;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex flex-col items-center gap-2.5 h-full justify-end group cursor-pointer"
                >
                  <div
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                      isHovered
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md scale-105"
                        : "text-zinc-400 opacity-80"
                    }`}
                  >
                    {metricView === "pulls"
                      ? `${point.pulls.toLocaleString()}`
                      : metricView === "signups"
                      ? `+${point.signups}`
                      : `${point.bandwidthGB} GB`}
                  </div>

                  <div className="w-full max-w-[48px] h-full bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden flex flex-col justify-end p-1">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isHovered
                          ? "bg-orange-500"
                          : metricView === "pulls"
                          ? "bg-orange-600"
                          : metricView === "signups"
                          ? "bg-emerald-600"
                          : "bg-zinc-800 dark:bg-zinc-200"
                      }`}
                      style={{ height: `${Math.max(heightPercentage, 8)}%` }}
                    />
                  </div>

                  <span
                    className={`text-xs transition-colors ${
                      isHovered
                        ? "text-orange-600 dark:text-orange-400 font-bold"
                        : "text-zinc-500 font-medium"
                    }`}
                  >
                    {point.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2 Bottom Breakdown Grids: Runtimes & Categories Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Runtime Ecosystem Distribution */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Layers className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Répartition des Runtimes Utilisés
            </h3>
          </div>

          <div className="space-y-4">
            {analytics.runtimeDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </span>
                  <span className="text-zinc-500 font-medium">
                    {item.count.toLocaleString()} pulls ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Database Categories Distribution */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Répartition des Boxes par Catégorie
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black">
              {totalBoxesCount} boxes
            </span>
          </div>

          <div className="space-y-4">
            {analytics.categoryDistribution.map((item, idx) => {
              const Icon = categoryIcons[item.key] || FolderTree;
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-zinc-500 font-medium">
                      {item.boxesCount} boxes ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
