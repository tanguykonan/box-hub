"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Plus,
  Bell,
  Star,
  Download,
  Package,
  HardDrive,
  Key,
  Shield,
  Sparkles,
  CheckCheck,
  Loader2,
} from "lucide-react";

interface DashboardHeaderProps {
  activeTabTitle: string;
  onOpenSidebar: () => void;
  onOpenPublishModal: () => void;
}

interface UserNotificationItem {
  id: string;
  category: string;
  message: string;
  level: "info" | "success" | "warning";
  isRead: boolean;
  createdAt: string;
  timeFormatted: string;
}

export function DashboardHeader({
  activeTabTitle,
  onOpenSidebar,
  onOpenPublishModal,
}: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<UserNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/v1/user/notifications");
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Recharger lors des événements du dashboard
    const handleUpdate = () => fetchNotifications();
    window.addEventListener("boxhub_packages_updated", handleUpdate);
    window.addEventListener("boxhub_notifications_updated", handleUpdate);

    return () => {
      window.removeEventListener("boxhub_packages_updated", handleUpdate);
      window.removeEventListener("boxhub_notifications_updated", handleUpdate);
    };
  }, []);

  // Fermeture au clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/user/notifications", {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Erreur marquage notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "star":
        return <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20 shrink-0" />;
      case "pull":
        return <Download className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
      case "milestone":
        return <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
      case "push":
        return <Package className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
      case "quota":
        return <HardDrive className="h-3.5 w-3.5 text-pink-500 shrink-0" />;
      case "token":
        return <Key className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
      case "account":
        return <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/90 px-4 sm:px-6 backdrop-blur-md transition-colors">
      
      {/* Left: Mobile Toggle et Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden rounded-xl border border-black/10 dark:border-white/10 p-2 text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 dark:text-zinc-500 font-semibold">Console</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <h1 className="font-bold text-zinc-950 dark:text-white text-sm tracking-tight">
            {activeTabTitle}
          </h1>
        </div>
      </div>

      {/* Right: Notifications + Action Button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Notification Bell Anchor */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) {
                // Auto mark as read or user clicks
              }
            }}
            className={`relative rounded-xl border p-2 transition-all cursor-pointer shadow-xs ${
              showNotifications
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/10"
                : "border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-black/20 dark:hover:border-white/20"
            }`}
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-600 ring-2 ring-white dark:ring-black animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown (Max 10) */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-950 dark:text-white">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-600 text-white">
                      {unreadCount} {unreadCount === 1 ? "nouvelle" : "nouvelles"}
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCheck className="h-3 w-3" />
                    )}
                    <span>Tout marquer lu</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5 text-xs">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="h-8 w-8 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                      <Bell className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-500">
                      Aucune notification pour le moment
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl p-3 border transition-all ${
                        !n.isRead
                          ? "bg-orange-50/30 dark:bg-orange-950/15 border-orange-500/20"
                          : "bg-zinc-50 dark:bg-zinc-900/60 border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {getNotificationIcon(n.category)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-zinc-400 block font-normal">
                            {n.timeFormatted}
                          </span>
                        </div>
                        {!n.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-600 shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer info */}
              {notifications.length > 0 && (
                <div className="pt-2 border-t border-black/5 dark:border-white/5 text-center">
                  <span className="text-[10px] text-zinc-400 font-medium">
                    Affichage des {notifications.length} notifications les plus récentes
                  </span>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Primary Action Button: Publier une Box */}
        <button
          onClick={onOpenPublishModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Publier une Box</span>
        </button>

      </div>
    </header>
  );
}
