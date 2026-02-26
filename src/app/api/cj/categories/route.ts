import { NextResponse } from "next/server";
import { getCategories } from "@/lib/cj";

/**
 * GET /api/cj/categories
 * Returns all CJ Dropshipping product categories.
 */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
