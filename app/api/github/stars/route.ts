import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repo = SITE_CONFIG.githubRepo || "tanguykonan/box";
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "BoxHub-App",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ stars: 0, formatted: "0" });
    }

    const data = await res.json();
    const count = typeof data.stargazers_count === "number" ? data.stargazers_count : 0;

    let formatted = count.toString();
    if (count >= 1000000) {
      formatted = (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (count >= 1000) {
      formatted = (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }

    return NextResponse.json({ stars: count, formatted });
  } catch (error) {
    return NextResponse.json({ stars: 0, formatted: "0" });
  }
}
