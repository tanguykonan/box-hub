import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRelativeNotificationDate } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentification requise." },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    const mapped = notifications.map((n) => ({
      id: n.id,
      category: n.category,
      message: n.message,
      level: n.level,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      timeFormatted: formatRelativeNotificationDate(n.createdAt),
    }));

    return NextResponse.json({
      success: true,
      data: {
        notifications: mapped,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors du chargement des notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentification requise." },
        { status: 401 }
      );
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Toutes les notifications ont été marquées comme lues.",
    });
  } catch (error) {
    console.error("Erreur mise à jour notifications:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour des notifications." },
      { status: 500 }
    );
  }
}
