"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Check,
  X,
  HardDrive,
  Loader2,
} from "lucide-react";
import { AdminUser } from "../../../lib/adminData";
import { ConfirmModal } from "../../ui/ConfirmModal";

export function AdminUsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal for user deletion confirmation
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const fetchUsers = () => {
    fetch("/api/v1/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement utilisateurs:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleToggleStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newBanned = user.status === "active";
    const newStatus = newBanned ? "suspended" : "active";

    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: newBanned }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
        showNotification(
          `Statut de ${user.username} modifié : ${newStatus === "active" ? "Compte Réactivé" : "Compte Suspendu"}.`
        );
      } else {
        showNotification(data.message || "Erreur lors de la modification du statut.");
      }
    } catch {
      showNotification("Erreur de connexion au serveur.");
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const target = userToDelete;

    try {
      const res = await fetch(`/api/v1/admin/users/${target.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== target.id));
        showNotification(`Compte de ${target.username} supprimé.`);
      } else {
        showNotification(data.message || "Erreur lors de la suppression.");
      }
    } catch {
      showNotification("Erreur lors de la suppression du compte.");
    } finally {
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "active") return u.status !== "suspended";
    if (statusFilter === "suspended") return u.status === "suspended";
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <Check className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par pseudo ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 text-xs text-zinc-950 dark:text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 text-xs overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === "all"
                ? "bg-white dark:bg-black text-zinc-950 dark:text-white font-semibold shadow-xs"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white font-medium"
            }`}
          >
            Tous ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === "active"
                ? "bg-white dark:bg-black text-zinc-950 dark:text-white font-semibold shadow-xs"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white font-medium"
            }`}
          >
            Actifs ({users.filter((u) => u.status !== "suspended").length})
          </button>
          <button
            onClick={() => setStatusFilter("suspended")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              statusFilter === "suspended"
                ? "bg-white dark:bg-black text-zinc-950 dark:text-white font-semibold shadow-xs"
                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white font-medium"
            }`}
          >
            Suspendus ({users.filter((u) => u.status === "suspended").length})
          </button>
        </div>

      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 whitespace-nowrap">Développeur</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Quota</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Boxes</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Stockage Consommé</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Statut</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Inscription</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Dernier Accès</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                          <div className="h-2.5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-8 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-5 w-14 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500 whitespace-nowrap">
                    Aucun utilisateur correspondant.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {user.username[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-950 dark:text-white block">
                            {user.username}
                          </span>
                          <span className="text-[11px] text-zinc-500 block">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black">
                        500 MB
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-800 dark:text-zinc-200 font-semibold whitespace-nowrap">
                      {user.boxesCount}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1.5 w-36">
                        <span className="text-zinc-700 dark:text-zinc-300 block text-[11px] font-medium whitespace-nowrap">
                          {user.storageUsedMB} MB / 500 MB
                        </span>
                        <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${Math.min(100, Math.round((user.storageUsedMB / 500) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap ${
                          user.status === "active"
                            ? "bg-emerald-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {user.status === "active" ? "Actif" : "Suspendu"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                      {user.joinedAt}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500 text-[11px] whitespace-nowrap">
                      {user.lastLogin}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Toggle Suspend/Active */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            user.status === "active"
                              ? "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 hover:border-amber-500"
                              : "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                          title={user.status === "active" ? "Suspendre le compte" : "Réactiver le compte"}
                        >
                          {user.status === "active" ? (
                            <UserX className="h-3.5 w-3.5" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Delete User */}
                        <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:border-red-500 transition-all cursor-pointer"
                          title="Supprimer le compte"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Confirmation Modal for User Deletion */}
      <ConfirmModal
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Supprimer Définitivement le Compte"
        description={`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${userToDelete?.username} (${userToDelete?.email}) ? Cette action détruira l'ensemble de ses box hébergées et révoquera ses tokens d'accès.`}
        confirmLabel="Supprimer le Compte"
        cancelLabel="Annuler"
        variant="danger"
        iconType="delete"
      />

    </div>
  );
}
