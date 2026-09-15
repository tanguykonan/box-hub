import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { PackageCategory, RuntimeType } from "@prisma/client";
import { STORAGE_QUOTAS } from "@/lib/site-config";

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
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
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

    const packages = await prisma.package.findMany({
      where: {
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { username: true },
        },
        versions: {
          orderBy: { createdAt: "desc" },
        },
        stars: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const formattedPackages = packages.map((pkg) => {
      const latestVersion = pkg.versions[0];
      const runtimeType = pkg.runtime === RuntimeType.PYTHON ? "python" : "node";
      const language = pkg.runtime === RuntimeType.PYTHON ? "Python" : "JavaScript";
      const sizeFormatted = latestVersion ? formatBytes(latestVersion.fileSizeBytes) : "0 MB";

      return {
        id: pkg.id,
        name: pkg.name,
        author: pkg.author.username,
        version: latestVersion ? `v${latestVersion.version}` : "v1.0.0",
        tag: latestVersion ? latestVersion.tag : "latest",
        runtime: pkg.runtime === RuntimeType.PYTHON ? `Python ${pkg.runtimeVersion || "3.12"}` : `Node.js ${pkg.runtimeVersion || "22.0.0"}`,
        runtimeType,
        language,
        size: sizeFormatted,
        pulls: formatPulls(pkg.totalDownloads),
        visibility: pkg.isPrivate ? "Privé" : "Public",
        category: pkg.category.toLowerCase(),
        hash: latestVersion ? latestVersion.checksumSha256 : "",
        updatedAt: formatTimeAgo(pkg.updatedAt),
        description: pkg.description,
        readme: latestVersion?.readme || `### ${pkg.name}\n${pkg.description}`,
        envExample: latestVersion?.envVariables ? JSON.stringify(latestVersion.envVariables, null, 2) : "",
      };
    });

    return NextResponse.json({
      success: true,
      packages: formattedPackages,
    });
  } catch (error) {
    console.error("Erreur récupération packages utilisateur:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la récupération des paquets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      tag = "latest",
      visibility = "Public",
      category = "bots",
      description = "",
      envExample = "",
      readme = "",
      runtime = "PYTHON",
      runtimeVersion = "3.12",
      fileSizeBytes = 14500000,
      checksumSha256 = "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, message: "Le nom du paquet est requis" },
        { status: 400 }
      );
    }

    const cleanName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "-");

    // Vérifie si le paquet existe déjà pour cet utilisateur
    const existing = await prisma.package.findUnique({
      where: {
        authorId_name: {
          authorId: session.user.id,
          name: cleanName,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Vous possédez déjà une Box nommée "${cleanName}"` },
        { status: 400 }
      );
    }

    // Vérification du quota et de la limite de taille par fichier
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true, quotaBytes: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const requestedSizeBytes = BigInt(fileSizeBytes);

    if (dbUser.tier === "FREE" && STORAGE_QUOTAS.FREE.maxFileBytes && requestedSizeBytes > STORAGE_QUOTAS.FREE.maxFileBytes) {
      return NextResponse.json(
        {
          success: false,
          message: `Le palier Gratuit limite la taille d'une archive à ${STORAGE_QUOTAS.FREE.maxFileMB} MB. Passez au palier Sponsor, Donateur ou Supporter pour lever cette contrainte.`,
        },
        { status: 413 }
      );
    }

    // Mapping enum catégorie
    const catEnum =
      category.toUpperCase() === "AI"
        ? PackageCategory.AI
        : category.toUpperCase() === "API"
        ? PackageCategory.API
        : category.toUpperCase() === "TOOLS"
        ? PackageCategory.TOOLS
        : PackageCategory.BOTS;

    const runtimeEnum =
      String(runtime).toUpperCase() === "NODEJS" || String(runtime).toLowerCase() === "node"
        ? RuntimeType.NODEJS
        : RuntimeType.PYTHON;

    const isPrivate = visibility === "Privé";
    const semverVersion = tag.startsWith("v") ? tag.slice(1) : tag === "latest" ? "1.0.0" : tag;

    // Création du package et de sa première version
    const newPackage = await prisma.package.create({
      data: {
        name: cleanName,
        description: description || "Application autonome Box.",
        runtime: runtimeEnum,
        runtimeVersion: String(runtimeVersion),
        category: catEnum,
        isPrivate,
        authorId: session.user.id,
        tags: [`#${catEnum.toLowerCase()}`, `#${runtimeEnum.toLowerCase()}`],
        versions: {
          create: {
            version: semverVersion,
            tag: String(tag),
            checksumSha256: String(checksumSha256),
            fileSizeBytes: BigInt(fileSizeBytes),
            storageKey: `packages/${session.user.id}/${cleanName}/${semverVersion}.box`,
            readme: readme || `# ${cleanName}\n${description}`,
            envVariables: envExample ? { raw: envExample } : undefined,
          },
        },
      },
      include: {
        author: { select: { username: true } },
        versions: true,
      },
    });

    // Enregistrement de l'activité
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        platform: "web",
        action: `Publication initiale de la Box "${session.user.username}/${cleanName}" (v${semverVersion})`,
        status: "success",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Box publiée avec succès",
      package: newPackage,
    });
  } catch (error) {
    console.error("Erreur publication package:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la publication du paquet" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, description, visibility, category, readme, envExample } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Identifiant de la Box requis" },
        { status: 400 }
      );
    }

    const existing = await prisma.package.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
      include: {
        versions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Box introuvable ou vous n'en êtes pas l'auteur" },
        { status: 404 }
      );
    }

    const updateData: { description?: string; isPrivate?: boolean; category?: PackageCategory } = {};
    if (description !== undefined) updateData.description = description;
    if (visibility !== undefined) updateData.isPrivate = visibility === "Privé";
    if (category !== undefined) {
      const catUpper = String(category).toUpperCase();
      if (catUpper === "AI") updateData.category = PackageCategory.AI;
      else if (catUpper === "API") updateData.category = PackageCategory.API;
      else if (catUpper === "TOOLS") updateData.category = PackageCategory.TOOLS;
      else if (catUpper === "BOTS") updateData.category = PackageCategory.BOTS;
    }

    await prisma.package.update({
      where: { id },
      data: updateData,
    });

    if (existing.versions[0] && (readme !== undefined || envExample !== undefined)) {
      await prisma.packageVersion.update({
        where: { id: existing.versions[0].id },
        data: {
          readme: readme !== undefined ? readme : existing.versions[0].readme,
          envVariables: envExample !== undefined ? { raw: envExample } : (existing.versions[0].envVariables as any),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Box mise à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur mise à jour box:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la mise à jour de la Box" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Identifiant manquant" },
        { status: 400 }
      );
    }

    const pkg = await prisma.package.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, message: "Box introuvable ou accès non autorisé" },
        { status: 404 }
      );
    }

    await prisma.package.delete({
      where: { id },
    });

    // Enregistrement de l'activité
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        platform: "web",
        action: `Suppression de la Box "${pkg.name}"`,
        status: "success",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Box supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur suppression box:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la suppression de la Box" },
      { status: 500 }
    );
  }
}
