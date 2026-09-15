import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { sendOtpEmail } from "../../../../lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;
    const mode = body?.mode || "login";
    const rawUsername = body?.username;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { success: false, message: "Veuillez renseigner votre adresse e-mail." },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Veuillez saisir une adresse e-mail valide." },
        { status: 400 }
      );
    }

    // Vérifications selon le mode
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (mode === "register") {
      if (!rawUsername || typeof rawUsername !== "string") {
        return NextResponse.json(
          { success: false, message: "Veuillez choisir un nom d'utilisateur." },
          { status: 400 }
        );
      }

      const username = rawUsername.toLowerCase().trim();

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Cette adresse e-mail est déjà associée à un compte. Veuillez vous connecter.",
            suggestLogin: true,
          },
          { status: 400 }
        );
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (existingUsername) {
        return NextResponse.json(
          { success: false, message: "Ce nom d'utilisateur n'est pas disponible." },
          { status: 400 }
        );
      }
    } else {
      // Mode login
      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Aucun compte n'est associé à cette adresse e-mail. Veuillez vous inscrire.",
            suggestRegister: true,
          },
          { status: 404 }
        );
      }

      if (existingUser.isBanned) {
        return NextResponse.json(
          { success: false, message: "Ce compte a été suspendu. Veuillez contacter le support." },
          { status: 403 }
        );
      }
    }

    // Génération du code à 4 chiffres (entre 1000 et 9999)
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Enregistrement / Remplacement du token de vérification
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const tokenPayload = JSON.stringify({
      code: otpCode,
      mode,
      username: mode === "register" ? rawUsername?.toLowerCase().trim() : null,
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenPayload,
        expires,
      },
    });

    // Envoi de l'e-mail réel via Resend
    const emailResult = await sendOtpEmail({
      to: email,
      code: otpCode,
      username: mode === "register" ? rawUsername?.toLowerCase().trim() : existingUser?.username,
      mode,
    });

    if (!emailResult.success && emailResult.error) {
      console.warn(`⚠️ [Auth] Notification e-mail non envoyée via Resend: ${emailResult.error}`);
    }

    // En environnement de développement, on log le code clairement dans la console
    console.log(`\n======================================================`);
    console.log(`🔐 [BOX HUB AUTH] Code OTP à 4 chiffres pour ${email} : [ ${otpCode} ]`);
    console.log(`   Mode : ${mode.toUpperCase()} (Expire dans 10 minutes)`);
    console.log(`======================================================\n`);

    return NextResponse.json({
      success: true,
      message: `Code de vérification envoyé à ${email}.`,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'OTP:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue. Veuillez réessayer dans quelques instants." },
      { status: 500 }
    );
  }
}
