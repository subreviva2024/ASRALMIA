/**
 * ASTRALMIA — Inventory Monitor (Autonomous Stock Tracker)
 * 
 * Monitors product stock levels and takes automated actions:
 * 
 * ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
 * │ CHECK STOCK  │ ──► │ OUT OF STOCK? │ ──► │ DISABLE ITEM │
 * └──────────────┘     └───────────────┘     └──────────────┘
 *        │                     │ no                │
 *        │                     ▼                   │
 *        │              ┌───────────────┐          │
 *        │              │ LOW STOCK?    │          │
 *        │              └───────────────┘          │
 *        │                     │ yes               │
 *        │                     ▼                   │
 *        │              ┌───────────────┐          │
 *        └──────────────│   ALERT       │──────────┘
 *                       └───────────────┘
 * 
 * Features:
 * - Periodic stock checks (every 2 hours)
 * - Auto-disable out-of-stock products from catalog
 * - Auto-re-enable when restocked
 * - Price change detection
 * - Low stock alerts
 * - Better alternative finder (cheaper/better scoring)
 * 
 * Runs as part of the main engine daemon.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const CATALOG_FILE = join(DATA_DIR, "catalog.json");
const INVENTORY_FILE = join(DATA_DIR, "inventory.json");
const ALERTS_FILE = join(DATA_DIR, "inventory-alerts.json");

// Thresholds
const LOW_STOCK_THRESHOLD = 5;
const PRICE_CHANGE_ALERT_PCT = 15;

// ═══════════════════════════════════════════════════════════
// Inventory Monitor
// ═══════════════════════════════════════════════════════════

export class InventoryMonitor {
  #cj;
  #inventoryCache = {};
  #alerts = [];
  #stats = {
    lastCheck: null,
    productsChecked: 0,
    outOfStock: 0,
    lowStock: 0,
    priceChanges: 0,
    disabled: 0,
    reEnabled: 0,
  };

  constructor(cjClient) {
    this.#cj = cjClient;
    this.load();
  }

  load() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    try {
      if (existsSync(INVENTORY_FILE)) {
        const data = JSON.parse(readFileSync(INVENTORY_FILE, "utf8"));
        this.#inventoryCache = data.cache || {};
        this.#stats = data.stats || this.#stats;
      }
    } catch { /* use defaults */ }
    try {
      if (existsSync(ALERTS_FILE)) {
        this.#alerts = JSON.parse(readFileSync(ALERTS_FILE, "utf8"));
      }
    } catch { this.#alerts = []; }
  }

  save() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(INVENTORY_FILE, JSON.stringify({
      cache: this.#inventoryCache,
      stats: this.#stats,
    }, null, 2));
    this.#alerts = this.#alerts.slice(-200);
    writeFileSync(ALERTS_FILE, JSON.stringify(this.#alerts, null, 2));
  }

  #addAlert(type, pid, message, data = {}) {
    const alert = {
      ts: new Date().toISOString(),
      type,
      pid,
      message,
      ...data,
    };
    this.#alerts.push(alert);
    console.log(`📊 [INVENTORY] ${type}: ${message}`);
  }

  getStats() { return { ...this.#stats }; }
  getAlerts(limit = 50) { return this.#alerts.slice(-limit); }
  getInventory(pid) { return this.#inventoryCache[pid] || null; }

  // ═══════════════════════════════════════════════════════════
  // CHECK STOCK — Full catalog inventory audit
  // ═══════════════════════════════════════════════════════════

  async checkAllStock() {
    console.log(`\n📊 [INVENTORY] Stock check starting — ${new Date().toISOString()}`);

    // Load current catalog
    let catalog;
    try {
      catalog = JSON.parse(readFileSync(CATALOG_FILE, "utf8"));
    } catch {
      console.error("[INVENTORY] Cannot read catalog");
      return { error: "Cannot read catalog" };
    }

    const products = catalog.products || [];
    if (products.length === 0) return { checked: 0 };

    const results = {
      checked: 0,
      outOfStock: [],
      lowStock: [],
      priceChanges: [],
      disabled: 0,
      reEnabled: 0,
    };

    // Check stock in batches (avoid rate limiting)
    for (const product of products) {
      try {
        await this.#checkProduct(product, results);
        results.checked++;

        // Rate limit: 400ms between checks
        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        console.error(`[INVENTORY] Error checking ${product.pid}:`, err.message);
      }
    }

    // Disable out-of-stock products in catalog
    if (results.outOfStock.length > 0) {
      for (const pid of results.outOfStock) {
        const product = products.find(p => p.pid === pid);
        if (product && !product.disabled) {
          product.disabled = true;
          product.disabledReason = "out_of_stock";
          product.disabledAt = new Date().toISOString();
          results.disabled++;
          this.#addAlert("OUT_OF_STOCK", pid, `${product.namePt || pid} — out of stock, disabled`);
        }
      }
    }

    // Re-enable previously disabled products that are back in stock
    for (const product of products) {
      if (product.disabled && product.disabledReason === "out_of_stock") {
        const cached = this.#inventoryCache[product.pid];
        if (cached && cached.inStock && cached.quantity > 0) {
          product.disabled = false;
          delete product.disabledReason;
          delete product.disabledAt;
          results.reEnabled++;
          this.#addAlert("RESTOCKED", product.pid, `${product.namePt || product.pid} — back in stock, re-enabled`);
        }
      }
    }

    // Save updated catalog
    if (results.disabled > 0 || results.reEnabled > 0) {
      writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2));
    }

    // Update stats
    this.#stats = {
      lastCheck: new Date().toISOString(),
      productsChecked: results.checked,
      outOfStock: results.outOfStock.length,
      lowStock: results.lowStock.length,
      priceChanges: results.priceChanges.length,
      disabled: results.disabled,
      reEnabled: results.reEnabled,
    };

    this.save();

    console.log(`📊 [INVENTORY] Check complete:`, {
      checked: results.checked,
      outOfStock: results.outOfStock.length,
      lowStock: results.lowStock.length,
      priceChanges: results.priceChanges.length,
      disabled: results.disabled,
      reEnabled: results.reEnabled,
    });

    return results;
  }

  // ── Check single product ──────────────────────────────

  async #checkProduct(product, results) {
    const { pid, vid } = product;

    // Get stock info
    let stockData;
    try {
      stockData = await this.#cj.checkInventory(pid);
    } catch {
      return; // Skip if API error
    }

    // Normalize stock data
    let quantity = 0;
    let inStock = false;

    if (Array.isArray(stockData)) {
      quantity = stockData.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);
      inStock = quantity > 0;
    } else if (stockData) {
      quantity = parseInt(stockData.quantity || stockData.stock || 0);
      inStock = stockData.inStock !== false && quantity > 0;
    }

    // Compare with previous
    const prev = this.#inventoryCache[pid];
    const wasInStock = prev ? prev.inStock : true;

    // Update cache
    this.#inventoryCache[pid] = {
      pid,
      quantity,
      inStock,
      lastChecked: new Date().toISOString(),
    };

    // Out of stock?
    if (!inStock) {
      results.outOfStock.push(pid);
      if (wasInStock) {
        this.#addAlert("STOCK_DEPLETED", pid, `${product.namePt || pid} went out of stock`);
      }
    }
    // Low stock?
    else if (quantity > 0 && quantity <= LOW_STOCK_THRESHOLD) {
      results.lowStock.push(pid);
      if (!prev || prev.quantity > LOW_STOCK_THRESHOLD) {
        this.#addAlert("LOW_STOCK", pid, `${product.namePt || pid} — only ${quantity} left`, { quantity });
      }
    }

    // Check price changes
    try {
      const productDetail = await this.#cj.getProduct(pid);
      if (productDetail) {
        const currentPrice = parseFloat(productDetail.sellPrice || 0);
        const catalogPrice = product.pricing?.cjPriceUsd || 0;

        if (catalogPrice > 0 && currentPrice > 0) {
          const changePct = Math.abs((currentPrice - catalogPrice) / catalogPrice * 100);
          if (changePct >= PRICE_CHANGE_ALERT_PCT) {
            results.priceChanges.push({
              pid,
              oldPrice: catalogPrice,
              newPrice: currentPrice,
              changePct: Math.round(changePct),
            });
            this.#addAlert("PRICE_CHANGE", pid,
              `${product.namePt || pid} price changed: $${catalogPrice} → $${currentPrice} (${changePct > 0 ? "+" : ""}${Math.round(changePct)}%)`,
              { oldPrice: catalogPrice, newPrice: currentPrice }
            );

            // Update catalog price
            product.pricing.cjPriceUsd = currentPrice;
          }
        }
      }
    } catch {
      // Price check is optional, don't fail the stock check
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CHECK SINGLE PRODUCT — On-demand inventory check
  // ═══════════════════════════════════════════════════════════

  async checkProduct(pid) {
    try {
      const stockData = await this.#cj.checkInventory(pid);
      let quantity = 0;
      let inStock = false;

      if (Array.isArray(stockData)) {
        quantity = stockData.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);
        inStock = quantity > 0;
      } else if (stockData) {
        quantity = parseInt(stockData.quantity || stockData.stock || 0);
        inStock = stockData.inStock !== false && quantity > 0;
      }

      this.#inventoryCache[pid] = {
        pid, quantity, inStock,
        lastChecked: new Date().toISOString(),
      };
      this.save();

      return { pid, quantity, inStock };
    } catch (err) {
      return { pid, error: err.message };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // WAREHOUSE INFO
  // ═══════════════════════════════════════════════════════════

  async getWarehouseInventory() {
    try {
      const warehouses = await this.#cj.getWarehouses();
      return Array.isArray(warehouses) ? warehouses : [];
    } catch (err) {
      return { error: err.message };
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Inventory Daemon — runs every INTERVAL
// ═══════════════════════════════════════════════════════════

const INVENTORY_CHECK_INTERVAL = parseInt(process.env.INVENTORY_CHECK_HOURS || "2", 10) * 3_600_000;

export async function startInventoryDaemon(cjClient) {
  const monitor = new InventoryMonitor(cjClient);

  console.log("📊 [INVENTORY] Inventory Monitor daemon started");
  console.log(`   Check interval: every ${INVENTORY_CHECK_INTERVAL / 3_600_000}h`);

  // Initial check (delayed 2 min to let catalog scan finish first)
  setTimeout(async () => {
    try {
      await monitor.checkAllStock();
    } catch (err) {
      console.error("📊 [INVENTORY] Initial check failed:", err.message);
    }
  }, 120_000);

  // Scheduled checks
  setInterval(async () => {
    try {
      console.log(`\n📊 [INVENTORY] Scheduled check at ${new Date().toISOString()}`);
      await monitor.checkAllStock();
    } catch (err) {
      console.error("📊 [INVENTORY] Scheduled check failed:", err.message);
    }
  }, INVENTORY_CHECK_INTERVAL);

  return monitor;
}

export default InventoryMonitor;
