"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  TrendingUp,
  Users,
  Heart,
  HardDrive,
  Receipt,
  Loader2,
} from "lucide-react";
import { RevenueStats, PaymentTransaction } from "../../../lib/adminData";

export function AdminRevenueSection() {
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/revenue")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.revenue) setRevenue(data.data.revenue);
          if (data.data.recentPayments) setPayments(data.data.recentPayments);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement revenue:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !revenue) {
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
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxMonthRevenue = Math.max(...revenue.monthlyRevenueHistory.map((m) => m.revenue), 1);

  const tier10And20Rev = revenue.tierDistribution
    .filter((t) => t.name.includes("10") || t.name.includes("20"))
    .reduce((acc, curr) => acc + curr.monthlyRevenue, 0);
  const tier10And20Pct = revenue.mrrTotal > 0
    ? ((tier10And20Rev / revenue.mrrTotal) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      
      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Monthly Support Card */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Soutien Mensuel
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              {revenue.mrrTotal} € <span className="text-sm font-normal text-zinc-400">/ mois</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <TrendingUp className="h-3 w-3" />
              <span>+{revenue.mrrGrowthPct}% vs mois dernier</span>
            </div>
          </div>
        </div>

        {/* Paid Donators */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Membres Donateurs
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              {revenue.totalSubscribers}
            </div>
            <span className="text-[11px] text-zinc-500 block font-medium">
              {revenue.activeSubscribers} donateurs actifs
            </span>
          </div>
        </div>

        {/* ARPU */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Don Moyen / Membre
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              {revenue.totalSubscribers > 0 ? (revenue.mrrTotal / revenue.totalSubscribers).toFixed(2) : "0.00"} €
            </div>
            <span className="text-[11px] text-zinc-500 block font-medium">
              Contribution moyenne mensuelle
            </span>
          </div>
        </div>

        {/* Tier Sponsor Share */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Tiers 10 € et 20 €
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              {tier10And20Pct}%
            </div>
            <span className="text-[11px] text-zinc-500 block font-medium">
              Du financement mensuel
            </span>
          </div>
        </div>

      </div>

      {/* Monthly Revenue Growth Chart */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Soutien Mensuel
            </h3>
            <p className="text-xs text-zinc-500">
              Évolution des dons reçus pour les quotas de ressources étendues.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold self-start sm:self-auto">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Croissance Continue</span>
          </span>
        </div>

        {/* Visual Revenue Bar Chart */}
        <div className="pt-6">
          <div className="grid grid-cols-6 gap-3 sm:gap-8 items-end h-56 px-2 sm:px-6">
            {revenue.monthlyRevenueHistory.map((point, index) => {
              const heightPercentage = Math.round((point.revenue / maxMonthRevenue) * 100);
              const isHovered = hoveredMonth === index;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredMonth(index)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex flex-col items-center gap-3 h-full justify-end group cursor-pointer"
                >
                  <div
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-all ${
                      isHovered
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md scale-105"
                        : "text-zinc-400 opacity-80"
                    }`}
                  >
                    {point.revenue} €
                  </div>

                  <div className="w-full max-w-[56px] h-full bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden flex flex-col justify-end p-1">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isHovered ? "bg-emerald-500" : "bg-emerald-600"
                      }`}
                      style={{ height: `${Math.max(heightPercentage, 10)}%` }}
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <span
                      className={`text-xs font-semibold transition-colors ${
                        isHovered
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-zinc-500"
                      }`}
                    >
                      {point.month}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {point.subscribers} donateurs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2 Blocks: Tier Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tier Distribution */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Heart className="h-4 w-4 text-pink-500" />
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Répartition des Tiers de Soutien
            </h3>
          </div>

          <div className="space-y-4">
            {revenue.tierDistribution.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-950 dark:text-white">
                      {t.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black">
                      {t.subscribersCount} membres
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {t.monthlyRevenue} € / mois
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${t.color}`}
                    style={{ width: `${revenue.mrrTotal > 0 ? Math.round((t.monthlyRevenue / revenue.mrrTotal) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
            <Receipt className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Dernières Contributions
            </h3>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5 text-xs">
            {payments.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                Aucune transaction enregistrée pour le moment.
              </div>
            ) : (
              payments.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-950 dark:text-white truncate">
                        {tx.user}
                      </span>
                      <span className="text-[11px] text-zinc-500 truncate">
                        ({tx.email})
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 block truncate">
                      {tx.tierName} • {tx.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {tx.amount}
                    </span>
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      Payé
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
