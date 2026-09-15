import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./db";
import { Role, UserTier } from "@prisma/client";

/**
 * Génère un pseudonyme unique disponible pour les nouveaux utilisateurs OAuth.
 * Ex: si "sarah" est déjà pris, teste "sarah-1", "sarah-2", etc.
 */
export async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let clean = baseUsername
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "");

  if (!clean || clean.length < 2) {
    clean = "dev";
  }

  let candidate = clean;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${clean}-${counter}`;
    counter++;
  }
}

const providers: any[] = [
  Credentials({
    id: "credentials",
    name: "OTP Code",
    credentials: {
      email: { label: "Email", type: "email" },
      verifiedToken: { label: "Verified Token", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.verifiedToken) {
        return null;
      }

      const email = String(credentials.email).toLowerCase().trim();
      const token = String(credentials.verifiedToken);

      // Vérification du token de session temporaire
      const verification = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          token: token,
          expires: { gt: new Date() },
        },
      });

      if (!verification) {
        return null;
      }

      // Supprime le token après usage unique
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Récupère l'utilisateur en base
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || user.isBanned) {
        return null;
      }

      // Met à jour la date de dernière connexion
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        id: user.id,
        name: user.username,
        email: user.email,
        image: user.avatarUrl,
        username: user.username,
        role: user.role,
        tier: user.tier,
        quotaBytes: user.quotaBytes.toString(),
      };
    },
  }),
];

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "boxhub_super_secret_dev_key_32_characters_long",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Si connexion via OAuth (GitHub ou Google)
      if (account && (account.provider === "github" || account.provider === "google")) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Détermine la base du username à partir du profil
          const rawUsername =
            (profile as { login?: string })?.login ||
            user.name ||
            user.email.split("@")[0];

          const uniqueUsername = await generateUniqueUsername(rawUsername);
          const verifiedAvatar = user.image || null;

          const created = await prisma.user.create({
            data: {
              username: uniqueUsername,
              email: user.email,
              avatarUrl: verifiedAvatar,
              role: Role.USER,
              tier: UserTier.FREE,
              quotaBytes: BigInt(524288000), // 500 MB
              lastLoginAt: new Date(),
            },
          });

          user.id = created.id;
          user.username = created.username;
          user.role = created.role;
          user.tier = created.tier;
          user.image = created.avatarUrl;
        } else {
          if (existingUser.isBanned) {
            return false;
          }

          // Si le provider OAuth fournit une photo de profil et qu'elle n'est pas à jour
          if (user.image && existingUser.avatarUrl !== user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { avatarUrl: user.image, lastLoginAt: new Date() },
            });
            user.image = user.image;
          } else {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            });
            user.image = existingUser.avatarUrl;
          }

          user.id = existingUser.id;
          user.username = existingUser.username;
          user.role = existingUser.role;
          user.tier = existingUser.tier;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
        token.role = (user as { role?: Role }).role;
        token.tier = (user as { tier?: UserTier }).tier;
        token.picture = user.image || (user as { avatarUrl?: string | null }).avatarUrl || null;
      }

      // Si le token n'a pas encore toutes les informations (ex: après redirection OAuth)
      if (token.email && (!token.username || !token.id)) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.tier = dbUser.tier;
          token.picture = dbUser.avatarUrl || token.picture || null;
        }
      }

      // Support des mises à jour dynamiques de session
      if (trigger === "update" && session) {
        if (session.user?.username) token.username = session.user.username;
        if (session.user?.tier) token.tier = session.user.tier;
        if (session.user?.image !== undefined) token.picture = session.user.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.username = (token.username as string) || "dev";
        session.user.role = (token.role as Role) || Role.USER;
        session.user.tier = (token.tier as UserTier) || UserTier.FREE;
        session.user.image = (token.picture as string) || null;
      }

      return session;
    },
  },
});
