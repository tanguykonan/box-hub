"use client";

import React, { useState, useEffect } from "react";
import {
  Cookie,
  ShieldCheck,
  Check,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    preferences: true,
  });

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem("box_hub_cookie_consent");
    if (!consent) {
      // Small timeout for smooth entrance animation after page mount
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(
      "box_hub_cookie_consent",
      JSON.stringify({
        ...prefs,
        date: new Date().toISOString(),
      })
    );
    window.dispatchEvent(
      new CustomEvent("boxhub_cookie_consent_changed", { detail: prefs })
    );
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      preferences: true,
    };
    saveConsent(allAccepted);
  };

  const handleRejectNonEssential = () => {
    const onlyEssential: CookiePreferences = {
      necessary: true,
      analytics: false,
      preferences: false,
    };
    saveConsent(onlyEssential);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Gestion des cookies"
      className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Cookie className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Cookies
              </h3>
              <span className="text-[11px] text-zinc-500 block">
                Gestion des cookies et données locales
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAcceptAll}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            title="Fermer et tout accepter"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Box Hub utilise des cookies essentiels pour maintenir votre session de connexion et vos préférences d'interface. Nous mesurons également anonymement l'usage des paquets pour améliorer le service.
        </p>

        {/* Accordion: Granular Details */}
        {showDetails && (
          <div className="space-y-2.5 pt-2 border-t border-black/5 dark:border-white/5 text-xs animate-in fade-in duration-150">
            
            {/* Category 1: Essential */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-zinc-950 dark:text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Cookies Essentiels (Requis)</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Authentification, jetons de session et sécurité du compte.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
                Toujours Actif
              </span>
            </div>

            {/* Category 2: Google Analytics */}
            <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-zinc-950 dark:text-white block">
                  Google Analytics
                </span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Mesure de la fréquentation, des pages consultées et de l'audience globale du site.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences({ ...preferences, analytics: e.target.checked })
                }
                className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0 cursor-pointer"
              />
            </label>

            {/* Category 3: Interface Preferences */}
            <label className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-zinc-950 dark:text-white block">
                  Préférences d'Interface
                </span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Mémorisation du thème sombre/clair et de l'état de la barre latérale.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.preferences}
                onChange={(e) =>
                  setPreferences({ ...preferences, preferences: e.target.checked })
                }
                className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0 cursor-pointer"
              />
            </label>

          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
          
          {/* Toggle Details Button */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer py-1 font-semibold"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{showDetails ? "Masquer" : "Personnaliser"}</span>
            {showDetails ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            {showDetails ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
              >
                Enregistrer mes choix
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-xs font-semibold cursor-pointer text-center"
              >
                Refuser
              </button>
            )}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
            >
              <Check className="h-3.5 w-3.5 text-white" />
              <span>Tout Accepter</span>
            </button>
          </div>

        </div>

      </div>
    </aside>
  );
}
