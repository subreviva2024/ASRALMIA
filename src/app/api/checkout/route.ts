import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session.
 * Client sends cart items + shipping info → we create a checkout session → return URL.
 * After payment, Stripe calls our webhook → we create CJ order.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }
    if (!customer?.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }
    if (!customer?.email?.trim()) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }
    if (!customer?.address?.trim()) {
      return NextResponse.json({ error: "Morada é obrigatória" }, { status: 400 });
    }
    if (!customer?.city?.trim()) {
      return NextResponse.json({ error: "Cidade é obrigatória" }, { status: 400 });
    }
    if (!customer?.zip?.trim()) {
      return NextResponse.json({ error: "Código postal é obrigatório" }, { status: 400 });
    }

    // Build Stripe line items from cart
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: { name: string; priceEur: number; qty: number; image?: string }) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name.length > 100 ? item.name.slice(0, 100) + "…" : item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.priceEur * 100), // Stripe uses cents
        },
        quantity: item.qty,
      })
    );

    // Build origin URL for redirects
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customer.email.trim().toLowerCase(),
      // Store order metadata so webhook can access it
      metadata: {
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: customer.phone?.trim() || "",
        customer_address: customer.address.trim(),
        customer_city: customer.city.trim(),
        customer_zip: customer.zip.trim(),
        customer_notes: (customer.notes?.trim() || "").slice(0, 500),
        items_json: JSON.stringify(
          items.map((item: { pid: string; vid: string; name: string; image: string; priceEur: number; costEur?: number; qty: number; shippingLabel: string }) => ({
            pid: item.pid,
            vid: item.vid,
            name: item.name,
            image: item.image,
            priceEur: item.priceEur,
            costEur: item.costEur || 0,
            qty: item.qty,
            shippingLabel: item.shippingLabel,
          }))
        ).slice(0, 500), // Stripe metadata max 500 chars per value
      },
      // Store full items in payment_intent metadata too (for larger orders)
      payment_intent_data: {
        metadata: {
          customer_name: customer.name.trim(),
          customer_email: customer.email.trim().toLowerCase(),
          customer_phone: customer.phone?.trim() || "",
          customer_address: customer.address.trim(),
          customer_city: customer.city.trim(),
          customer_zip: customer.zip.trim(),
          customer_notes: (customer.notes?.trim() || "").slice(0, 500),
          items_json: JSON.stringify(
            items.map((item: { pid: string; vid: string; name: string; image: string; priceEur: number; costEur?: number; qty: number; shippingLabel: string }) => ({
              pid: item.pid,
              vid: item.vid,
              name: item.name,
              image: item.image,
              priceEur: item.priceEur,
              costEur: item.costEur || 0,
              qty: item.qty,
              shippingLabel: item.shippingLabel,
            }))
          ).slice(0, 500),
        },
      },
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrinho?cancelled=true`,
      locale: "pt",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout] Stripe error:", err);
    const message = err instanceof Error ? err.message : "Erro ao criar sessão de pagamento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
