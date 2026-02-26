import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL = process.env.ASTRALMIA_ENGINE_URL || "http://localhost:4002";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "astralmia2026";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-key");
  return auth === ADMIN_PASSWORD;
}

/**
 * GET /api/admin/dashboard
 * Full dashboard data: health, stats, catalog summary, inventory alerts, balance, recent webhooks
 */
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const section = req.nextUrl.searchParams.get("section") || "all";
  const results: Record<string, unknown> = {};

  const fetchEngine = async (path: string) => {
    try {
      const res = await fetch(`${ENGINE_URL}${path}`, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.json();
    } catch { /* ignore */ }
    return null;
  };

  if (section === "all" || section === "health") {
    results.health = await fetchEngine("/health");
  }

  if (section === "all" || section === "stats") {
    results.orderStats = await fetchEngine("/orders/stats");
  }

  if (section === "all" || section === "balance") {
    results.balance = await fetchEngine("/balance");
  }

  if (section === "all" || section === "catalog") {
    const catalogData = await fetchEngine("/catalog");
    if (catalogData) {
      const products = catalogData.products || catalogData;
      results.catalog = {
        total: Array.isArray(products) ? products.length : catalogData.total || 0,
        categories: catalogData.categories || [],
        sample: Array.isArray(products) ? products.slice(0, 5) : [],
      };
    }
  }

  if (section === "all" || section === "inventory") {
    results.inventoryStats = await fetchEngine("/inventory/stats");
    results.inventoryAlerts = await fetchEngine("/inventory/alerts");
  }

  if (section === "all" || section === "disputes") {
    results.disputes = await fetchEngine("/disputes");
  }

  if (section === "all" || section === "webhooks") {
    results.webhookEvents = await fetchEngine("/webhook/events");
  }

  if (section === "catalog-full") {
    results.catalog = await fetchEngine("/catalog");
  }

  if (section === "orders-engine") {
    results.engineOrders = await fetchEngine("/orders");
  }

  if (section === "orders-history") {
    results.orderHistory = await fetchEngine("/orders/history");
  }

  return NextResponse.json(results);
}

/**
 * POST /api/admin/dashboard
 * Admin engine actions: scan, search, process orders, check inventory, manage webhooks
 */
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  const postEngine = async (path: string, payload?: unknown) => {
    try {
      const res = await fetch(`${ENGINE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
        signal: AbortSignal.timeout(30000),
      });
      return await res.json();
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Engine unreachable" };
    }
  };

  switch (action) {
    case "scan-catalog":
      return NextResponse.json(await postEngine("/scan"));

    case "search-products":
      return NextResponse.json(await postEngine("/search", { query: body.query }));

    case "process-orders":
      return NextResponse.json(await postEngine("/orders/process"));

    case "sync-orders":
      return NextResponse.json(await postEngine("/orders/sync"));

    case "sync-cj-orders":
      return NextResponse.json(await postEngine("/orders/sync-cj"));

    case "check-inventory":
      return NextResponse.json(await postEngine("/inventory/check", { pid: body.pid }));

    case "process-disputes":
      return NextResponse.json(await postEngine("/disputes/process"));

    case "enable-webhooks":
      return NextResponse.json(await postEngine("/cj/webhook/enable-all"));

    case "disable-webhooks":
      return NextResponse.json(await postEngine("/cj/webhook/disable-all"));

    case "get-tracking": {
      try {
        const res = await fetch(`${ENGINE_URL}/cj/track/${body.trackNumber}`, {
          signal: AbortSignal.timeout(10000),
        });
        return NextResponse.json(await res.json());
      } catch {
        return NextResponse.json({ error: "Engine unreachable" });
      }
    }

    case "get-product": {
      try {
        const res = await fetch(`${ENGINE_URL}/cj/product/${body.pid}`, {
          signal: AbortSignal.timeout(10000),
        });
        return NextResponse.json(await res.json());
      } catch {
        return NextResponse.json({ error: "Engine unreachable" });
      }
    }

    case "get-cj-settings": {
      try {
        const res = await fetch(`${ENGINE_URL}/cj/settings`, {
          signal: AbortSignal.timeout(10000),
        });
        return NextResponse.json(await res.json());
      } catch {
        return NextResponse.json({ error: "Engine unreachable" });
      }
    }

    default:
      return NextResponse.json({ error: `Ação desconhecida: ${action}` }, { status: 400 });
  }
}
