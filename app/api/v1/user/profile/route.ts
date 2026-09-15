import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const hasGithub = user.accounts.some((a) => a.provider === "github");
    const hasGoogle = user.accounts.some((a) => a.provider === "google");

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        tier: user.tier,
        createdAt: user.createdAt,
        linkedAccounts: {
          github: hasGithub,
          google: hasGoogle,
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawUsername = body?.username;

    if (!rawUsername || typeof rawUsername !== "string") {
      return NextResponse.json(
        { success: false, message: "Nom d'utilisateur requis." },
        { status: 400 }
      );
    }

    const cleanUsername = rawUsername.toLowerCase().trim();

    // Règle de validation du format
    const isValidFormat = /^[a-z0-9_-]{2,32}$/.test(cleanUsername);
    if (!isValidFormat) {
      return NextResponse.json(
        {
          success: false,
          message: "Le nom d'utilisateur doit comporter entre 2 et 32 caractères (lettres minuscules, chiffres, tirets).",
        },
        { status: 400 }
      );
    }

    // Noms réservés
    const reservedNames = [
      "admin",
      "root",
      "api",
      "auth",
      "box",
      "hub",
      "system",
      "dashboard",
      "catalog",
      "null",
      "undefined",
      "explore",
      "pricing",
      "docs",
    ];

    if (reservedNames.includes(cleanUsername)) {
      return NextResponse.json(
        { success: false, message: "Ce nom d'utilisateur est réservé par le système." },
        { status: 400 }
      );
    }

    // Vérifier si un autre utilisateur utilise déjà ce username
    const existing = await prisma.user.findFirst({
      where: {
        username: cleanUsername,
        NOT: {
          id: session.user.id,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Ce nom d'utilisateur n'est pas disponible." },
        { status: 400 }
      );
    }

    // Mise à jour de l'utilisateur
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { username: cleanUsername },
    });

    // Enregistrement de l'activité
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        platform: "web",
        action: `Mise à jour du nom d'utilisateur vers "${cleanUsername}"`,
        status: "success",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Nom d'utilisateur mis à jour avec succès.",
      username: updated.username,
    });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
