"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  BarChart3,
  Bell,
  Shield,
  X,
  LogOut,
  User,
  ExternalLink,
  ChevronsUpDown,
} from "lucide-react";
import logoImg from "../../public/logo.jpg";
import { ConfirmModal } from "../ui/ConfirmModal";
import { useSession, signOut } from "next-auth/react";

export const ADMIN_NAV_ITEMS = [
  {
    id: "users",
    label: "Utilisateurs",
    icon: Users,
    desc: "Comptes, Quotas et Statut",
  },
  {
    id: "analytics",
    label: "Télémétrie",
    icon: BarChart3,
    desc: "Pulls, Trafic et Runtimes",
  },
  {
    id: "alerts",
    label: "Alertes",
    icon: Bell,
    desc: "Telegram et Discord",
  },
  {
    id: "admins",
    label: "Administrateurs",
    icon: Shield,
    desc: "Équipe et Permissions",
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  isCollapsed,
}: AdminSidebarProps) {
  const { data: session } = useSession();
  const adminUsername = session?.user?.username || session?.user?.name || "Administrateur";
  const adminEmail = session?.user?.email || "";

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/v1/admin/team")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (typeof data.isCurrentUserOwner === "boolean") {
            setIsOwner(data.isCurrentUserOwner);
          } else {
            const userAdmin = data.admins?.find((a: any) => a.email === session?.user?.email);
            setIsOwner(userAdmin?.role === "Propriétaire");
          }
        }
      })
      .catch(() => {
        setIsOwner(false);
      });
  }, [session?.user?.email]);

  const displayRole = isOwner ? "Propriétaire" : "Administrateur";
  const badgeStyle = isOwner
    ? "bg-orange-600 text-white"
    : "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black";

  // Close popup menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Admin Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 border-r border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Top Header Branding */}
        <div>
          <div className={`flex h-16 items-center border-b border-black/8 dark:border-white/10 ${
            isCollapsed ? "justify-center px-2" : "justify-between px-5"
          }`}>
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-xs border border-black/10 dark:border-white/15 bg-zinc-900 transition-all duration-300 group-hover:scale-105 shrink-0">
                <Image
                  src={logoImg}
                  alt="Box Hub Admin"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
                    Box Hub
                  </span>
                  <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-orange-600 text-white">
                    Admin
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="p-3 space-y-1.5">
            {!isCollapsed && (
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
                Console d'Administration
              </div>
            )}

            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl transition-all duration-150 cursor-pointer ${
                    isCollapsed
                      ? "justify-center p-3"
                      : "justify-start gap-3.5 px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-orange-500" : "text-zinc-400"
                  }`} />
                  
                  {!isCollapsed && (
                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold truncate">
                        {item.label}
                      </div>
                      <div className={`text-[10px] truncate ${
                        isActive ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-400"
                      }`}>
                        {item.desc}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Connected User Menu Anchor */}
        <div className="relative p-3 border-t border-black/8 dark:border-white/10" ref={menuRef}>
          
          {/* Floating User Popup Menu */}
          {showUserMenu && (
            <div className={`absolute bottom-full mb-2 rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 p-2 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150 ${
              isCollapsed ? "left-3 w-64" : "left-3 right-3"
            }`}>
              
              {/* User Identity Header */}
              <div className="p-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-950 dark:text-white block">
                    {adminUsername}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeStyle}`}>
                    {displayRole}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  {adminEmail}
                </span>
              </div>

              {/* Menu Actions */}
              <div className="p-1 space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center justify-between w-full p-2.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white transition-colors font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span>Espace Développeur</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-zinc-400" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-red-600 hover:bg-red-600 hover:text-white font-bold transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>

            </div>
          )}

          {/* User Button Trigger */}
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title={isCollapsed ? `Profil ${adminUsername} (${displayRole})` : undefined}
            className={`w-full flex items-center rounded-xl border transition-all cursor-pointer ${
              isCollapsed ? "justify-center p-2" : "justify-between p-2.5"
            } ${
              showUserMenu
                ? "border-black/20 dark:border-white/20 bg-zinc-100 dark:bg-zinc-900"
                : "border-black/8 dark:border-white/8 bg-zinc-50 dark:bg-zinc-900/60 hover:border-black/20 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative h-8 w-8 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden bg-zinc-950 dark:bg-white text-white dark:text-black font-bold text-xs shadow-xs">
                  {session?.user?.image && !imageError ? (
                    <img
                      src={session.user.image}
                      alt={adminUsername}
                      onError={() => setImageError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    adminUsername ? adminUsername[0].toUpperCase() : "A"
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-zinc-950" />
              </div>
              
              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-950 dark:text-white truncate block">
                      {adminUsername}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badgeStyle}`}>
                      {displayRole}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate block">
                    {adminEmail}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <ChevronsUpDown className="h-4 w-4 text-zinc-400 shrink-0" />
            )}
          </button>

        </div>
      </aside>

      {/* Modern Confirmation Modal for Logout */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Déconnexion Administrateur"
        description="Voulez-vous vraiment vous déconnecter de votre session d'administration Box Hub ?"
        confirmLabel="Se Déconnecter"
        cancelLabel="Annuler"
        variant="danger"
        iconType="logout"
      />
    </>
  );
}
