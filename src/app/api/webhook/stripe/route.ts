import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/** Load pending order data saved by checkout API */
function loadPendingOrder(orderId: string): Record<string, unknown> | null {
  try {
    const filePath = path.join(process.cwd(), "data", "pending", `${orderId}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (err) {
    console.error("[Webhook] Failed to load pending order:", err);
  }
  return null;
}

/** Mark pending order as completed (move to processed) */
function markOrderCompleted(orderId: string) {
  try {
    const srcDir = path.join(process.cwd(), "data", "pending");
    const dstDir = path.join(process.cwd(), "data", "processed");
    if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
    const src = path.join(srcDir, `${orderId}.json`);
    const dst = path.join(dstDir, `${orderId}.json`);
    if (fs.existsSync(src)) {
      fs.renameSync(src, dst);
    }
  } catch (err) {
    console.error("[Webhook] Failed to move order file:", err);
  }
}

/** Persist completed order to orders.json (backup log) */
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
 * On successful payment → load full order from server-side file → create CJ order via engine.
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
    console.warn("[Webhook] ⚠️ No STRIPE_WEBHOOK_SECRET — running without signature verification");
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
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`[Webhook] Payment succeeded: ${paymentIntent.id} — €${(paymentIntent.amount / 100).toFixed(2)}`);
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle successful payment: load full order data → create CJ order via engine
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};
  const orderId = meta.order_id || `AST-${Date.now().toString(36).toUpperCase()}`;
  const orderDate = new Date().toISOString();

  // Load full order data from server-side file (saved by checkout API)
  const pendingOrder = loadPendingOrder(orderId);

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

  let customer = {
    name: meta.customer_name || "",
    email: meta.customer_email || session.customer_email || "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "PT",
    notes: "",
  };

  if (pendingOrder) {
    // Use full data from server-side file (no truncation)
    items = (pendingOrder.items as typeof items) || [];
    const pCustomer = pendingOrder.customer as typeof customer;
    if (pCustomer) {
      customer = { ...customer, ...pCustomer };
    }
    console.log(`[Webhook] Loaded pending order ${orderId}: ${items.length} items`);
  } else {
    console.error(`[Webhook] ⚠️ No pending order file found for ${orderId} — payment received but order data missing`);
  }

  const serverTotal = items.reduce(
    (sum, item) => sum + item.priceEur * item.qty,
    0
  );

  const order = {
    orderRef: orderId,
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

  // Persist to orders log
  persistOrder(order);

  // Mark pending order as processed
  markOrderCompleted(orderId);

  // Console log
  console.log("=== 💰 PAGAMENTO RECEBIDO ===");
  console.log(`Ref: ${orderId}`);
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
        orderRef: orderId,
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
