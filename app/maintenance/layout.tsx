import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Système",
  description: "La plateforme Box Hub est temporairement en maintenance.",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
