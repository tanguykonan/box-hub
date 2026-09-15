import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { UserTier } from "@prisma/client";

function formatJoinedDate(date: Date): string {
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatLastLogin(date: Date | null): string {
  if (!date) return "Jamais";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return formatJoinedDate(date);
}

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        packages: {
          select: {
            id: true,
            versions: {
              select: {
                fileSizeBytes: true,
              },
            },
          },
        },
      },
    });

    const tierNameMap: Record<UserTier, string> = {
      [UserTier.FREE]: "Gratuit",
      [UserTier.TIER_5]: "Sponsor 5 €",
      [UserTier.TIER_10]: "Donateur 10 €",
      [UserTier.TIER_20]: "Supporter 20 €",
    };

    const tierKeyMap: Record<UserTier, "free" | "tier_5" | "tier_10" | "tier_20"> = {
      [UserTier.FREE]: "free",
      [UserTier.TIER_5]: "tier_5",
      [UserTier.TIER_10]: "tier_10",
      [UserTier.TIER_20]: "tier_20",
    };

    const mappedUsers = users.map((u) => {
      let totalStorageBytes = BigInt(0);
      for (const pkg of u.packages) {
        for (const v of pkg.versions) {
          totalStorageBytes += BigInt(v.fileSizeBytes);
        }
      }

      const storageUsedMB = Number((Number(totalStorageBytes) / (1024 * 1024)).toFixed(1));
      const storageLimitMB = Math.round(Number(u.quotaBytes) / (1024 * 1024));

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        tier: tierKeyMap[u.tier] || "free",
        tierName: tierNameMap[u.tier] || "Gratuit",
        boxesCount: u.packages.length,
        storageUsedMB,
        storageLimitMB,
        status: u.isBanned ? "suspended" : "active",
        joinedAt: formatJoinedDate(u.createdAt),
        lastLogin: formatLastLogin(u.lastLoginAt),
        role: u.role,
      };
    });

    return NextResponse.json({
      success: true,
      users: mappedUsers,
    });
  } catch (error) {
    console.error("Erreur API Admin Users GET:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des utilisateurs." },
      { status: 500 }
    );
  }
}
