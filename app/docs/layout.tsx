import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation Développeur",
  description:
    "Guide complet, référence de configuration boxconfig.yml et commandes CLI Box.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
