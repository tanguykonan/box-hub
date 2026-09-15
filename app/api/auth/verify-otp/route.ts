import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { Role, UserTier } from "@prisma/client";
import { getVerifiedGravatar } from "../../../../lib/avatar";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;
    const code = body?.code;

    if (!rawEmail || !code) {
      return NextResponse.json(
        { success: false, message: "Veuillez renseigner votre email et votre code de confirmation." },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();
    const cleanCode = String(code).trim();

    // Recherche du token actif non expiré
    const verification = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        expires: { gt: new Date() },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, message: "Code expiré ou invalide. Veuillez demander un nouveau code." },
        { status: 400 }
      );
    }

    let tokenData: { code: string; mode: string; username?: string | null };
    try {
      tokenData = JSON.parse(verification.token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Code invalide. Veuillez demander un nouveau code." },
        { status: 400 }
      );
    }

    if (tokenData.code !== cleanCode) {
      return NextResponse.json(
        { success: false, message: "Code incorrect. Veuillez vérifier les 4 chiffres." },
        { status: 400 }
      );
    }

    // Le code est valide ! Traitement du compte
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (tokenData.mode === "register") {
      if (!user) {
        if (!tokenData.username) {
          return NextResponse.json(
            { success: false, message: "Informations d'inscription incomplètes. Veuillez recommencer." },
            { status: 400 }
          );
        }

        // Vérifie si l'adresse e-mail possède une photo Gravatar réelle
        const avatarUrl = await getVerifiedGravatar(email);

        user = await prisma.user.create({
          data: {
            username: tokenData.username,
            email,
            avatarUrl,
            role: Role.USER,
            tier: UserTier.FREE,
            quotaBytes: BigInt(524288000), // 500 MB
            lastLoginAt: new Date(),
          },
        });
      }
    } else {
      // Mode login
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Aucun compte associé à cette adresse. Veuillez vous inscrire." },
          { status: 404 }
        );
      }

      if (user.isBanned) {
        return NextResponse.json(
          { success: false, message: "Ce compte a été suspendu. Veuillez contacter le support." },
          { status: 403 }
        );
      }

      const updateData: { lastLoginAt: Date; avatarUrl?: string } = {
        lastLoginAt: new Date(),
      };

      // Si le compte existant n'a pas encore d'avatar, vérifie si un Gravatar est disponible
      if (!user.avatarUrl) {
        const verifiedAvatar = await getVerifiedGravatar(email);
        if (verifiedAvatar) {
          updateData.avatarUrl = verifiedAvatar;
          user.avatarUrl = verifiedAvatar;
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // Génère un token de validation à usage unique pour NextAuth Credentials
    const verifiedToken = `auth_ok_${crypto.randomBytes(24).toString("hex")}`;
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verifiedToken,
        expires,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Authentification réussie.",
      verifiedToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'OTP:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de la vérification. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
