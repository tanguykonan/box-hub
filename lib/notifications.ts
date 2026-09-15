import { prisma } from "@/lib/db";

export type NotificationCategory =
  | "star"
  | "pull"
  | "milestone"
  | "push"
  | "quota"
  | "token"
  | "account";

export interface CreateNotificationParams {
  userId: string;
  category: NotificationCategory;
  message: string;
  level?: "info" | "success" | "warning";
}

/**
 * Enregistre une notification pour un utilisateur et maintient un maximum de 10 notifications
 * en supprimant automatiquement les plus anciennes de la base de données.
 */
export async function createUserNotification({
  userId,
  category,
  message,
  level = "info",
}: CreateNotificationParams) {
  try {
    // 1. Création de la nouvelle notification
    await prisma.notification.create({
      data: {
        userId,
        category,
        title: "", // Pas de titre, message direct
        message: message.trim(),
        level,
        isRead: false,
      },
    });

    // 2. Récupération des notifications excédentaires (au-delà des 10 plus récentes)
    const excessNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: 10,
      select: { id: true },
    });

    // 3. Suppression automatique des plus anciennes
    if (excessNotifications.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          id: { in: excessNotifications.map((n) => n.id) },
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
  }
}

/**
 * Formate une date en horodatage relatif français court (ex: "Il y a 5 min", "Hier à 14:30")
 */
export function formatRelativeNotificationDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const pad = (n: number) => String(n).padStart(2, "0");
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return `Il y a ${diffHours}h`;
  }
  if (diffDays === 1 || (diffHours < 48 && date.getDate() === now.getDate() - 1)) {
    return `Hier à ${timeStr}`;
  }

  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];
  return `${pad(date.getDate())} ${months[date.getMonth()]}`;
}
