import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moteur CLI Rust",
  description:
    "Téléchargez et installez la CLI Box ultra-rapide développée en Rust pour exécuter et publier vos paquets .box.",
};

export default function CliLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
