import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue des Box",
  description:
    "Explorez, recherchez et découvrez des applications Python et Node.js prêtes à l'emploi au format hermétique .box.",
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
