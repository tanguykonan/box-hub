import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { sendSystemAlert } from "@/lib/alerts";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_mode" },
    });

    const isMaintenance = setting?.value === "true";

    return NextResponse.json({
      success: true,
      maintenance: isMaintenance,
      updatedAt: setting?.updatedAt,
    });
  } catch (error) {
    console.error("Erreur API Maintenance GET:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la vérification du mode maintenance." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await req.json().catch(() => ({}));
    let nextState: boolean;

    if (typeof body.maintenance === "boolean") {
      nextState = body.maintenance;
    } else {
      const current = await prisma.systemSetting.findUnique({
        where: { key: "maintenance_mode" },
      });
      nextState = current?.value !== "true";
    }

    const updated = await prisma.systemSetting.upsert({
      where: { key: "maintenance_mode" },
      update: {
        value: String(nextState),
      },
      create: {
        key: "maintenance_mode",
        value: String(nextState),
        description: "Bascule globale du mode maintenance sur le Hub et les API",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: authResult.user.id,
        platform: "web",
        action: `Mode maintenance ${nextState ? "ACTIVÉ" : "DÉSACTIVÉ"} par ${authResult.user.username}`,
        status: "success",
      },
    });

    // Envoi de l'alerte sur les canaux Discord / Telegram
    await sendSystemAlert({
      trigger: "maintenanceToggle",
      category: "Sécurité",
      title: nextState ? "Mode Maintenance Activé" : "Plateforme Opérationnelle",
      message: nextState
        ? `Le mode maintenance a été ACTIVÉ par l'administrateur @${authResult.user.username}. L'accès public est temporairement verrouillé.`
        : `Le mode maintenance a été DÉSACTIVÉ par l'administrateur @${authResult.user.username}. La plateforme est de nouveau en ligne.`,
      level: nextState ? "warning" : "success",
      userId: authResult.user.id,
    });

    return NextResponse.json({
      success: true,
      maintenance: updated.value === "true",
      message: updated.value === "true"
        ? "Mode maintenance activé. La plateforme est désormais verrouillée."
        : "Mode maintenance désactivé. La plateforme est opérationnelle.",
    });
  } catch (error) {
    console.error("Erreur API Maintenance POST:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la modification du mode maintenance." },
      { status: 500 }
    );
  }
}
