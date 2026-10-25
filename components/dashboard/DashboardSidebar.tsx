"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Key,
  BarChart2,
  Settings,
  X,
  HardDrive,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import logoImg from "../../public/logo.jpg";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "boxes", label: "Mes Box Hébergées", icon: Package },
  { id: "tokens", label: "Tokens d'accès", icon: Key },
  { id: "analytics", label: "Statistiques", icon: BarChart2 },
  { id: "settings", label: "Paramètres", icon: Settings },
];

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const currentUsername = session?.user?.username || session?.user?.name || "Développeur";
  const currentEmail = session?.user?.email || "";

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "tier_5" | "tier_10" | "tier_20">("free");
  const [storageUsedMB, setStorageUsedMB] = useState(0.0);
  const [storageLimitMB, setStorageLimitMB] = useState(500);
  const [percentage, setPercentage] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/v1/user/stats");
        const data = await res.json();
        if (data.success && data.stats) {
          setStorageUsedMB(data.stats.storageUsedMB);
          setStorageLimitMB(data.stats.storageLimitMB);
          setPercentage(data.stats.percentage);
          if (data.stats.tier) {
            setUserTier(data.stats.tier as any);
          }
        }
      } catch (err) {
        console.error("Erreur stats sidebar:", err);
      }
    };
    loadStats();
    window.addEventListener("boxhub_packages_updated", loadStats);
    return () => window.removeEventListener("boxhub_packages_updated", loadStats);
  }, []);

  const tierBadgeConfig = {
    free: { label: "500 MB", bg: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black" },
    tier_5: { label: "500 MB", bg: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black" },
    tier_10: { label: "500 MB", bg: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black" },
    tier_20: { label: "500 MB", bg: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black" },
  };

  const [imageError, setImageError] = useState(false);

  // Close popup menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding et Navigation */}
        <div>
          <div className="flex h-16 items-center justify-between px-5 border-b border-black/8 dark:border-white/10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-xs border border-black/10 dark:border-white/15 bg-zinc-900 transition-all duration-300 group-hover:scale-105">
                <Image
                  src={logoImg}
                  alt="Box Hub"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
                  Box Hub
                </span>
                <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-orange-600 text-white">
                  Console
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Espace Développeur
            </div>

            {DASHBOARD_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-orange-500" : "text-zinc-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 dark:bg-black/20 text-current"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-black/5 dark:border-white/10"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Quota Tracker, User Profile et Theme */}
        <div className="p-4 border-t border-black/8 dark:border-white/10 space-y-3">
          
          {/* Storage Quota Progress Card with Pure Color Badges */}
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-bold text-zinc-950 dark:text-white">
                  Stockage
                </span>
              </div>
              
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tierBadgeConfig[userTier].bg}`}>
                {tierBadgeConfig[userTier].label}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                <span>{storageUsedMB} MB</span>
                <span>{storageLimitMB >= 1000 ? `${storageLimitMB / 1000} GB` : `${storageLimitMB} MB`}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-600 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
              <span className="text-[10px] text-zinc-400 font-semibold">
                {percentage}% consommé
              </span>
            </div>
          </div>

          {/* Connected User Profile Menu Anchor */}
          <div className="relative" ref={menuRef}>
            
            {/* Floating User Popup Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 p-2 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-1">
                
                {/* User Info Header */}
                <div className="p-2.5 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-950 dark:text-white block">
                      {currentUsername}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[9px] font-bold shadow-xs ${tierBadgeConfig[userTier].bg}`}>
                      {tierBadgeConfig[userTier].label}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    {currentEmail}
                  </span>
                </div>

                {/* Menu Actions */}
                <div className="pt-1 space-y-1">
                  {session?.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-zinc-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 font-semibold transition-all cursor-pointer"
                    >
                      <span className="h-2 w-2 rounded-full bg-orange-600" />
                      <span>Console d'Administration</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-red-600 hover:bg-red-600 hover:text-white font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>

              </div>
            )}

            {/* Profile Trigger Button */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex-1 flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                  showUserMenu
                    ? "border-black/20 dark:border-white/20 bg-zinc-100 dark:bg-zinc-900"
                    : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative h-8 w-8 shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden bg-zinc-950 dark:bg-white text-white dark:text-black font-bold text-xs shadow-xs">
                      {session?.user?.image && !imageError ? (
                        <img
                          src={session.user.image}
                          alt={currentUsername}
                          onError={() => setImageError(true)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        currentUsername ? currentUsername[0].toUpperCase() : "U"
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-zinc-950" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                      {currentUsername}
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">
                      Connecté
                    </span>
                  </div>
                </div>

                <ChevronUp className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              <ThemeToggle />
            </div>

          </div>

        </div>
      </aside>
    </>
  );
}
