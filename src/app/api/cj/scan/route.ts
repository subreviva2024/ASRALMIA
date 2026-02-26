import { NextRequest, NextResponse } from "next/server";
import {
  searchProducts,
  calculateFreight,
  getProductVariants,
  analyzePricing,
  safeFloat,
  usdToEur,
  TOP_OPPORTUNITY_KEYWORDS,
  KEYWORD_CATEGORIES,
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
 * GET /api/cj/scan
 *
 * Bulk-scan multiple keywords across CJ Dropshipping, calculate shipping to Portugal,
 * and return ALL products ranked by opportunity score.
 *
 * This is the "find me the best deals" endpoint.
 *
 * Query params:
 *   mode      - "top" (top 20 keywords) | "category" | "all" (default: "top")
 *   category  - if mode=category, which category to scan (e.g. "cristais", "joias")
 *   markup    - target markup multiplier (default: 2.5)
 *   maxShip   - max shipping in USD to consider "cheap" (default: 5)
 *   limit     - max products per keyword to check shipping for (default: 5)
 *   minMargin - minimum margin % to include (default: 40)
 */

interface ScanProduct {
  pid: string;
  name: string;
  image: string;
  sku: string;
  category: string;
  weight: number;
  keyword: string;
  cjPriceUsd: number;
  cjPriceEur: number;
  shippingUsd: number;
  shippingEur: number;
  totalCostEur: number;
  suggestedPriceEur: number;
  marginEur: number;
  marginPct: number;
  freeShipping: boolean;
  shippingDays: string;
  opportunityScore: number;
  cheapestShipping: CJFreightOption | null;
  allShipping: CJFreightOption[];
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "top";
    const category = url.searchParams.get("category") || "";
    const markup = parseFloat(url.searchParams.get("markup") || "2.5");
    const maxShip = parseFloat(url.searchParams.get("maxShip") || "5");
    const limit = parseInt(url.searchParams.get("limit") || "5");
    const minMargin = parseFloat(url.searchParams.get("minMargin") || "40");

    // Decide which keywords to scan
    let keywords: string[];
    if (mode === "category" && category && KEYWORD_CATEGORIES[category]) {
      keywords = KEYWORD_CATEGORIES[category];
    } else if (mode === "all") {
      // All keywords (warning: slow!)
      keywords = Object.values(KEYWORD_CATEGORIES).flat();
    } else {
      // Default: top opportunity keywords
      keywords = TOP_OPPORTUNITY_KEYWORDS;
    }

    const allProducts: ScanProduct[] = [];
    const keywordResults: Record<string, number> = {};
    const errors: string[] = [];

    // Scan each keyword (sequential to avoid rate limiting)
    for (const kw of keywords) {
      try {
        const result = await searchProducts({
          keyword: kw,
          page: 1,
          size: limit,
        });

        const rawProducts: CJProduct[] = (result.list || []).slice(0, limit);
        // Pre-filter: skip expensive or image-less products
        const products = rawProducts.filter(p => {
          if (safeFloat(p.sellPrice) > MAX_CJ_PRICE_USD) return false;
          if (!isValidImageUrl(p.productImage)) return false;
          return true;
        });
        keywordResults[kw] = products.length;

        for (const p of products) {
          try {
            // Don't re-process products we've already seen
            if (allProducts.some((x) => x.pid === p.pid)) continue;

            // Get variants for freight calculation
            let variants = p.variants || [];
            if (!variants.length) {
              try {
                variants = await getProductVariants(p.pid);
              } catch {
                /* skip */
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
                /* skip */
              }
            }

            const cheapest = shipping.length
              ? shipping.reduce((a, b) => (a.logisticPrice < b.logisticPrice ? a : b))
              : null;

            const pricing = analyzePricing(safeFloat(p.sellPrice), cheapest, markup);

            // Filter by minimum margin, max shipping, and max retail price
            if (pricing.marginPct < minMargin) continue;
            if (cheapest && cheapest.logisticPrice > MAX_SHIPPING_USD) continue;
            if (pricing.suggestedPriceEur > MAX_RETAIL_PRICE_EUR) continue;

            allProducts.push({
              pid: p.pid,
              name: p.productNameEn || p.productName,
              image: p.productImage,
              sku: p.productSku,
              category: p.categoryName,
              weight: safeFloat(p.productWeight),
              keyword: kw,
              cjPriceUsd: pricing.cjPriceUsd,
              cjPriceEur: pricing.cjPriceEur,
              shippingUsd: pricing.shippingUsd,
              shippingEur: pricing.shippingEur,
              totalCostEur: pricing.totalCostEur,
              suggestedPriceEur: pricing.suggestedPriceEur,
              marginEur: pricing.marginEur,
              marginPct: pricing.marginPct,
              freeShipping: pricing.freeShipping,
              shippingDays: pricing.shippingDays,
              opportunityScore: pricing.opportunityScore,
              cheapestShipping: cheapest,
              allShipping: shipping,
            });
          } catch {
            /* skip individual product */
          }
        }
      } catch (err) {
        errors.push(`${kw}: ${err instanceof Error ? err.message : "error"}`);
      }
    }

    // Sort by opportunity score (best deals first)
    allProducts.sort((a, b) => b.opportunityScore - a.opportunityScore);

    // Stats
    const freeShippingCount = allProducts.filter((p) => p.freeShipping).length;
    const cheapShippingCount = allProducts.filter((p) => p.shippingUsd <= maxShip).length;
    const avgMargin = allProducts.length
      ? Math.round((allProducts.reduce((s, p) => s + p.marginPct, 0) / allProducts.length) * 10) / 10
      : 0;
    const avgScore = allProducts.length
      ? Math.round(allProducts.reduce((s, p) => s + p.opportunityScore, 0) / allProducts.length)
      : 0;

    return NextResponse.json({
      mode,
      category: mode === "category" ? category : undefined,
      keywordsScanned: keywords.length,
      keywordResults,
      products: allProducts,
      total: allProducts.length,
      stats: {
        freeShipping: freeShippingCount,
        cheapShipping: cheapShippingCount,
        avgMarginPct: avgMargin,
        avgOpportunityScore: avgScore,
        bestMargin: allProducts.length ? allProducts.reduce((b, p) => (p.marginPct > b.marginPct ? p : b)).marginPct : 0,
        bestScore: allProducts.length ? allProducts[0].opportunityScore : 0,
      },
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
