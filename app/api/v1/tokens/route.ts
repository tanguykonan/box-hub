import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import crypto from "crypto";

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
    const tokens = await prisma.apiToken.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      tokens,
    });
  } catch (error) {
    console.error("Erreur récupération tokens:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la récupération des jetons" },
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
    const { name, scopeType } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Le nom du jeton est obligatoire" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const scopes =
      scopeType === "write"
        ? ["packages:read", "packages:write"]
        : ["packages:read"];

    // Génération cryptographique du jeton personnel d'accès
    const randomHex = crypto.randomBytes(24).toString("hex");
    const fullToken = `box_pat_${randomHex}`;
    const tokenPrefix = `box_pat_${randomHex.slice(0, 4)}...`;
    const tokenHash = crypto.createHash("sha256").update(fullToken).digest("hex");

    const created = await prisma.apiToken.create({
      data: {
        userId: session.user.id,
        name: cleanName,
        tokenHash,
        tokenPrefix,
        scopes,
      },
    });

    // Enregistrement de l'activité
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        platform: "web",
        action: `Création du jeton d'accès CLI "${cleanName}" (${scopes.join(", ")})`,
        status: "success",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Jeton généré avec succès",
      token: {
        id: created.id,
        name: created.name,
        tokenPrefix: created.tokenPrefix,
        fullToken, // Renvoyé UNIQUEMENT à la création
        scopes: created.scopes,
        createdAt: created.createdAt,
        lastUsedAt: created.lastUsedAt,
      },
    });
  } catch (error) {
    console.error("Erreur création token:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la génération du jeton" },
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
        { success: false, message: "Identifiant du jeton manquant" },
        { status: 400 }
      );
    }

    const tokenToDelete = await prisma.apiToken.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!tokenToDelete) {
      return NextResponse.json(
        { success: false, message: "Jeton introuvable ou accès non autorisé" },
        { status: 404 }
      );
    }

    await prisma.apiToken.delete({
      where: {
        id,
      },
    });

    // Enregistrement de l'activité
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        platform: "web",
        action: `Révocation du jeton d'accès CLI "${tokenToDelete.name}"`,
        status: "success",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Jeton révoqué avec succès",
    });
  } catch (error) {
    console.error("Erreur suppression token:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la révocation du jeton" },
      { status: 500 }
    );
  }
}
