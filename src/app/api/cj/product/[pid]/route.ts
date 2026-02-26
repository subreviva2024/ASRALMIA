import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cj/product/[pid]
 * 
 * Get full product details from the ASTRALMIA engine's catalog.
 * The engine stores pre-analyzed products with variants, shipping, and pricing.
 * Falls back to direct CJ API call if not in engine catalog.
 */

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";

export async function GET(req: NextRequest, { params }: { params: Promise<{ pid: string }> }) {
  try {
    const { pid } = await params;

    // First, try the engine (instant, pre-cached)
    try {
      const engineRes = await fetch(`${ENGINE_URL}/product/${pid}`, {
        next: { revalidate: 300 },
        headers: { "Accept": "application/json" },
      });

      if (engineRes.ok) {
        const data = await engineRes.json();
        if (data.product) {
          const p = data.product;
          // Map engine product → CJ product format expected by the detail page
          const product = {
            pid: p.pid,
            productNameEn: p.nameEn || p.namePt,
            productName: p.namePt,
            productImage: p.image,
            productImageSet: (p.images || []).join(";"),
            sellPrice: String(p.pricing?.cjPriceUsd || 0),
            productWeight: p.weight || 0,
            productSku: p.sku || "",
            categoryName: p.categoryPt,
            description: p.descPt,
          };
          const variants = (p.variants || []).map((v: { vid: string; name: string; price: number; image: string }) => ({
            vid: v.vid,
            variantNameEn: v.name,
            variantSellPrice: String(v.price || p.pricing?.cjPriceUsd || 0),
            variantImage: v.image || p.image,
            variantKey: v.name,
          }));
          // If no variants, create one from the product
          if (variants.length === 0 && p.vid) {
            variants.push({
              vid: p.vid,
              variantNameEn: "Padrão",
              variantSellPrice: String(p.pricing?.cjPriceUsd || 0),
              variantImage: p.image,
              variantKey: "default",
            });
          }
          const shipping = p.shipping ? [{
            logisticName: p.shipping.method || "Standard",
            logisticPrice: String(p.shipping.priceUsd || 0),
            logisticAging: p.shipping.days || "7-15",
          }] : [];
          return NextResponse.json({ product, variants, shipping, engine: true });
        }
      }
    } catch {
      // Engine unavailable, fall through to direct CJ call
    }

    // Fallback: direct CJ API call (slower, but ensures product is accessible)
    const { getProductDetail, getProductVariants, calculateFreight } = await import("@/lib/cj");
    const [product, variants] = await Promise.all([
      getProductDetail(pid),
      getProductVariants(pid),
    ]);

    let shipping: unknown[] = [];
    if (variants.length > 0) {
      try {
        shipping = await calculateFreight({
          endCountryCode: "PT",
          products: [{ quantity: 1, vid: variants[0].vid }],
        });
      } catch {
        // Shipping calc may fail for some products
      }
    }

    return NextResponse.json({ product, variants, shipping, engine: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
