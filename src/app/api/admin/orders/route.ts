import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "astralmia2026";

/** Verify admin auth via header */
function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-key");
  return auth === ADMIN_PASSWORD;
}

/** Read orders from local JSON backup */
function readLocalOrders(): Record<string, unknown>[] {
  try {
    const filePath = path.join(process.cwd(), "data", "orders.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch {
    // ignore
  }
  return [];
}

/** Write orders to local JSON */
function writeLocalOrders(orders: Record<string, unknown>[]) {
  try {
    const dir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "orders.json"), JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error("[Admin] Write orders failed:", err);
  }
}

/**
 * GET /api/admin/orders
 * Returns all orders (merged: local backup + engine)
 */
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const localOrders = readLocalOrders();

  // Also fetch from engine
  let engineOrders: Record<string, unknown>[] = [];
  let engineStats = null;
  let engineHealth = null;

  try {
    const [ordersRes, statsRes, healthRes] = await Promise.all([
      fetch(`${ENGINE_URL}/orders`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${ENGINE_URL}/orders/stats`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${ENGINE_URL}/health`, { signal: AbortSignal.timeout(5000) }),
    ]);
    if (ordersRes.ok) {
      const data = await ordersRes.json();
      engineOrders = data.orders || [];
    }
    if (statsRes.ok) {
      engineStats = await statsRes.json();
    }
    if (healthRes.ok) {
      engineHealth = await healthRes.json();
    }
  } catch {
    // engine unreachable — use local only
  }

  // Fetch CJ balance
  let balance = null;
  try {
    const balRes = await fetch(`${ENGINE_URL}/balance`, { signal: AbortSignal.timeout(5000) });
    if (balRes.ok) balance = await balRes.json();
  } catch {
    // ignore
  }

  // Merge: local orders with engine status
  const merged = localOrders.map((local: Record<string, unknown>) => {
    const ref = local.orderRef as string;
    const engineMatch = engineOrders.find(
      (e: Record<string, unknown>) =>
        (e.localId as string)?.includes(ref?.replace("AST-", "")) ||
        (e.orderRef as string) === ref
    );
    return {
      ...local,
      engineStatus: engineMatch
        ? {
            cjOrderId: engineMatch.cjOrderId,
            status: engineMatch.status,
            trackingNumber: engineMatch.trackingNumber,
            cjCost: engineMatch.cjCost,
          }
        : null,
    };
  });

  // Calculate stats
  const totalRevenue = localOrders.reduce(
    (sum: number, o: Record<string, unknown>) => sum + ((o.amountPaid as number) || (o.total as number) || 0),
    0
  );
  const paidOrders = localOrders.filter(
    (o: Record<string, unknown>) => o.status === "PAID" || o.stripeSessionId
  );
  const pendingOrders = localOrders.filter(
    (o: Record<string, unknown>) => o.status === "PENDING" && !o.stripeSessionId
  );

  return NextResponse.json({
    orders: merged.reverse(), // newest first
    stats: {
      totalOrders: localOrders.length,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      engineOrders: engineOrders.length,
    },
    engineStats,
    engineHealth,
    balance,
  });
}

/**
 * POST /api/admin/orders
 * Admin actions: approve, reject, resend-to-engine
 */
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { action, orderRef } = body;

  if (!action || !orderRef) {
    return NextResponse.json({ error: "action e orderRef obrigatórios" }, { status: 400 });
  }

  const orders = readLocalOrders();
  const idx = orders.findIndex((o: Record<string, unknown>) => o.orderRef === orderRef);

  if (idx === -1) {
    return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });
  }

  const order = orders[idx] as Record<string, unknown>;

  switch (action) {
    case "approve": {
      order.status = "APPROVED";
      order.approvedAt = new Date().toISOString();
      orders[idx] = order;
      writeLocalOrders(orders);

      // Forward to engine if not already sent
      let engineResult = null;
      try {
        const customer = order.customer as Record<string, unknown>;
        const items = order.items as Array<Record<string, unknown>>;

        const enginePayload = {
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || "",
            address: {
              address: customer.address,
              line1: customer.address,
              city: customer.city,
              zip: customer.zip,
              postalCode: customer.zip,
              province: customer.city,
              state: customer.city,
              country: customer.country || "PT",
            },
          },
          items: items.map((item) => ({
            pid: item.pid,
            vid: item.vid,
            quantity: item.qty || item.quantity,
            retailPrice: item.priceEur || item.retailPrice,
          })),
          shippingCountry: (customer.country as string) || "PT",
          retailPrice: order.total,
          orderRef,
        };

        const res = await fetch(`${ENGINE_URL}/orders/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enginePayload),
          signal: AbortSignal.timeout(15000),
        });
        engineResult = await res.json();
      } catch (err) {
        engineResult = { error: err instanceof Error ? err.message : "Engine unreachable" };
      }

      return NextResponse.json({
        success: true,
        message: `Encomenda ${orderRef} aprovada`,
        engineResult,
      });
    }

    case "reject": {
      order.status = "REJECTED";
      order.rejectedAt = new Date().toISOString();
      order.rejectReason = body.reason || "";
      orders[idx] = order;
      writeLocalOrders(orders);

      return NextResponse.json({
        success: true,
        message: `Encomenda ${orderRef} rejeitada`,
      });
    }

    case "resend": {
      // Resend to engine
      let engineResult = null;
      try {
        const customer = order.customer as Record<string, unknown>;
        const items = order.items as Array<Record<string, unknown>>;

        const enginePayload = {
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || "",
            address: {
              address: customer.address,
              line1: customer.address,
              city: customer.city,
              zip: customer.zip,
              postalCode: customer.zip,
              province: customer.city,
              state: customer.city,
              country: customer.country || "PT",
            },
          },
          items: items.map((item) => ({
            pid: item.pid,
            vid: item.vid,
            quantity: item.qty || item.quantity,
            retailPrice: item.priceEur || item.retailPrice,
          })),
          shippingCountry: (customer.country as string) || "PT",
          retailPrice: order.total,
          orderRef,
        };

        const res = await fetch(`${ENGINE_URL}/orders/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enginePayload),
          signal: AbortSignal.timeout(15000),
        });
        engineResult = await res.json();
      } catch (err) {
        engineResult = { error: err instanceof Error ? err.message : "Engine unreachable" };
      }

      return NextResponse.json({
        success: true,
        message: `Encomenda ${orderRef} reenviada ao engine`,
        engineResult,
      });
    }

    case "sync": {
      // Sync all orders with engine
      let syncResult = null;
      try {
        const res = await fetch(`${ENGINE_URL}/orders/sync`, {
          method: "POST",
          signal: AbortSignal.timeout(15000),
        });
        syncResult = await res.json();
      } catch (err) {
        syncResult = { error: err instanceof Error ? err.message : "Engine unreachable" };
      }

      return NextResponse.json({ success: true, syncResult });
    }

    default:
      return NextResponse.json({ error: `Ação desconhecida: ${action}` }, { status: 400 });
  }
}
