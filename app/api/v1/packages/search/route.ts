import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { RuntimeType, PackageCategory } from "@prisma/client";

function formatBytes(bytes: bigint | number): string {
  const num = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

function formatPulls(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 2) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const runtime = searchParams.get("runtime");
    const onlyProtected = searchParams.get("protected") === "true";
    const sortBy = searchParams.get("sortBy") || "stars"; // 'stars' | 'pulls' | 'recent'
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {
      isPrivate: false,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { author: { username: { contains: query, mode: "insensitive" } } },
        { tags: { has: query.startsWith("#") ? query : `#${query}` } },
      ];
    }

    if (category && category !== "all") {
      const catUpper = category.toUpperCase();
      if (catUpper === "AI") where.category = PackageCategory.AI;
      else if (catUpper === "API") where.category = PackageCategory.API;
      else if (catUpper === "TOOLS") where.category = PackageCategory.TOOLS;
      else if (catUpper === "BOTS") where.category = PackageCategory.BOTS;
    }

    if (runtime && runtime !== "all") {
      const rtLower = runtime.toLowerCase();
      if (rtLower === "python") {
        where.runtime = RuntimeType.PYTHON;
      } else if (rtLower === "node" || rtLower === "nodejs") {
        where.runtime = RuntimeType.NODEJS;
      }
    }

    if (onlyProtected) {
      where.isProtected = true;
    }

    let orderBy: any = { totalDownloads: "desc" };
    if (sortBy === "recent") {
      orderBy = { updatedAt: "desc" };
    }

    const packages = await prisma.package.findMany({
      where,
      include: {
        author: {
          select: { username: true, avatarUrl: true, tier: true },
        },
        versions: {
          orderBy: { createdAt: "desc" },
        },
        stars: {
          select: { id: true },
        },
      },
      orderBy,
      take: Math.min(limit, 100),
    });

    let results = packages.map((pkg) => {
      const latestVersion = pkg.versions[0];
      const isPython = pkg.runtime === RuntimeType.PYTHON;
      const starCount = pkg.stars.length;

      return {
        id: pkg.id,
        name: pkg.name,
        author: pkg.author.username,
        authorAvatar: pkg.author.avatarUrl,
        authorTier: pkg.author.tier.toLowerCase(),
        version: latestVersion ? `v${latestVersion.version}` : "v1.0.0",
        tag: latestVersion ? latestVersion.tag : "latest",
        size: latestVersion ? formatBytes(latestVersion.fileSizeBytes) : "0 MB",
        pulls: formatPulls(pkg.totalDownloads),
        pullsCount: pkg.totalDownloads,
        stars: starCount,
        runtime: {
          type: isPython ? "python" : "node",
          version: pkg.runtimeVersion || (isPython ? "3.12" : "22.0.0"),
          runtimeName: isPython
            ? `Python ${pkg.runtimeVersion || "3.12"}`
            : `Node.js ${pkg.runtimeVersion || "22.0.0"}`,
        },
        runtimeText: isPython ? "Python" : "Node.js",
        runtimeColor: isPython ? "bg-orange-600 text-white" : "bg-emerald-600 text-white",
        language: isPython ? "Python" : "TypeScript",
        protected: pkg.isProtected,
        category: pkg.category.toLowerCase(),
        tags: pkg.tags || [],
        description: pkg.description,
        updatedAt: formatTimeAgo(pkg.updatedAt),
        updatedAtRaw: pkg.updatedAt,
      };
    });

    if (sortBy === "stars") {
      results = results.sort((a, b) => b.stars - a.stars);
    } else if (sortBy === "pulls") {
      results = results.sort((a, b) => b.pullsCount - a.pullsCount);
    }

    return NextResponse.json({
      success: true,
      packages: results,
      total: results.length,
    });
  } catch (error) {
    console.error("Erreur recherche packages:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la recherche des paquets" },
      { status: 500 }
    );
  }
}
