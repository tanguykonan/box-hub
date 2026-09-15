"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastType = "error" | "success" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "error") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss après 5 secondes
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Notification Container (Flottant en bas à droite) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5 pointer-events-none w-full max-w-sm px-4 sm:px-0">
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 w-full rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 slide-in-from-right-4 ${
                isError
                  ? "bg-zinc-950 border-red-600 text-white"
                  : isSuccess
                  ? "bg-zinc-950 border-emerald-600 text-white"
                  : "bg-zinc-950 border-orange-600 text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs ${
                    isError
                      ? "bg-red-600 text-white"
                      : isSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-orange-600 text-white"
                  }`}
                >
                  {isError && <AlertCircle className="h-4 w-4" />}
                  {isSuccess && <CheckCircle2 className="h-4 w-4" />}
                  {!isError && !isSuccess && <Info className="h-4 w-4" />}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-relaxed text-zinc-100">
                    {toast.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-lg p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé à l'intérieur d'un ToastProvider");
  }
  return context;
}
