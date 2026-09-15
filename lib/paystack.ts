import crypto from "crypto";
import { UserTier } from "@prisma/client";

export interface TierConfig {
  id: "tier_5" | "tier_10" | "tier_20";
  name: string;
  tierEnum: UserTier;
  amountSubunit: number; // En sous-unités Paystack (ex: 300000 pour 3 000 XOF, 500 pour 5 EUR)
  displayPrice: string;
  quotaBytes: bigint;
  currency: string;
}

import { STORAGE_QUOTAS } from "./site-config";

const PAYSTACK_CURRENCY = (process.env.PAYSTACK_CURRENCY || "XOF").toUpperCase();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_API_BASE = "https://api.paystack.co";

/**
 * Configuration des 3 paliers de soutien adaptée à la devise (XOF par défaut, EUR ou USD).
 */
export function getTierConfig(tierId: "tier_5" | "tier_10" | "tier_20"): TierConfig {
  const isXof = PAYSTACK_CURRENCY === "XOF";
  const isUsd = PAYSTACK_CURRENCY === "USD";

  const configs: Record<"tier_5" | "tier_10" | "tier_20", TierConfig> = {
    tier_5: {
      id: "tier_5",
      name: STORAGE_QUOTAS.TIER_5.name,
      tierEnum: UserTier.TIER_5,
      amountSubunit: isXof ? STORAGE_QUOTAS.TIER_5.priceXof * 100 : 500, // 3 000 FCFA ou 5.00 €/$
      displayPrice: isXof ? "3 000 FCFA / mois" : isUsd ? "5 $ / mois" : STORAGE_QUOTAS.TIER_5.priceEur,
      quotaBytes: STORAGE_QUOTAS.TIER_5.totalBytes, // 10 Go
      currency: PAYSTACK_CURRENCY,
    },
    tier_10: {
      id: "tier_10",
      name: STORAGE_QUOTAS.TIER_10.name,
      tierEnum: UserTier.TIER_10,
      amountSubunit: isXof ? STORAGE_QUOTAS.TIER_10.priceXof * 100 : 1000, // 6 500 FCFA ou 10.00 €/$
      displayPrice: isXof ? "6 500 FCFA / mois" : isUsd ? "10 $ / mois" : STORAGE_QUOTAS.TIER_10.priceEur,
      quotaBytes: STORAGE_QUOTAS.TIER_10.totalBytes, // 30 Go
      currency: PAYSTACK_CURRENCY,
    },
    tier_20: {
      id: "tier_20",
      name: STORAGE_QUOTAS.TIER_20.name,
      tierEnum: UserTier.TIER_20,
      amountSubunit: isXof ? STORAGE_QUOTAS.TIER_20.priceXof * 100 : 2000, // 13 000 FCFA ou 20.00 €/$
      displayPrice: isXof ? "13 000 FCFA / mois" : isUsd ? "20 $ / mois" : STORAGE_QUOTAS.TIER_20.priceEur,
      quotaBytes: STORAGE_QUOTAS.TIER_20.totalBytes, // 100 Go
      currency: PAYSTACK_CURRENCY,
    },
  };

  return configs[tierId];
}

export const PAYSTACK_TIERS = {
  tier_5: getTierConfig("tier_5"),
  tier_10: getTierConfig("tier_10"),
  tier_20: getTierConfig("tier_20"),
};

/**
 * Initialise une transaction de paiement auprès de Paystack.
 */
export async function initializePaystackTransaction({
  email,
  tier,
  userId,
  username,
  callbackUrl,
}: {
  email: string;
  tier: "tier_5" | "tier_10" | "tier_20";
  userId: string;
  username: string;
  callbackUrl: string;
}): Promise<{
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  error?: string;
}> {
  try {
    const tierConfig = getTierConfig(tier);
    if (!tierConfig) {
      return { success: false, error: "Palier de soutien invalide." };
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.warn("⚠️ [Paystack] PAYSTACK_SECRET_KEY non configurée. Simulation de redirection.");
      return {
        success: true,
        authorizationUrl: `${callbackUrl}?payment=success&reference=simulated_${Date.now()}&tier=${tier}`,
        reference: `simulated_${Date.now()}`,
      };
    }

    // Payload conforme à Paystack Côte d'Ivoire & International
    const payload = {
      email,
      amount: tierConfig.amountSubunit,
      currency: tierConfig.currency,
      channels: ["card", "mobile_money"],
      callback_url: callbackUrl,
      metadata: {
        userId,
        username,
        tier: tierConfig.id,
        tierName: tierConfig.name,
        quotaBytes: tierConfig.quotaBytes.toString(),
        custom_fields: [
          {
            display_name: "Palier Box Hub",
            variable_name: "tier_name",
            value: `${tierConfig.name} (${Math.round(Number(tierConfig.quotaBytes) / (1024 * 1024 * 1024))} Go)`,
          },
          {
            display_name: "Développeur",
            variable_name: "username",
            value: username,
          },
        ],
      },
    };

    let res = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data = await res.json().catch(() => ({ status: false }));

    // Si l'API Paystack a eu un micro-timeout (503 / status false), on retente une fois après 500ms
    if (!data.status && (res.status >= 500 || res.status === 400)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      res = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      data = await res.json().catch(() => ({ status: false }));
    }

    if (!data.status || !data.data?.authorization_url) {
      console.error("[Paystack Initialize Error]:", data);
      return {
        success: false,
        error: data.message || "Impossible d'initialiser le paiement avec Paystack.",
      };
    }

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    };
  } catch (err: any) {
    console.error("[Paystack Exception]:", err);
    return {
      success: false,
      error: err?.message || "Erreur de connexion avec la passerelle de paiement.",
    };
  }
}

/**
 * Valide la signature HMAC-SHA512 d'un webhook entrant provenant de Paystack.
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader || !PAYSTACK_SECRET_KEY) {
    return false;
  }

  try {
    const computedHash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(signatureHeader, "hex")
    );
  } catch {
    return false;
  }
}
