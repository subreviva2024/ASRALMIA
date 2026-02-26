import { NextRequest, NextResponse } from "next/server";
import { calculateFreight } from "@/lib/cj";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vid, quantity = 1, zip } = body;

    if (!vid) {
      return NextResponse.json({ error: "vid is required" }, { status: 400 });
    }

    const options = await calculateFreight({
      endCountryCode: "PT",
      products: [{ quantity, vid }],
      ...(zip ? { zip } : {}),
    });

    const sorted = [...options].sort((a, b) => a.logisticPrice - b.logisticPrice);

    return NextResponse.json({
      vid,
      quantity,
      destination: "PT",
      options: sorted,
      cheapest: sorted[0] || null,
      freeOptions: sorted.filter((o) => o.logisticPrice === 0 || o.logisticPrice < 0.01),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
