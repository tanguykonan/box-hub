"use client";

import React, { useState } from "react";
import {
  HardDrive,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Database,
  Terminal,
} from "lucide-react";

export function VolumesSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVolName, setNewVolName] = useState("");

  const volumes = [
    {
      id: "v1",
      name: "bot_db",
      size: "18.4 MB",
      type: "SQLite Database",
      mountedTo: "alex/discord-bot",
      targetPath: "/data/bot.db",
      status: "Monté",
      created: "Il y a 12 jours",
    },
    {
      id: "v2",
      name: "groq_cache",
      size: "14.2 MB",
      type: "Key-Value Cache",
      mountedTo: "alex/fastapi-groq",
      targetPath: "/cache",
      status: "Monté",
      created: "Il y a 6 jours",
    },
    {
      id: "v3",
      name: "telegram_data",
      size: "10.2 MB",
      type: "Logs et Sessions",
      mountedTo: "Non assigné",
      targetPath: "-",
      status: "Inactif",
      created: "Il y a 18 jours",
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Volume Explanation and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
            Gestionnaire de Volumes Persistants
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Stockage hermétique persistant conservant vos bases SQLite et caches entre chaque redémarrage.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-semibold shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Créer un Volume</span>
        </button>
      </div>

      {/* Volumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {volumes.map((vol) => {
          const mountCmd = `box volume inspect ${vol.name}`;
          const isCopied = copiedId === vol.id;

          return (
            <div
              key={vol.id}
              className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-5 backdrop-blur-md shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-mono text-zinc-950 dark:text-white">
                      {vol.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {vol.type}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                    vol.status === "Monté"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                  }`}
                >
                  {vol.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono border-t border-b border-black/5 dark:border-white/5 py-3 text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Taille:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-200">{vol.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Monté sur:</span>
                  <span className="text-zinc-900 dark:text-zinc-200 truncate max-w-[140px]">{vol.mountedTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cible:</span>
                  <span className="text-zinc-900 dark:text-zinc-200">{vol.targetPath}</span>
                </div>
              </div>

              {/* CLI Command */}
              <div
                onClick={() => handleCopy(vol.id, mountCmd)}
                className="flex items-center justify-between rounded-lg border border-black/10 dark:border-zinc-800 bg-zinc-50 dark:bg-black px-2.5 py-1.5 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-orange-500 transition-colors"
                title="Copier la commande d'inspection"
              >
                <span className="truncate">{mountCmd}</span>
                <button className="text-zinc-400 hover:text-white">
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Volume Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
            <h4 className="text-base font-bold text-zinc-950 dark:text-white mb-2">
              Créer un nouveau volume nommé
            </h4>
            <p className="text-xs text-zinc-500 mb-4">
              Ce volume sera alloué pour vos conteneurs Box locaux et synchronisables.
            </p>

            <input
              type="text"
              value={newVolName}
              onChange={(e) => setNewVolName(e.target.value)}
              placeholder="ex: app_database"
              className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono placeholder-zinc-400 focus:border-orange-500 focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black px-3.5 py-1.5 text-xs font-semibold"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

