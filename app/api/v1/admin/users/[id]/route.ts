import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { UserTier, Role } from "@prisma/client";
import { sendSystemAlert } from "@/lib/alerts";
import { createUserNotification } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { id } = await params;
    const body = await req.json();

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (typeof body.isBanned === "boolean") {
      if (id === authResult.user.id && body.isBanned) {
        return NextResponse.json(
          { success: false, message: "Vous ne pouvez pas suspendre votre propre compte administrateur." },
          { status: 400 }
        );
      }
      updateData.isBanned = body.isBanned;
    }

    if (body.tier) {
      const tierMap: Record<string, { tier: UserTier; quotaBytes: bigint }> = {
        free: { tier: UserTier.FREE, quotaBytes: BigInt(524288000) },
        tier_5: { tier: UserTier.TIER_5, quotaBytes: BigInt(10737418240) },
        tier_10: { tier: UserTier.TIER_10, quotaBytes: BigInt(32212254720) },
        tier_20: { tier: UserTier.TIER_20, quotaBytes: BigInt(107374182400) },
        FREE: { tier: UserTier.FREE, quotaBytes: BigInt(524288000) },
        TIER_5: { tier: UserTier.TIER_5, quotaBytes: BigInt(10737418240) },
        TIER_10: { tier: UserTier.TIER_10, quotaBytes: BigInt(32212254720) },
        TIER_20: { tier: UserTier.TIER_20, quotaBytes: BigInt(107374182400) },
      };

      const matched = tierMap[body.tier];
      if (matched) {
        updateData.tier = matched.tier;
        updateData.quotaBytes = matched.quotaBytes;
      }
    }

    if (typeof body.quotaBytes === "number" || typeof body.quotaBytes === "string") {
      updateData.quotaBytes = BigInt(body.quotaBytes);
    }

    if (body.role && (body.role === Role.ADMIN || body.role === Role.USER)) {
      if (id === authResult.user.id && body.role !== Role.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Vous ne pouvez pas retirer vos propres privilèges administrateur." },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        userId: authResult.user.id,
        platform: "web",
        action: `Modification administrative de l'utilisateur ${targetUser.username} (ID: ${id})`,
        status: "success",
      },
    });

    // Déclenchement alerte suspension
    if (typeof body.isBanned === "boolean" && body.isBanned !== targetUser.isBanned) {
      await sendSystemAlert({
        trigger: "userModeration",
        category: "Sécurité",
        title: body.isBanned ? "Compte Utilisateur Suspendu" : "Compte Utilisateur Réactivé",
        message: body.isBanned
          ? `Le compte @${targetUser.username} (${targetUser.email}) a été suspendu/banni par l'administrateur @${authResult.user.username}.`
          : `La suspension du compte @${targetUser.username} (${targetUser.email}) a été levée par @${authResult.user.username}.`,
        level: body.isBanned ? "warning" : "info",
        userId: authResult.user.id,
      });

      // Notification utilisateur lors de la réactivation de son compte
      if (!body.isBanned) {
        createUserNotification({
          userId: targetUser.id,
          category: "account",
          message: "Votre compte a été réactivé avec succès.",
          level: "success",
        }).catch(() => {});
      }
    }

    // Déclenchement alerte don / tier
    if (updateData.tier && updateData.tier !== targetUser.tier && updateData.tier !== UserTier.FREE) {
      await sendSystemAlert({
        trigger: "newDonation",
        category: "Financement",
        title: "Nouveau Tier de Soutien",
        message: `Le compte @${targetUser.username} a été configuré au palier ${updateData.tier}. Quota étendu alloué avec succès.`,
        level: "success",
        userId: authResult.user.id,
      });
    }

    // Notification utilisateur lors de la mise à jour de son quota
    if (updateData.tier && updateData.tier !== targetUser.tier) {
      const quotaLabels: Record<UserTier, string> = {
        [UserTier.FREE]: "500 MB (Palier Gratuit)",
        [UserTier.TIER_5]: "10 Go (Palier Sponsor)",
        [UserTier.TIER_10]: "30 Go (Palier Donateur)",
        [UserTier.TIER_20]: "100 Go (Palier Supporter)",
      };
      const label = quotaLabels[updateData.tier as UserTier] || "mis à jour";
      createUserNotification({
        userId: targetUser.id,
        category: "quota",
        message: `Votre quota de stockage est passé à ${label}.`,
        level: "info",
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Utilisateur mis à jour avec succès.",
      user: {
        id: updated.id,
        username: updated.username,
        tier: updated.tier,
        isBanned: updated.isBanned,
        role: updated.role,
        quotaBytes: updated.quotaBytes.toString(),
      },
    });
  } catch (error) {
    console.error("Erreur API Admin Users PATCH:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour de l'utilisateur." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { id } = await params;

    if (id === authResult.user.id) {
      return NextResponse.json(
        { success: false, message: "Vous ne pouvez pas supprimer votre propre compte administrateur." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: authResult.user.id,
        platform: "web",
        action: `Suppression définitive de l'utilisateur ${targetUser.username} (${targetUser.email})`,
        status: "success",
      },
    });

    await sendSystemAlert({
      trigger: "userModeration",
      category: "Sécurité",
      title: "Compte Utilisateur Supprimé",
      message: `Le compte @${targetUser.username} (${targetUser.email}) a été définitivement supprimé par @${authResult.user.username}.`,
      level: "warning",
      userId: authResult.user.id,
    });

    return NextResponse.json({
      success: true,
      message: `Compte de ${targetUser.username} supprimé avec succès.`,
    });
  } catch (error) {
    console.error("Erreur API Admin Users DELETE:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la suppression de l'utilisateur." },
      { status: 500 }
    );
  }
}
