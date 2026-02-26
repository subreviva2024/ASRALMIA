import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cj/catalog — Proxies to ASTRALMIA Engine
 * 
 * The autonomous engine maintains a pre-scanned, filtered, translated catalog.
 * This route simply proxies to the engine and maps the data to the site format.
 */

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";

// ── Types ───────────────────────────────────────────────────────────────────

export interface CatalogProduct {
  pid: string;
  vid: string;
  nameEn: string;
  namePt: string;
  descPt: string;
  categoryPt: string;
  tagPt: string;
  accent: string;
  image: string;
  priceEur: number;
  freeShipping: boolean;
  shippingLabel: string;
  shippingDays: string;
  opportunityScore: number;
}

// Category key → engine categoryPt mapping
const CATEGORY_MAP: Record<string, string> = {
  cristais:  "Cristais",
  tarot:     "Tarot",
  incenso:   "Incenso",
  joias:     "Joias",
  meditacao: "Meditação",
  decoracao: "Decoração",
  velas:     "Velas",
  artefactos: "Artefactos",
  adivinhacao: "Adivinhação",
  aromaterapia: "Aromaterapia",
};

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // e.g. "cristais", "tarot", or null for all

    // Build engine URL with filters
    const engineParams = new URLSearchParams();
    if (category && CATEGORY_MAP[category]) {
      engineParams.set("category", CATEGORY_MAP[category]);
    }
    engineParams.set("limit", category ? "24" : "50");
    engineParams.set("sort", "score");

    const engineUrl = `${ENGINE_URL}/catalog?${engineParams.toString()}`;
    const res = await fetch(engineUrl, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 min
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Engine returned ${res.status}`);
    }

    const data = await res.json();
    const engineProducts = data.products || [];

    // Map engine format → site CatalogProduct format
    const products: CatalogProduct[] = engineProducts.map((p: {
      pid: string; namePt: string; descPt: string; categoryPt: string;
      tagPt?: string; accent?: string; image: string; price: number;
      shipping?: { free?: boolean; priceUsd?: number; days?: string; method?: string };
      score: number; margin?: number; vid?: string; nameEn?: string;
    }) => {
      const freeShipping = p.shipping?.free ?? false;
      const shippingCostEur = (p.shipping?.priceUsd || 0) * 0.92;
      return {
        pid: p.pid,
        vid: p.vid || p.pid,
        nameEn: p.nameEn || p.namePt,
        namePt: p.namePt,
        descPt: p.descPt,
        categoryPt: p.categoryPt,
        tagPt: p.tagPt || "Espiritual",
        accent: p.accent || "#c9a84c",
        image: p.image,
        priceEur: p.price,
        freeShipping,
        shippingLabel: freeShipping
          ? "Envio Grátis"
          : `Portes €${shippingCostEur.toFixed(2).replace(".", ",")}`,
        shippingDays: p.shipping?.days || "7-15",
        opportunityScore: p.score,
      };
    });

    return NextResponse.json(
      { products, category: category || "all", cached: false, engine: true },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[catalog] Engine proxy error:", message);
    return NextResponse.json({ error: message, products: [] }, { status: 500 });
  }
}
