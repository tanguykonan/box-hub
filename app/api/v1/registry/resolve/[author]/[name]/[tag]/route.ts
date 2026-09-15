import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { RuntimeType } from "@prisma/client";

export async function GET(
  req: Request,
  props: { params: Promise<{ author: string; name: string; tag: string }> }
) {
  try {
    const { author: authorParam, name: nameParam, tag: tagParam } = await props.params;
    const authorUsername = decodeURIComponent(authorParam).toLowerCase();
    const packageName = decodeURIComponent(nameParam).toLowerCase();
    const requestedTag = decodeURIComponent(tagParam).toLowerCase();

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
        versions: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!pkg) {
      return NextResponse.json({ success: false, error: "Paquet introuvable." }, { status: 404 });
    }

    if (pkg.isPrivate) {
      const { user } = await authenticateApiRequest(req, ["packages:read"]);
      if (!user || (user.id !== authorUser.id && user.role !== "ADMIN")) {
        return NextResponse.json({ success: false, error: "Accès refusé au paquet privé." }, { status: 403 });
      }
    }

    let matchedVersion = pkg.versions.find(
      (v: { tag: string; version: string }) =>
        v.tag.toLowerCase() === requestedTag ||
        v.version.toLowerCase() === requestedTag ||
        `v${v.version.toLowerCase()}` === requestedTag
    );

    if (!matchedVersion) {
      matchedVersion = pkg.versions[0];
    }

    if (!matchedVersion) {
      return NextResponse.json({ success: false, error: "Aucune version disponible." }, { status: 404 });
    }

    const isPython = pkg.runtime === RuntimeType.PYTHON;

    return NextResponse.json({
      success: true,
      manifest: {
        name: pkg.name,
        author: authorUser.username,
        version: matchedVersion.version,
        tag: matchedVersion.tag,
        runtime: {
          engine: isPython ? "fastengine-python" : "fastengine-node",
          type: isPython ? "python" : "node",
          version: pkg.runtimeVersion || (isPython ? "3.12" : "22.0.0"),
        },
        execution: {
          entrypoint: isPython ? "main.py" : "src/index.js",
          network: "outbound / http",
          volumes: ["./data:/app/data"],
          ports: isPython ? ["8000"] : ["3000"],
        },
        envVariables: matchedVersion.envVariables || {},
        checksumSha256: matchedVersion.checksumSha256,
        sizeBytes: Number(matchedVersion.fileSizeBytes),
        isProtected: pkg.isProtected,
        pullCommand: `box pull ${authorUser.username}/${pkg.name}:${matchedVersion.tag}`,
        runCommand: `box run ${authorUser.username}/${pkg.name}:${matchedVersion.tag}`,
      },
    });
  } catch (error) {
    console.error("Erreur registry resolve:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la résolution du paquet." },
      { status: 500 }
    );
  }
}
