import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { AuthProvider } from "../components/auth/AuthProvider";
import { ToastProvider } from "../components/ui/Toast";
import { CookieBanner } from "../components/ui/CookieBanner";
import { GoogleAnalytics } from "../components/analytics/GoogleAnalytics";
import { GoogleTranslateProvider } from "../components/translation/GoogleTranslateProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://boxhub.paxiz.org"),
  title: {
    default: "Box Hub • Format d'Applications Autonomes",
    template: "Box Hub • %s",
  },
  description:
    "Découvrez, distribuez et exécutez des applications Python et Node.js en un seul fichier hermétique .box sans Docker ni installation d'environnement.",
  keywords: [
    "box",
    "box hub",
    "python",
    "node.js",
    "microservices",
    "registre",
    "applications autonomes",
    "serverless",
    "bytecode",
    "fastengine",
    "bun",
    "rust cli",
  ],
  authors: [{ name: "Box Hub Team" }],
  creator: "Box Hub",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://boxhub.paxiz.org",
    siteName: "Box Hub",
    title: "Box Hub • Format d'Applications Autonomes",
    description:
      "Découvrez, distribuez et exécutez des applications Python et Node.js en un seul fichier hermétique .box sans Docker.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Box Hub • Format d'Applications Autonomes",
    description:
      "Découvrez, distribuez et exécutez des applications Python et Node.js en un seul fichier hermétique .box sans Docker.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.jpg?v=2", sizes: "any" },
      { url: "/logo.jpg?v=2" },
    ],
    shortcut: "/favicon.jpg?v=2",
    apple: "/favicon.jpg?v=2",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-400">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <CookieBanner />
              <GoogleAnalytics />
              <GoogleTranslateProvider />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
