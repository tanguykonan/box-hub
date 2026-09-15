"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Check,
  Save,
  CreditCard,
  Zap,
  Shield,
  Heart,
  Loader2,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
} from "lucide-react";
import { TelegramIcon } from "../../ui/TelegramIcon";
import { DiscordIcon } from "../../ui/DiscordIcon";

interface ChannelConfig {
  id: "telegram" | "discord";
  name: string;
  enabled: boolean;
  target: string;
  extraTarget?: string; // Chat ID for telegram
  placeholder: string;
}

interface AdminNotification {
  id: string;
  category: "Financement" | "Trafic" | "Sécurité";
  title: string;
  message: string;
  time: string;
  level: "success" | "warning" | "info";
}

export function AdminAlertsSection() {
  // 1. Strictly Telegram & Discord
  const [channels, setChannels] = useState<ChannelConfig[]>([
    {
      id: "telegram",
      name: "Telegram Bot",
      enabled: true,
      target: "",
      extraTarget: "",
      placeholder: "Token du Bot Telegram",
    },
    {
      id: "discord",
      name: "Discord Webhook",
      enabled: true,
      target: "",
      placeholder: "https://discord.com/api/webhooks/...",
    },
  ]);

  // Secret Visibility States (Masked by default)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({
    telegram: false,
    discord: false,
  });

  const toggleShowSecret = (channelId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }));
  };

  // 2. Realistic Notification Triggers (8 types sur 3 catégories équilibrées)
  const [triggers, setTriggers] = useState({
    // 1. Financement et Soutiens
    newDonation: true,
    failedPayment: true,
    // 2. Trafic et Santé Système
    trafficSpike: true,
    storageSaturation: true,
    systemError: true,
    // 3. Sécurité et Administration
    maintenanceToggle: true,
    adminChanges: true,
    userModeration: true,
  });

  // 3. System Platform Notifications Feed
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // UI state
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [successChannel, setSuccessChannel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Floating Notification state (strictly styled like CookieBanner.tsx)
  const [toast, setToast] = useState<{
    type: "error" | "success";
    title: string;
    subtitle: string;
    message: string;
  } | null>(null);

  const showFloatingNotification = (newToast: {
    type: "error" | "success";
    title: string;
    subtitle: string;
    message: string;
  }) => {
    setToast(newToast);
    setTimeout(() => {
      setToast((current) => (current?.title === newToast.title && current?.message === newToast.message ? null : current));
    }, 6000);
  };

  useEffect(() => {
    fetch("/api/v1/admin/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.channels)) setChannels(data.channels);
          if (data.triggers) setTriggers(data.triggers);
          if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement alertes:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleTestChannel = async (channel: ChannelConfig) => {
    if (!channel.target.trim()) return;
    setTestingChannel(channel.id);
    setSuccessChannel(null);

    try {
      const res = await fetch("/api/v1/admin/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: channel.id,
          target: channel.target,
          extraTarget: channel.extraTarget,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessChannel(channel.id);
        showFloatingNotification({
          type: "success",
          title: "Test de Connexion Réussi",
          subtitle: channel.name,
          message: data.message || "Notification de test envoyée avec succès sur votre canal !",
        });
        setTimeout(() => setSuccessChannel(null), 3000);
      } else {
        showFloatingNotification({
          type: "error",
          title: "Échec du Test de Connexion",
          subtitle: channel.name,
          message: data.message || "Erreur lors de l'envoi du message de test.",
        });
      }
    } catch {
      showFloatingNotification({
        type: "error",
        title: "Erreur de Connexion",
        subtitle: channel.name,
        message: "Impossible de joindre le serveur pour tester ce canal.",
      });
    } finally {
      setTestingChannel(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels, triggers }),
      });
      const data = await res.json();
      if (data.success) {
        showFloatingNotification({
          type: "success",
          title: "Configuration Enregistrée",
          subtitle: "Canaux & Déclencheurs",
          message: "Vos canaux d'alertes Telegram / Discord et vos déclencheurs ont été mis à jour avec succès.",
        });
      } else {
        showFloatingNotification({
          type: "error",
          title: "Erreur de Sauvegarde",
          subtitle: "Canaux & Déclencheurs",
          message: data.message || "Erreur lors de l'enregistrement des alertes.",
        });
      }
    } catch (err) {
      console.error("Erreur sauvegarde alertes:", err);
      showFloatingNotification({
        type: "error",
        title: "Erreur Réseau",
        subtitle: "Canaux & Déclencheurs",
        message: "Erreur de connexion lors de l'enregistrement des alertes.",
      });
    }
  };

  const updateChannelTarget = (id: string, value: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, target: value } : c))
    );
  };

  const updateChannelExtraTarget = (id: string, value: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, extraTarget: value } : c))
    );
  };

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
      
      {/* Floating Notification (Strictly styled like CookieBanner.tsx) */}
      {toast && (
        <aside
          aria-label="Notification d'alerte"
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-2xl space-y-3">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0 text-white ${
                    toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
                  }`}
                >
                  {toast.type === "error" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    {toast.title}
                  </h3>
                  <span className="text-[11px] text-zinc-500 block">
                    {toast.subtitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors"
                title="Fermer la notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Body */}
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-mono">
              {toast.message}
            </p>

          </div>
        </aside>
      )}

      {/* 1. Canaux Telegram et Discord */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">
            Canaux de Réception des Alertes
          </h3>
          <p className="text-xs text-zinc-500">
            Connectez vos salons Telegram et Discord pour recevoir les notifications critiques en direct.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`rounded-2xl border p-5 transition-all space-y-4 ${
                channel.enabled
                  ? "border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-xs"
                  : "border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/40 opacity-70"
              }`}
            >
              {/* Channel Header & Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shadow-xs ${
                    channel.id === "telegram"
                      ? "bg-sky-500 text-white"
                      : "bg-[#5865F2] text-white"
                  }`}>
                    {channel.id === "telegram" ? (
                      <TelegramIcon className="h-4 w-4" />
                    ) : (
                      <DiscordIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-950 dark:text-white block">
                      {channel.name}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {channel.enabled ? "Canal Actif" : "Désactivé"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleChannel(channel.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    channel.enabled ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      channel.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Channel Inputs & Test Button */}
              <div className="space-y-3 text-xs">
                
                {/* Secret Input (Masked with Eye toggle) */}
                <div className="space-y-1">
                  <label className="text-zinc-600 dark:text-zinc-400 font-semibold block text-[11px]">
                    {channel.id === "telegram" ? "Token du Bot Telegram" : "URL du Webhook Discord"}
                  </label>
                  
                  <div className="relative">
                    <input
                      type={showSecrets[channel.id] ? "text" : "password"}
                      disabled={!channel.enabled}
                      placeholder={channel.placeholder}
                      value={channel.target}
                      onChange={(e) => updateChannelTarget(channel.id, e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50 font-mono tracking-wider"
                    />
                    
                    {/* Mask / Reveal Toggle Button */}
                    <button
                      type="button"
                      disabled={!channel.enabled}
                      onClick={() => toggleShowSecret(channel.id)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer disabled:opacity-30"
                      title={showSecrets[channel.id] ? "Masquer le secret" : "Afficher le secret"}
                    >
                      {showSecrets[channel.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Telegram Extra Input: Chat ID */}
                {channel.id === "telegram" && (
                  <div className="space-y-1">
                    <label className="text-zinc-600 dark:text-zinc-400 font-semibold block text-[11px]">
                      Chat ID / Identifiant du Salon ou Groupe
                    </label>
                    <input
                      type="text"
                      disabled={!channel.enabled}
                      placeholder="Ex: -100123456789 ou @mon_canal"
                      value={channel.extraTarget || ""}
                      onChange={(e) => updateChannelExtraTarget(channel.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50 font-mono"
                    />
                  </div>
                )}

                {/* Inline Button with Pure Solid Feedback */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleTestChannel(channel)}
                    disabled={!channel.enabled || !channel.target.trim() || testingChannel === channel.id}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer disabled:opacity-40 shadow-xs ${
                      successChannel === channel.id
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                    }`}
                  >
                    {testingChannel === channel.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : successChannel === channel.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Notification envoyée !</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        <span>Tester ce canal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 2. Déclencheurs Réalistes et Essentiels (8 déclencheurs sur 3 catégories) */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">
            Déclencheurs d'Alertes et Événements
          </h3>
          <p className="text-xs text-zinc-500">
            Sélectionnez les événements réels qui déclenchent un message instantané sur vos salons configurés.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Category 1: Financement et Soutiens */}
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
              <CreditCard className="h-4 w-4 text-pink-500" />
              <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                Financement et Soutiens
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Nouveau Don de Soutien
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Souscription Sponsor (5€), Donateur (10€) ou Supporter (20€).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={triggers.newDonation}
                  onChange={(e) => setTriggers({ ...triggers, newDonation: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0"
                />
              </label>

              <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Échec de Paiement ou Annulation
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Alerte si un don récurrent n'a pas pu être prélevé.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={triggers.failedPayment}
                  onChange={(e) => setTriggers({ ...triggers, failedPayment: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0"
                />
              </label>
            </div>
          </div>

          {/* Category 2: Trafic et Santé Système */}
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
              <Zap className="h-4 w-4 text-orange-500" />
              <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                Trafic et Santé Système
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Pic Anormal de Trafic CLI
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Alerte si les requêtes augmentent de +40% en 10 minutes.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={triggers.trafficSpike}
                  onChange={(e) => setTriggers({ ...triggers, trafficSpike: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0"
                />
              </label>

              <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Seuil de Stockage Global (&gt; 85%)
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Avertissement avant la saturation du stockage global.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={triggers.storageSaturation}
                  onChange={(e) => setTriggers({ ...triggers, storageSaturation: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0"
                />
              </label>

              <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Erreurs Serveur Critiques
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Échecs d'upload R2, indisponibilité API ou base de données.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={triggers.systemError}
                  onChange={(e) => setTriggers({ ...triggers, systemError: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0"
                />
              </label>
            </div>
          </div>

          {/* Category 3: Sécurité et Administration */}
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
              <Shield className="h-4 w-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                Sécurité et Administration
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Bascule du Mode Maintenance
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Alerte immédiate quand le site est verrouillé ou rétabli.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={triggers.maintenanceToggle}
                  onChange={(e) => setTriggers({ ...triggers, maintenanceToggle: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0"
                />
              </label>

              <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Modifications d'Équipe Admin
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Invitation, acceptation ou révocation d'un administrateur.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={triggers.adminChanges}
                  onChange={(e) => setTriggers({ ...triggers, adminChanges: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0"
                />
              </label>

              <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Modération &amp; Bannissement
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Suspension, bannissement ou suppression d'un compte utilisateur.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={triggers.userModeration}
                  onChange={(e) => setTriggers({ ...triggers, userModeration: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 shrink-0"
                />
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Dernières Notifications (Flux Direct et Pur avec Couleurs Solides) */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/5">
          <Bell className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
            Dernières Notifications
          </h3>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5">
          {loading ? (
            [1, 2, 3].map((idx) => (
              <div key={idx} className="py-3.5 flex items-start justify-between gap-4 animate-pulse">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="h-3.5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
                <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded shrink-0 pt-0.5" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              Aucune notification récente.
            </div>
          ) : (
            notifications.map((notif) => (
            <div key={notif.id} className="py-3.5 flex items-start justify-between gap-4">
              
              {/* Left: Event Icon (Pure Solid Opaque Colors) + Descriptive Content */}
              <div className="flex items-start gap-3 min-w-0">
                
                {/* Event Type Icon */}
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs text-white ${
                  notif.category === "Financement"
                    ? "bg-pink-600"
                    : notif.category === "Trafic"
                    ? "bg-orange-600"
                    : "bg-emerald-600"
                }`}>
                  {notif.category === "Financement" && <Heart className="h-4 w-4" />}
                  {notif.category === "Trafic" && <Zap className="h-4 w-4" />}
                  {notif.category === "Sécurité" && <Shield className="h-4 w-4" />}
                </div>

                {/* Title & Detailed Message */}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-950 dark:text-white">
                      {notif.title}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      • {notif.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

              </div>

              {/* Right: Timestamp */}
              <span className="text-[11px] text-zinc-400 whitespace-nowrap shrink-0 pt-0.5">
                {notif.time}
              </span>

            </div>
          )))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 text-xs font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Enregistrer les modifications</span>
        </button>
      </div>

    </form>
  );
}
