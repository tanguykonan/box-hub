import { NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import { RuntimeType } from "@prisma/client";

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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

export async function GET(
  req: Request,
  props: { params: Promise<{ author: string; name: string }> }
) {
  try {
    const { author: authorParam, name: nameParam } = await props.params;
    const authorUsername = decodeURIComponent(authorParam).toLowerCase();
    const packageName = decodeURIComponent(nameParam).toLowerCase();

    const session = await auth();
    const currentUserId = session?.user?.id;

    const authorUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: authorUsername,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        tier: true,
        role: true,
      },
    });

    if (!authorUser) {
      return NextResponse.json(
        { success: false, message: "Auteur introuvable" },
        { status: 404 }
      );
    }

    const pkg = await prisma.package.findFirst({
      where: {
        authorId: authorUser.id,
        name: {
          equals: packageName,
          mode: "insensitive",
        },
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
        },
        stars: {
          select: { userId: true },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, message: "Paquet introuvable" },
        { status: 404 }
      );
    }

    const isOwner = currentUserId ? currentUserId === authorUser.id : false;

    // Si le paquet est privé et que l'utilisateur n'est pas le propriétaire ni admin
    if (pkg.isPrivate && !isOwner && session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Ce paquet est privé ou introuvable" },
        { status: 403 }
      );
    }

    const isPython = pkg.runtime === RuntimeType.PYTHON;
    const isStarred = currentUserId ? pkg.stars.some((s) => s.userId === currentUserId) : false;
    const starCount = pkg.stars.length;

    const formattedVersions = pkg.versions.map((v) => {
      let envFormatted = "# Aucune variable requise.";
      if (v.envVariables) {
        if (typeof v.envVariables === "object" && "raw" in (v.envVariables as any)) {
          envFormatted = (v.envVariables as any).raw;
        } else if (typeof v.envVariables === "object") {
          envFormatted = Object.entries(v.envVariables)
            .map(([k, meta]: [string, any]) => {
              const desc = meta?.description ? `# ${meta.description}\n` : "";
              const def = meta?.default !== undefined ? meta.default : meta?.secret ? "votre_secret" : "";
              return `${desc}${k}=${def}`;
            })
            .join("\n\n");
        }
      }

      return {
        id: v.id,
        tag: v.tag,
        version: `v${v.version}`,
        versionRaw: v.version,
        date: formatDate(v.createdAt),
        dateRaw: v.createdAt,
        size: formatBytes(v.fileSizeBytes),
        sizeBytes: Number(v.fileSizeBytes),
        pulls: formatPulls(v.downloadCount),
        pullsCount: v.downloadCount,
        checksumSha256: v.checksumSha256,
        targetArch: v.targetArch || "universal",
        readme: v.readme || `### ${pkg.name} ${v.tag}\n${pkg.description}`,
        envExample: envFormatted,
      };
    });

    const latestVersion = formattedVersions[0] || {
      tag: "latest",
      version: "v1.0.0",
      versionRaw: "1.0.0",
      date: formatDate(pkg.createdAt),
      size: "0 MB",
      pulls: formatPulls(pkg.totalDownloads),
      readme: `### ${pkg.name}\n${pkg.description}`,
      envExample: "# Aucune variable requise.",
    };

    const responseData = {
      id: pkg.id,
      name: pkg.name,
      author: authorUser.username,
      authorAvatar: authorUser.avatarUrl,
      authorTier: authorUser.tier.toLowerCase(),
      isOwner,
      isPrivate: pkg.isPrivate,
      isProtected: pkg.isProtected,
      tag: latestVersion.tag,
      version: latestVersion.version,
      updatedAt: formatTimeAgo(pkg.updatedAt),
      description: pkg.description,
      size: latestVersion.size,
      pulls: formatPulls(pkg.totalDownloads),
      pullsCount: pkg.totalDownloads,
      stars: starCount,
      isStarred,
      runtime: {
        type: isPython ? "python" : "node",
        version: pkg.runtimeVersion || (isPython ? "3.12" : "22.0.0"),
        runtimeName: isPython ? `Python ${pkg.runtimeVersion || "3.12"}` : `Node.js ${pkg.runtimeVersion || "22.0.0"}`,
      },
      language: isPython ? "Python" : "TypeScript",
      protected: pkg.isProtected,
      category: pkg.category.toLowerCase(),
      tags: pkg.tags || [],
      license: pkg.license || "MIT",
      boxConfig: {
        entrypoint: isPython ? "main.py" : "src/index.js",
        network: "outbound / http",
        volumes: ["./data:/app/data"],
        ports: isPython ? ["8000"] : ["3000"],
      },
      envExample: latestVersion.envExample,
      readme: latestVersion.readme,
      versions: formattedVersions,
    };

    return NextResponse.json({
      success: true,
      box: responseData,
    });
  } catch (error) {
    console.error("Erreur récupération détail box:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la récupération du paquet" },
      { status: 500 }
    );
  }
}
