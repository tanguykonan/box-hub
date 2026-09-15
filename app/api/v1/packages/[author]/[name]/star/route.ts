import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createUserNotification } from "@/lib/notifications";

export async function POST(
  req: Request,
  props: { params: Promise<{ author: string; name: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Connexion requise pour aimer un paquet." },
        { status: 401 }
      );
    }

    const { author: authorParam, name: nameParam } = await props.params;
    const authorUsername = decodeURIComponent(authorParam).toLowerCase();
    const packageName = decodeURIComponent(nameParam).toLowerCase();

    const authorUser = await prisma.user.findFirst({
      where: {
        username: { equals: authorUsername, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (!authorUser) {
      return NextResponse.json(
        { success: false, message: "Auteur introuvable" },
        { status: 404 }
      );
    }

    const pkg = await prisma.package.findFirst({
      where: {
        authorId: authorUser.id,
        name: { equals: packageName, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, message: "Paquet introuvable" },
        { status: 404 }
      );
    }

    const existingStar = await prisma.packageStar.findUnique({
      where: {
        userId_packageId: {
          userId: session.user.id,
          packageId: pkg.id,
        },
      },
    });

    let isStarred = false;
    if (existingStar) {
      await prisma.packageStar.delete({
        where: { id: existingStar.id },
      });
      isStarred = false;
    } else {
      await prisma.packageStar.create({
        data: {
          userId: session.user.id,
          packageId: pkg.id,
        },
      });
      isStarred = true;

      // Notification uniquement si l'étoile provient d'un autre utilisateur
      if (session.user.id !== authorUser.id) {
        const starringUsername = (session.user as any).username || session.user.name || "Un développeur";
        createUserNotification({
          userId: authorUser.id,
          category: "star",
          message: `@${starringUsername} a attribué une étoile à votre box ${packageName}.`,
          level: "info",
        }).catch(() => {});
      }
    }

    const starsCount = await prisma.packageStar.count({
      where: { packageId: pkg.id },
    });

    return NextResponse.json({
      success: true,
      isStarred,
      starsCount,
    });
  } catch (error) {
    console.error("Erreur toggle star:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la gestion de l'étoile" },
      { status: 500 }
    );
  }
}
