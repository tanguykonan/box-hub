import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export interface AdminAuthSuccess {
  authorized: true;
  user: {
    id: string;
    username: string;
    email: string;
    role: Role;
  };
}

export interface AdminAuthFailure {
  authorized: false;
  response: NextResponse;
}

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

/**
 * Vérifie si la requête actuelle émane d'un utilisateur avec le rôle ADMIN.
 * Renvoie l'utilisateur admin authentifié ou une réponse d'erreur 401/403.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "Authentification requise pour accéder à la console d'administration.",
        },
        { status: 401 }
      ),
    };
  }

  // Vérification directe en base pour garantir que le rôle est toujours à jour
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isBanned: true,
    },
  });

  if (!dbUser || dbUser.isBanned) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "USER_INVALID",
          message: "Compte utilisateur introuvable ou suspendu.",
        },
        { status: 403 }
      ),
    };
  }

  if (dbUser.role !== Role.ADMIN) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "FORBIDDEN",
          message: "Accès refusé. Privilèges administrateur requis.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
    },
  };
}
