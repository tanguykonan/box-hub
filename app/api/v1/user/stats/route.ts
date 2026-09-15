import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { RuntimeType } from "@prisma/client";

function formatPulls(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
}

function formatBandwidth(bytes: number | bigint): string {
  const num = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  if (num < 1024 * 1024 * 1024 * 1024) return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  return `${(num / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Récupération de l'utilisateur avec son quota et tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        tier: true,
        quotaBytes: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Récupération des paquets et versions
    const [publicCount, protectedCount, packages] = await Promise.all([
      prisma.package.count({
        where: { authorId: userId, isPrivate: false },
      }),
      prisma.package.count({
        where: { authorId: userId, isPrivate: true },
      }),
      prisma.package.findMany({
        where: { authorId: userId },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: {
          totalDownloads: "desc",
        },
      }),
    ]);

    // Calcul du stockage utilisé et de la bande passante estimée
    let totalStorageBytes = BigInt(0);
    let totalBandwidthBytes = BigInt(0);
    let totalDownloads = 0;
    let pythonPulls = 0;
    let nodePulls = 0;

    for (const pkg of packages) {
      totalDownloads += pkg.totalDownloads;
      const latestVersion = pkg.versions[0];
      const versionSizeBytes = latestVersion ? BigInt(latestVersion.fileSizeBytes) : BigInt(0);

      // Bande passante estimée = downloads * taille de la version
      totalBandwidthBytes += BigInt(pkg.totalDownloads) * versionSizeBytes;

      if (pkg.runtime === RuntimeType.PYTHON) {
        pythonPulls += pkg.totalDownloads;
      } else {
        nodePulls += pkg.totalDownloads;
      }

      for (const v of pkg.versions) {
        totalStorageBytes += BigInt(v.fileSizeBytes);
      }
    }

    const storageUsedMB = Number((Number(totalStorageBytes) / (1024 * 1024)).toFixed(1));
    const quotaBytesNum = Number(user.quotaBytes);
    const storageLimitMB = Math.round(quotaBytesNum / (1024 * 1024));

    const percentage = storageLimitMB > 0
      ? Math.min(100, Math.round((storageUsedMB / storageLimitMB) * 100))
      : 0;

    // Répartition par runtime (0% si aucun téléchargement)
    const totalRuntimePulls = pythonPulls + nodePulls;
    const pythonPct = totalRuntimePulls > 0 ? Math.round((pythonPulls / totalRuntimePulls) * 100) : 0;
    const nodePct = totalRuntimePulls > 0 ? 100 - pythonPct : 0;

    const distributionByRuntime = [
      {
        name: "Python (UV / FastEngine)",
        percentage: pythonPct,
        pulls: `${formatPulls(pythonPulls)} pulls`,
        color: "bg-orange-600",
      },
      {
        name: "Node.js (Bun / TypeScript)",
        percentage: nodePct,
        pulls: `${formatPulls(nodePulls)} pulls`,
        color: "bg-emerald-600",
      },
    ];

    // Top 5 paquets
    const topPackages = packages.slice(0, 5).map((pkg) => {
      const isPython = pkg.runtime === RuntimeType.PYTHON;
      const latestVersion = pkg.versions[0];
      const sharePct = totalDownloads > 0 ? Math.round((pkg.totalDownloads / totalDownloads) * 100) : 0;

      return {
        name: `${user.username}/${pkg.name}`,
        tag: latestVersion ? latestVersion.tag : "latest",
        pulls: formatPulls(pkg.totalDownloads),
        share: `${sharePct}%`,
        runtime: isPython ? "Python" : "Node.js",
        runtimeColor: isPython ? "bg-orange-600" : "bg-emerald-600",
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        publicBoxes: publicCount,
        protectedBoxes: protectedCount,
        totalDownloads,
        totalDownloadsFormatted: formatPulls(totalDownloads),
        storageUsedMB,
        storageLimitMB,
        percentage,
        tier: user.tier.toLowerCase(),
        bandwidthFormatted: formatBandwidth(totalBandwidthBytes),
        distributionByRuntime,
        topPackages,
      },
    });
  } catch (error) {
    console.error("Erreur calcul stats utilisateur:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
