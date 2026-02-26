import { NextRequest, NextResponse } from "next/server";
import {
  searchProducts,
  calculateFreight,
  getProductVariants,
  analyzePricing,
  safeFloat,
  usdToEur,
  SPIRITUAL_KEYWORDS,
  type CJProduct,
  type CJFreightOption,
} from "@/lib/cj";

const MAX_CJ_PRICE_USD = 20;
const MAX_SHIPPING_USD = 8;
const MAX_RETAIL_PRICE_EUR = 49.99;

function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (u.protocol === "https:" || u.protocol === "http:") && /\.(jpg|jpeg|png|webp)/i.test(u.pathname);
  } catch { return false; }
}

/**
 * GET /api/cj/products
 *
 * Search CJ Dropshipping for spiritual products, calculate shipping to Portugal,
 * and return products sorted by best margin opportunity.
 *
 * Query params:
 *   keyword  - search term (defaults to rotating spiritual keywords)
 *   page     - page number (default 1)
 *   size     - results per page (default 20)
 *   markup   - your target sell-price markup multiplier (default 2.5)
 *   maxShip  - maximum shipping cost in USD to consider "cheap" (default 5)
 */

interface EnrichedProduct {
  pid: string;
  name: string;
  image: string;
  sku: string;
  category: string;
  weight: number;
  cjPrice: number;
  cjPriceEur: number;
  cheapestShipping: CJFreightOption | null;
  allShipping: CJFreightOption[];
  totalCost: number;
  totalCostEur: number;
  suggestedSellPrice: number;
  margin: number;
  marginPct: number;
  shippingDays: string;
  freeShipping: boolean;
  opportunityScore: number;
  variants?: { vid: string; name: string; price: number; image: string }[];
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const keyword = url.searchParams.get("keyword") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const size = parseInt(url.searchParams.get("size") || "20");
    const markup = parseFloat(url.searchParams.get("markup") || "2.5");
    const maxShip = parseFloat(url.searchParams.get("maxShip") || "5");

    // If no keyword, use a spiritual keyword
    const searchKeyword = keyword || SPIRITUAL_KEYWORDS[Math.floor(Math.random() * SPIRITUAL_KEYWORDS.length)];

    // Search products
    const result = await searchProducts({
      keyword: searchKeyword,
      page,
      size,
    });

    const products: CJProduct[] = result.list || [];
    if (products.length === 0) {
      return NextResponse.json({
        keyword: searchKeyword,
        products: [],
        total: 0,
        page,
        message: "No products found for this keyword",
      });
    }

    // Pre-filter: skip expensive or image-less products
    const filtered = products.filter(p => {
      if (safeFloat(p.sellPrice) > MAX_CJ_PRICE_USD) return false;
      if (!isValidImageUrl(p.productImage)) return false;
      return true;
    });

    // For each product, get variants and calculate freight to Portugal
    const enriched: EnrichedProduct[] = [];

    for (const p of filtered) {
      try {
        // Get variants to get VIDs for freight calculation
        let variants = p.variants || [];
        if (!variants.length) {
          try {
            variants = await getProductVariants(p.pid);
          } catch {
            // Skip if we can't get variants
          }
        }

        const firstVid = variants[0]?.vid;
        let shipping: CJFreightOption[] = [];

        if (firstVid) {
          try {
            shipping = await calculateFreight({
              endCountryCode: "PT",
              products: [{ quantity: 1, vid: firstVid }],
            });
          } catch {
            // Shipping calc failed, continue
          }
        }

        // Find cheapest shipping option
        const cheapest = shipping.length
          ? shipping.reduce((a, b) => (a.logisticPrice < b.logisticPrice ? a : b))
          : null;

        const cjPrice = safeFloat(p.sellPrice);
        const pricing = analyzePricing(cjPrice, cheapest, markup);

        // Skip if shipping too expensive or retail price too high
        if (cheapest && cheapest.logisticPrice > MAX_SHIPPING_USD) continue;
        if (pricing.suggestedPriceEur > MAX_RETAIL_PRICE_EUR) continue;

        enriched.push({
          pid: p.pid,
          name: p.productNameEn || p.productName,
          image: p.productImage,
          sku: p.productSku,
          category: p.categoryName,
          weight: safeFloat(p.productWeight),
          cjPrice,
          cjPriceEur: pricing.cjPriceEur,
          cheapestShipping: cheapest,
          allShipping: shipping,
          totalCost: pricing.totalCostUsd,
          totalCostEur: pricing.totalCostEur,
          suggestedSellPrice: pricing.suggestedPriceEur,
          margin: pricing.marginEur,
          marginPct: pricing.marginPct,
          shippingDays: pricing.shippingDays,
          freeShipping: pricing.freeShipping,
          opportunityScore: pricing.opportunityScore,
          variants: variants.slice(0, 5).map((v) => ({
            vid: v.vid,
            name: v.variantNameEn || v.variantKey || v.variantName || "",
            price: v.variantSellPrice,
            image: v.variantImage,
          })),
        });
      } catch {
        // Skip individual product errors
      }
    }

    // Sort: free shipping first, then by margin % descending
    enriched.sort((a, b) => {
      if (a.freeShipping !== b.freeShipping) return a.freeShipping ? -1 : 1;
      if (a.cheapestShipping && b.cheapestShipping) {
        if (a.cheapestShipping.logisticPrice !== b.cheapestShipping.logisticPrice) {
          return a.cheapestShipping.logisticPrice - b.cheapestShipping.logisticPrice;
        }
      }
      return b.marginPct - a.marginPct;
    });

    return NextResponse.json({
      keyword: searchKeyword,
      products: enriched,
      total: result.total || enriched.length,
      page,
      cheapShipping: enriched.filter((p) => (p.cheapestShipping?.logisticPrice ?? 99) <= maxShip).length,
      freeShipping: enriched.filter((p) => p.freeShipping).length,
      avgMargin: enriched.length
        ? Math.round((enriched.reduce((s, p) => s + p.marginPct, 0) / enriched.length) * 10) / 10
        : 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
