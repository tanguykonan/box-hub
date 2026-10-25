"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Terminal,
  Copy,
  Check,
  Globe,
  Lock,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";

interface PublishBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish?: (newBoxData: any) => void;
}

export function PublishBoxModal({
  isOpen,
  onClose,
  onPublish,
}: PublishBoxModalProps) {
  const [tab, setTab] = useState<"cli" | "web">("cli");
  const [copied, setCopied] = useState(false);
  
  // Web form states
  const [boxFile, setBoxFile] = useState<File | null>(null);
  const [boxName, setBoxName] = useState("");
  const [tag, setTag] = useState("latest");
  const [visibility, setVisibility] = useState<"Public" | "Privé">("Public");
  const [category, setCategory] = useState<"bots" | "api" | "tools" | "ai">("bots");
  const [description, setDescription] = useState("");
  
  // Uploaded files content et metadata
  const [envFile, setEnvFile] = useState<{ name: string; size: number; content: string } | null>(null);
  const [readmeFile, setReadmeFile] = useState<{ name: string; size: number; content: string } | null>(null);
  
  const [showEnvPreview, setShowEnvPreview] = useState(false);
  const [showReadmePreview, setShowReadmePreview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const boxFileInputRef = useRef<HTMLInputElement>(null);
  const envFileInputRef = useRef<HTMLInputElement>(null);
  const readmeFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const cleanPkg = boxName.trim() || "mon-app";
  const cliCommand = tag && tag.trim() !== "latest" && tag.trim() !== ""
    ? `box push ${cleanPkg}:${tag.trim()}`
    : `box push ${cleanPkg}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBoxFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBoxFile(file);
      if (!boxName) {
        const cleanName = file.name.replace(/\.box$/i, "").toLowerCase().replace(/[^a-z0-9_-]/g, "-");
        setBoxName(cleanName);
      }
    }
  };

  const handleEnvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setEnvFile({
            name: file.name,
            size: file.size,
            content,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReadmeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setReadmeFile({
            name: file.name,
            size: file.size,
            content,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleWebSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boxName.trim()) return;

    try {
      const res = await fetch("/api/v1/user/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: boxName.trim(),
          tag: tag || "latest",
          visibility,
          category,
          description: description || "Application autonome Box.",
          envExample: envFile ? envFile.content : "",
          readme: readmeFile ? readmeFile.content : "",
          fileSizeBytes: boxFile ? boxFile.size : 14500000,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onPublish) {
          onPublish(data.package);
        }
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          window.dispatchEvent(new Event("boxhub_packages_updated"));
        }, 600);
      }
    } catch (err) {
      console.error("Erreur publication web:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/8 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
              Publier une Box
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Deployez une archive sur votre registre.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-black/8 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/30 px-6 gap-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab("cli")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              tab === "cli"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Ligne de commande CLI
          </button>
          <button
            type="button"
            onClick={() => setTab("web")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              tab === "web"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Depot direct Web
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {tab === "cli" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Nom du paquet
                  </label>
                  <input
                    type="text"
                    value={boxName}
                    onChange={(e) => setBoxName(e.target.value)}
                    placeholder="mon-service"
                    className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono placeholder-zinc-400 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="latest"
                    className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono placeholder-zinc-400 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Terminal instructions */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                  <span className="text-orange-400">terminal</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copie</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-zinc-500"># 1. Compiler le paquet</p>
                  <p className="text-emerald-400">$ box build .</p>
                  <p className="text-zinc-500 pt-1"># 2. Pousser vers le Hub</p>
                  <p className="text-orange-400">$ {cliCommand}</p>
                </div>
              </div>

              {/* CLI Tab Footer */}
              <div className="pt-3 border-t border-black/8 dark:border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWebSubmit} className="space-y-4">
              
              {/* Box Archive Upload Dropzone */}
              <div>
                <input
                  type="file"
                  ref={boxFileInputRef}
                  onChange={handleBoxFileUpload}
                  accept=".box"
                  className="hidden"
                />
                {!boxFile ? (
                  <div
                    onClick={() => boxFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/15 dark:border-white/15 p-5 text-center hover:border-orange-500 transition-colors cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/30"
                  >
                    <Upload className="h-5 w-5 text-orange-500 mb-1" />
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      Glisser l'archive <span className="text-orange-500 font-mono">.box</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      Ou cliquer pour parcourir
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900">
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-900 dark:text-white">
                        <Package className="h-4 w-4 text-orange-500 shrink-0" />
                        <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{boxFile.name}</span>
                        <span className="text-[10px] text-zinc-400">• {formatFileSize(boxFile.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBoxFile(null)}
                        className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Name and Tag */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Nom du paquet
                  </label>
                  <input
                    type="text"
                    required
                    value={boxName}
                    onChange={(e) => setBoxName(e.target.value)}
                    placeholder="mon-app"
                    className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="latest"
                    className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category and Visibility row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Catégorie */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="bots">Bots et Automatisation</option>
                    <option value="api">Services et APIs</option>
                    <option value="tools">Outils et Utilitaires</option>
                    <option value="ai">Intelligence Artificielle</option>
                  </select>
                </div>

                {/* Visibilité */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Visibilité
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibility("Public")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        visibility === "Public"
                          ? "border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs"
                          : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium"
                      }`}
                    >
                      <Globe className={`h-3.5 w-3.5 ${visibility === "Public" ? "text-white" : ""}`} />
                      <span>Public</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility("Privé")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        visibility === "Privé"
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black font-bold shadow-xs"
                          : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium"
                      }`}
                    >
                      <Lock className={`h-3.5 w-3.5 ${visibility === "Privé" ? "text-white dark:text-black" : ""}`} />
                      <span>Privé</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Court resume..."
                  className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* 1-Click File Upload for .env.example */}
              <div className="border-t border-black/8 dark:border-white/10 pt-3 space-y-2">
                <input
                  type="file"
                  ref={envFileInputRef}
                  onChange={handleEnvFileUpload}
                  accept=".env,.env.example,.txt"
                  className="hidden"
                />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Variables .env
                  </span>
                  {!envFile ? (
                    <button
                      type="button"
                      onClick={() => envFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline cursor-pointer font-medium"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Importer .env.example</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEnvPreview(!showEnvPreview)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{showEnvPreview ? "Masquer" : "Voir"}</span>
                        {showEnvPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnvFile(null)}
                        className="text-zinc-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {envFile && (
                  <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200 font-semibold">
                      <FileText className="h-3.5 w-3.5 text-orange-500" />
                      <span>{envFile.name}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">• {formatFileSize(envFile.size)}</span>
                    </div>
                    {showEnvPreview && (
                      <pre className="mt-2 p-2 rounded-lg bg-zinc-950 text-zinc-300 text-[11px] overflow-x-auto">
                        {envFile.content}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* 1-Click File Upload for README.md */}
              <div className="border-t border-black/8 dark:border-white/10 pt-3 space-y-2">
                <input
                  type="file"
                  ref={readmeFileInputRef}
                  onChange={handleReadmeFileUpload}
                  accept=".md,.txt"
                  className="hidden"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Documentation README
                  </span>
                  {!readmeFile ? (
                    <button
                      type="button"
                      onClick={() => readmeFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline cursor-pointer font-medium"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Importer README.md</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReadmePreview(!showReadmePreview)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{showReadmePreview ? "Masquer" : "Voir"}</span>
                        {showReadmePreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadmeFile(null)}
                        className="text-zinc-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {readmeFile && (
                  <div className="rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200 font-semibold">
                      <FileText className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{readmeFile.name}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">• {formatFileSize(readmeFile.size)}</span>
                    </div>
                    {showReadmePreview && (
                      <pre className="mt-2 p-2 rounded-lg bg-zinc-950 text-zinc-300 text-[11px] overflow-x-auto max-h-36">
                        {readmeFile.content}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Form Footer Actions */}
              <div className="pt-3 border-t border-black/8 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isSuccess ? "Paquet publie" : "Publier"}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

