import { prisma } from "@/lib/db";

export type AlertTriggerType =
  | "newDonation"
  | "failedPayment"
  | "trafficSpike"
  | "storageSaturation"
  | "systemError"
  | "maintenanceToggle"
  | "adminChanges"
  | "userModeration";

export type AlertCategory = "Financement" | "Trafic" | "Sécurité";
export type AlertLevel = "info" | "warning" | "success" | "error";

export interface AlertPayload {
  trigger: AlertTriggerType;
  category: AlertCategory;
  title: string;
  message: string;
  level?: AlertLevel;
  userId?: string;
  metadata?: Record<string, any>;
}

function getCategoryEmoji(category: AlertCategory): string {
  switch (category) {
    case "Financement":
      return "💖";
    case "Trafic":
      return "⚡";
    case "Sécurité":
      return "🛡️";
    default:
      return "🔔";
  }
}

function getDiscordColor(level: AlertLevel, category: AlertCategory): number {
  if (level === "error") return 0xef4444; // Red
  if (level === "warning") return 0xf59e0b; // Amber
  if (category === "Financement") return 0xdb2777; // Pink 600
  if (category === "Trafic") return 0xea580c; // Orange 600
  return 0x059669; // Emerald 600
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Envoie un message de test ou réel sur un webhook Discord
 */
export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: {
    title: string;
    message: string;
    category: AlertCategory;
    level?: AlertLevel;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return { success: false, error: "URL du Webhook Discord invalide." };
    }

    const level = payload.level || "info";
    const body = {
      username: "Box Hub Alerts",
      avatar_url: "https://boxhub.paxiz.org/icon.jpg",
      embeds: [
        {
          title: `${getCategoryEmoji(payload.category)} ${payload.title}`,
          description: payload.message,
          color: getDiscordColor(level, payload.category),
          fields: [
            { name: "Catégorie", value: payload.category, inline: true },
            { name: "Niveau", value: level.toUpperCase(), inline: true },
          ],
          footer: {
            text: "Box Hub Platform • boxhub.paxiz.org",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        success: false,
        error: `Erreur Discord HTTP ${res.status}: ${errText.substring(0, 100) || res.statusText}`,
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: `Échec de connexion Discord: ${err.message || String(err)}`,
    };
  }
}

/**
 * Envoie un message de test ou réel via un Bot Telegram
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  payload: {
    title: string;
    message: string;
    category: AlertCategory;
    level?: AlertLevel;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      return { success: false, error: "Token Bot ou Chat ID Telegram manquant." };
    }

    const formattedText = [
      `<b>${getCategoryEmoji(payload.category)} ${escapeHtml(payload.title)}</b>`,
      `<i>Catégorie: ${payload.category} | Niveau: ${(payload.level || "info").toUpperCase()}</i>`,
      ``,
      `${escapeHtml(payload.message)}`,
      ``,
      `📅 <code>${new Date().toLocaleString("fr-FR")}</code> • <b>Box Hub</b>`,
    ].join("\n");

    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: formattedText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      return {
        success: false,
        error: `Erreur Telegram ${data?.error_code || res.status}: ${data?.description || res.statusText}`,
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: `Échec de connexion Telegram: ${err.message || String(err)}`,
    };
  }
}

/**
 * Moteur central d'alerte : vérifie les canaux activés et les triggers, puis dispatche les messages.
 */
export async function sendSystemAlert(payload: AlertPayload): Promise<void> {
  try {
    const channels = await prisma.alertChannel.findMany({
      where: { isEnabled: true },
    });

    const promises: Promise<any>[] = [];

    for (const channel of channels) {
      const triggers = (channel.triggers as Record<string, boolean>) || {};
      // Si le déclencheur est actif pour ce canal (ou true par défaut)
      const isTriggerEnabled = triggers[payload.trigger] !== false;

      if (!isTriggerEnabled) continue;

      if (channel.type === "discord" && channel.target) {
        promises.push(
          sendDiscordWebhook(channel.target, {
            title: payload.title,
            message: payload.message,
            category: payload.category,
            level: payload.level,
          })
        );
      } else if (channel.type === "telegram" && channel.target && channel.extraTarget) {
        promises.push(
          sendTelegramMessage(channel.target, channel.extraTarget, {
            title: payload.title,
            message: payload.message,
            category: payload.category,
            level: payload.level,
          })
        );
      }
    }

    // Exécution en parallèle sans bloquer la requête principale
    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'alerte système:", error);
  }
}
