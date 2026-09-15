import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: string;
  tier: string;
  isBanned: boolean;
  quotaBytes: bigint;
  authMethod: "token" | "session";
  tokenId?: string;
  tokenName?: string;
  scopes?: string[];
}

export async function authenticateApiRequest(
  req: Request,
  requiredScopes: string[] = ["packages:read"]
): Promise<{ user: AuthenticatedUser | null; error?: string; status?: number }> {
  try {
    const authHeader = req.headers.get("authorization");

    // 1. Authentification via Token PAT (CLI & CI/CD)
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const rawToken = authHeader.replace("Bearer ", "").trim();
      if (!rawToken) {
        return { user: null, error: "Format de jeton invalide.", status: 401 };
      }

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
        return { user: null, error: "Jeton d'accès invalide ou révoqué.", status: 401 };
      }

      if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
        return { user: null, error: "Ce jeton d'accès a expiré.", status: 401 };
      }

      if (apiToken.user.isBanned) {
        return { user: null, error: "Compte utilisateur suspendu.", status: 403 };
      }

      // Vérification des scopes
      const hasAllScopes = requiredScopes.every(
        (reqScope) =>
          apiToken.scopes.includes(reqScope) ||
          apiToken.scopes.includes("admin:all") ||
          (apiToken.scopes.includes("packages:write") && reqScope === "packages:read")
      );

      if (!hasAllScopes) {
        return {
          user: null,
          error: `Permissions insuffisantes. Scopes requis : ${requiredScopes.join(", ")}`,
          status: 403,
        };
      }

      // Met à jour la date de dernière utilisation sans bloquer
      prisma.apiToken
        .update({
          where: { id: apiToken.id },
          data: { lastUsedAt: new Date() },
        })
        .catch(() => {});

      return {
        user: {
          id: apiToken.user.id,
          username: apiToken.user.username,
          email: apiToken.user.email,
          role: apiToken.user.role,
          tier: apiToken.user.tier,
          isBanned: apiToken.user.isBanned,
          quotaBytes: apiToken.user.quotaBytes,
          authMethod: "token",
          tokenId: apiToken.id,
          tokenName: apiToken.name,
          scopes: apiToken.scopes,
        },
      };
    }

    // 2. Repli vers la session Web NextAuth
    const session = await auth();
    if (session?.user?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          tier: true,
          isBanned: true,
          quotaBytes: true,
        },
      });

      if (!dbUser) {
        return { user: null, error: "Utilisateur introuvable.", status: 404 };
      }

      if (dbUser.isBanned) {
        return { user: null, error: "Compte utilisateur suspendu.", status: 403 };
      }

      return {
        user: {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          role: dbUser.role,
          tier: dbUser.tier,
          isBanned: dbUser.isBanned,
          quotaBytes: dbUser.quotaBytes,
          authMethod: "session",
        },
      };
    }

    return {
      user: null,
      error: "Authentification requise. Fournissez un en-tête 'Authorization: Bearer box_pat_...'",
      status: 401,
    };
  } catch (error) {
    console.error("Erreur api-auth:", error);
    return { user: null, error: "Erreur serveur lors de l'authentification.", status: 500 };
  }
}
