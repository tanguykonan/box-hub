import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { sendDiscordWebhook, sendTelegramMessage } from "@/lib/alerts";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await req.json();
    const { channelId, target, extraTarget } = body;

    if (!target) {
      return NextResponse.json(
        { success: false, message: "Cible de notification manquante." },
        { status: 400 }
      );
    }

    let testResult: { success: boolean; error?: string } = { success: false };

    if (channelId === "discord") {
      testResult = await sendDiscordWebhook(target, {
        title: "Test de Connexion Réussi",
        message: "Ceci est une notification de test envoyée depuis la console d'administration Box Hub. Vos alertes Discord sont opérationnelles !",
        category: "Sécurité",
        level: "success",
      });
    } else if (channelId === "telegram") {
      if (!extraTarget) {
        return NextResponse.json(
          { success: false, message: "Chat ID Telegram requis pour envoyer une notification de test." },
          { status: 400 }
        );
      }
      testResult = await sendTelegramMessage(target, extraTarget, {
        title: "Test de Connexion Réussi",
        message: "Ceci est une notification de test envoyée depuis la console d'administration Box Hub. Vos alertes Telegram sont opérationnelles !",
        category: "Sécurité",
        level: "success",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Type de canal d'alerte non reconnu." },
        { status: 400 }
      );
    }

    if (!testResult.success) {
      await prisma.activityLog.create({
        data: {
          userId: authResult.user.id,
          platform: "web",
          action: `Échec du test de notification sur le canal ${channelId}: ${testResult.error}`,
          status: "failed",
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: testResult.error || "Échec de l'envoi du message de test.",
        },
        { status: 400 }
      );
    }

    await prisma.activityLog.create({
      data: {
        userId: authResult.user.id,
        platform: "web",
        action: `Test de notification envoyé avec succès sur le canal ${channelId}`,
        status: "success",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification de test envoyée avec succès.",
    });
  } catch (error) {
    console.error("Erreur API Admin Alerts Test:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de l'envoi du message de test." },
      { status: 500 }
    );
  }
}
