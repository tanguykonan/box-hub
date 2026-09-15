import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Role, AdminRole } from "@prisma/client";
import { sendSystemAlert } from "@/lib/alerts";

function formatAdminDate(date: Date): string {
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const adminUsers = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: "asc" },
    });
    const invites = await prisma.adminInvite.findMany({
      where: { accepted: false },
      orderBy: { createdAt: "desc" },
    });

    const members = adminUsers.map((u, index) => {
      const isOwner = index === 0;
      return {
        id: u.id,
        name: u.username,
        email: u.email,
        role: isOwner ? ("Propriétaire" as const) : ("Administrateur" as const),
        addedAt: isOwner ? "Créateur" : formatAdminDate(u.createdAt),
        lastActive: u.lastLoginAt ? "En ligne récemment" : "En attente de connexion",
        isInvite: false,
      };
    });

    const pendingInvites = invites.map((inv) => ({
      id: inv.id,
      name: inv.name,
      email: inv.email,
      role: inv.role === AdminRole.OWNER ? ("Propriétaire" as const) : ("Administrateur" as const),
      addedAt: formatAdminDate(inv.createdAt),
      lastActive: "Invitation en attente",
      isInvite: true,
    }));

    const firstAdmin = adminUsers[0];
    const isCurrentUserOwner = Boolean(
      firstAdmin && authResult.user.id === firstAdmin.id
    );

    return NextResponse.json({
      success: true,
      admins: [...members, ...pendingInvites],
      isCurrentUserOwner,
    });
  } catch (error) {
    console.error("Erreur API Admin Team GET:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des membres administrateurs." },
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

    // Seul le Propriétaire peut inviter ou promouvoir un administrateur
    const adminUsers = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: "asc" },
    });
    const firstAdmin = adminUsers[0];
    const isOwner = Boolean(
      firstAdmin && authResult.user.id === firstAdmin.id
    );

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          message: "Action refusée. Seul le Propriétaire de la plateforme peut inviter des administrateurs.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Nom et adresse email requis." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name).trim();
    const targetRole = role === "Propriétaire" ? AdminRole.OWNER : AdminRole.ADMINISTRATOR;

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: Role.ADMIN },
      });

      await prisma.activityLog.create({
        data: {
          userId: authResult.user.id,
          platform: "web",
          action: `Promotion de ${existingUser.username} (${cleanEmail}) au rôle Administrateur`,
          status: "success",
        },
      });

      await sendSystemAlert({
        trigger: "adminChanges",
        category: "Sécurité",
        title: "Nouvel Administrateur Promu",
        message: `${existingUser.username} (${cleanEmail}) a été promu au rôle d'Administrateur par @${authResult.user.username}.`,
        level: "info",
        userId: authResult.user.id,
      });

      return NextResponse.json({
        success: true,
        message: `${cleanName} a été promu Administrateur avec succès.`,
      });
    }

    const token = `adm_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await prisma.adminInvite.upsert({
      where: { email: cleanEmail },
      update: {
        name: cleanName,
        role: targetRole,
        token,
        accepted: false,
        expiresAt,
      },
      create: {
        email: cleanEmail,
        name: cleanName,
        role: targetRole,
        token,
        accepted: false,
        expiresAt,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: authResult.user.id,
        platform: "web",
        action: `Invitation administrateur envoyée à ${cleanName} (${cleanEmail})`,
        status: "success",
      },
    });

    await sendSystemAlert({
      trigger: "adminChanges",
      category: "Sécurité",
      title: "Invitation Administrateur Envoyée",
      message: `Une invitation administrateur (${targetRole === AdminRole.OWNER ? "Propriétaire" : "Administrateur"}) a été envoyée à ${cleanName} (${cleanEmail}) par @${authResult.user.username}.`,
      level: "info",
      userId: authResult.user.id,
    });

    return NextResponse.json({
      success: true,
      message: `Invitation envoyée avec succès à ${cleanName}.`,
      invite: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        role: invite.role,
      },
    });
  } catch (error) {
    console.error("Erreur API Admin Team POST:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'envoi de l'invitation." },
      { status: 500 }
    );
  }
}
