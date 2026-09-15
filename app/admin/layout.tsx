import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Console d'Administration",
  description:
    "Supervision globale de l'infrastructure, utilisateurs, télémétrie et mode maintenance de Box Hub.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
