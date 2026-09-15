import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { PackageCategory, RuntimeType } from "@prisma/client";
import { createUserNotification } from "@/lib/notifications";
import { uploadToR2 } from "@/lib/r2";
import { STORAGE_QUOTAS } from "@/lib/site-config";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { user, error, status } = await authenticateApiRequest(req, ["packages:write"]);
    if (!user) {
      return NextResponse.json({ success: false, error }, { status: status || 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let version = "1.0.0";
    let tag = "latest";
    let description = "";
    let runtime = "PYTHON";
    let runtimeVersion = "3.12";
    let category = "BOTS";
    let isPrivate = false;
    let isProtected = false;
    let readme = "";
    let envVariables: any = null;
    let targetArch = "universal";
    let clientChecksum = "";
    let fileSizeBytes = BigInt(0);

    let fileBuffer: Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const manifestStr = formData.get("manifest") as string;
      const file = formData.get("file") as File | null;

      let manifest: any = {};
      if (manifestStr) {
        try {
          manifest = JSON.parse(manifestStr);
        } catch {
          manifest = {};
        }
      }

      name = String(formData.get("name") || manifest.name || "");
      version = String(formData.get("version") || manifest.version || "1.0.0");
      tag = String(formData.get("tag") || manifest.tag || "latest");
      description = String(formData.get("description") || manifest.description || "");
      runtime = String(formData.get("runtime") || manifest.runtime || "PYTHON");
      runtimeVersion = String(formData.get("runtimeVersion") || manifest.runtimeVersion || "3.12");
      category = String(formData.get("category") || manifest.category || "BOTS");
      isPrivate = formData.get("isPrivate") === "true" || Boolean(manifest.isPrivate);
      isProtected = formData.get("isProtected") === "true" || Boolean(manifest.isProtected);
      readme = String(formData.get("readme") || manifest.readme || "");
      targetArch = String(formData.get("targetArch") || manifest.targetArch || "universal");
      clientChecksum = String(formData.get("checksum") || manifest.checksumSha256 || "");

      if (formData.get("envVariables")) {
        try {
          envVariables = JSON.parse(String(formData.get("envVariables")));
        } catch {
          envVariables = { raw: String(formData.get("envVariables")) };
        }
      } else if (manifest.envVariables) {
        envVariables = manifest.envVariables;
      }

      if (file) {
        fileSizeBytes = BigInt(file.size);
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        const serverHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
        if (clientChecksum && clientChecksum.replace("sha256:", "") !== serverHash) {
          return NextResponse.json(
            {
              success: false,
              error: "Échec de vérification d'intégrité : le checksum SHA-256 calculé ne correspond pas.",
            },
            { status: 400 }
          );
        }
        clientChecksum = `sha256:${serverHash}`;
      }
    } else {
      // JSON Payload
      const body = await req.json();
      name = String(body.name || "");
      version = String(body.version || "1.0.0");
      tag = String(body.tag || "latest");
      description = String(body.description || "");
      runtime = String(body.runtime || "PYTHON");
      runtimeVersion = String(body.runtimeVersion || "3.12");
      category = String(body.category || "BOTS");
      isPrivate = Boolean(body.isPrivate);
      isProtected = Boolean(body.isProtected);
      readme = String(body.readme || "");
      envVariables = body.envVariables || null;
      targetArch = String(body.targetArch || "universal");
      clientChecksum = String(body.checksumSha256 || `sha256:${crypto.randomBytes(32).toString("hex")}`);
      fileSizeBytes = BigInt(body.fileSizeBytes || 14500000);
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Le nom du paquet est obligatoire." },
        { status: 400 }
      );
    }

    const cleanName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "-");

    const cleanVersion = version.startsWith("v") ? version.slice(1) : version;

    // Vérification du quota de stockage de l'utilisateur
    const existingVersions = await prisma.packageVersion.findMany({
      where: {
        package: {
          authorId: user.id,
        },
      },
      select: {
        fileSizeBytes: true,
      },
    });

    const currentUsedBytes = existingVersions.reduce(
      (acc: bigint, v: { fileSizeBytes: bigint }) => acc + BigInt(v.fileSizeBytes),
      BigInt(0)
    );

    // Vérification de la limite par fichier pour le Tier Gratuit (60 MB max par archive .box)
    if (user.tier === "FREE" && STORAGE_QUOTAS.FREE.maxFileBytes && fileSizeBytes > STORAGE_QUOTAS.FREE.maxFileBytes) {
      const fileMB = (Number(fileSizeBytes) / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          success: false,
          error: `Le palier Gratuit limite la taille maximale à ${STORAGE_QUOTAS.FREE.maxFileMB} MB par archive .box (${fileMB} MB détectés). Passez au palier Sponsor (10 Go), Donateur (30 Go) ou Supporter (100 Go) pour lever toute contrainte.`,
        },
        { status: 413 }
      );
    }

    if (currentUsedBytes + fileSizeBytes > user.quotaBytes) {
      const quotaMB = Math.round(Number(user.quotaBytes) / (1024 * 1024));
      const usedMB = (Number(currentUsedBytes) / (1024 * 1024)).toFixed(1);

      if (user.authMethod === "token") {
        createUserNotification({
          userId: user.id,
          category: "quota",
          message: `Échec du push sur ${cleanName} : quota de stockage saturé.`,
          level: "warning",
        }).catch(() => {});
      }

      return NextResponse.json(
        {
          success: false,
          error: `Quota de stockage dépassé (${usedMB} MB utilisés sur ${quotaMB} MB alloués à votre tier).`,
        },
        { status: 413 }
      );
    }

    // Mapping enum
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

    // Création ou mise à jour du paquet
    const pkg = await prisma.package.upsert({
      where: {
        authorId_name: {
          authorId: user.id,
          name: cleanName,
        },
      },
      create: {
        name: cleanName,
        description: description || "Application autonome Box.",
        runtime: runtimeEnum,
        runtimeVersion: String(runtimeVersion),
        category: catEnum,
        isPrivate,
        isProtected,
        authorId: user.id,
        tags: [`#${catEnum.toLowerCase()}`, `#${runtimeEnum.toLowerCase()}`],
      },
      update: {
        description: description || undefined,
        runtime: runtimeEnum,
        runtimeVersion: String(runtimeVersion),
        category: catEnum,
        isPrivate,
        isProtected,
      },
    });

    // Enregistrement de la version
    const storageKey = `packages/${user.username}/${cleanName}/${cleanVersion}/${cleanName}.box`;

    const packageVersion = await prisma.packageVersion.upsert({
      where: {
        packageId_version: {
          packageId: pkg.id,
          version: cleanVersion,
        },
      },
      create: {
        packageId: pkg.id,
        version: cleanVersion,
        tag: String(tag),
        checksumSha256: clientChecksum,
        fileSizeBytes,
        storageKey,
        targetArch,
        readme: readme || `### ${cleanName} v${cleanVersion}\n${description}`,
        envVariables: envVariables ? (typeof envVariables === "object" ? envVariables : { raw: envVariables }) : undefined,
      },
      update: {
        tag: String(tag),
        checksumSha256: clientChecksum,
        fileSizeBytes,
        storageKey,
        targetArch,
        readme: readme || undefined,
        envVariables: envVariables ? (typeof envVariables === "object" ? envVariables : { raw: envVariables }) : undefined,
      },
    });

    // Téléversement sur Cloudflare R2 (si un binaire .box est fourni)
    if (fileBuffer) {
      await uploadToR2({
        key: storageKey,
        buffer: fileBuffer,
        contentType: "application/gzip",
        metadata: {
          author: user.username,
          package: cleanName,
          version: cleanVersion,
          checksum: clientChecksum,
        },
      });
    }

    // Log d'activité
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        platform: user.authMethod === "token" ? "cli" : "web",
        action: `box push ${user.username}/${cleanName}:${tag} (v${cleanVersion})`,
        status: "success",
      },
    }).catch(() => {});

    // Notification uniquement si le push est effectué via CLI
    if (user.authMethod === "token") {
      createUserNotification({
        userId: user.id,
        category: "push",
        message: `Box ${cleanName}:${tag} publiée avec succès via la CLI.`,
        level: "success",
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Paquet ${user.username}/${cleanName}:${tag} publié avec succès !`,
      package: {
        id: pkg.id,
        name: pkg.name,
        author: user.username,
        runtime: pkg.runtime,
        category: pkg.category,
      },
      version: {
        version: packageVersion.version,
        tag: packageVersion.tag,
        checksum: packageVersion.checksumSha256,
        size: Number(packageVersion.fileSizeBytes),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur registry push:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la publication du paquet." },
      { status: 500 }
    );
  }
}
