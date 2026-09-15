"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Download,
  Copy,
  Check,
  Globe,
  Lock,
  Pencil,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { EditBoxModal, EditableBoxData } from "../modals/EditBoxModal";
import { BoxDetailDashboardView, DashboardBoxItem } from "./BoxDetailDashboardView";
import { useToast } from "../../ui/Toast";

interface MyBoxesSectionProps {
  onOpenPublishModal: () => void;
}

export function MyBoxesSection({ onOpenPublishModal }: MyBoxesSectionProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingBox, setEditingBox] = useState<EditableBoxData | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [myPackages, setMyPackages] = useState<DashboardBoxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/user/packages");
      const data = await res.json();
      if (data.success && Array.isArray(data.packages)) {
        setMyPackages(data.packages);
      }
    } catch {
      showToast("Impossible de charger vos Box.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const selectedBox = myPackages.find((p) => p.id === selectedBoxId);

  const handleUpdateBox = async (updated: DashboardBoxItem) => {
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
        setMyPackages((prev) =>
          prev.map((pkg) => (pkg.id === updated.id ? updated : pkg))
        );
        showToast("Box mise à jour avec succès.", "success");
      }
    } catch {
      showToast("Erreur lors de la mise à jour de la Box.", "error");
    }
  };

  const handleDeleteBox = async (boxId: string) => {
    try {
      const res = await fetch(`/api/v1/user/packages?id=${boxId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMyPackages((prev) => prev.filter((p) => p.id !== boxId));
        setSelectedBoxId(null);
        showToast("Box supprimée avec succès.", "success");
      } else {
        showToast(data.message || "Impossible de supprimer la Box.", "error");
      }
    } catch {
      showToast("Erreur lors de la suppression de la Box.", "error");
    }
  };

  const handleSaveEditedBox = async (updated: EditableBoxData) => {
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
        setMyPackages((prev) =>
          prev.map((pkg) =>
            pkg.id === updated.id
              ? {
                  ...pkg,
                  description: updated.description,
                  visibility: updated.visibility,
                  category: updated.category,
                  readme: updated.readme || pkg.readme,
                  envExample: updated.envExample || pkg.envExample,
                }
              : pkg
          )
        );
        showToast("Modifications enregistrées.", "success");
      }
    } catch {
      showToast("Erreur lors de la sauvegarde.", "error");
    }
  };

  const filtered = myPackages.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (selectedBox) {
    return (
      <BoxDetailDashboardView
        box={selectedBox}
        onBack={() => setSelectedBoxId(null)}
        onUpdateBox={handleUpdateBox}
        onDeleteBox={handleDeleteBox}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer mes Box hébergées..."
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-3.5 py-2.5 pl-9 text-xs text-zinc-950 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none transition-colors"
          />
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
        </div>

        <button
          onClick={onOpenPublishModal}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Publier un paquet</span>
        </button>
      </div>

      {/* Package Registry Table */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[760px]">
            <thead className="border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-5">Paquet</th>
                <th className="py-3.5 px-4">Visibilité</th>
                <th className="py-3.5 px-4">Taille</th>
                <th className="py-3.5 px-4">Pulls</th>
                <th className="py-3.5 px-4">Téléchargement CLI</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      <span>Chargement de vos Box...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    {search ? "Aucune Box ne correspond à votre filtre." : "Vous n'avez pas encore publié de Box. Cliquez sur \"Publier un paquet\" pour commencer."}
                  </td>
                </tr>
              ) : (
                filtered.map((pkg) => {
                  const pullCmd = `box pull ${pkg.author}/${pkg.name}:${pkg.tag}`;
                  const isCopied = copiedId === pkg.id;
                  const isPublic = pkg.visibility === "Public";

                  return (
                    <tr key={pkg.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                      
                      {/* Click Package Name -> Stays in Dashboard */}
                      <td className="py-3.5 px-5">
                        <button
                          type="button"
                          onClick={() => setSelectedBoxId(pkg.id)}
                          className="text-left group cursor-pointer block"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:underline transition-colors font-mono">
                              {pkg.author}/{pkg.name}
                            </span>
                            
                            {/* Solid Pure Runtime Tag */}
                            <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded shadow-xs text-white ${
                              pkg.runtimeType === "python" ? "bg-orange-600" : "bg-emerald-600"
                            }`}>
                              {pkg.runtimeType === "python" ? "Python" : "Node.js"}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-normal mt-0.5">
                            {pkg.version} • {pkg.updatedAt}
                          </div>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        {/* Pure Solid Visibility Badge */}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs text-white ${
                          isPublic ? "bg-emerald-600" : "bg-amber-600"
                        }`}>
                          {isPublic ? (
                            <>
                              <Globe className="h-3 w-3 text-white" />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 text-white" />
                              <span>Protégé</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                        {pkg.size}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-zinc-950 dark:text-white">
                        {pkg.pulls}
                      </td>

                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => handleCopy(pkg.id, pullCmd)}
                          className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 cursor-pointer hover:border-orange-500 transition-colors shadow-xs"
                          title="Copier la commande de téléchargement"
                        >
                          <span className="text-orange-500 font-bold">$</span>
                          <span className="truncate max-w-[160px]">{pullCmd}</span>
                          <button className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white">
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions: Open in Dashboard */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedBoxId(pkg.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer shadow-xs"
                        >
                          <Pencil className="h-3.5 w-3.5 text-orange-500" />
                          <span>Gérer</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Box Modal */}
      <EditBoxModal
        isOpen={editingBox !== null}
        box={editingBox}
        onClose={() => setEditingBox(null)}
        onSave={handleSaveEditedBox}
      />

    </div>
  );
}
