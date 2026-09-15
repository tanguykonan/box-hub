import { Role, UserTier } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
      tier: UserTier;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    username?: string;
    role?: Role;
    tier?: UserTier;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: Role;
    tier?: UserTier;
    picture?: string | null;
  }
}
