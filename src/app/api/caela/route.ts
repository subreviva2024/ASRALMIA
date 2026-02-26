import { NextResponse } from "next/server";

const CAELA_URL = process.env.CAELA_URL || "http://localhost:4001";

export async function GET() {
  try {
    const res = await fetch(`${CAELA_URL}/health`, { next: { revalidate: 60 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Caela offline" }, { status: 503 });
  }
}
