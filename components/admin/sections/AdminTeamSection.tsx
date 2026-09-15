"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  UserCheck,
  Shield,
  Trash2,
  UserPlus,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { AdminMember } from "../../../lib/adminData";
import { ConfirmModal } from "../../ui/ConfirmModal";

export function AdminTeamSection() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [adminToRevoke, setAdminToRevoke] = useState<AdminMember | null>(null);

  // Form inputs
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"Propriétaire" | "Administrateur">("Administrateur");

  // Détermine si l'utilisateur actuel est le Propriétaire
  const isOwner = Boolean(
    isCurrentUserOwner ||
    admins.find((a) => a.email === session?.user?.email)?.role === "Propriétaire"
  );

  const fetchAdmins = () => {
    fetch("/api/v1/admin/team")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.admins)) {
          setAdmins(data.admins);
          if (typeof data.isCurrentUserOwner === "boolean") {
            setIsCurrentUserOwner(data.isCurrentUserOwner);
          }
        }
      })
      .catch((err) => {
        console.error("Erreur chargement admins:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    try {
      const res = await fetch("/api/v1/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || `Invitation envoyée avec succès à ${newName}.`);
        setNewName("");
        setNewEmail("");
        setNewRole("Administrateur");
        setIsModalOpen(false);
        fetchAdmins();
      } else {
        showNotification(data.message || "Erreur lors de l'envoi de l'invitation.");
      }
    } catch {
      showNotification("Erreur de connexion lors de l'envoi de l'invitation.");
    }
  };

  const handleConfirmRevoke = async () => {
    if (!adminToRevoke) return;
    const target = adminToRevoke;

    try {
      const res = await fetch(`/api/v1/admin/team/${target.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAdmins((prev) => prev.filter((a) => a.id !== target.id));
        showNotification(data.message || `Accès administrateur de ${target.name} révoqué.`);
      } else {
        showNotification(data.message || "Erreur lors de la révocation de l'accès.");
      }
    } catch {
      showNotification("Erreur lors de la révocation de l'accès administrateur.");
    } finally {
      setAdminToRevoke(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification (Pure Solid Color) */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs animate-in fade-in">
          <Check className="h-4 w-4 shrink-0 text-white" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Banner and Invite Button */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
            Administrateurs de la Plateforme
          </h2>
          <p className="text-xs text-zinc-500">
            Gérez l'équipe ayant accès à la console d'administration et aux configurations système.
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 text-xs font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Inviter un administrateur</span>
          </button>
        )}
      </div>

      {/* Admins Table */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
            <thead className="border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-5">Membre</th>
                <th className="py-3.5 px-4">Rôle</th>
                <th className="py-3.5 px-4">Ajouté le</th>
                <th className="py-3.5 px-4">Dernière Activité</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                [1, 2, 3].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                          <div className="h-2.5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                    <td className="py-3.5 px-5 text-right"><div className="h-6 w-8 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : (
                admins.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                  
                  {/* Name & Email */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {member.name.charAt(0)}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-zinc-950" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-950 dark:text-white block">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 block">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold whitespace-nowrap ${
                        member.role === "Propriétaire"
                          ? "bg-orange-600 text-white"
                          : "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                    {member.addedAt}
                  </td>

                  <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-medium whitespace-nowrap">
                    {member.lastActive}
                  </td>

                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    {isOwner && member.role !== "Propriétaire" && (
                      <button
                        type="button"
                        onClick={() => setAdminToRevoke(member)}
                        className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:border-red-500 transition-all cursor-pointer"
                        title="Révoquer l'accès administrateur"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Inviter un Administrateur
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAdmin} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold block">
                  Nom Complet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Thomas Bernard"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold block">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="thomas.infra@boxhub.dev"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold block">
                  Rôle Attribué
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRole("Administrateur")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      newRole === "Administrateur"
                        ? "border-orange-500 bg-orange-600 text-white font-bold"
                        : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className="font-bold block">Administrateur</span>
                    <span className={`text-[10px] block mt-0.5 ${newRole === "Administrateur" ? "text-zinc-100" : "text-zinc-500"}`}>
                      Gestion courante
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole("Propriétaire")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      newRole === "Propriétaire"
                        ? "border-orange-500 bg-orange-600 text-white font-bold"
                        : "border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className="font-bold block">Propriétaire</span>
                    <span className={`text-[10px] block mt-0.5 ${newRole === "Propriétaire" ? "text-zinc-100" : "text-zinc-500"}`}>
                      Accès total
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer transition-all shadow-xs hover:scale-105 active:scale-95"
                >
                  Envoyer l'invitation
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modern Confirmation Modal for Revoking Admin Access */}
      <ConfirmModal
        isOpen={adminToRevoke !== null}
        onClose={() => setAdminToRevoke(null)}
        onConfirm={handleConfirmRevoke}
        title="Révoquer les Droits Administrateur"
        description={`Êtes-vous sûr de vouloir révoquer les accès administrateur de ${adminToRevoke?.name} (${adminToRevoke?.email}) ? Cet utilisateur n'aura plus accès à la console d'administration.`}
        confirmLabel="Révoquer l'Accès"
        cancelLabel="Annuler"
        variant="danger"
        iconType="shield"
      />

    </div>
  );
}
