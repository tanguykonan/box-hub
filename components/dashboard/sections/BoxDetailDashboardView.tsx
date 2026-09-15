"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Copy,
  Check,
  Terminal,
  Globe,
  Lock,
  Pencil,
  Trash2,
  ExternalLink,
  Sliders,
  Layers,
  Clock,
  AlertTriangle,
  ChevronDown,
  Plus,
  ShieldAlert,
  X,
} from "lucide-react";
import { EditBoxModal, EditableBoxData } from "../modals/EditBoxModal";
import { PublishBoxModal } from "../modals/PublishBoxModal";
import { MarkdownViewer } from "../../ui/MarkdownViewer";
import { ConfirmModal } from "../../ui/ConfirmModal";

export interface DashboardBoxVersion {
  tag: string;
  version: string;
  date: string;
  size: string;
  pulls: string;
  readme?: string;
  envExample?: string;
}

export interface DashboardBoxItem {
  id: string;
  name: string;
  author: string;
  version: string;
  tag: string;
  runtime: string;
  runtimeType: string;
  language?: string;
  size: string;
  pulls: string;
  visibility: "Public" | "Privé";
  category?: string;
  hash: string;
  updatedAt: string;
  description: string;
  readme?: string;
  envExample?: string;
  versions?: DashboardBoxVersion[];
}

interface BoxDetailDashboardViewProps {
  box: DashboardBoxItem;
  onBack: () => void;
  onUpdateBox: (updated: DashboardBoxItem) => void;
  onDeleteBox: (boxId: string) => void;
}

export function BoxDetailDashboardView({
  box,
  onBack,
  onUpdateBox,
  onDeleteBox,
}: BoxDetailDashboardViewProps) {
  // Ensure versions list exists
  const versionsList: DashboardBoxVersion[] =
    box.versions && box.versions.length > 0
      ? box.versions
      : [
          {
            tag: box.tag || "latest",
            version: box.version || "v1.0.0",
            date: box.updatedAt || "Recemment",
            size: box.size || "14.2 MB",
            pulls: box.pulls || "18.4k",
            readme: box.readme,
            envExample: box.envExample,
          },
        ];

  const [selectedTag, setSelectedTag] = useState<string>(box.tag || versionsList[0].tag);
  const [activeTab, setActiveTab] = useState<"readme" | "env" | "versions" | "danger">("readme");
  const [copiedPull, setCopiedPull] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedVersionCmd, setCopiedVersionCmd] = useState<string | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const activeVersion =
    versionsList.find((v) => v.tag === selectedTag) || versionsList[0];

  const pullCmd =
    box.visibility === "Public"
      ? `box pull ${box.author}/${box.name}:${activeVersion.tag}`
      : `box pull --token <VOTRE_TOKEN> ${box.author}/${box.name}:${activeVersion.tag}`;

  const envContent =
    activeVersion.envExample ||
    box.envExample ||
    `# Port HTTP\nPORT=8080\n\n# Cle API\nAPI_KEY=your_key_here`;
  const readmeContent = activeVersion.readme || box.readme || "";

  const handleCopy = (text: string, type: "pull" | "env") => {
    navigator.clipboard.writeText(text);
    if (type === "pull") {
      setCopiedPull(true);
      setTimeout(() => setCopiedPull(false), 2000);
    } else {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  const handleCopyVersionCmd = (vTag: string) => {
    const cmd =
      box.visibility === "Public"
        ? `box pull ${box.author}/${box.name}:${vTag}`
        : `box pull --token <VOTRE_TOKEN> ${box.author}/${box.name}:${vTag}`;
    navigator.clipboard.writeText(cmd);
    setCopiedVersionCmd(vTag);
    setTimeout(() => setCopiedVersionCmd(null), 2000);
  };

  const handleConfirmChangeVisibility = () => {
    const nextVis: "Public" | "Privé" = box.visibility === "Public" ? "Privé" : "Public";
    onUpdateBox({ ...box, visibility: nextVis });
    setIsVisibilityModalOpen(false);
  };

  const handleSaveEdit = (updated: EditableBoxData) => {
    onUpdateBox({
      ...box,
      description: updated.description,
      visibility: updated.visibility,
      category: updated.category,
      readme: updated.readme,
      envExample: updated.envExample,
    });
  };

  const handlePublishNewVersion = (newVerData: any) => {
    const newVersionItem: DashboardBoxVersion = {
      tag: newVerData.tag || `v1.0.${versionsList.length}`,
      version: newVerData.tag || `v1.0.${versionsList.length}`,
      date: "A l'instant",
      size: "14.5 MB",
      pulls: "0",
      readme: newVerData.readme || box.readme,
      envExample: newVerData.envExample || box.envExample,
    };

    const updatedVersions = [newVersionItem, ...versionsList];
    onUpdateBox({
      ...box,
      tag: newVersionItem.tag,
      version: newVersionItem.version,
      updatedAt: "A l'instant",
      readme: newVersionItem.readme,
      envExample: newVersionItem.envExample,
      versions: updatedVersions,
    });
    setSelectedTag(newVersionItem.tag);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/8 dark:border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Mes Box</span>
          </button>
          <span className="text-zinc-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-zinc-950 dark:text-white">
            {box.author}/{box.name}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {box.visibility === "Public" && (
            <Link
              href={`/box/${box.author}/${box.name}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <span>Page publique</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-3.5 py-1.5 text-xs font-medium hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Modifier</span>
          </button>
        </div>
      </div>

      {/* Main Info Card with Static Indicator */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6 backdrop-blur-md shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold font-mono text-zinc-950 dark:text-white tracking-tight">
                {box.author}/{box.name}
              </h2>

              {/* Interactive Version Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="appearance-none rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 pl-2.5 pr-7 py-1 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 hover:border-orange-500 focus:border-orange-500 focus:outline-none transition-colors cursor-pointer"
                  title="Changer de version active"
                >
                  {versionsList.map((v) => (
                    <option key={v.tag} value={v.tag}>
                      {v.tag === v.version ? v.tag : `${v.tag} • ${v.version}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-zinc-400" />
              </div>

              {/* Static Visibility Badge - Non-accidental */}
              <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 text-[10px] font-mono text-zinc-800 dark:text-zinc-200 font-medium">
                {box.visibility === "Public" ? (
                  <>
                    <Globe className="h-3 w-3 text-zinc-500" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 text-zinc-500" />
                    <span>Privé</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              {box.description || "Aucune description renseignee."}
            </p>

            <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 pt-1 flex-wrap">
              <span className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                {box.runtime}
              </span>
              <span>•</span>
              <span>{activeVersion.pulls} pulls</span>
              <span>•</span>
              <span>{activeVersion.size}</span>
              <span>•</span>
              <span>{activeVersion.date}</span>
            </div>
          </div>

          {/* Pull Command for Active Tag */}
          <div className="lg:w-96 shrink-0">
            <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-50 dark:bg-black p-3.5 font-mono text-xs shadow-sm space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1 border-b border-black/5 dark:border-zinc-800">
                <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-semibold">
                  <Terminal className="h-3.5 w-3.5 text-orange-500" />
                  <span>Telecharger</span>
                </span>
                <button
                  onClick={() => handleCopy(pullCmd, "pull")}
                  className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  {copiedPull ? (
                    <span className="text-emerald-500 font-bold">Copie</span>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-orange-600 dark:text-orange-400 truncate">$ {pullCmd}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Detail Tabs */}
      <div className="space-y-4">
        
        {/* Navigation */}
        <div className="flex border-b border-black/8 dark:border-white/10 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("readme")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "readme"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>README</span>
          </button>

          <button
            onClick={() => setActiveTab("env")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "env"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>.env</span>
          </button>

          <button
            onClick={() => setActiveTab("versions")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "versions"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Versions</span>
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "danger"
                ? "border-red-500 text-red-600 dark:text-red-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span>Danger</span>
          </button>
        </div>

        {/* Tab 1: Formatted README for active tag */}
        {activeTab === "readme" && (
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-6">
            <MarkdownViewer content={readmeContent} />
          </div>
        )}

        {/* Tab 2: Clean .env for active tag */}
        {activeTab === "env" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 shadow-sm space-y-2">
            <div className="flex items-center justify-end pb-2 border-b border-zinc-800/80">
              <button
                onClick={() => handleCopy(envContent, "env")}
                className="hover:text-white text-zinc-400 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
              >
                {copiedEnv ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copie</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto leading-relaxed text-zinc-300 font-mono text-xs selection:bg-orange-500/30 p-2">
              {envContent}
            </pre>
          </div>
        )}

        {/* Tab 3: Interactive Versions List + Release Action */}
        {activeTab === "versions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500">
                Historique des versions
              </span>

              <button
                type="button"
                onClick={() => setIsNewVersionModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-3 py-1.5 text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Publier une nouvelle version</span>
              </button>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-black/8 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-500">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Tag</th>
                    <th className="py-3 px-4 font-semibold">Version</th>
                    <th className="py-3 px-4 font-semibold">Taille</th>
                    <th className="py-3 px-4 font-semibold">Pulls</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {versionsList.map((v) => {
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
                                ? "bg-orange-500 text-white dark:bg-orange-400 dark:text-black"
                                : "bg-black/5 dark:bg-white/10"
                            }`}
                          >
                            {v.tag}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500">{v.version}</td>
                        <td className="py-3 px-4 text-zinc-500">{v.size}</td>
                        <td className="py-3 px-4 text-zinc-500">{v.pulls}</td>
                        <td className="py-3 px-4 text-zinc-500">{v.date}</td>
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
                                Activer
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyVersionCmd(v.tag)}
                              className="rounded border border-black/10 dark:border-white/10 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-orange-500 cursor-pointer"
                              title={`Copier la commande de téléchargement`}
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
          </div>
        )}

        {/* Tab 4: Danger Zone */}
        {activeTab === "danger" && (
          <div className="space-y-4">
            
            {/* Action 1: Change Visibility with Safety Gate */}
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/40 p-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    Changer la visibilité
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Actuellement <span className="font-bold text-zinc-800 dark:text-zinc-200">{box.visibility}</span>. {box.visibility === "Public" ? "Tout le monde peut télécharger ce paquet." : "Seuls les utilisateurs authentifiés avec un jeton peuvent télécharger ce paquet."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVisibilityModalOpen(true)}
                  className="rounded-xl border border-black/15 dark:border-white/15 bg-zinc-100 dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold hover:border-orange-500 transition-all cursor-pointer shrink-0"
                >
                  {box.visibility === "Public" ? "Rendre Privé" : "Rendre Public"}
                </button>
              </div>
            </div>

            {/* Action 2: Delete Box */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-red-600 dark:text-red-400">
                    Supprimer cette Box
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Action irréversible. Le paquet et toutes ses versions seront définitivement retirés du registre.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Supprimer la Box</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Visibility Confirmation Modal */}
      {isVisibilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsVisibilityModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/8 dark:border-white/10">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="text-sm font-bold">Confirmer le changement de visibilité</h3>
              </div>
              <button
                onClick={() => setIsVisibilityModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
              {box.visibility === "Public" ? (
                <p>
                  Vous êtes sur le point de rendre <span className="font-mono font-bold">{box.author}/{box.name}</span> <span className="font-bold text-amber-500">Privé</span>.
                  Le paquet ne sera plus visible dans le catalogue public et nécessitera un jeton d'authentification pour chaque téléchargement.
                </p>
              ) : (
                <p>
                  Vous êtes sur le point de rendre <span className="font-mono font-bold">{box.author}/{box.name}</span> <span className="font-bold text-emerald-500">Public</span>.
                  N'importe quel utilisateur pourra rechercher, consulter et télécharger ce paquet librement sans jeton.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/8 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsVisibilityModalOpen(false)}
                className="rounded-xl border border-black/10 dark:border-white/15 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmChangeVisibility}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer ${
                  box.visibility === "Public"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {box.visibility === "Public" ? "Confirmer le passage en Privé" : "Confirmer le passage en Public"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditBoxModal
        isOpen={isEditModalOpen}
        box={{
          id: box.id,
          name: box.name,
          author: box.author,
          version: activeVersion.version,
          tag: activeVersion.tag,
          visibility: box.visibility,
          description: box.description,
          readme: readmeContent,
          envExample: envContent,
        }}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Publish New Version Modal */}
      <PublishBoxModal
        isOpen={isNewVersionModalOpen}
        onClose={() => setIsNewVersionModalOpen(false)}
        onPublish={handlePublishNewVersion}
      />

      {/* Modern Confirmation Modal for Box Deletion */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDeleteBox(box.id)}
        title="Supprimer Définitivement la Box"
        description={`Êtes-vous sûr de vouloir supprimer définitivement la box "${box.author}/${box.name}" ? Cette action est irréversible et supprimera l'ensemble de ses versions du registre.`}
        confirmLabel="Supprimer la Box"
        cancelLabel="Annuler"
        variant="danger"
        iconType="delete"
      />

    </div>
  );
}

