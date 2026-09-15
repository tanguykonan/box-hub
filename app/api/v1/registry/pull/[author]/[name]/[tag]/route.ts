import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { createUserNotification } from "@/lib/notifications";
import { getR2PresignedDownloadUrl, getR2PublicUrl } from "@/lib/r2";

export async function GET(
  req: Request,
  props: { params: Promise<{ author: string; name: string; tag: string }> }
) {
  try {
    const { author: authorParam, name: nameParam, tag: tagParam } = await props.params;
    const authorUsername = decodeURIComponent(authorParam).toLowerCase();
    const packageName = decodeURIComponent(nameParam).toLowerCase();
    const requestedTag = decodeURIComponent(tagParam).toLowerCase();

    const authorUser = await prisma.user.findFirst({
      where: {
        username: { equals: authorUsername, mode: "insensitive" },
      },
      select: { id: true, username: true },
    });

    if (!authorUser) {
      return NextResponse.json(
        { success: false, error: "Auteur introuvable sur Box Hub." },
        { status: 404 }
      );
    }

    const pkg = await prisma.package.findFirst({
      where: {
        authorId: authorUser.id,
        name: { equals: packageName, mode: "insensitive" },
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "Paquet introuvable sur Box Hub." },
        { status: 404 }
      );
    }

    // Si le paquet est privé, authentification requise
    if (pkg.isPrivate) {
      const { user } = await authenticateApiRequest(req, ["packages:read"]);
      if (!user || (user.id !== authorUser.id && user.role !== "ADMIN")) {
        return NextResponse.json(
          { success: false, error: "Ce paquet est privé. Jeton d'accès autorisé requis." },
          { status: 403 }
        );
      }
    }

    // Résolution de la version demandée
    let matchedVersion = pkg.versions.find(
      (v: { tag: string; version: string }) =>
        v.tag.toLowerCase() === requestedTag ||
        v.version.toLowerCase() === requestedTag ||
        `v${v.version.toLowerCase()}` === requestedTag
    );

    if (!matchedVersion && (requestedTag === "latest" || requestedTag === "default")) {
      matchedVersion = pkg.versions[0];
    }

    if (!matchedVersion) {
      return NextResponse.json(
        {
          success: false,
          error: `Version '${requestedTag}' introuvable pour le paquet ${authorUser.username}/${pkg.name}.`,
          availableTags: pkg.versions.map((v: { tag: string }) => v.tag),
        },
        { status: 404 }
      );
    }

    // Incrémentation atomique des téléchargements
    const newTotal = pkg.totalDownloads + 1;
    await Promise.all([
      prisma.package.update({
        where: { id: pkg.id },
        data: { totalDownloads: { increment: 1 } },
      }),
      prisma.packageVersion.update({
        where: { id: matchedVersion.id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]).catch(() => {});

    // Notification de pull ou de palier franchi
    if (newTotal === 50 || newTotal === 100 || newTotal === 500 || newTotal === 1000) {
      createUserNotification({
        userId: authorUser.id,
        category: "milestone",
        message: `Votre box ${pkg.name} a franchi le cap des ${newTotal} pulls.`,
        level: "success",
      }).catch(() => {});
    } else {
      createUserNotification({
        userId: authorUser.id,
        category: "pull",
        message: `Nouveau pull sur votre box ${pkg.name}:${matchedVersion.tag}.`,
        level: "info",
      }).catch(() => {});
    }

    // Résolution de l'URL de téléchargement R2 (Public ou Pré-signée temporaire)
    let downloadUrl = getR2PublicUrl(matchedVersion.storageKey);
    if (pkg.isPrivate) {
      const presigned = await getR2PresignedDownloadUrl({
        key: matchedVersion.storageKey,
        expiresIn: 3600, // Valide 1 heure
      });
      if (presigned) {
        downloadUrl = presigned;
      }
    }

    // Métadonnées de téléchargement
    return NextResponse.json(
      {
        success: true,
        package: `${authorUser.username}/${pkg.name}`,
        version: matchedVersion.version,
        tag: matchedVersion.tag,
        checksum: matchedVersion.checksumSha256,
        sizeBytes: Number(matchedVersion.fileSizeBytes),
        storageKey: matchedVersion.storageKey,
        runtime: pkg.runtime,
        runtimeVersion: pkg.runtimeVersion,
        isProtected: pkg.isProtected,
        downloadUrl,
      },
      {
        headers: {
          "X-Box-Package": `${authorUser.username}/${pkg.name}`,
          "X-Box-Version": matchedVersion.version,
          "X-Box-Checksum": matchedVersion.checksumSha256,
          "X-Box-Runtime": pkg.runtime,
        },
      }
    );
  } catch (error) {
    console.error("Erreur registry pull:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors du téléchargement du paquet." },
      { status: 500 }
    );
  }
}
