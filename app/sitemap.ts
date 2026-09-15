import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || SITE_CONFIG.url;

  // 1. Pages publiques principales du site
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cli`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mobile`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 2. Indexation dynamique de toutes les Box publiques créées par la communauté
  let packageRoutes: MetadataRoute.Sitemap = [];
  try {
    const publicPackages = await prisma.package.findMany({
      where: {
        isPrivate: false,
      },
      select: {
        name: true,
        updatedAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    packageRoutes = publicPackages.map((pkg) => ({
      url: `${baseUrl}/box/${encodeURIComponent(pkg.author.username)}/${encodeURIComponent(pkg.name)}`,
      lastModified: pkg.updatedAt || new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Erreur génération sitemap dynamique des paquets:", error);
  }

  return [...staticRoutes, ...packageRoutes];
}
