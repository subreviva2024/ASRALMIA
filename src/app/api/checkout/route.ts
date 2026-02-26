import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/** Save pending order data to file (avoids Stripe 500-char metadata limit) */
function savePendingOrder(orderId: string, data: Record<string, unknown>) {
  try {
    const dir = path.join(process.cwd(), "data", "pending");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${orderId}.json`), JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[Checkout] Failed to save pending order:", err);
  }
}

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session.
 * Client sends cart items + shipping info → we create a checkout session → return URL.
 * After payment, Stripe calls our webhook → we create CJ order.
 *
 * Full order data is stored server-side (data/pending/<orderId>.json) to avoid
 * Stripe's 500-char metadata limit, which would truncate multi-item orders.
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

    // Generate unique order ID
    const orderId = `AST-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

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

    // Save full order data server-side (no 500-char limit)
    const fullItems = items.map((item: { pid: string; vid: string; name: string; image: string; priceEur: number; costEur?: number; qty: number; shippingLabel: string }) => ({
      pid: item.pid,
      vid: item.vid,
      name: item.name,
      image: item.image,
      priceEur: item.priceEur,
      costEur: item.costEur || 0,
      qty: item.qty,
      shippingLabel: item.shippingLabel,
    }));

    const customerData = {
      name: customer.name.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone?.trim() || "",
      address: customer.address.trim(),
      city: customer.city.trim(),
      zip: customer.zip.trim(),
      country: "PT",
      notes: (customer.notes?.trim() || "").slice(0, 500),
    };

    savePendingOrder(orderId, {
      orderId,
      customer: customerData,
      items: fullItems,
      total: Math.round(items.reduce((s: number, i: { priceEur: number; qty: number }) => s + i.priceEur * i.qty, 0) * 100) / 100,
      createdAt: new Date().toISOString(),
    });

    // Build origin URL for redirects
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "http://localhost:3000";

    // Create Stripe Checkout Session — only store orderId in metadata (no truncation risk)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customerData.email,
      metadata: {
        order_id: orderId,
        customer_name: customerData.name,
        customer_email: customerData.email,
      },
      payment_intent_data: {
        metadata: {
          order_id: orderId,
          customer_name: customerData.name,
          customer_email: customerData.email,
        },
      },
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrinho?cancelled=true`,
      locale: "pt",
    });

    console.log(`[Checkout] Session ${session.id} created for order ${orderId} — €${(session.amount_total || 0) / 100}`);

    return NextResponse.json({ url: session.url, orderId });
  } catch (err) {
    console.error("[Checkout] Stripe error:", err);
    const message = err instanceof Error ? err.message : "Erro ao criar sessão de pagamento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
