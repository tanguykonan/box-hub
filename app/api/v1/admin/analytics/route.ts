import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { RuntimeType, PackageCategory } from "@prisma/client";

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const totalUsers = await prisma.user.count({ where: { isBanned: false } });
    const packages = await prisma.package.findMany({
      select: {
        id: true,
        runtime: true,
        category: true,
        totalDownloads: true,
      },
    });
    const versions = await prisma.packageVersion.findMany({
      select: {
        fileSizeBytes: true,
      },
    });
    const dailyMetrics = await prisma.dailyMetric.findMany({
      orderBy: { date: "asc" },
      take: 7,
    });
    const storageSetting = await prisma.systemSetting.findUnique({
      where: { key: "max_storage_limit_gb" },
    });

    let totalPulls = 0;
    let pythonPulls = 0;
    let nodePulls = 0;

    const categoryCounts: Record<PackageCategory, number> = {
      [PackageCategory.BOTS]: 0,
      [PackageCategory.API]: 0,
      [PackageCategory.AI]: 0,
      [PackageCategory.TOOLS]: 0,
    };

    for (const pkg of packages) {
      totalPulls += pkg.totalDownloads;
      if (pkg.runtime === RuntimeType.PYTHON) {
        pythonPulls += pkg.totalDownloads;
      } else {
        nodePulls += pkg.totalDownloads;
      }

      if (categoryCounts[pkg.category] !== undefined) {
        categoryCounts[pkg.category]++;
      }
    }

    const totalRuntimePulls = pythonPulls + nodePulls;
    const pythonPct = totalRuntimePulls > 0 ? Math.round((pythonPulls / totalRuntimePulls) * 100) : 0;
    const nodePct = totalRuntimePulls > 0 ? 100 - pythonPct : 0;

    const runtimeDistribution = [
      {
        name: "Python (UV / FastEngine)",
        percentage: pythonPct,
        count: pythonPulls,
        color: "bg-orange-600",
      },
      {
        name: "Node.js (Bun / TS)",
        percentage: nodePct,
        count: nodePulls,
        color: "bg-emerald-600",
      },
    ];

    const totalPackages = packages.length;
    const categoryDistribution = [
      {
        key: "bots" as const,
        category: "Bots et Automatisation",
        boxesCount: categoryCounts[PackageCategory.BOTS],
        percentage: totalPackages > 0 ? Math.round((categoryCounts[PackageCategory.BOTS] / totalPackages) * 100) : 0,
        color: "bg-orange-600",
      },
      {
        key: "api" as const,
        category: "Services et APIs",
        boxesCount: categoryCounts[PackageCategory.API],
        percentage: totalPackages > 0 ? Math.round((categoryCounts[PackageCategory.API] / totalPackages) * 100) : 0,
        color: "bg-emerald-600",
      },
      {
        key: "tools" as const,
        category: "Outils et Utilitaires",
        boxesCount: categoryCounts[PackageCategory.TOOLS],
        percentage: totalPackages > 0 ? Math.round((categoryCounts[PackageCategory.TOOLS] / totalPackages) * 100) : 0,
        color: "bg-zinc-800 dark:bg-zinc-200",
      },
      {
        key: "ai" as const,
        category: "Intelligence Artificielle",
        boxesCount: categoryCounts[PackageCategory.AI],
        percentage: totalPackages > 0 ? Math.round((categoryCounts[PackageCategory.AI] / totalPackages) * 100) : 0,
        color: "bg-pink-600",
      },
    ];

    let totalStorageBytes = BigInt(0);
    for (const v of versions) {
      totalStorageBytes += BigInt(v.fileSizeBytes);
    }
    const storageUsedGB = Number((Number(totalStorageBytes) / (1024 * 1024 * 1024)).toFixed(2));
    const storageLimitGB = storageSetting?.value ? parseFloat(storageSetting.value) : 10.0;

    const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const weeklyHistory = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      const dayIso = d.toISOString().split("T")[0];

      const foundMetric = dailyMetrics.find((dm) => {
        const metricIso = new Date(dm.date).toISOString().split("T")[0];
        return metricIso === dayIso;
      });

      const bwGB = foundMetric
        ? Math.round(Number(foundMetric.bandwidthBytes) / (1024 * 1024 * 1024))
        : 0;

      weeklyHistory.push({
        date: dayLabel,
        pulls: foundMetric ? foundMetric.pullsCount : 0,
        signups: foundMetric ? foundMetric.signupsCount : 0,
        bandwidthGB: bwGB,
      });
    }

    const totalBwBytes = dailyMetrics.reduce((acc, m) => acc + BigInt(m.bandwidthBytes), BigInt(0));
    const bandwidthConsumedTB = Number((Number(totalBwBytes) / (1024 * 1024 * 1024 * 1024)).toFixed(2));

    return NextResponse.json({
      success: true,
      analytics: {
        totalPulls,
        pullsGrowthPct: 0.0,
        totalUsers,
        usersGrowthPct: 0.0,
        bandwidthConsumedTB,
        dauMauRatio: 0.0,
        storageUsedGB,
        storageLimitGB,
        runtimeDistribution,
        categoryDistribution,
        weeklyHistory,
      },
    });
  } catch (error) {
    console.error("Erreur API Admin Analytics:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération de la télémétrie." },
      { status: 500 }
    );
  }
}
