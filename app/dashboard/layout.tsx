import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace Développeur",
  description:
    "Gérez vos paquets publiés, analysez les téléchargements et configurez vos clés API.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
