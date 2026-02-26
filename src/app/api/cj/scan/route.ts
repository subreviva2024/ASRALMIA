import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cj/scan — Triggers or reads scan from ASTRALMIA Engine
 * 
 * The engine handles all scanning autonomously.
 * This route reads the full catalog from the engine, optionally triggering a rescan.
 */

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "top";
    const category = url.searchParams.get("category") || "";
    const trigger = url.searchParams.get("trigger") === "true";

    // Optionally trigger a rescan
    if (trigger) {
      try {
        await fetch(`${ENGINE_URL}/scan`, { method: "POST" });
      } catch { /* non-blocking */ }
    }

    // Build engine query
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("limit", "100");
    params.set("sort", "score");

    const res = await fetch(`${ENGINE_URL}/catalog?${params.toString()}`, {
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) throw new Error(`Engine returned ${res.status}`);
    const data = await res.json();
    const products = data.products || [];

    // Get stats
    let stats = {};
    try {
      const statsRes = await fetch(`${ENGINE_URL}/stats`);
      if (statsRes.ok) stats = await statsRes.json();
    } catch { /* ignore */ }

    // Map to scan format
    const scanProducts = products.map((p: {
      pid: string; namePt: string; categoryPt: string; image: string;
      price: number; score: number; margin: number;
      shipping?: { free?: boolean; priceUsd?: number; days?: string };
    }) => ({
      pid: p.pid,
      name: p.namePt,
      image: p.image,
      category: p.categoryPt,
      suggestedPriceEur: p.price,
      marginPct: p.margin,
      freeShipping: p.shipping?.free ?? false,
      shippingDays: p.shipping?.days || "7-15",
      opportunityScore: p.score,
    }));

    const freeShippingCount = scanProducts.filter((p: { freeShipping: boolean }) => p.freeShipping).length;
    const avgScore = scanProducts.length
      ? Math.round(scanProducts.reduce((s: number, p: { opportunityScore: number }) => s + p.opportunityScore, 0) / scanProducts.length)
      : 0;

    return NextResponse.json({
      mode,
      category: category || undefined,
      products: scanProducts,
      total: scanProducts.length,
      stats: {
        freeShipping: freeShippingCount,
        avgOpportunityScore: avgScore,
        ...stats,
      },
      engine: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
