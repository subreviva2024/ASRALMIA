/**
 * ASTRALMIA — Main Process v5.0 (24/7 Autonomous Sales Machine)
 * 
 * Full CJ API automation with ALL subsystems:
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │  CATALOG SCANNER    │ Auto-update catalog every 4h          │
 * │  ORDER MANAGER      │ Full order lifecycle (5m cycles)      │
 * │  INVENTORY MONITOR  │ Stock tracking (2h checks)            │
 * │  DISPUTE MANAGER    │ Auto-detect & file disputes (30m)     │
 * │  WEBHOOK RECEIVER   │ Real-time CJ event processing        │
 * │  HTTP API           │ 70+ endpoints for full control        │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * CJ API Coverage: 45 endpoints (100% of v2.0 API)
 * Designed to run via PM2 for 24/7 uptime.
 */

import { createServer } from "http";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { startDaemon, runFullScan, CatalogManager } from "./catalog-scanner.js";
import CJClient from "./cj-client.js";
import { analyzeProduct, translateProduct, calculatePricing } from "./product-engine.js";
import { OrderManager, startOrderDaemon } from "./order-manager.js";
import { InventoryMonitor, startInventoryDaemon } from "./inventory-monitor.js";
import { DisputeManager, startDisputeDaemon } from "./dispute-manager.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env (no dependencies) ──
function loadEnv() {
  const envPaths = [
    join(__dirname, "..", ".env"),
    join(__dirname, "..", "openclaw", ".env"),
    join(__dirname, "..", "..", "openclaw", ".env"),
  ];
  for (const p of envPaths) {
    if (existsSync(p)) {
      const lines = readFileSync(p, "utf-8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
      console.log(`[ASTRALMIA] .env loaded from ${p}`);
      return;
    }
  }
  console.log("[ASTRALMIA] No .env file found — using environment variables");
}
loadEnv();

const DATA_DIR = join(__dirname, "..", "data");
const PORT = parseInt(process.env.ASTRALMIA_PORT || "4002", 10);

// Global subsystem references (set in main())
let orderManager = null;
let inventoryMonitor = null;
let disputeManager = null;
let sharedCJClient = null;

// ═══════════════════════════════════════════════════════════
// HTTP API Server — Full CJ automation control plane
// ═══════════════════════════════════════════════════════════

function startServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    try {
      // ═══════════════════════════════════════════════════════
      // HEALTH & STATUS
      // ═══════════════════════════════════════════════════════

      if (path === "/health" || path === "/") {
        const stats = loadJSON(join(DATA_DIR, "stats.json"), {});
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        json(res, {
          status: "ok",
          service: "ASTRALMIA Sales Engine v5.0",
          uptime: process.uptime(),
          catalogSize: (catalog.products || []).filter(p => !p.disabled).length,
          totalProducts: catalog.products?.length || 0,
          lastScan: stats.completedAt || null,
          cjApiCalls: stats.cjApiStats?.calls || 0,
          subsystems: {
            catalog: "active",
            orders: orderManager ? "active" : "inactive",
            inventory: inventoryMonitor ? "active" : "inactive",
            disputes: disputeManager ? "active" : "inactive",
          },
        });
        return;
      }

      // ═══════════════════════════════════════════════════════
      // CATALOG
      // ═══════════════════════════════════════════════════════

      if (path === "/catalog") {
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        const category = url.searchParams.get("category");
        const minScore = parseInt(url.searchParams.get("minScore") || "0", 10);
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
        const sort = url.searchParams.get("sort") || "score";
        const includeDisabled = url.searchParams.get("includeDisabled") === "true";

        let products = catalog.products || [];
        if (!includeDisabled) products = products.filter(p => !p.disabled);
        if (category) products = products.filter(p => p.categoryPt?.toLowerCase() === category.toLowerCase());
        if (minScore > 0) products = products.filter(p => p.pricing?.score >= minScore);

        if (sort === "price") products.sort((a, b) => a.pricing.retailEur - b.pricing.retailEur);
        else if (sort === "margin") products.sort((a, b) => b.pricing.marginPct - a.pricing.marginPct);
        else products.sort((a, b) => b.pricing.score - a.pricing.score);

        products = products.slice(0, limit);

        json(res, {
          total: products.length,
          catalog: catalog.stats || {},
          products: products.map(formatProduct),
        });
        return;
      }

      if (path === "/catalog/featured") {
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        const limit = parseInt(url.searchParams.get("limit") || "12", 10);
        const featured = (catalog.products || [])
          .filter(p => p.pricing?.score >= 65 && !p.disabled)
          .sort((a, b) => b.pricing.score - a.pricing.score)
          .slice(0, limit);
        json(res, { total: featured.length, products: featured.map(formatProduct) });
        return;
      }

      if (path === "/catalog/categories") {
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        const categories = {};
        for (const p of (catalog.products || []).filter(p => !p.disabled)) {
          if (!categories[p.categoryPt]) categories[p.categoryPt] = { count: 0, avgScore: 0, totalScore: 0 };
          categories[p.categoryPt].count++;
          categories[p.categoryPt].totalScore += p.pricing?.score || 0;
        }
        for (const [k, v] of Object.entries(categories)) {
          v.avgScore = Math.round(v.totalScore / v.count);
          delete v.totalScore;
        }
        json(res, { categories });
        return;
      }

      if (path.startsWith("/product/") && !path.startsWith("/product/stock") && !path.startsWith("/product/reviews")) {
        const pid = path.replace("/product/", "");
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        const product = (catalog.products || []).find(p => p.pid === pid);
        if (!product) { json(res, { error: "Product not found" }, 404); return; }
        json(res, { product });
        return;
      }

      // ═══════════════════════════════════════════════════════
      // PRODUCT — CJ Direct API Endpoints
      // ═══════════════════════════════════════════════════════

      // GET /cj/search?q=keyword&page=1&limit=20
      if (path === "/cj/search") {
        const q = url.searchParams.get("q") || url.searchParams.get("query") || "";
        if (!q) { json(res, { error: "q parameter required" }, 400); return; }
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        const data = await getCJ().searchProducts(q, page, limit);
        json(res, { query: q, page, data });
        return;
      }

      // GET /cj/search/v2?keyword=...&categoryId=...&priceMin=...&priceMax=...
      if (path === "/cj/search/v2") {
        const data = await getCJ().searchProductsV2({
          keyword: url.searchParams.get("keyword") || "",
          categoryId: url.searchParams.get("categoryId") || undefined,
          pageNum: parseInt(url.searchParams.get("page") || "1", 10),
          pageSize: parseInt(url.searchParams.get("limit") || "20", 10),
          priceMin: url.searchParams.get("priceMin") ? parseFloat(url.searchParams.get("priceMin")) : undefined,
          priceMax: url.searchParams.get("priceMax") ? parseFloat(url.searchParams.get("priceMax")) : undefined,
          sortField: url.searchParams.get("sortField") || undefined,
          sortType: url.searchParams.get("sortType") || undefined,
        });
        json(res, data);
        return;
      }

      // GET /cj/product/:pid
      if (path.startsWith("/cj/product/") && !path.includes("/variants") && !path.includes("/stock") && !path.includes("/reviews")) {
        const pid = path.replace("/cj/product/", "");
        const data = await getCJ().getProduct(pid);
        json(res, data);
        return;
      }

      // GET /cj/product/:pid/variants
      if (path.match(/^\/cj\/product\/[^/]+\/variants$/)) {
        const pid = path.split("/")[3];
        const data = await getCJ().getVariants(pid);
        json(res, { variants: data });
        return;
      }

      // GET /cj/variant/:vid
      if (path.startsWith("/cj/variant/")) {
        const vid = path.replace("/cj/variant/", "");
        const data = await getCJ().getVariantById(vid);
        json(res, data);
        return;
      }

      // GET /cj/product/:pid/stock
      if (path.match(/^\/cj\/product\/[^/]+\/stock$/)) {
        const pid = path.split("/")[3];
        const data = await getCJ().checkInventory(pid);
        json(res, { pid, stock: data });
        return;
      }

      // GET /cj/product/:pid/reviews
      if (path.match(/^\/cj\/product\/[^/]+\/reviews$/)) {
        const pid = path.split("/")[3];
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const data = await getCJ().getProductReviews(pid, page);
        json(res, data);
        return;
      }

      // GET /cj/categories
      if (path === "/cj/categories") {
        const data = await getCJ().getCategories();
        json(res, data);
        return;
      }

      // POST /cj/myproducts/add  { pid }
      if (path === "/cj/myproducts/add" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().addToMyProduct(body.pid);
        json(res, data);
        return;
      }

      // GET /cj/myproducts
      if (path === "/cj/myproducts") {
        const data = await getCJ().getMyProducts({
          keyword: url.searchParams.get("keyword") || undefined,
          pageNum: parseInt(url.searchParams.get("page") || "1", 10),
          pageSize: parseInt(url.searchParams.get("limit") || "20", 10),
        });
        json(res, data);
        return;
      }

      // GET /cj/warehouses
      if (path === "/cj/warehouses") {
        const data = await getCJ().getWarehouses();
        json(res, data);
        return;
      }

      // GET /cj/warehouse/:id
      if (path.startsWith("/cj/warehouse/")) {
        const id = path.replace("/cj/warehouse/", "");
        const data = await getCJ().getWarehouseDetail(id);
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // SHIPPING / FREIGHT
      // ═══════════════════════════════════════════════════════

      // POST /cj/freight  { vid, countryCode, quantity }
      if (path === "/cj/freight" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().calculateShipping(
          body.vid, body.countryCode || "PT", body.quantity || 1
        );
        json(res, { options: data });
        return;
      }

      // POST /cj/freight/tip  { products, endCountryCode, warehouseId }
      if (path === "/cj/freight/tip" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().calculateShippingTip(body);
        json(res, data);
        return;
      }

      // POST /cj/logistics/supplier  { products, endCountryCode }
      if (path === "/cj/logistics/supplier" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().getSupplierLogistics(body);
        json(res, data);
        return;
      }

      // GET /cj/track/:trackNumber
      if (path.startsWith("/cj/track/")) {
        const trackNumber = path.replace("/cj/track/", "");
        const data = await getCJ().trackShipment(trackNumber);
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // SOURCING
      // ═══════════════════════════════════════════════════════

      // POST /cj/sourcing/create
      if (path === "/cj/sourcing/create" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().createSourcing(body);
        json(res, data);
        return;
      }

      // POST /cj/sourcing/query
      if (path === "/cj/sourcing/query" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().querySourcing(body);
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // ORDERS
      // ═══════════════════════════════════════════════════════

      // GET /orders?status=...&limit=...
      if (path === "/orders" && req.method === "GET") {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        const orders = orderManager.getOrders({
          status: url.searchParams.get("status") || undefined,
          limit: parseInt(url.searchParams.get("limit") || "50", 10),
        });
        json(res, { total: orders.length, orders });
        return;
      }

      // GET /orders/stats
      if (path === "/orders/stats") {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        json(res, orderManager.getStats());
        return;
      }

      // GET /orders/history
      if (path === "/orders/history") {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        json(res, { history: orderManager.getHistory(parseInt(url.searchParams.get("limit") || "50", 10)) });
        return;
      }

      // GET /order/:id
      if (path.startsWith("/order/") && !path.startsWith("/orders")) {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        const id = path.replace("/order/", "");
        const order = orderManager.getOrder(id);
        if (!order) { json(res, { error: "Order not found" }, 404); return; }
        json(res, { order });
        return;
      }

      // POST /orders/create  (create from store purchase)
      if (path === "/orders/create" && req.method === "POST") {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        const body = JSON.parse(await readBody(req));
        const order = await orderManager.createOrder(body);
        json(res, { order }, 201);
        return;
      }

      // POST /orders/cancel  { orderId }
      if (path === "/orders/cancel" && req.method === "POST") {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        const body = JSON.parse(await readBody(req));
        const order = await orderManager.cancelOrder(body.orderId);
        json(res, { order });
        return;
      }

      // POST /orders/sync (sync statuses from CJ)
      if (path === "/orders/sync" && req.method === "POST") {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        const result = await orderManager.syncOrderStatuses();
        json(res, result);
        return;
      }

      // POST /orders/sync-cj (pull all orders from CJ)
      if (path === "/orders/sync-cj" && req.method === "POST") {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        const result = await orderManager.syncFromCJ();
        json(res, result);
        return;
      }

      // POST /orders/process (run full order processing cycle)
      if (path === "/orders/process" && req.method === "POST") {
        if (!orderManager) { json(res, { error: "Order manager not ready" }, 503); return; }
        const result = await orderManager.processCycle();
        json(res, result);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // CJ ORDERS (direct CJ API)
      // ═══════════════════════════════════════════════════════

      // POST /cj/order/create  (V2)
      if (path === "/cj/order/create" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().createOrder(body);
        json(res, data);
        return;
      }

      // POST /cj/order/create-v3
      if (path === "/cj/order/create-v3" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().createOrderV3(body);
        json(res, data);
        return;
      }

      // GET /cj/order/:id
      if (path.startsWith("/cj/order/") && !path.includes("create") && !path.includes("list")) {
        const orderId = path.replace("/cj/order/", "");
        const data = await getCJ().getOrder(orderId);
        json(res, data);
        return;
      }

      // GET /cj/orders
      if (path === "/cj/orders") {
        const data = await getCJ().listOrders({
          pageNum: parseInt(url.searchParams.get("page") || "1", 10),
          pageSize: parseInt(url.searchParams.get("limit") || "20", 10),
          orderStatus: url.searchParams.get("status") || undefined,
        });
        json(res, data);
        return;
      }

      // PATCH /cj/order/confirm  { orderId }
      if (path === "/cj/order/confirm" && req.method === "PATCH") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().confirmOrder(body.orderId);
        json(res, data);
        return;
      }

      // DELETE /cj/order/delete  { orderId }
      if (path === "/cj/order/delete" && (req.method === "DELETE" || req.method === "POST")) {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().deleteOrder(body.orderId);
        json(res, data);
        return;
      }

      // POST /cj/cart/add
      if (path === "/cj/cart/add" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().addToCart(body);
        json(res, data);
        return;
      }

      // POST /cj/cart/confirm
      if (path === "/cj/cart/confirm" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().confirmCart(body);
        json(res, data);
        return;
      }

      // POST /cj/order/waybill/upload
      if (path === "/cj/order/waybill/upload" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().uploadShippingInfo(body);
        json(res, data);
        return;
      }

      // POST /cj/order/waybill/update
      if (path === "/cj/order/waybill/update" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().updateShippingInfo(body);
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // PAYMENT / BALANCE
      // ═══════════════════════════════════════════════════════

      // GET /balance
      if (path === "/balance") {
        const data = await getCJ().getBalance();
        json(res, data);
        return;
      }

      // POST /pay  { orderId }
      if (path === "/pay" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().payBalance(body.orderId);
        json(res, data);
        return;
      }

      // POST /pay/v2
      if (path === "/pay/v2" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().payBalanceV2(body);
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // INVENTORY
      // ═══════════════════════════════════════════════════════

      // GET /inventory/stats
      if (path === "/inventory/stats") {
        if (!inventoryMonitor) { json(res, { error: "Inventory monitor not ready" }, 503); return; }
        json(res, inventoryMonitor.getStats());
        return;
      }

      // GET /inventory/alerts
      if (path === "/inventory/alerts") {
        if (!inventoryMonitor) { json(res, { error: "Inventory monitor not ready" }, 503); return; }
        json(res, { alerts: inventoryMonitor.getAlerts(parseInt(url.searchParams.get("limit") || "50", 10)) });
        return;
      }

      // GET /inventory/:pid
      if (path.startsWith("/inventory/") && path !== "/inventory/stats" && path !== "/inventory/alerts" && path !== "/inventory/check") {
        if (!inventoryMonitor) { json(res, { error: "Inventory monitor not ready" }, 503); return; }
        const pid = path.replace("/inventory/", "");
        const data = await inventoryMonitor.checkProduct(pid);
        json(res, data);
        return;
      }

      // POST /inventory/check (trigger full stock check)
      if (path === "/inventory/check" && req.method === "POST") {
        if (!inventoryMonitor) { json(res, { error: "Inventory monitor not ready" }, 503); return; }
        json(res, { message: "Stock check started" });
        inventoryMonitor.checkAllStock().catch(err => console.error("Manual stock check error:", err.message));
        return;
      }

      // ═══════════════════════════════════════════════════════
      // DISPUTES
      // ═══════════════════════════════════════════════════════

      // GET /disputes
      if (path === "/disputes" && req.method === "GET") {
        if (!disputeManager) { json(res, { error: "Dispute manager not ready" }, 503); return; }
        json(res, {
          stats: disputeManager.getStats(),
          disputes: disputeManager.getDisputes({
            status: url.searchParams.get("status") || undefined,
            limit: parseInt(url.searchParams.get("limit") || "50", 10),
          }),
        });
        return;
      }

      // POST /disputes/create  { orderId, reason, type }
      if (path === "/disputes/create" && req.method === "POST") {
        if (!disputeManager) { json(res, { error: "Dispute manager not ready" }, 503); return; }
        const body = JSON.parse(await readBody(req));
        const dispute = await disputeManager.createDisputeForOrder(
          body.orderId, body.reason || "Manual dispute", body
        );
        json(res, { dispute });
        return;
      }

      // POST /disputes/cancel  { disputeId }
      if (path === "/disputes/cancel" && req.method === "POST") {
        if (!disputeManager) { json(res, { error: "Dispute manager not ready" }, 503); return; }
        const body = JSON.parse(await readBody(req));
        const dispute = await disputeManager.cancelDispute(body.disputeId);
        json(res, { dispute });
        return;
      }

      // POST /disputes/process (run full dispute cycle)
      if (path === "/disputes/process" && req.method === "POST") {
        if (!disputeManager) { json(res, { error: "Dispute manager not ready" }, 503); return; }
        const result = await disputeManager.processCycle();
        json(res, result);
        return;
      }

      // GET /cj/disputes (direct CJ API)
      if (path === "/cj/disputes") {
        const data = await getCJ().listDisputes({
          pageNum: parseInt(url.searchParams.get("page") || "1", 10),
          pageSize: parseInt(url.searchParams.get("limit") || "20", 10),
          disputeStatus: url.searchParams.get("status") || undefined,
        });
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // SETTINGS
      // ═══════════════════════════════════════════════════════

      // GET /cj/settings
      if (path === "/cj/settings") {
        const data = await getCJ().getSettings();
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // WEBHOOK — CJ Real-time Notifications
      // ═══════════════════════════════════════════════════════

      // POST /cj/webhook/set  { product, stock, order, logistics }
      if (path === "/cj/webhook/set" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().setWebhook(body);
        json(res, data);
        return;
      }

      // POST /cj/webhook/enable-all  { callbackUrl }
      if (path === "/cj/webhook/enable-all" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        if (!body.callbackUrl) { json(res, { error: "callbackUrl required (HTTPS)" }, 400); return; }
        const data = await getCJ().enableAllWebhooks(body.callbackUrl);
        json(res, data);
        return;
      }

      // POST /cj/webhook/disable-all
      if (path === "/cj/webhook/disable-all" && req.method === "POST") {
        const data = await getCJ().disableAllWebhooks();
        json(res, data);
        return;
      }

      // POST /webhook/callback — Receive CJ webhook events
      // CJ sends: { messageId, type, messageType, params }
      // Types: PRODUCT, VARIANT, STOCK, ORDER, ORDERSPLIT, SOURCINGCREATE, LOGISTIC
      // MUST respond within 3 seconds with 200 OK
      if (path === "/webhook/callback" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        // Respond immediately (CJ requires < 3s)
        json(res, { received: true });
        // Process asynchronously
        processWebhookEvent(body).catch(err =>
          console.error(`[WEBHOOK] Error processing ${body?.type}:`, err.message)
        );
        return;
      }

      // GET /webhook/events — View recent webhook events
      if (path === "/webhook/events") {
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
        const type = url.searchParams.get("type") || undefined;
        let events = webhookEvents.slice(-limit);
        if (type) events = events.filter(e => e.type === type.toUpperCase());
        json(res, { total: events.length, events: events.reverse() });
        return;
      }

      // GET /cj/track/v1/:trackNumber  (deprecated endpoint)
      if (path.startsWith("/cj/track/v1/")) {
        const trackNumber = path.replace("/cj/track/v1/", "");
        const data = await getCJ().trackShipmentV1(trackNumber);
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // STOCK DIRECT — CJ API inventory endpoints
      // ═══════════════════════════════════════════════════════

      // GET /cj/stock/vid/:vid
      if (path.startsWith("/cj/stock/vid/")) {
        const vid = path.replace("/cj/stock/vid/", "");
        const data = await getCJ().checkInventoryByVid(vid);
        json(res, { vid, stock: data });
        return;
      }

      // GET /cj/stock/sku/:sku
      if (path.startsWith("/cj/stock/sku/")) {
        const sku = path.replace("/cj/stock/sku/", "");
        const data = await getCJ().checkInventoryBySku(sku);
        json(res, { sku, stock: data });
        return;
      }

      // GET /cj/stock/detailed/:pid
      if (path.startsWith("/cj/stock/detailed/")) {
        const pid = path.replace("/cj/stock/detailed/", "");
        const data = await getCJ().getInventoryByPid(pid);
        json(res, { pid, inventory: data });
        return;
      }

      // POST /cj/order/parent  (saveGenerateParentOrder)
      if (path === "/cj/order/parent" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().saveParentOrder(body);
        json(res, data);
        return;
      }

      // POST /cj/order/warehouse  (changeWarehouse)
      if (path === "/cj/order/warehouse" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().changeOrderWarehouse(body);
        json(res, data);
        return;
      }

      // POST /cj/order/pod  (podProductCustomPicturesEdit)
      if (path === "/cj/order/pod" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const data = await getCJ().updatePodPictures(body);
        json(res, data);
        return;
      }

      // ═══════════════════════════════════════════════════════
      // SCAN & SEARCH (legacy)
      // ═══════════════════════════════════════════════════════

      if (path === "/stats") {
        const stats = loadJSON(join(DATA_DIR, "stats.json"), {});
        const history = loadJSON(join(DATA_DIR, "scan-history.json"), []);
        const orderStats = orderManager ? orderManager.getStats() : null;
        const inventoryStats = inventoryMonitor ? inventoryMonitor.getStats() : null;
        const disputeStats = disputeManager ? disputeManager.getStats() : null;
        json(res, {
          lastScan: stats,
          history: history.slice(-10),
          orders: orderStats,
          inventory: inventoryStats,
          disputes: disputeStats,
        });
        return;
      }

      if (path === "/scan" && req.method === "POST") {
        json(res, { message: "Scan started", startedAt: new Date().toISOString() });
        runFullScan().catch(err => console.error("Manual scan error:", err.message));
        return;
      }

      if (path === "/search" && req.method === "POST") {
        const body = JSON.parse(await readBody(req));
        const { query, limit = 10 } = body;
        if (!query) { json(res, { error: "query required" }, 400); return; }

        const cj = getCJ();
        const data = await cj.searchProducts(query, 1, Math.min(limit * 2, 40));
        const list = data?.list || [];
        const results = [];
        const seenFPs = new Set();

        for (const raw of list) {
          if (results.length >= limit) break;
          const product = await analyzeProduct(cj, raw, seenFPs);
          if (product) results.push(product);
        }

        json(res, {
          query,
          total: results.length,
          products: results.map(p => ({
            pid: p.pid,
            namePt: p.namePt,
            descPt: p.descPt,
            image: p.image,
            price: p.pricing.retailEur,
            score: p.pricing.score,
            margin: p.pricing.marginPct,
          })),
        });
        return;
      }

      // 404
      json(res, { error: "Not found", endpoints: getEndpointList() }, 404);
    } catch (err) {
      console.error(`[API] Error: ${err.message}`);
      json(res, { error: err.message }, 500);
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🌐 ASTRALMIA API server v5.0 running on port ${PORT}`);
    console.log(`   ${getEndpointList().length} endpoints available`);
  });

  return server;
}

// ═══════════════════════════════════════════════════════════
// Webhook Event Processing
// ═══════════════════════════════════════════════════════════

const MAX_WEBHOOK_EVENTS = 500;
const webhookEvents = [];

/**
 * Process incoming CJ webhook event asynchronously.
 * Event types: PRODUCT, VARIANT, STOCK, ORDER, ORDERSPLIT, SOURCINGCREATE, LOGISTIC
 */
async function processWebhookEvent(event) {
  const { messageId, type, messageType, params } = event;
  const ts = new Date().toISOString();

  // Store event (ring buffer)
  webhookEvents.push({ messageId, type, messageType, params, receivedAt: ts });
  if (webhookEvents.length > MAX_WEBHOOK_EVENTS) webhookEvents.shift();

  console.log(`[WEBHOOK] ${type}/${messageType} — messageId=${messageId}`);

  // Persist webhook events
  const eventsFile = join(DATA_DIR, "webhook-events.json");
  try {
    const recent = webhookEvents.slice(-100);
    writeFileSync(eventsFile, JSON.stringify(recent, null, 2));
  } catch (err) {
    console.error("[WEBHOOK] Failed to persist events:", err.message);
  }

  // Route event to subsystems
  switch (type) {
    case "ORDER":
    case "ORDERSPLIT":
      if (orderManager) {
        try {
          // Sync the specific order from CJ
          const orderId = params?.cjOrderId || params?.originalOrderId;
          if (orderId) {
            console.log(`[WEBHOOK] Order event → syncing order ${orderId}`);
            await orderManager.syncOrderStatuses();
          }
        } catch (err) {
          console.error("[WEBHOOK] Order sync error:", err.message);
        }
      }
      break;

    case "STOCK":
      if (inventoryMonitor) {
        try {
          // Trigger stock check for affected variants
          const vids = Object.keys(params || {});
          console.log(`[WEBHOOK] Stock change for ${vids.length} variant(s)`);
          // Trigger full stock check asynchronously
          inventoryMonitor.checkAllStock().catch(e =>
            console.error("[WEBHOOK] Stock check error:", e.message)
          );
        } catch (err) {
          console.error("[WEBHOOK] Inventory error:", err.message);
        }
      }
      break;

    case "PRODUCT":
    case "VARIANT":
      console.log(`[WEBHOOK] Product/Variant ${messageType}: pid=${params?.pid || params?.vid}`);
      // Could trigger catalog re-scan for affected product
      break;

    case "LOGISTIC":
      if (orderManager) {
        try {
          const orderId = params?.orderId;
          console.log(`[WEBHOOK] Logistics update: order=${orderId}, tracking=${params?.trackingNumber}`);
          await orderManager.syncOrderStatuses();
        } catch (err) {
          console.error("[WEBHOOK] Logistics sync error:", err.message);
        }
      }
      break;

    case "SOURCINGCREATE":
      console.log(`[WEBHOOK] Sourcing result: product=${params?.cjProductId}, status=${params?.status}`);
      break;

    default:
      console.log(`[WEBHOOK] Unknown event type: ${type}`);
  }
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function json(res, data, code = 200) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function loadJSON(path, fallback) {
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  } catch {}
  return fallback;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function getCJ() {
  if (!sharedCJClient) sharedCJClient = new CJClient();
  return sharedCJClient;
}

function formatProduct(p) {
  return {
    pid: p.pid,
    vid: p.vid || "",
    nameEn: p.nameEn || p.namePt,
    namePt: p.namePt,
    descPt: p.descPt,
    categoryPt: p.categoryPt,
    tagPt: p.tagPt,
    accent: p.accent,
    image: p.image,
    images: p.images,
    price: p.pricing?.retailEur,
    cjPriceEur: p.pricing?.cjPriceEur,
    totalCostEur: p.pricing?.totalCostEur,
    shipping: p.shipping,
    score: p.pricing?.score,
    margin: p.pricing?.marginPct,
    storeUrl: p.storeUrl,
    disabled: p.disabled || false,
  };
}

function getEndpointList() {
  return [
    // Health & Status
    "GET  /health",
    "GET  /stats",
    // Catalog
    "GET  /catalog",
    "GET  /catalog/featured",
    "GET  /catalog/categories",
    "GET  /product/:pid",
    // CJ Product API
    "GET  /cj/search?q=...",
    "GET  /cj/search/v2?keyword=...",
    "GET  /cj/product/:pid",
    "GET  /cj/product/:pid/variants",
    "GET  /cj/product/:pid/stock",
    "GET  /cj/product/:pid/reviews",
    "GET  /cj/variant/:vid",
    "GET  /cj/categories",
    "GET  /cj/myproducts",
    "POST /cj/myproducts/add",
    "GET  /cj/warehouses",
    "GET  /cj/warehouse/:id",
    // Stock (direct CJ API)
    "GET  /cj/stock/vid/:vid",
    "GET  /cj/stock/sku/:sku",
    "GET  /cj/stock/detailed/:pid",
    // Shipping/Freight
    "POST /cj/freight",
    "POST /cj/freight/tip",
    "POST /cj/logistics/supplier",
    "GET  /cj/track/:trackNumber",
    "GET  /cj/track/v1/:trackNumber",
    // Sourcing
    "POST /cj/sourcing/create",
    "POST /cj/sourcing/query",
    // Orders (managed)
    "GET  /orders",
    "GET  /orders/stats",
    "GET  /orders/history",
    "GET  /order/:id",
    "POST /orders/create",
    "POST /orders/cancel",
    "POST /orders/sync",
    "POST /orders/sync-cj",
    "POST /orders/process",
    // CJ Orders (direct)
    "POST /cj/order/create",
    "POST /cj/order/create-v3",
    "GET  /cj/order/:id",
    "GET  /cj/orders",
    "PATCH /cj/order/confirm",
    "DELETE /cj/order/delete",
    "POST /cj/cart/add",
    "POST /cj/cart/confirm",
    "POST /cj/order/waybill/upload",
    "POST /cj/order/waybill/update",
    "POST /cj/order/parent",
    "POST /cj/order/warehouse",
    "POST /cj/order/pod",
    // Payment
    "GET  /balance",
    "POST /pay",
    "POST /pay/v2",
    // Inventory
    "GET  /inventory/stats",
    "GET  /inventory/alerts",
    "GET  /inventory/:pid",
    "POST /inventory/check",
    // Disputes
    "GET  /disputes",
    "POST /disputes/create",
    "POST /disputes/cancel",
    "POST /disputes/process",
    "GET  /cj/disputes",
    // Settings
    "GET  /cj/settings",
    // Webhook
    "POST /cj/webhook/set",
    "POST /cj/webhook/enable-all",
    "POST /cj/webhook/disable-all",
    "POST /webhook/callback",
    "GET  /webhook/events",
    // Scan/Search
    "POST /scan",
    "POST /search",
  ];
}

// ═══════════════════════════════════════════════════════════
// Main Entry Point
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ✨ ASTRALMIA — Autonomous Sales Engine v5.0");
  console.log("  🔮 100% CJ Dropshipping API v2.0 — 45 endpoints");
  console.log("  🕐 " + new Date().toISOString());
  console.log("═══════════════════════════════════════════════════════\n");

  // Ensure data directory
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  // Create shared CJ client
  sharedCJClient = new CJClient();

  // Start HTTP API
  startServer();

  // Start all subsystems
  console.log("\n🚀 Starting subsystems...\n");

  // 1. Order Manager (5-min cycles)
  try {
    orderManager = await startOrderDaemon(sharedCJClient);
    console.log("  ✅ Order Manager — active");
  } catch (err) {
    console.error("  ❌ Order Manager failed:", err.message);
  }

  // 2. Inventory Monitor (2-hour cycles, 2-min delayed start)
  try {
    inventoryMonitor = await startInventoryDaemon(sharedCJClient);
    console.log("  ✅ Inventory Monitor — active");
  } catch (err) {
    console.error("  ❌ Inventory Monitor failed:", err.message);
  }

  // 3. Dispute Manager (30-min cycles, 5-min delayed start)
  try {
    disputeManager = await startDisputeDaemon(sharedCJClient);
    console.log("  ✅ Dispute Manager — active");
  } catch (err) {
    console.error("  ❌ Dispute Manager failed:", err.message);
  }

  // 4. Catalog Scanner Daemon (4-hour cycles)
  await startDaemon();

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  🔮 All systems online — ASTRALMIA is operational");
  console.log("═══════════════════════════════════════════════════════\n");
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
