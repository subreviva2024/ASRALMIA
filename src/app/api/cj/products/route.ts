import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cj/products — Live search via ASTRALMIA Engine
 * 
 * Uses the engine's /search endpoint for live CJ searches,
 * or falls back to catalog browsing.
 */

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const keyword = url.searchParams.get("keyword") || "";
    const limit = parseInt(url.searchParams.get("size") || "20");

    if (keyword) {
      // Live search through engine
      try {
        const res = await fetch(`${ENGINE_URL}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: keyword, limit }),
        });

        if (res.ok) {
          const data = await res.json();
          const products = (data.products || []).map((p: {
            pid: string; namePt: string; image: string;
            price: number; score: number; margin: number;
          }) => ({
            pid: p.pid,
            name: p.namePt,
            image: p.image,
            suggestedSellPrice: p.price,
            opportunityScore: p.score,
            marginPct: p.margin,
          }));

          return NextResponse.json({
            keyword,
            products,
            total: products.length,
            engine: true,
          });
        }
      } catch { /* fall through */ }
    }

    // Fallback: return from catalog
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("sort", "score");
    const res = await fetch(`${ENGINE_URL}/catalog?${params.toString()}`);
    
    if (!res.ok) throw new Error(`Engine returned ${res.status}`);
    
    const data = await res.json();
    return NextResponse.json({
      keyword: keyword || "catalog",
      products: data.products || [],
      total: data.total || 0,
      engine: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
