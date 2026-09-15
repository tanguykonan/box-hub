"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Check,
  Save,
  HardDrive,
  Heart,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { GithubIcon } from "../../ui/GithubIcon";
import { GoogleIcon } from "../../ui/GoogleIcon";
import { SupportModal } from "../modals/SupportModal";
import { useSession, signIn } from "next-auth/react";
import { useToast } from "../../ui/Toast";

export function SettingsSection() {
  const { data: session, update } = useSession();
  const { showToast } = useToast();

  const [username, setUsername] = useState(session?.user?.username || "");
  const [initialUsername, setInitialUsername] = useState(session?.user?.username || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [tier, setTier] = useState<"free" | "tier_5" | "tier_10" | "tier_20">("free");
  const [storageUsedMB, setStorageUsedMB] = useState(0.0);
  const [storageLimitMB, setStorageLimitMB] = useState(500);
  const [percentage, setPercentage] = useState(0);

  // Vérification de la disponibilité du nom d'utilisateur
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available?: boolean;
    isCurrent?: boolean;
    message?: string;
  } | null>(null);

  // Comptes associés réels
  const [linkedAccounts, setLinkedAccounts] = useState<{
    github: boolean;
    google: boolean;
  }>({
    github: false,
    google: false,
  });

  // Chargement initial du profil et des statistiques
  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
      setInitialUsername(session.user.username);
    }
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    const loadProfileAndStats = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          fetch("/api/v1/user/stats").then((r) => r.json()).catch(() => null),
          fetch("/api/v1/user/profile").then((r) => r.json()).catch(() => null),
        ]);

        if (statsRes?.success && statsRes?.stats) {
          setStorageUsedMB(statsRes.stats.storageUsedMB);
          setStorageLimitMB(statsRes.stats.storageLimitMB);
          setPercentage(statsRes.stats.percentage);
          if (statsRes.stats.tier) {
            setTier(statsRes.stats.tier as any);
          }
        }

        if (profileRes?.success && profileRes?.profile) {
          if (profileRes.profile.username) {
            setUsername(profileRes.profile.username);
            setInitialUsername(profileRes.profile.username);
          }
          if (profileRes.profile.email) {
            setEmail(profileRes.profile.email);
          }
          if (profileRes.profile.linkedAccounts) {
            setLinkedAccounts(profileRes.profile.linkedAccounts);
          }
        }
      } catch (err) {
        console.error("Erreur chargement profil & stats:", err);
      }
    };

    loadProfileAndStats();
  }, []);

  // Vérification de disponibilité du nom d'utilisateur en temps réel (Debounce 400ms)
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      setUsernameStatus(null);
      return;
    }

    if (clean === initialUsername.toLowerCase()) {
      setUsernameStatus({ available: true, isCurrent: true, message: "Nom actuel" });
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch("/api/auth/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: clean }),
        });
        const data = await res.json();
        setUsernameStatus(data);
      } catch {
        setUsernameStatus({ available: false, message: "Vérification impossible." });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, initialUsername]);

  const tierBadgeConfig = {
    free: { label: "Gratuit", bg: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black" },
    tier_5: { label: "Sponsor 5 €", bg: "bg-pink-600 text-white" },
    tier_10: { label: "Donateur 10 €", bg: "bg-orange-600 text-white" },
    tier_20: { label: "Supporter 20 €", bg: "bg-emerald-600 text-white" },
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 2) {
      showToast("Veuillez saisir un nom d'utilisateur valide.", "error");
      return;
    }

    if (usernameStatus && !usernameStatus.available) {
      showToast(usernameStatus.message || "Ce nom d'utilisateur n'est pas disponible.", "error");
      return;
    }

    if (cleanUsername === initialUsername.toLowerCase()) {
      showToast("Aucune modification à enregistrer.", "info");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername }),
      });

      const data = await res.json();
      if (data.success) {
        setInitialUsername(cleanUsername);
        setUsername(cleanUsername);
        if (update) {
          await update({ user: { username: cleanUsername } });
        }
        setSaved(true);
        showToast("Nom d'utilisateur mis à jour avec succès !", "success");
        setTimeout(() => setSaved(false), 2500);
      } else {
        showToast(data.message || "Impossible de mettre à jour le profil.", "error");
      }
    } catch {
      showToast("Erreur réseau lors de la mise à jour.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkAccount = (provider: "github" | "google") => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="max-w-2xl space-y-6">
      
      <div>
        <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
          Paramètres
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Gérez votre profil public, vos quotas de stockage et vos connexions.
        </p>
      </div>

      {/* Quota et Storage Tracking Card */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
              <HardDrive className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Quota de Stockage
                </h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-xs ${tierBadgeConfig[tier].bg}`}>
                  {tierBadgeConfig[tier].label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 px-3.5 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
          >
            <Heart className="h-3.5 w-3.5 fill-white text-white" />
            <span>Soutenir l'infrastructure</span>
          </button>
        </div>

        {/* Storage Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
              {storageUsedMB} MB consommés sur {storageLimitMB >= 1000 ? `${storageLimitMB / 1000} GB` : `${storageLimitMB} MB`}
            </span>
            <span className="font-bold text-zinc-950 dark:text-white">{percentage}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-600 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            Le stockage inclut l'ensemble des versions (.box) actives publiées sous votre organisation.
          </p>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs">
        <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
          Informations du Profil
        </h4>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Nom d'utilisateur / Handle
            </label>
            {isCheckingUsername && (
              <span className="text-[10px] text-zinc-400">Vérification...</span>
            )}
            {!isCheckingUsername && usernameStatus && (
              <span
                className={`text-[10px] font-bold ${
                  usernameStatus.available
                    ? usernameStatus.isCurrent
                      ? "text-zinc-400"
                      : "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {usernameStatus.available
                  ? usernameStatus.isCurrent
                    ? "✓ Actuel"
                    : "✓ Disponible"
                  : "✗ Indisponible"}
              </span>
            )}
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-950 dark:text-white font-mono focus:border-orange-500 focus:outline-none transition-colors"
          />
          <p className="text-[11px] text-zinc-400 mt-1">
            Vos paquets seront publiés sous : <code>{username.trim() || "dev"}/nom-de-la-box</code>
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Adresse e-mail
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-500 focus:outline-none opacity-80 cursor-not-allowed"
          />
        </div>

        {/* Connected Accounts */}
        <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-zinc-950 dark:text-white">
            Comptes Associés
          </h4>

          {/* GitHub Account Item */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2.5">
              <GithubIcon className="h-4 w-4 text-zinc-950 dark:text-white" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-white">GitHub</span>
            </div>
            {linkedAccounts.github ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                Connecté
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleLinkAccount("github")}
                className="px-3 py-1 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
              >
                <span>Associer</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </button>
            )}
          </div>

          {/* Google Account Item */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2.5">
              <GoogleIcon className="h-4 w-4" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-white">Google</span>
            </div>
            {linkedAccounts.google ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                Connecté
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleLinkAccount("google")}
                className="px-3 py-1 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
              >
                <span>Associer</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </button>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || isCheckingUsername || Boolean(usernameStatus && !usernameStatus.available)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Enregistrement...</span>
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4 text-white" />
                <span>Enregistré avec succès</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

    </div>
  );
}
