import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays} jours`;
}

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const channels = await prisma.alertChannel.findMany({
      orderBy: { type: "asc" },
    });
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const telegramChannel = channels.find((c) => c.type === "telegram");
    const discordChannel = channels.find((c) => c.type === "discord");

    const mappedChannels = [
      {
        id: "telegram",
        name: "Telegram Bot",
        enabled: telegramChannel?.isEnabled ?? true,
        target: telegramChannel?.target ?? "",
        extraTarget: telegramChannel?.extraTarget ?? "",
        placeholder: "Token du Bot Telegram",
      },
      {
        id: "discord",
        name: "Discord Webhook",
        enabled: discordChannel?.isEnabled ?? true,
        target: discordChannel?.target ?? "",
        placeholder: "https://discord.com/api/webhooks/...",
      },
    ];

    const telegramTriggers = (telegramChannel?.triggers as any) || {};
    const discordTriggers = (discordChannel?.triggers as any) || {};

    const triggers = {
      // 1. Trafic et Santé Système
      trafficSpike: telegramTriggers.trafficSpike ?? discordTriggers.trafficSpike ?? true,
      storageSaturation: telegramTriggers.storageSaturation ?? discordTriggers.storageSaturation ?? true,
      systemError: telegramTriggers.systemError ?? discordTriggers.systemError ?? true,
      // 2. Sécurité et Administration
      maintenanceToggle: telegramTriggers.maintenanceToggle ?? discordTriggers.maintenanceToggle ?? true,
      adminChanges: telegramTriggers.adminChanges ?? discordTriggers.adminChanges ?? true,
      userModeration: telegramTriggers.userModeration ?? discordTriggers.userModeration ?? true,
    };

    const notifications = logs.map((log) => {
      let category: "Financement" | "Trafic" | "Sécurité" = "Sécurité";
      let level: "success" | "warning" | "info" = "info";

      const lower = log.action.toLowerCase();
      if (lower.includes("don") || lower.includes("tier") || lower.includes("paiement") || lower.includes("supporter") || lower.includes("sponsor")) {
        category = "Financement";
        level = lower.includes("échec") || lower.includes("annul") ? "warning" : "success";
      } else if (lower.includes("push") || lower.includes("pull") || lower.includes("trafic") || lower.includes("stockage") || lower.includes("erreur") || lower.includes("saturation")) {
        category = "Trafic";
        level = lower.includes("pic") || lower.includes("échec") || lower.includes("saturation") || lower.includes("erreur") ? "warning" : "info";
      } else {
        category = "Sécurité";
        level = lower.includes("suppression") || lower.includes("banni") || lower.includes("révocation") || lower.includes("maintenance") ? "warning" : "info";
      }

      return {
        id: log.id,
        category,
        title: log.action.split(":")[0] || log.action,
        message: log.action,
        time: formatNotificationTime(log.createdAt),
        level,
      };
    });

    return NextResponse.json({
      success: true,
      channels: mappedChannels,
      triggers,
      notifications,
    });
  } catch (error) {
    console.error("Erreur API Admin Alerts GET:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des alertes." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await req.json();
    const { channels, triggers } = body;

    if (Array.isArray(channels)) {
      for (const ch of channels) {
        const type = ch.id === "telegram" ? "telegram" : "discord";
        const existing = await prisma.alertChannel.findFirst({
          where: { type },
        });

        if (existing) {
          await prisma.alertChannel.update({
            where: { id: existing.id },
            data: {
              isEnabled: Boolean(ch.enabled),
              target: String(ch.target || ""),
              extraTarget: ch.extraTarget ? String(ch.extraTarget) : null,
              triggers: triggers || {},
            },
          });
        } else {
          await prisma.alertChannel.create({
            data: {
              type,
              name: ch.name || (type === "telegram" ? "Telegram Bot" : "Discord Webhook"),
              isEnabled: Boolean(ch.enabled),
              target: String(ch.target || ""),
              extraTarget: ch.extraTarget ? String(ch.extraTarget) : null,
              triggers: triggers || {},
            },
          });
        }
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: authResult.user.id,
        platform: "web",
        action: "Mise à jour des canaux d'alertes Telegram et Discord",
        status: "success",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configuration des alertes enregistrée avec succès.",
    });
  } catch (error) {
    console.error("Erreur API Admin Alerts PUT:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'enregistrement des alertes." },
      { status: 500 }
    );
  }
}
