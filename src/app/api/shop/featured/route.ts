import { NextResponse } from "next/server";

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";

export interface FeaturedProduct {
  pid: string;
  vid: string;
  name: string;
  namePt: string;
  descPt: string;
  image: string;
  categoryLabel: string;
  accent: string;
  suggestedPriceEur: number;
  cjPriceEur: number;
  totalCostEur: number;
  marginPct: number;
  freeShipping: boolean;
  shippingLabel: string;
  shippingDays: string;
  opportunityScore: number;
  tag: string;
}

export async function GET() {
  try {
    const engineUrl = `${ENGINE_URL}/catalog/featured?limit=12`;
    const res = await fetch(engineUrl, {
      next: { revalidate: 300 },
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Engine returned ${res.status}`);
    }

    const data = await res.json();
    const engineProducts = data.products || [];

    const products: FeaturedProduct[] = engineProducts.map((p: {
      pid: string; namePt: string; descPt: string; categoryPt: string;
      tagPt?: string; accent?: string; image: string; price: number;
      shipping?: { free?: boolean; priceUsd?: number; days?: string; method?: string };
      score: number; margin?: number; vid?: string; nameEn?: string;
      cjPriceEur?: number; totalCostEur?: number;
    }) => {
      const freeShipping = p.shipping?.free ?? false;
      const shippingCostEur = (p.shipping?.priceUsd || 0) * 0.92;
      const totalCostEur = p.totalCostEur || (p.cjPriceEur || p.price * 0.4) + shippingCostEur;
      return {
        pid: p.pid,
        vid: p.vid || p.pid,
        name: p.nameEn || p.namePt,
        namePt: p.namePt,
        descPt: p.descPt,
        image: p.image,
        categoryLabel: p.categoryPt,
        accent: p.accent || "#c9a84c",
        suggestedPriceEur: p.price,
        cjPriceEur: p.cjPriceEur || Math.round(p.price * 0.4 * 100) / 100,
        totalCostEur: Math.round(totalCostEur * 100) / 100,
        marginPct: p.margin || 0,
        freeShipping,
        shippingLabel: freeShipping
          ? "Envio Grátis"
          : `Portes €${shippingCostEur.toFixed(2).replace(".", ",")}`,
        shippingDays: p.shipping?.days || "7-15",
        opportunityScore: p.score,
        tag: p.tagPt || "Espiritual",
      };
    });

    return NextResponse.json(
      { products, cached: false, engine: true },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, products: [] }, { status: 500 });
  }
}
