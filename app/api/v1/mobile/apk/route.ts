import { NextResponse } from "next/server";

const GITHUB_REPO = "tanguykonan/box-runner";

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "BoxHub/1.0",
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ success: false }, { status: 502 });
    }

    const release = await res.json();
    const apkAsset = (
      release.assets as { name: string; browser_download_url: string }[]
    ).find((a) => a.name.endsWith(".apk"));

    if (!apkAsset) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    return NextResponse.redirect(apkAsset.browser_download_url, { status: 302 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
