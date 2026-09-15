import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const userRole = (req.auth?.user as { role?: string })?.role;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Protection du Dashboard : connexion requise
  if (isDashboardRoute && !isLoggedIn) {
    const authUrl = new URL("/auth", nextUrl.origin);
    authUrl.searchParams.set("mode", "login");
    return NextResponse.redirect(authUrl);
  }

  // Protection de l'Administration : connexion ET rôle ADMIN requis
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const authUrl = new URL("/auth", nextUrl.origin);
      authUrl.searchParams.set("mode", "login");
      return NextResponse.redirect(authUrl);
    }

    if (userRole !== "ADMIN") {
      // Redirection discrète vers la racine si l'utilisateur n'est pas admin
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
