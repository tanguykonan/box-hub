import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion et Inscription",
  description:
    "Accédez à votre compte développeur Box Hub ou créez un nouveau compte.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
