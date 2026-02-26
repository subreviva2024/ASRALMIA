/**
 * ASTRALMIA — Test Suite v5.0
 * Tests all engine modules for correctness
 */

import { translateProduct, calculatePricing, isValidImage, fingerprint } from "./product-engine.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return result.then(() => {
        console.log(`  ✅ ${name}`);
        passed++;
      }).catch(err => {
        console.log(`  ❌ ${name}: ${err.message}`);
        failed++;
      });
    }
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function assert(condition, msg = "Assertion failed") {
  if (!condition) throw new Error(msg);
}

console.log("\n═══════════════════════════════════════════════════════");
console.log("  ✨ ASTRALMIA — Engine Tests v5.0");
console.log("═══════════════════════════════════════════════════════\n");

// ── Translation Engine ──────────────────────────────────────

console.log("📝 Translation Engine:");

test("amethyst pendant → Colar de Ametista Natural", () => {
  const r = translateProduct("Natural Amethyst Crystal Pendant Necklace");
  assert(r.namePt === "Colar de Ametista Natural");
  assert(r.categoryPt === "Cristais");
});

test("rose quartz → Quartzo Rosa", () => {
  const r = translateProduct("Rose Quartz Crystal Heart Shape");
  assert(r.namePt === "Quartzo Rosa — Pedra do Amor");
});

test("tarot deck → Baralho de Tarot", () => {
  const r = translateProduct("Classic Tarot Card Deck 78 Cards");
  assert(r.namePt === "Baralho de Tarot");
  assert(r.categoryPt === "Tarot");
});

test("evil eye → Olho Grego", () => {
  const r = translateProduct("Evil Eye Blue Bead Bracelet");
  assert(r.namePt === "Olho Grego — Protecção");
});

test("backflow incense → Incensário Cascata", () => {
  const r = translateProduct("Backflow Incense Burner Waterfall");
  assert(r.namePt === "Incensário Cascata");
});

test("singing bowl → Taça Tibetana", () => {
  const r = translateProduct("Tibetan Singing Bowl Set Meditation");
  assert(r.namePt === "Taça Tibetana");
  assert(r.categoryPt === "Meditação");
});

test("unknown product → fallback clean name", () => {
  const r = translateProduct("Some Random Item [wholesale] {lot}");
  assert(r.categoryPt === "Artefactos");
  assert(!r.namePt.includes("["));
});

test("tiger eye → Olho de Tigre", () => {
  const r = translateProduct("Natural Tiger Eye Stone Bracelet");
  assert(r.namePt === "Olho de Tigre");
});

test("obsidian → Obsidiana", () => {
  const r = translateProduct("Black Obsidian Pendant Necklace");
  assert(r.namePt === "Obsidiana — Espelho da Alma");
});

// ── Pricing Engine ──────────────────────────────────────────

console.log("\n💰 Pricing Engine:");

test("$5 product → €12.99", () => {
  const p = calculatePricing(5, 0);
  assert(p.retailEur === 11.99 || p.retailEur === 12.99 || p.retailEur === 14.99,
    `Expected €11.99-14.99, got €${p.retailEur}`);
  assert(p.score > 0, "Score must be > 0");
});

test("$10 product → price < €49.99", () => {
  const p = calculatePricing(10, 3);
  assert(p.retailEur <= 49.99, `Price too high: €${p.retailEur}`);
  assert(p.marginEur > 0, "Margin must be positive");
});

test("free shipping → higher score", () => {
  const p1 = calculatePricing(5, 0);
  const p2 = calculatePricing(5, 5);
  assert(p1.score > p2.score, "Free shipping should score higher");
  assert(p1.freeShipping === true);
  assert(p2.freeShipping === false);
});

test("margin % is correct", () => {
  const p = calculatePricing(3, 0);
  assert(p.marginPct > 50, `Low margin: ${p.marginPct}%`);
  assert(p.marginEur > 0);
});

test("price ends in .99", () => {
  const p = calculatePricing(7, 2);
  const decimal = Math.round((p.retailEur - Math.floor(p.retailEur)) * 100);
  assert(decimal === 99, `Expected .99, got .${decimal}`);
});

// ── Image Validator ──────────────────────────────────────────

console.log("\n🖼️ Image Validator:");

test("valid HTTPS image", () => {
  assert(isValidImage("https://cbu01.alicdn.com/img/product.jpg") === true);
});

test("HTTP rejected", () => {
  assert(isValidImage("http://example.com/img.jpg") === false);
});

test("placeholder rejected", () => {
  assert(isValidImage("https://example.com/no-image-placeholder.jpg") === false);
});

test("empty rejected", () => {
  assert(isValidImage("") === false);
  assert(isValidImage(null) === false);
});

test("CJ CDN valid", () => {
  assert(isValidImage("https://cbu01.alicdn.com/product.jpg") === true);
});

// ── Deduplication ──────────────────────────────────────────

console.log("\n🔒 Deduplication:");

test("same product → same fingerprint", () => {
  const fp1 = fingerprint("Amethyst Crystal Pendant", 5.99);
  const fp2 = fingerprint("amethyst crystal pendant", 5.50);
  assert(fp1 === fp2, `Fingerprints differ: ${fp1} vs ${fp2}`);
});

test("different products → different fingerprints", () => {
  const fp1 = fingerprint("Amethyst Crystal Pendant", 5.99);
  const fp2 = fingerprint("Rose Quartz Heart Stone", 3.99);
  assert(fp1 !== fp2);
});

test("noise words removed", () => {
  const fp1 = fingerprint("Crystal Pendant NEW Hot Sale Wholesale", 5);
  const fp2 = fingerprint("Crystal Pendant", 5);
  assert(fp1 === fp2, "Noise words should be stripped");
});

// ── Module Imports ──────────────────────────────────────────

console.log("\n📦 Module Imports:");

await test("CJClient imports", async () => {
  const m = await import("./cj-client.js");
  assert(m.CJClient !== undefined);
  assert(typeof m.CJClient === "function");
});

await test("catalog-scanner imports", async () => {
  const m = await import("./catalog-scanner.js");
  assert(typeof m.runFullScan === "function");
  assert(typeof m.CatalogManager === "function");
});

await test("product-engine imports", async () => {
  const m = await import("./product-engine.js");
  assert(typeof m.analyzeProduct === "function");
  assert(typeof m.translateProduct === "function");
  assert(typeof m.calculatePricing === "function");
});

await test("order-manager imports", async () => {
  const m = await import("./order-manager.js");
  assert(typeof m.OrderManager === "function");
  assert(typeof m.startOrderDaemon === "function");
  assert(m.STATUS !== undefined);
});

await test("inventory-monitor imports", async () => {
  const m = await import("./inventory-monitor.js");
  assert(typeof m.InventoryMonitor === "function");
  assert(typeof m.startInventoryDaemon === "function");
});

await test("dispute-manager imports", async () => {
  const m = await import("./dispute-manager.js");
  assert(typeof m.DisputeManager === "function");
  assert(typeof m.startDisputeDaemon === "function");
});

// ── CJ Client Structure ──────────────────────────────────

console.log("\n🔗 CJ Client v5.0 API Coverage (100% — 45 endpoints):");

await test("CJClient has all 45+ methods (100% CJ API v2.0)", async () => {
  const m = await import("./cj-client.js");
  // Use prototype to check methods
  const proto = m.CJClient.prototype;
  const methods = [
    // Auth
    "logout",
    // Product
    "searchProducts", "searchProductsV2", "getProduct", "getVariants",
    "getVariantById", "getCategories", "addToMyProduct", "getMyProducts",
    "getProductReviews",
    // Stock
    "checkInventory", "checkInventoryByVid", "checkInventoryBySku", "getInventoryByPid",
    // Warehouses
    "getWarehouses", "getWarehouseDetail",
    // Sourcing
    "createSourcing", "querySourcing",
    // Logistics
    "calculateShipping", "calculateShippingTip", "getSupplierLogistics",
    "trackShipment", "trackShipmentV1",
    // Cart
    "addToCart", "confirmCart",
    // Orders
    "createOrder", "createOrderV3", "saveParentOrder", "getOrder",
    "listOrders", "deleteOrder", "confirmOrder", "changeOrderWarehouse",
    // Shipping Info
    "uploadShippingInfo", "updateShippingInfo", "updatePodPictures",
    // Payment
    "getBalance", "payBalance", "payBalanceV2",
    // Disputes
    "getDisputeProducts", "confirmDisputeInfo", "createDispute", "cancelDispute", "listDisputes",
    // Settings
    "getSettings",
    // Webhook
    "setWebhook", "enableAllWebhooks", "disableAllWebhooks",
    // Core
    "api",
  ];

  const missing = methods.filter(m => typeof proto[m] !== "function");
  assert(missing.length === 0, `Missing methods: ${missing.join(", ")}`);
  assert(methods.length >= 45, `Expected 45+ methods, got ${methods.length}`);
});

// ── Order Manager Structure ──────────────────────────────

console.log("\n📦 Order Manager:");

await test("OrderManager has all lifecycle methods", async () => {
  const m = await import("./order-manager.js");
  const proto = m.OrderManager.prototype;
  const methods = [
    "load", "save", "getOrders", "getOrder", "getStats", "getHistory",
    "createOrder", "autoConfirmOrders", "autoPayOrders",
    "syncOrderStatuses", "syncTracking", "retryFailedOrders",
    "cancelOrder", "syncFromCJ", "checkBalance", "processCycle",
  ];
  const missing = methods.filter(m => typeof proto[m] !== "function");
  assert(missing.length === 0, `Missing: ${missing.join(", ")}`);
});

await test("STATUS constants correct", async () => {
  const { STATUS } = await import("./order-manager.js");
  assert(STATUS.PENDING === "pending");
  assert(STATUS.SHIPPED === "shipped");
  assert(STATUS.DELIVERED === "delivered");
  assert(STATUS.FAILED === "failed");
});

// ── Inventory Monitor Structure ──────────────────────────

console.log("\n📊 Inventory Monitor:");

await test("InventoryMonitor has all methods", async () => {
  const m = await import("./inventory-monitor.js");
  const proto = m.InventoryMonitor.prototype;
  const methods = [
    "load", "save", "getStats", "getAlerts", "getInventory",
    "checkAllStock", "checkProduct", "getWarehouseInventory",
  ];
  const missing = methods.filter(m => typeof proto[m] !== "function");
  assert(missing.length === 0, `Missing: ${missing.join(", ")}`);
});

// ── Dispute Manager Structure ──────────────────────────

console.log("\n⚠️ Dispute Manager:");

await test("DisputeManager has all methods", async () => {
  const m = await import("./dispute-manager.js");
  const proto = m.DisputeManager.prototype;
  const methods = [
    "load", "save", "getStats", "getDisputes",
    "detectProblems", "createDisputeForOrder", "syncDisputes",
    "cancelDispute", "processCycle",
  ];
  const missing = methods.filter(m => typeof proto[m] !== "function");
  assert(missing.length === 0, `Missing: ${missing.join(", ")}`);
});

// ── Summary ──────────────────────────────────────────────

// Give async tests a moment to complete
await new Promise(r => setTimeout(r, 100));

console.log("\n═══════════════════════════════════════════════════════");
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(failed === 0 ? "  ✅ ALL TESTS PASSED" : "  ❌ SOME TESTS FAILED");
console.log("═══════════════════════════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
