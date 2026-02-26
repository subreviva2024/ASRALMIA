import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/** Persist order to JSON file as backup */
function persistOrder(order: Record<string, unknown>) {
  try {
    const ordersDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(ordersDir)) fs.mkdirSync(ordersDir, { recursive: true });
    const filePath = path.join(ordersDir, "orders.json");
    const existing = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : [];
    existing.push(order);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("[Webhook] Failed to persist order:", err);
  }
}

/**
 * POST /api/webhook/stripe
 * Stripe sends payment events here.
 * On successful payment → create CJ order via engine.
 */
export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  // Verify webhook signature if secret is configured
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (WEBHOOK_SECRET && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // No webhook secret configured — parse directly (development mode)
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  console.log(`[Webhook] Received: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process paid sessions
    if (session.payment_status !== "paid") {
      console.log(`[Webhook] Session ${session.id} not yet paid, skipping`);
      return NextResponse.json({ received: true });
    }

    await handleSuccessfulPayment(session);
  }

  if (event.type === "payment_intent.succeeded") {
    // Backup handler — also catches payments
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`[Webhook] Payment succeeded: ${paymentIntent.id} — €${(paymentIntent.amount / 100).toFixed(2)}`);
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle successful payment: create CJ order via engine
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};
  const orderRef = `AST-${Date.now().toString(36).toUpperCase()}`;
  const orderDate = new Date().toISOString();

  // Parse items from metadata
  let items: Array<{
    pid: string;
    vid: string;
    name: string;
    image: string;
    priceEur: number;
    costEur: number;
    qty: number;
    shippingLabel: string;
  }> = [];

  try {
    items = JSON.parse(meta.items_json || "[]");
  } catch {
    console.error("[Webhook] Failed to parse items from metadata");
  }

  const serverTotal = items.reduce(
    (sum, item) => sum + item.priceEur * item.qty,
    0
  );

  const customer = {
    name: meta.customer_name || "",
    email: meta.customer_email || session.customer_email || "",
    phone: meta.customer_phone || "",
    address: meta.customer_address || "",
    city: meta.customer_city || "",
    zip: meta.customer_zip || "",
    country: "PT",
    notes: meta.customer_notes || "",
  };

  const order = {
    orderRef,
    orderDate,
    status: "PAID",
    stripeSessionId: session.id,
    stripePaymentIntent: session.payment_intent,
    amountPaid: (session.amount_total || 0) / 100,
    currency: session.currency || "eur",
    customer,
    items: items.map((item) => ({
      pid: item.pid,
      vid: item.vid,
      name: item.name,
      image: item.image,
      priceEur: item.priceEur,
      qty: item.qty,
      subtotal: Math.round(item.priceEur * item.qty * 100) / 100,
      shippingLabel: item.shippingLabel,
    })),
    total: Math.round(serverTotal * 100) / 100,
  };

  // Persist to file
  persistOrder(order);

  // Console log
  console.log("=== 💰 PAGAMENTO RECEBIDO ===");
  console.log(`Ref: ${orderRef}`);
  console.log(`Stripe: ${session.id}`);
  console.log(`Valor pago: €${order.amountPaid.toFixed(2)}`);
  console.log(`Cliente: ${customer.name} <${customer.email}>`);
  console.log(`Morada: ${customer.address}, ${customer.zip} ${customer.city}`);
  items.forEach((item) => {
    console.log(
      `  - ${item.name} × ${item.qty} = €${(item.priceEur * item.qty).toFixed(2)}`
    );
  });
  console.log("=============================");

  // Forward to engine → CJ order pipeline
  if (items.length > 0 && customer.name) {
    try {
      const enginePayload = {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: {
            address: customer.address,
            line1: customer.address,
            city: customer.city,
            zip: customer.zip,
            postalCode: customer.zip,
            province: customer.city,
            state: customer.city,
            country: "PT",
          },
        },
        items: items.map((item) => ({
          pid: item.pid,
          vid: item.vid,
          quantity: item.qty,
          retailPrice: item.priceEur,
        })),
        shippingCountry: "PT",
        retailPrice: Math.round(serverTotal * 100) / 100,
        stripeRef: session.id,
        orderRef,
      };

      const engineRes = await fetch(`${ENGINE_URL}/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enginePayload),
        signal: AbortSignal.timeout(15000),
      });

      const engineData = await engineRes.json();

      if (engineRes.ok && engineData.order) {
        console.log(
          `✅ [ENGINE] CJ order created from Stripe payment: ${engineData.order.cjOrderId || engineData.order.localId}`
        );
      } else {
        console.error(
          `⚠️ [ENGINE] Order forward failed: ${engineData.error || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error(
        `⚠️ [ENGINE] Connection error: ${err instanceof Error ? err.message : "Engine unreachable"}`
      );
    }
  } else {
    console.error("[Webhook] Missing items or customer data, skipping engine forward");
  }
}
