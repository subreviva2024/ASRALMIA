import { NextRequest, NextResponse } from "next/server";
import {
  searchProducts,
  calculateFreight,
  getProductVariants,
  analyzePricing,
  safeFloat,
} from "@/lib/cj";
import { translateProduct } from "@/data/translations";

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

// ── In-memory cache (per keyword, server-side) ──────────────────────────────

const cache = new Map<string, { data: CatalogProduct[]; at: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Constraints for the Portuguese market
const MAX_CJ_PRICE_USD = 20;      // max CJ cost — keeps retail ≤€49.99
const MAX_SHIPPING_USD = 8;        // skip products with shipping >$8
const MAX_RETAIL_PRICE_EUR = 49.99; // affordable price ceiling

// Shop categories mapped to CJ search keywords
const SHOP_CATEGORIES: Record<string, string[]> = {
  cristais:    ["crystal pendant", "amethyst necklace", "crystal bracelet", "rose quartz", "crystal tree", "natural stone pendant"],
  tarot:       ["tarot deck", "tarot", "oracle cards"],
  incenso:     ["backflow incense", "incense holder", "incense waterfall"],
  joias:       ["evil eye bracelet", "zodiac necklace", "chakra bracelet", "hamsa necklace", "moon phase necklace"],
  meditacao:   ["singing bowl", "pendulum dowsing", "mala beads", "prayer beads"],
  decoracao:   ["dreamcatcher", "buddha statue", "sacred geometry"],
  velas:       ["candle spell", "ritual candle"],
};

const ALL_KEYWORDS = Object.values(SHOP_CATEGORIES).flat();

/** Check if a product name is relevant to the search keyword */
function isRelevant(productName: string, keyword: string): boolean {
  const lower = productName.toLowerCase();
  const primaryWord = keyword.split(" ")[0].toLowerCase();
  return lower.includes(primaryWord);
}

/** Validate that a CJ image URL is usable */
function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || url.length < 10) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

async function fetchCatalogForKeyword(kw: string): Promise<CatalogProduct[]> {
  const results: CatalogProduct[] = [];

  try {
    const { list } = await searchProducts({ keyword: kw, page: 1, size: 8 });
    if (!list?.length) return results;

    for (const p of list.slice(0, 6)) {
      try {
        if (!isValidImageUrl(p.productImage)) continue;
        // Skip irrelevant results
        if (!isRelevant(p.productNameEn || p.productName, kw)) continue;
        const cjPrice = safeFloat(p.sellPrice);
        if (cjPrice <= 0 || cjPrice > MAX_CJ_PRICE_USD) continue; // Skip expensive items

        const variants = await getProductVariants(p.pid);
        const firstVariant = variants[0];
        if (!firstVariant?.vid) continue;

        // Calculate cheapest shipping to Portugal
        let shipping: Awaited<ReturnType<typeof calculateFreight>> = [];
        try {
          shipping = await calculateFreight({
            endCountryCode: "PT",
            products: [{ quantity: 1, vid: firstVariant.vid }],
          });
        } catch {
          shipping = [];
        }

        const cheapest = shipping.length
          ? shipping.reduce((a, b) =>
              safeFloat(a.logisticPrice) <= safeFloat(b.logisticPrice) ? a : b
            )
          : null;

        const pricing = analyzePricing(cjPrice, cheapest, 2.5);
        if (pricing.suggestedPriceEur <= 0) continue;
        if (pricing.suggestedPriceEur > MAX_RETAIL_PRICE_EUR) continue; // Keep prices accessible

        // Skip products with expensive shipping to Portugal
        const shippingUsd = cheapest ? safeFloat(cheapest.logisticPrice) : 0;
        if (shippingUsd > MAX_SHIPPING_USD) continue;

        const freeShipping = cheapest ? shippingUsd === 0 : false;
        const shippingCostEur = cheapest ? shippingUsd * 0.92 : 0;

        // Translate to Portuguese
        const translation = translateProduct(p.productNameEn || p.productName);

        results.push({
          pid: p.pid,
          vid: firstVariant.vid,
          nameEn: p.productNameEn || p.productName,
          namePt: translation.namePt,
          descPt: translation.descPt,
          categoryPt: translation.categoryPt,
          tagPt: translation.tagPt,
          accent: translation.accent,
          image: p.productImage,
          priceEur: pricing.suggestedPriceEur,
          freeShipping,
          shippingLabel: freeShipping
            ? "Envio Grátis"
            : `Portes €${shippingCostEur.toFixed(2).replace(".", ",")}`,
          shippingDays: cheapest?.logisticAging || "5-12",
          opportunityScore: pricing.opportunityScore,
        });
      } catch {
        // Skip individual product errors
      }
    }
  } catch {
    // Skip keyword errors
  }

  return results;
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // e.g. "cristais", "tarot", or null for all

    // Determine which keywords to search
    const keywords = category && SHOP_CATEGORIES[category]
      ? SHOP_CATEGORIES[category]
      : ALL_KEYWORDS;

    const cacheKey = category || "all";

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return NextResponse.json(
        { products: cached.data, category: cacheKey, cached: true },
        { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=600" } }
      );
    }

    // Fetch products in parallel batches (max 4 concurrent)
    const allProducts: CatalogProduct[] = [];
    const batchSize = 4;

    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(fetchCatalogForKeyword));
      allProducts.push(...batchResults.flat());
    }

    // Deduplicate by pid, sort by opportunity score
    const seen = new Set<string>();
    const products = allProducts
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .filter((p) => {
        if (seen.has(p.pid)) return false;
        seen.add(p.pid);
        return true;
      })
      .slice(0, category ? 12 : 24); // 12 per category, 24 for "all"

    // Cache results
    cache.set(cacheKey, { data: products, at: Date.now() });

    return NextResponse.json(
      { products, category: cacheKey, cached: false },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=600" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, products: [] }, { status: 500 });
  }
}
