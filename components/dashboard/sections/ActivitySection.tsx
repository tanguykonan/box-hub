"use client";

import React, { useState } from "react";
import {
  Activity,
  Terminal,
  Smartphone,
  Check,
  Filter,
  Download,
  Clock,
} from "lucide-react";

export function ActivitySection() {
  const [filterType, setFilterType] = useState<"all" | "cli" | "android">("all");

  const logs = [
    {
      id: "l1",
      timestamp: "Aujourd'hui 14:32:08",
      platform: "CLI",
      platformType: "cli",
      action: "box run alex/discord-bot:latest -v bot_db:data",
      status: "Succès",
      duration: "0.84s boot",
      ip: "127.0.0.1 (Localhost)",
    },
    {
      id: "l2",
      timestamp: "Aujourd'hui 14:28:44",
      platform: "Android",
      platformType: "android",
      action: "Exécution Companion Foreground Service (WakeLock)",
      status: "Succès",
      duration: "1.12s boot",
      ip: "Pixel 8 Pro (Android 15)",
    },
    {
      id: "l3",
      timestamp: "Aujourd'hui 13:50:12",
      platform: "CLI",
      platformType: "cli",
      action: "box build . -> alex/fastapi-groq:v1.2.0",
      status: "Succès",
      duration: "2.31s compilation",
      ip: "127.0.0.1 (Localhost)",
    },
    {
      id: "l4",
      timestamp: "Aujourd'hui 12:15:30",
      platform: "CLI",
      platformType: "cli",
      action: "box volume inspect bot_db",
      status: "Succès",
      duration: "0.04s query",
      ip: "127.0.0.1 (Localhost)",
    },
    {
      id: "l5",
      timestamp: "Hier 22:10:04",
      platform: "Android",
      platformType: "android",
      action: "Exécution alex/ollama-bridge:latest",
      status: "Succès",
      duration: "0.45s sync",
      ip: "Pixel 8 Pro (Android 15)",
    },
    {
      id: "l6",
      timestamp: "Hier 19:40:19",
      platform: "CLI",
      platformType: "cli",
      action: "box push alex/discord-bot:v1.0.4",
      status: "Succès",
      duration: "1.80s upload",
      ip: "127.0.0.1 (Localhost)",
    },
  ];

  const filtered = logs.filter((l) => {
    if (filterType === "cli") return l.platformType === "cli";
    if (filterType === "android") return l.platformType === "android";
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Filter and Export Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
            Journal d'Activité et Exécutions
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Historique temps réel des compilations, lancements CLI et déploiements mobiles.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 p-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterType === "all"
                ? "bg-white dark:bg-black text-zinc-950 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Tout
          </button>
          <button
            onClick={() => setFilterType("cli")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterType === "cli"
                ? "bg-white dark:bg-black text-zinc-950 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            CLI Core
          </button>
          <button
            onClick={() => setFilterType("android")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterType === "android"
                ? "bg-white dark:bg-black text-zinc-950 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Android Runner
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Horodatage</th>
                <th className="py-3 px-4 font-semibold">Plateforme</th>
                <th className="py-3 px-4 font-semibold">Commande / Événement</th>
                <th className="py-3 px-4 font-semibold">Latence / Durée</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {log.platformType === "cli" ? (
                        <span className="inline-flex items-center gap-1 rounded border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-800 dark:text-zinc-200">
                          <Terminal className="h-3 w-3 text-orange-500" />
                          <span>CLI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded border border-[#7F52FF]/30 bg-[#7F52FF]/15 px-2 py-0.5 text-[10px] text-[#7F52FF]">
                          <Smartphone className="h-3 w-3" />
                          <span>Android</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-950 dark:text-white max-w-md truncate">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                    {log.duration}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                      <Check className="h-3.5 w-3.5" />
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

