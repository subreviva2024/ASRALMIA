import { NextResponse } from "next/server";

/**
 * POST /api/order
 * DEPRECATED — All orders must go through Stripe Checkout (/api/checkout).
 * This endpoint is disabled for security (prevents unpaid orders).
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Este endpoint foi desactivado. Todas as encomendas devem ser efectuadas através do checkout com pagamento.",
      redirect: "/carrinho",
    },
    { status: 410 }
  );
}
