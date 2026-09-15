"use client";

import React from "react";
import { AlertTriangle, LogOut, Trash2, ShieldAlert, X } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "neutral";
  iconType?: "danger" | "logout" | "delete" | "shield";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  iconType = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (iconType) {
      case "logout":
        return <LogOut className="h-4 w-4 text-white" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-white" />;
      case "shield":
        return <ShieldAlert className="h-4 w-4 text-white" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-white" />;
    }
  };

  const getIconBg = () => {
    if (variant === "warning") return "bg-orange-600";
    if (variant === "neutral") return "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black";
    return "bg-red-600";
  };

  const getConfirmBtnClass = () => {
    if (variant === "warning") {
      return "bg-orange-600 hover:bg-orange-700 text-white";
    }
    if (variant === "neutral") {
      return "bg-zinc-950 text-white dark:bg-white dark:text-black";
    }
    return "bg-red-600 hover:bg-red-700 text-white";
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold shadow-xs ${getIconBg()}`}>
              {getIcon()}
            </div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {description}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${getConfirmBtnClass()}`}
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
