"use client";

import React from "react";
import Link from "next/link";
import { Terminal, ArrowLeft, Search, Compass, AlertCircle } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-950 dark:text-white transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          
          {/* Big Minimal Monospace 404 */}
          <div className="space-y-2">
            <span className="text-7xl sm:text-9xl font-black font-mono tracking-tighter text-zinc-900 dark:text-zinc-100 select-none block">
              404
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono font-semibold text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Page Introuvable</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            L'adresse à laquelle vous tentez d'accéder n'existe pas ou a été déplacée.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black px-5 py-2.5 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retourner à l'Accueil</span>
            </Link>

            <Link
              href="/catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/15 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>Explorer le Catalogue</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
