import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaystackWebhookSignature, PAYSTACK_TIERS } from "@/lib/paystack";
import { createUserNotification } from "@/lib/notifications";
import { sendSystemAlert } from "@/lib/alerts";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // En environnement de production avec clé configurée, vérification cryptographique stricte
    if (process.env.PAYSTACK_SECRET_KEY) {
      const isValid = verifyPaystackWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn("⚠️ [Paystack Webhook] Signature invalide rejetée.");
        return NextResponse.json({ success: false, message: "Signature invalide" }, { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: "JSON invalide" }, { status: 400 });
    }

    const event = payload?.event;
    const data = payload?.data;

    console.log(`📦 [Paystack Webhook] Événement reçu : ${event} (Ref: ${data?.reference})`);

    // Traitement du paiement réussi
    if (event === "charge.success") {
      const userId = data?.metadata?.userId;
      const tierId = data?.metadata?.tier as "tier_5" | "tier_10" | "tier_20";
      const tierConfig = PAYSTACK_TIERS[tierId];

      if (userId && tierConfig) {
        // 1. Mise à jour de l'utilisateur avec son nouveau palier et quota
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            tier: tierConfig.tierEnum,
            quotaBytes: tierConfig.quotaBytes,
          },
        });

        // 2. Enregistrement de la transaction financière
        await prisma.paymentTransaction.create({
          data: {
            userId,
            tierName: tierConfig.name,
            amount: data.amount ? Math.round(data.amount / 100) : Math.round(tierConfig.amountSubunit / 100),
            currency: data.currency || tierConfig.currency,
            status: "paid",
            externalId: data.reference || String(data.id || Date.now()),
          },
        }).catch((err) => console.error("Erreur enregistrement transaction:", err));

        // 3. Notification utilisateur interne
        const quotaGB = Math.round(Number(tierConfig.quotaBytes) / (1024 * 1024 * 1024));
        createUserNotification({
          userId,
          category: "quota",
          message: `Votre compte est maintenant ${tierConfig.name} (${quotaGB} Go de stockage alloués).`,
          level: "success",
        }).catch(() => {});

        // 4. Déclenchement de l'alerte administrative (Discord / Telegram)
        sendSystemAlert({
          trigger: "newDonation",
          category: "Financement",
          title: `Nouveau soutien ${tierConfig.name}`,
          message: `L'utilisateur @${updatedUser.username} a souscrit au palier ${tierConfig.name} pour ${(data.amount / 100).toFixed(2)} ${data.currency || "EUR"}.`,
          level: "success",
          userId: updatedUser.id,
        }).catch(() => {});

        console.log(`✅ [Paystack] Palier ${tierConfig.name} activé avec succès pour l'utilisateur ${updatedUser.username}`);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook traité avec succès" });
  } catch (error) {
    console.error("Erreur Paystack webhook:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur webhook" }, { status: 500 });
  }
}
