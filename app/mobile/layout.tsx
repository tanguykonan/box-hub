import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Box Runner Android",
  description:
    "Exécutez vos applications Box de manière autonome sur smartphones et tablettes Android.",
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
