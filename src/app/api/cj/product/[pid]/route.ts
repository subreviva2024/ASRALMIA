import { NextRequest, NextResponse } from "next/server";
import { getProductDetail, getProductVariants, calculateFreight } from "@/lib/cj";

/**
 * GET /api/cj/product/[pid]
 * Get full product details with variants and shipping options to Portugal.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ pid: string }> }) {
  try {
    const { pid } = await params;

    // Fetch product details and variants in parallel
    const [product, variants] = await Promise.all([
      getProductDetail(pid),
      getProductVariants(pid),
    ]);

    // Calculate freight for first variant
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

    return NextResponse.json({
      product,
      variants,
      shipping,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
