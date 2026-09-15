import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'Utilisation",
  description:
    "Conditions générales d'utilisation du service et du registre Box Hub.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
