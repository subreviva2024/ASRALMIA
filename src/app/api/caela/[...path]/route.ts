import { NextRequest, NextResponse } from "next/server";

const CAELA_URL = process.env.CAELA_URL || "http://localhost:4001";

async function proxy(slug: string) {
  try {
    const res = await fetch(`${CAELA_URL}/${slug}`, {
      next: { revalidate: 300 }, // 5 min cache
    });
    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Caela offline", slug }, { status: 503 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(path ? path.join("/") : "health");
}
