"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "../../ui/Toast";

interface TokenItem {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Jamais";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 2) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Hier";
  if (diffDays < 30) return `Il y a ${diffDays} jours`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function TokensSection() {
  const { showToast } = useToast();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal de création
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenScope, setNewTokenScope] = useState<"read" | "write">("read");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal d'affichage unique du token créé
  const [createdTokenSecret, setCreatedTokenSecret] = useState<string | null>(null);
  const [hasCopiedSecret, setHasCopiedSecret] = useState(false);

  // Chargement des tokens
  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/tokens");
      const data = await res.json();
      if (data.success && Array.isArray(data.tokens)) {
        setTokens(data.tokens);
      }
    } catch {
      showToast("Impossible de charger les jetons d'accès.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/tokens?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setTokens((prev) => prev.filter((t) => t.id !== id));
        showToast("Jeton d'accès révoqué avec succès.", "success");
      } else {
        showToast(data.message || "Impossible de révoquer le jeton.", "error");
      }
    } catch {
      showToast("Erreur lors de la révocation du jeton.", "error");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/v1/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTokenName.trim(),
          scopeType: newTokenScope,
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        setTokens((prev) => [data.token, ...prev]);
        setCreatedTokenSecret(data.token.fullToken);
        setNewTokenName("");
        setShowGenerateModal(false);
        showToast("Jeton d'accès créé avec succès.", "success");
      } else {
        showToast(data.message || "Erreur lors de la création du jeton.", "error");
      }
    } catch {
      showToast("Une erreur réseau est survenue.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySecret = () => {
    if (!createdTokenSecret) return;
    navigator.clipboard.writeText(createdTokenSecret);
    setHasCopiedSecret(true);
    showToast("Jeton copié dans le presse-papier !", "success");
    setTimeout(() => setHasCopiedSecret(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
            Tokens d'accès
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Gérez vos jetons d'authentification pour le CLI Box ou les intégrations CI/CD.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Générer un Jeton</span>
        </button>
      </div>

      {/* Security Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
              Accès aux Box Privées
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Vos Box privées ne peuvent être téléchargées que par les machines munies d'un jeton d'accès valide.
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
              Révocation Immédiate
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            La suppression d'un jeton bloque instantanément toutes les commandes CLI et requêtes associées.
          </p>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
            <thead className="border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-5">Nom du Jeton</th>
                <th className="py-3.5 px-4">Clé Masquée</th>
                <th className="py-3.5 px-4">Permissions</th>
                <th className="py-3.5 px-4">Dernière Utilisation</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      <span>Chargement des jetons d'accès...</span>
                    </div>
                  </td>
                </tr>
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Aucun jeton actif. Cliquez sur "Générer un Jeton" pour en créer un.
                  </td>
                </tr>
              ) : (
                tokens.map((tok) => {
                  const isCopied = copiedId === tok.id;
                  const hasWrite = tok.scopes.includes("packages:write");
                  const scopeLabel = hasWrite ? "Lecture et Publication" : "Lecture seule (Pull)";

                  return (
                    <tr key={tok.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-zinc-950 dark:text-white">
                        {tok.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                        {tok.tokenPrefix}
                      </td>
                      <td className="py-3.5 px-4">
                        {/* Pure Solid Scope Badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs text-white ${
                          hasWrite ? "bg-orange-600" : "bg-emerald-600"
                        }`}>
                          {scopeLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-medium">
                        {formatRelativeTime(tok.lastUsedAt)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(tok.id, tok.tokenPrefix)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-orange-500 transition-all cursor-pointer shadow-xs"
                            title="Copier le préfixe"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>

                          {/* Delete Token Button */}
                          <button
                            onClick={() => handleDelete(tok.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                            title="Supprimer ce jeton"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                Nouveau Jeton d'accès
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Définissez les permissions accordées à ce token.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Nom du jeton
                </label>
                <input
                  type="text"
                  required
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="Ex: Token CLI Macbook Pro"
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-950 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Type d'accès
                </label>
                <select
                  value={newTokenScope}
                  onChange={(e) => setNewTokenScope(e.target.value as "read" | "write")}
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-xs text-zinc-950 dark:text-white focus:border-orange-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="read">Lecture seule (Télécharger les Box)</option>
                  <option value="write">Lecture et Publication (box push)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={isGenerating}
                  className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isGenerating ? "Génération..." : "Générer le Token"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Token Display Modal (Affichage unique à la création) */}
      {createdTokenSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Check className="h-4 w-4" />
                </div>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                  Jeton d'accès créé
                </h4>
              </div>
              <button
                onClick={() => setCreatedTokenSecret(null)}
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Copiez ce jeton dès maintenant !</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Pour des raisons de sécurité, cette clé secrète ne sera <strong>plus jamais affichée</strong>. Si vous la perdez, vous devrez générer un nouveau jeton.
              </p>
            </div>

            {/* Secret key box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                Votre clé secrète CLI :
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 p-2.5">
                <code className="text-xs font-mono text-zinc-950 dark:text-white break-all flex-1 select-all font-bold">
                  {createdTokenSecret}
                </code>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  {hasCopiedSecret ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCreatedTokenSecret(null)}
                className="rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black px-5 py-2 text-xs font-bold shadow-xs cursor-pointer"
              >
                J'ai bien enregistré ma clé
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
