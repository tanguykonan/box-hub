"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Save,
  Check,
  Upload,
  Globe,
  Lock,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface EditableBoxData {
  id: string;
  name: string;
  author: string;
  version: string;
  tag: string;
  visibility: "Public" | "Privé";
  category?: string;
  description: string;
  readme?: string;
  envExample?: string;
}

interface EditBoxModalProps {
  isOpen: boolean;
  box: EditableBoxData | null;
  onClose: () => void;
  onSave: (updatedBox: EditableBoxData) => void;
}

export function EditBoxModal({ isOpen, box, onClose, onSave }: EditBoxModalProps) {
  if (!isOpen || !box) return null;

  const [description, setDescription] = useState(box.description || "");
  const [visibility, setVisibility] = useState<"Public" | "Privé">(box.visibility || "Public");
  const [category, setCategory] = useState<string>(box.category || "bots");
  const [readme, setReadme] = useState(box.readme || "");
  const [envExample, setEnvExample] = useState(box.envExample || "");

  const [showEnvEditor, setShowEnvEditor] = useState(false);
  const [showReadmeEditor, setShowReadmeEditor] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const envFileInputRef = useRef<HTMLInputElement>(null);
  const readmeFileInputRef = useRef<HTMLInputElement>(null);

  const handleEnvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setEnvExample(content);
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
          setReadme(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...box,
      description,
      visibility,
      category,
      readme,
      envExample,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/8 dark:border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">{box.author} /</span>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white font-mono tracking-tight">
                {box.name}
              </h3>
              <span className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                {box.version}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Modifier la catégorie, visibilité, description, .env et README.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Category and Visibility row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Catégorie */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
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
              placeholder="Resume court..."
              className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-zinc-50 dark:bg-black px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* File Upload for .env.example */}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => envFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline cursor-pointer font-medium"
                >
                  <Upload className="h-3 w-3" />
                  <span>Importer .env.example</span>
                </button>
                {envExample && (
                  <button
                    type="button"
                    onClick={() => setShowEnvEditor(!showEnvEditor)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white inline-flex items-center gap-0.5 cursor-pointer ml-1"
                  >
                    <span>{showEnvEditor ? "Masquer texte" : "Editer texte"}</span>
                    {showEnvEditor ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>

            {envExample ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200">
                    <FileText className="h-3.5 w-3.5 text-orange-500" />
                    <span>.env.example charge</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnvExample("")}
                    className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {showEnvEditor && (
                  <textarea
                    rows={4}
                    value={envExample}
                    onChange={(e) => setEnvExample(e.target.value)}
                    placeholder="PORT=8080"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-xs text-zinc-200 focus:border-orange-500 focus:outline-none leading-relaxed"
                  />
                )}
              </div>
            ) : (
              <div
                onClick={() => envFileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-black/15 dark:border-white/15 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs text-zinc-400 hover:border-orange-500 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Aucun fichier .env.example (Cliquer pour importer)</span>
              </div>
            )}
          </div>

          {/* File Upload for README.md */}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => readmeFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline cursor-pointer font-medium"
                >
                  <Upload className="h-3 w-3" />
                  <span>Importer README.md</span>
                </button>
                {readme && (
                  <button
                    type="button"
                    onClick={() => setShowReadmeEditor(!showReadmeEditor)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white inline-flex items-center gap-0.5 cursor-pointer ml-1"
                  >
                    <span>{showReadmeEditor ? "Masquer texte" : "Editer texte"}</span>
                    {showReadmeEditor ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>

            {readme ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200">
                    <FileText className="h-3.5 w-3.5 text-emerald-500" />
                    <span>README.md charge</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReadme("")}
                    className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {showReadmeEditor && (
                  <textarea
                    rows={6}
                    value={readme}
                    onChange={(e) => setReadme(e.target.value)}
                    placeholder="Documentation..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-xs text-zinc-200 focus:border-orange-500 focus:outline-none leading-relaxed"
                  />
                )}
              </div>
            ) : (
              <div
                onClick={() => readmeFileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-black/15 dark:border-white/15 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs text-zinc-400 hover:border-orange-500 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Aucun README.md (Cliquer pour importer)</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-black/8 dark:border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/10 dark:border-white/15 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-1.5 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Enregistre</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

