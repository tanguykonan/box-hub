"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

interface AdminHeaderProps {
  activeTabTitle: string;
  onOpenSidebar: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminHeader({
  activeTabTitle,
  onOpenSidebar,
  isCollapsed,
  onToggleCollapse,
}: AdminHeaderProps) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    // Initial fetch from database
    fetch("/api/v1/admin/settings/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.maintenance === "boolean") {
          setIsMaintenance(data.maintenance);
          localStorage.setItem("boxhub_maintenance_mode", String(data.maintenance));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem("boxhub_maintenance_mode");
        if (saved === "true") {
          setIsMaintenance(true);
        }
      });
  }, []);

  const handleOpenMaintenanceModal = () => {
    setIsModalOpen(true);
  };

  const handleConfirmToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isToggling) return;
    setIsToggling(true);

    const nextState = !isMaintenance;

    try {
      const res = await fetch("/api/v1/admin/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance: nextState }),
      });
      const data = await res.json();
      if (data.success && typeof data.maintenance === "boolean") {
        setIsMaintenance(data.maintenance);
        localStorage.setItem("boxhub_maintenance_mode", String(data.maintenance));
      } else {
        setIsMaintenance(nextState);
        localStorage.setItem("boxhub_maintenance_mode", String(nextState));
      }
    } catch {
      setIsMaintenance(nextState);
      localStorage.setItem("boxhub_maintenance_mode", String(nextState));
    } finally {
      window.dispatchEvent(new Event("boxhub_maintenance_change"));
      setIsToggling(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors">
        
        {/* Left: Collapse / Mobile Drawer Toggles & Active Tab */}
        <div className="flex items-center gap-3">
          
          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="p-2 rounded-xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white lg:hidden cursor-pointer"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 hover:border-orange-500/50 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title={isCollapsed ? "Déplier la barre latérale" : "Plier la barre latérale"}
            aria-label={isCollapsed ? "Déplier la barre latérale" : "Plier la barre latérale"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-orange-500" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
              {activeTabTitle}
            </h1>
            
            {isMaintenance ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Mode Maintenance Actif
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Plateforme Opérationnelle
              </span>
            )}
          </div>
        </div>

        {/* Right: Mode Maintenance Button + Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Protected Maintenance Action Trigger */}
          <button
            type="button"
            onClick={handleOpenMaintenanceModal}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isMaintenance
                ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400"
            }`}
            title="Gérer le mode maintenance"
          >
            {isMaintenance ? (
              <>
                <Lock className="h-3.5 w-3.5 text-white" />
                <span>Maintenance Active</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>Mode Maintenance</span>
              </>
            )}
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Secure Maintenance Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold shadow-xs ${
                  isMaintenance ? "bg-emerald-600" : "bg-red-600"
                }`}>
                  {isMaintenance ? (
                    <Unlock className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    {isMaintenance ? "Rétablir la Plateforme" : "Activer le Mode Maintenance"}
                  </h3>
                  <span className="text-[11px] text-zinc-500 block">
                    Action critique d'administration
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Warnings & Impact */}
            <form onSubmit={handleConfirmToggle} className="space-y-4 text-xs">
              
              {!isMaintenance ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-red-600 text-white font-medium space-y-1.5 shadow-xs">
                    <span className="font-bold block uppercase tracking-wider text-[10px]">
                      Avertissement de Service
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      L'activation du mode maintenance verrouille immédiatement la plateforme pour tous les développeurs :
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-100">
                      <li>Interruption immédiate des commandes <code className="font-mono bg-black/30 px-1 rounded">box push</code></li>
                      <li>Blocage des créations de nouveaux comptes</li>
                      <li>Affichage de l'écran de maintenance pour les visiteurs</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-600 text-white font-medium space-y-1.5 shadow-xs">
                  <span className="font-bold block uppercase tracking-wider text-[10px]">
                    Rétablissement du Service
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    La plateforme redeviendra accessible à tous les développeurs. Les opérations CLI et l'ensemble des requêtes reprendront normalement.
                  </p>
                </div>
              )}

              {/* Actions Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer font-semibold"
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white font-bold cursor-pointer transition-all shadow-xs ${
                    isMaintenance
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isMaintenance ? "Rouvrir la Plateforme" : "Confirmer le Verrouillage"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
