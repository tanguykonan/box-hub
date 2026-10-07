"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Box Hub Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors p-4">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Error Icon: Solid red background, white icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm">
          <AlertOctagon className="h-7 w-7" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight text-zinc-950 dark:text-white">
            Une interruption est survenue
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Une erreur inattendue s'est produite lors du traitement de votre requête.
          </p>
          {error.message && (
            <div className="mt-3 p-3 rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 text-left overflow-x-auto">
              {error.message}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-5 py-2.5 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Réessayer</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Accueil</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
