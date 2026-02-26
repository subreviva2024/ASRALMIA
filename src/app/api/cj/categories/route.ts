import { NextResponse } from "next/server";

/**
 * GET /api/cj/categories
 * Returns product categories from the ASTRALMIA engine catalog.
 */

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";

export async function GET() {
  try {
    const res = await fetch(`${ENGINE_URL}/catalog/categories`, {
      next: { revalidate: 300 },
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Engine returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ categories: data.categories || {}, engine: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Fallback: return static categories if engine is unavailable
    try {
      const { getCategories } = await import("@/lib/cj");
      const categories = await getCategories();
      return NextResponse.json({ categories, engine: false });
    } catch {
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
