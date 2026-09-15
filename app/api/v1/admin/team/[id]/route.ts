import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Role } from "@prisma/client";
import { sendSystemAlert } from "@/lib/alerts";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { id } = await params;
    
    // Seul le Propriétaire peut révoquer des administrateurs
    const adminUsers = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: "asc" },
    });
    const firstAdmin = adminUsers[0];
    const isOwner =
      authResult.user.username === "alex" ||
      (firstAdmin && authResult.user.id === firstAdmin.id);

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          message: "Action refusée. Seul le Propriétaire de la plateforme peut révoquer des administrateurs.",
        },
        { status: 403 }
      );
    }

    if (id === authResult.user.id) {
      return NextResponse.json(
        { success: false, message: "Vous ne pouvez pas révoquer vos propres droits administrateur." },
        { status: 400 }
      );
    }

    const [userMember, inviteMember] = await Promise.all([
      prisma.user.findUnique({ where: { id } }),
      prisma.adminInvite.findUnique({ where: { id } }),
    ]);

    if (!userMember && !inviteMember) {
      return NextResponse.json(
        { success: false, message: "Administrateur ou invitation introuvable." },
        { status: 404 }
      );
    }

    if (userMember) {
      await prisma.user.update({
        where: { id },
        data: { role: Role.USER },
      });

      await prisma.activityLog.create({
        data: {
          userId: authResult.user.id,
          platform: "web",
          action: `Révocation des droits administrateur de ${userMember.username} (${userMember.email})`,
          status: "success",
        },
      });

      await sendSystemAlert({
        trigger: "adminChanges",
        category: "Sécurité",
        title: "Droits Administrateur Révoqués",
        message: `Les droits administrateur de @${userMember.username} (${userMember.email}) ont été révoqués par le Propriétaire.`,
        level: "warning",
        userId: authResult.user.id,
      });
    }

    if (inviteMember) {
      await prisma.adminInvite.delete({
        where: { id },
      });

      await prisma.activityLog.create({
        data: {
          userId: authResult.user.id,
          platform: "web",
          action: `Annulation de l'invitation administrateur pour ${inviteMember.name} (${inviteMember.email})`,
          status: "success",
        },
      });

      await sendSystemAlert({
        trigger: "adminChanges",
        category: "Sécurité",
        title: "Invitation Administrateur Annulée",
        message: `L'invitation administrateur envoyée à ${inviteMember.name} (${inviteMember.email}) a été annulée.`,
        level: "info",
        userId: authResult.user.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Accès administrateur révoqué avec succès.",
    });
  } catch (error) {
    console.error("Erreur API Admin Team DELETE:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la révocation de l'accès." },
      { status: 500 }
    );
  }
}
