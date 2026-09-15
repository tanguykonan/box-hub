import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initializePaystackTransaction, PAYSTACK_TIERS } from "@/lib/paystack";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Vous devez être connecté pour soutenir le projet." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tier = body?.tier as "tier_5" | "tier_10" | "tier_20";

    if (!tier || !PAYSTACK_TIERS[tier]) {
      return NextResponse.json(
        { success: false, message: "Palier de soutien invalide." },
        { status: 400 }
      );
    }

    // Détermination de l'URL de retour après paiement
    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const callbackUrl = `${origin}/dashboard`;

    const result = await initializePaystackTransaction({
      email: session.user.email,
      tier,
      userId: session.user.id,
      username: session.user.username || "dev",
      callbackUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Échec de l'initialisation du paiement." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
    });
  } catch (error) {
    console.error("Erreur Paystack initialize:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de l'initialisation du paiement." },
      { status: 500 }
    );
  }
}
