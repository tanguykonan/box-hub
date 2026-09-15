import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token d'accès Bearer manquant ou invalide." },
        { status: 401 }
      );
    }

    const rawToken = authHeader.replace("Bearer ", "").trim();
    if (!rawToken) {
      return NextResponse.json(
        { error: "Format de token invalide." },
        { status: 401 }
      );
    }

    // Hachage SHA-256 du token reçu pour comparaison avec la base
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            tier: true,
            isBanned: true,
            quotaBytes: true,
          },
        },
      },
    });

    if (!apiToken) {
      return NextResponse.json(
        { error: "Jeton d'accès invalide ou révoqué." },
        { status: 401 }
      );
    }

    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Ce jeton d'accès a expiré." },
        { status: 401 }
      );
    }

    if (apiToken.user.isBanned) {
      return NextResponse.json(
        { error: "Compte développeur suspendu." },
        { status: 403 }
      );
    }

    // Met à jour la date de dernière utilisation du token
    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() },
    });

    return NextResponse.json({
      username: apiToken.user.username,
      email: apiToken.user.email,
      role: apiToken.user.role,
      tier: apiToken.user.tier,
      scopes: apiToken.scopes,
      tokenName: apiToken.name,
      quotaBytes: apiToken.user.quotaBytes.toString(),
    });
  } catch (error) {
    console.error("Erreur whoami CLI:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification du jeton." },
      { status: 500 }
    );
  }
}
