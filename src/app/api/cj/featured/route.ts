import { NextResponse } from "next/server";
import {
  searchProducts,
  calculateFreight,
  getProductVariants,
  analyzePricing,
  safeFloat,
} from "@/lib/cj";
import { translateProduct } from "@/data/translations";

// ── Types ───────────────────────────────────────────────────────────────────

export interface FeaturedProduct {
  pid: string;
  vid: string;  // first variant ID (for cart)
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

// ── In-memory cache (server-side, resets on deploy) ─────────────────────────

let cache: { data: FeaturedProduct[]; at: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
// Constraints for affordable PT market
const MAX_CJ_PRICE_USD = 20;
const MAX_SHIPPING_USD = 8;
const MAX_RETAIL_PRICE_EUR = 49.99;
// Keywords mapped to Portuguese display labels for the shop
const FEATURED_KEYWORDS: { kw: string; label: string; tag: string }[] = [
  { kw: "crystal pendant",        label: "Cristais",     tag: "Energia" },
  { kw: "evil eye bracelet",      label: "Joias",        tag: "Protecção" },
  { kw: "pendulum dowsing",       label: "Adivinhação",  tag: "Divinação" },
  { kw: "backflow incense",       label: "Incenso",      tag: "Ritual" },
  { kw: "tarot deck",             label: "Tarot",        tag: "Sabedoria" },
  { kw: "zodiac necklace",        label: "Joias",        tag: "Zodíaco" },
  { kw: "crystal tree",           label: "Decoração",    tag: "Abundância" },
  { kw: "singing bowl",           label: "Meditação",    tag: "Meditação" },
];

/** Check if a product name is relevant to the search keyword */
function isRelevant(productName: string, keyword: string): boolean {
  const lower = productName.toLowerCase();
  // The primary keyword word (first word) must appear in the product name
  const primaryWord = keyword.split(" ")[0].toLowerCase();
  return lower.includes(primaryWord);
}

/** Validate that a CJ image URL is usable */
function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || url.length < 10) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

async function fetchFeatured(): Promise<FeaturedProduct[]> {
  const results: FeaturedProduct[] = [];

  for (const entry of FEATURED_KEYWORDS) {
    try {
      const { list } = await searchProducts({ keyword: entry.kw, page: 1, size: 8 });
      if (!list.length) continue;

      // Take first relevant products per keyword
      for (const p of list.slice(0, 4)) {
        try {
          // Skip products with no image
          if (!isValidImageUrl(p.productImage)) continue;

          // Skip irrelevant results (CJ sometimes returns unrelated products)
          if (!isRelevant(p.productNameEn || p.productName, entry.kw)) continue;

          const cjPrice = safeFloat(p.sellPrice);
          if (cjPrice <= 0 || cjPrice > MAX_CJ_PRICE_USD) continue;

          const variants = await getProductVariants(p.pid);
          const firstVariant = variants[0];
          if (!firstVariant?.vid) continue;

          // Calculate cheapest shipping to Portugal
          let shipping = await calculateFreight({
            endCountryCode: "PT",
            products: [{ quantity: 1, vid: firstVariant.vid }],
          });

          const cheapest = shipping.length
            ? shipping.reduce((a, b) => (safeFloat(a.logisticPrice) <= safeFloat(b.logisticPrice) ? a : b))
            : null;

          // Skip products with expensive shipping
          const shippingUsd = cheapest ? safeFloat(cheapest.logisticPrice) : 0;
          if (shippingUsd > MAX_SHIPPING_USD) continue;

          if (cjPrice <= 0) continue;

          const pricing = analyzePricing(cjPrice, cheapest, 2.5);
          if (pricing.suggestedPriceEur <= 0) continue;
          if (pricing.suggestedPriceEur > MAX_RETAIL_PRICE_EUR) continue;

          const freeShipping = cheapest ? shippingUsd === 0 : false;
          const shippingCostEur = cheapest ? shippingUsd * 0.92 : 0;
          const shippingLabel = freeShipping
            ? "Envio Grátis"
            : `Portes €${shippingCostEur.toFixed(2).replace(".", ",")}`;

          // Extract shipping days from channelName or use default
          const shippingDays =
            cheapest?.logisticName
              ? `${cheapest.logisticName}`
              : "5–12 dias";

          // Cache translation to avoid calling 3x per product
          const translation = translateProduct(p.productNameEn || p.productName);

          results.push({
            pid: p.pid,
            vid: firstVariant.vid,
            name: p.productNameEn || p.productName,
            namePt: translation.namePt,
            descPt: translation.descPt,
            image: p.productImage,
            categoryLabel: entry.label,
            accent: translation.accent,
            suggestedPriceEur: pricing.suggestedPriceEur,
            cjPriceEur: pricing.cjPriceEur,
            totalCostEur: pricing.totalCostEur,
            marginPct: pricing.marginPct,
            freeShipping,
            shippingLabel,
            shippingDays,
            opportunityScore: pricing.opportunityScore,
            tag: entry.tag,
          });
        } catch {
          // Skip individual product errors
        }
      }
    } catch {
      // Skip keyword errors
    }
  }

  // Sort by score, deduplicate pids, return top 8
  const seen = new Set<string>();
  return results
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .filter((p) => {
      if (seen.has(p.pid)) return false;
      seen.add(p.pid);
      return true;
    })
    .slice(0, 8);
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // Serve from cache if fresh
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      return NextResponse.json(
        { products: cache.data, cached: true },
        { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=600" } }
      );
    }

    const products = await fetchFeatured();
    cache = { data: products, at: Date.now() };

    return NextResponse.json(
      { products, cached: false },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=600" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, products: [] }, { status: 500 });
  }
}
