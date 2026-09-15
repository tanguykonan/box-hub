import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { auth } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawUsername = body?.username;

    if (!rawUsername || typeof rawUsername !== "string") {
      return NextResponse.json(
        { available: false, message: "Veuillez saisir un nom d'utilisateur." },
        { status: 400 }
      );
    }

    const username = rawUsername.toLowerCase().trim();

    // Règle de validation du format
    const isValidFormat = /^[a-z0-9_-]{2,32}$/.test(username);
    if (!isValidFormat) {
      return NextResponse.json(
        {
          available: false,
          message: "Le nom d'utilisateur doit comporter entre 2 et 32 caractères (lettres, chiffres, tirets).",
        },
        { status: 400 }
      );
    }

    // Noms réservés du système
    const reservedNames = ["admin", "root", "api", "auth", "box", "hub", "system", "dashboard", "catalog", "null", "undefined"];
    if (reservedNames.includes(username)) {
      return NextResponse.json(
        { available: false, message: "Ce nom d'utilisateur n'est pas disponible." },
        { status: 400 }
      );
    }

    // Vérification de l'unicité en base de données
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    const session = await auth().catch(() => null);
    if (existing) {
      if (session?.user?.id && existing.id === session.user.id) {
        return NextResponse.json({
          available: true,
          isCurrent: true,
          message: "Votre nom d'utilisateur actuel.",
        });
      }

      return NextResponse.json({
        available: false,
        message: "Ce nom d'utilisateur n'est pas disponible.",
      });
    }

    return NextResponse.json({
      available: true,
      message: "Nom d'utilisateur disponible.",
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du username:", error);
    return NextResponse.json(
      { available: false, message: "Vérification impossible pour le moment." },
      { status: 500 }
    );
  }
}
