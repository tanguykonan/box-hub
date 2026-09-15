import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  props: { params: Promise<{ author: string; name: string }> }
) {
  try {
    const { author: authorParam, name: nameParam } = await props.params;
    const authorUsername = decodeURIComponent(authorParam).toLowerCase();
    const packageName = decodeURIComponent(nameParam).toLowerCase();

    const authorUser = await prisma.user.findFirst({
      where: { username: { equals: authorUsername, mode: "insensitive" } },
      select: { id: true, username: true },
    });

    if (!authorUser) {
      return NextResponse.json({ success: false, error: "Auteur introuvable." }, { status: 404 });
    }

    const pkg = await prisma.package.findFirst({
      where: {
        authorId: authorUser.id,
        name: { equals: packageName, mode: "insensitive" },
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          select: {
            version: true,
            tag: true,
            checksumSha256: true,
            fileSizeBytes: true,
            downloadCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json({ success: false, error: "Paquet introuvable." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      package: `${authorUser.username}/${pkg.name}`,
      tags: pkg.versions.map((v: { tag: string }) => v.tag),
      versions: pkg.versions.map((v: { version: string; tag: string; checksumSha256: string; fileSizeBytes: bigint; downloadCount: number; createdAt: Date }) => ({
        version: v.version,
        tag: v.tag,
        checksum: v.checksumSha256,
        sizeBytes: Number(v.fileSizeBytes),
        pulls: v.downloadCount,
        publishedAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erreur registry tags:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la récupération des tags." },
      { status: 500 }
    );
  }
}
