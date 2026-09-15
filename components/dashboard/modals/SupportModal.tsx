"use client";

import React, { useState } from "react";
import {
  X,
  Heart,
  HardDrive,
  Check,
  ExternalLink,
  Zap,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useToast } from "../../ui/Toast";
import { STORAGE_QUOTAS } from "@/lib/site-config";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { showToast } = useToast();
  const [selectedTier, setSelectedTier] = useState<"tier_5" | "tier_10" | "tier_20">("tier_5");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleProceedToPayment = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/v1/payments/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier }),
      });

      const data = await res.json();
      if (data.success && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        showToast(data.message || "Impossible d'initialiser le paiement.", "error");
        setIsProcessing(false);
      }
    } catch {
      showToast("Erreur de connexion à la passerelle de paiement.", "error");
      setIsProcessing(false);
    }
  };

  const tiers = [
    {
      id: "tier_5",
      name: `${STORAGE_QUOTAS.TIER_5.name} 5 €`,
      badge: STORAGE_QUOTAS.TIER_5.name,
      price: STORAGE_QUOTAS.TIER_5.priceEur,
      storage: `${STORAGE_QUOTAS.TIER_5.totalGB} Go de stockage`,
      perBox: "Sans contrainte par Box",
      badgeColor: "bg-pink-600 text-white",
      features: [
        `Stockage étendu : ${STORAGE_QUOTAS.TIER_5.totalGB} Go`,
        "Aucune limite par fichier .box",
        `Badge officiel ${STORAGE_QUOTAS.TIER_5.name} sur votre profil`,
      ],
      popular: true,
    },
    {
      id: "tier_10",
      name: `${STORAGE_QUOTAS.TIER_10.name} 10 €`,
      badge: STORAGE_QUOTAS.TIER_10.name,
      price: STORAGE_QUOTAS.TIER_10.priceEur,
      storage: `${STORAGE_QUOTAS.TIER_10.totalGB} Go de stockage`,
      perBox: "Sans contrainte par Box",
      badgeColor: "bg-orange-600 text-white",
      features: [
        `Stockage étendu : ${STORAGE_QUOTAS.TIER_10.totalGB} Go`,
        "Aucune limite par fichier .box",
        `Badge ${STORAGE_QUOTAS.TIER_10.name} sur votre profil`,
      ],
      popular: false,
    },
    {
      id: "tier_20",
      name: `${STORAGE_QUOTAS.TIER_20.name} 20 €`,
      badge: STORAGE_QUOTAS.TIER_20.name,
      price: STORAGE_QUOTAS.TIER_20.priceEur,
      storage: `${STORAGE_QUOTAS.TIER_20.totalGB} Go de stockage`,
      perBox: "Sans contrainte par Box",
      badgeColor: "bg-emerald-600 text-white",
      features: [
        `Stockage étendu : ${STORAGE_QUOTAS.TIER_20.totalGB} Go`,
        "Aucune limite par fichier .box",
        `Badge distinctif ${STORAGE_QUOTAS.TIER_20.name} sur votre profil`,
      ],
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-2xl z-10 transition-all max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-pink-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Heart className="h-4 w-4 fill-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">
              Soutien et Quotas de Stockage
            </h3>
            <span className="text-xs text-zinc-500">
              Soutenez l’infrastructure Box Hub et repoussez vos limites.
            </span>
          </div>
        </div>

        {/* Free Tier Reminder Banner */}
        <div className="rounded-xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-zinc-950 dark:text-white">Tier Gratuit de base :</span>{" "}
            <span className="text-zinc-600 dark:text-zinc-400">500 MB total • 60 MB max par fichier</span>
          </div>
          <span className="rounded bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 self-start sm:self-auto">
            Actif par défaut
          </span>
        </div>

        {/* Tiers Grid (3 Donator / Sponsor options) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {tiers.map((t) => {
            const isSelected = selectedTier === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTier(t.id as any)}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-pink-500 bg-pink-50/20 dark:bg-pink-950/10 shadow-md ring-2 ring-pink-500"
                    : "border-black/10 dark:border-white/10 bg-zinc-50/60 dark:bg-zinc-900/60 hover:border-black/25 dark:hover:border-white/25"
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-pink-600 text-white px-2.5 py-0.5 text-[9px] font-extrabold uppercase shadow-xs">
                    Populaire
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                      {t.name}
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-pink-600 dark:text-pink-400 mb-2">
                    {t.price}
                  </p>

                  <div className="rounded-xl bg-black/5 dark:bg-white/5 p-2 text-[10px] text-zinc-700 dark:text-zinc-300 font-bold mb-2 flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-pink-600" />
                    <span>{t.storage}</span>
                  </div>

                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-3 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>{t.perBox}</span>
                  </div>

                  <ul className="space-y-1.5 text-[10px] text-zinc-600 dark:text-zinc-400">
                    {t.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-xs ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-pink-600 bg-pink-600 text-white" : "border-zinc-400"
                  }`}>
                    {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-3 text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-98 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Initialisation de la session Paystack...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Soutenir via Paiement Sécurisé (Paystack)</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
