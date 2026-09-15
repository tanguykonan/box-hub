import type { Metadata } from "next";

type Props = {
  params: Promise<{ author: string; name: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string; name: string }>;
}): Promise<Metadata> {
  const { author, name } = await params;
  return {
    title: `@${author}/${name}`,
    description: `Détails, documentation et installation du paquet .box @${author}/${name} sur Box Hub.`,
  };
}

export default function BoxDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
