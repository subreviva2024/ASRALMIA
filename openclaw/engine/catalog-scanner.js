/**
 * ASTRALMIA — Autonomous Catalog Scanner & Updater
 * 
 * Runs on a schedule (default: every 4 hours) to:
 * 1. Search CJ for products in all ASTRALMIA niches
 * 2. Filter through 7-gate analysis pipeline
 * 3. Remove duplicates, bad images, expensive products
 * 4. Find cheaper/better alternatives for existing catalog
 * 5. Save updated catalog to disk
 * 6. Generate stats and optimization report
 * 
 * 100% autonomous — zero human intervention needed.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import CJClient from "./cj-client.js";
import { analyzeProduct, fingerprint, calculatePricing } from "./product-engine.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const CATALOG_FILE = join(DATA_DIR, "catalog.json");
const HISTORY_FILE = join(DATA_DIR, "scan-history.json");
const STATS_FILE = join(DATA_DIR, "stats.json");

// ═══════════════════════════════════════════════════════════
// Search Keywords (all ASTRALMIA niches)
// ═══════════════════════════════════════════════════════════

const SEARCH_QUERIES = [
  // Cristais & Pedras
  "crystal pendant necklace", "amethyst jewelry", "rose quartz pendant",
  "tourmaline bracelet", "crystal tree decoration", "natural stone bracelet",
  "obsidian pendant", "lapis lazuli jewelry", "tiger eye bracelet",
  "moonstone necklace", "crystal healing stone",
  // Tarot & Adivinhação
  "tarot deck cards", "oracle cards deck", "pendulum crystal divination",
  "rune stones set",
  // Incenso & Purificação
  "backflow incense burner", "incense holder ceramic",
  "incense waterfall cone", "essential oil diffuser",
  // Meditação
  "singing bowl tibetan", "mala beads 108 bracelet",
  "meditation cushion", "yoga mat towel",
  // Joias Espirituais
  "evil eye bracelet", "zodiac necklace pendant",
  "chakra bracelet 7 stone", "hamsa hand pendant",
  "moon phase necklace", "lotus flower jewelry",
  // Decoração
  "dreamcatcher wall hanging", "buddha statue decoration",
  "sacred geometry wall art",
  // Velas & Aromaterapia
  "ritual candle set", "chakra candle set",
  "aromatherapy essential oil set",
];

// ═══════════════════════════════════════════════════════════
// Catalog Manager
// ═══════════════════════════════════════════════════════════

class CatalogManager {
  constructor() {
    this.catalog = { products: [], updatedAt: null, stats: {} };
    this.history = [];
    this.load();
  }

  load() {
    try {
      if (existsSync(CATALOG_FILE)) {
        this.catalog = JSON.parse(readFileSync(CATALOG_FILE, "utf8"));
      }
    } catch { this.catalog = { products: [], updatedAt: null, stats: {} }; }
    try {
      if (existsSync(HISTORY_FILE)) {
        this.history = JSON.parse(readFileSync(HISTORY_FILE, "utf8"));
      }
    } catch { this.history = []; }
  }

  save() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    this.catalog.updatedAt = new Date().toISOString();
    writeFileSync(CATALOG_FILE, JSON.stringify(this.catalog, null, 2));
    // Keep only last 100 history entries
    this.history = this.history.slice(-100);
    writeFileSync(HISTORY_FILE, JSON.stringify(this.history, null, 2));
  }

  saveStats(stats) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  }

  getExistingFingerprints() {
    return new Set(this.catalog.products.map(p => p.fingerprint).filter(Boolean));
  }

  addProduct(product) {
    // Check if PID already exists — replace if better score
    const existingIdx = this.catalog.products.findIndex(p => p.pid === product.pid);
    if (existingIdx >= 0) {
      const existing = this.catalog.products[existingIdx];
      if (product.pricing.score > existing.pricing.score) {
        this.catalog.products[existingIdx] = product;
        return "upgraded";
      }
      return "skipped-same";
    }
    this.catalog.products.push(product);
    return "added";
  }

  /** Find cheaper alternatives for existing catalog products */
  findUpgradeCandidates() {
    return this.catalog.products
      .filter(p => p.pricing.score < 70)
      .sort((a, b) => a.pricing.score - b.pricing.score)
      .slice(0, 10);
  }

  /** Remove worst products if catalog is too large (>200) */
  trim(maxSize = 200) {
    if (this.catalog.products.length <= maxSize) return 0;
    this.catalog.products.sort((a, b) => b.pricing.score - a.pricing.score);
    const removed = this.catalog.products.length - maxSize;
    this.catalog.products = this.catalog.products.slice(0, maxSize);
    return removed;
  }

  /** Get catalog stats */
  getStats() {
    const products = this.catalog.products;
    if (!products.length) return { total: 0 };
    const categories = {};
    let totalMargin = 0;
    let totalScore = 0;
    for (const p of products) {
      categories[p.categoryPt] = (categories[p.categoryPt] || 0) + 1;
      totalMargin += p.pricing.marginEur;
      totalScore += p.pricing.score;
    }
    return {
      total: products.length,
      avgScore: Math.round(totalScore / products.length),
      avgMarginEur: Math.round(totalMargin / products.length * 100) / 100,
      priceRange: {
        min: Math.min(...products.map(p => p.pricing.retailEur)),
        max: Math.max(...products.map(p => p.pricing.retailEur)),
      },
      categories,
      updatedAt: this.catalog.updatedAt,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// Scanner — Main Scan Loop
// ═══════════════════════════════════════════════════════════

export async function runFullScan(options = {}) {
  const { verbose = true } = options;
  const log = verbose ? console.log.bind(console) : () => {};

  log("\n═══════════════════════════════════════════════════════");
  log("  ✨ ASTRALMIA — Catalog Scanner v3.0");
  log("  🕐 " + new Date().toISOString());
  log("═══════════════════════════════════════════════════════\n");

  const cj = new CJClient();
  const catalog = new CatalogManager();
  const seenFPs = catalog.getExistingFingerprints();
  const scanStats = {
    startedAt: new Date().toISOString(),
    queriesSearched: 0,
    productsFound: 0,
    productsAnalyzed: 0,
    productsAdded: 0,
    productsUpgraded: 0,
    productsRejected: 0,
    errors: 0,
  };

  for (const query of SEARCH_QUERIES) {
    log(`🔍 Searching: "${query}"`);
    scanStats.queriesSearched++;

    try {
      const data = await cj.searchProducts(query, 1, 40);
      const list = data?.list || [];
      scanStats.productsFound += list.length;
      log(`   Found ${list.length} results`);

      for (const rawProduct of list) {
        scanStats.productsAnalyzed++;
        try {
          const product = await analyzeProduct(cj, rawProduct, seenFPs);
          if (!product) {
            scanStats.productsRejected++;
            continue;
          }

          const result = catalog.addProduct(product);
          if (result === "added") {
            scanStats.productsAdded++;
            log(`   ✅ Added: ${product.namePt} — €${product.pricing.retailEur} (Score: ${product.pricing.score})`);
          } else if (result === "upgraded") {
            scanStats.productsUpgraded++;
            log(`   ⬆️ Upgraded: ${product.namePt} — Score: ${product.pricing.score}`);
          }
        } catch (err) {
          scanStats.errors++;
        }
      }

      // Rate limit between queries
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      scanStats.errors++;
      log(`   ❌ Search error: ${err.message}`);
    }
  }

  // ── Trim catalog if too large ──
  const trimmed = catalog.trim(200);
  if (trimmed > 0) {
    log(`\n🗑️ Trimmed ${trimmed} low-score products`);
  }

  // ── Sort by score ──
  catalog.catalog.products.sort((a, b) => b.pricing.score - a.pricing.score);

  // ── Update stats ──
  const finalStats = catalog.getStats();
  catalog.catalog.stats = finalStats;
  scanStats.completedAt = new Date().toISOString();
  scanStats.catalogStats = finalStats;
  scanStats.cjApiStats = cj.stats;

  // ── Save everything ──
  catalog.history.push(scanStats);
  catalog.save();
  catalog.saveStats(scanStats);

  // ── Report ──
  log("\n═══════════════════════════════════════════════════════");
  log("  📊 SCAN COMPLETE");
  log("═══════════════════════════════════════════════════════");
  log(`  Queries: ${scanStats.queriesSearched}`);
  log(`  Products Found: ${scanStats.productsFound}`);
  log(`  Products Analyzed: ${scanStats.productsAnalyzed}`);
  log(`  Products Added: ${scanStats.productsAdded}`);
  log(`  Products Upgraded: ${scanStats.productsUpgraded}`);
  log(`  Products Rejected: ${scanStats.productsRejected}`);
  log(`  Errors: ${scanStats.errors}`);
  log(`  CJ API Calls: ${cj.stats.calls}`);
  log(`  Catalog Total: ${finalStats.total}`);
  log(`  Avg Score: ${finalStats.avgScore}`);
  log(`  Avg Margin: €${finalStats.avgMarginEur}`);
  if (finalStats.categories) {
    log(`  Categories: ${Object.entries(finalStats.categories).map(([k, v]) => `${k}(${v})`).join(", ")}`);
  }
  log("═══════════════════════════════════════════════════════\n");

  return scanStats;
}

// ═══════════════════════════════════════════════════════════
// Auto-Updater Daemon (runs every INTERVAL_MS)
// ═══════════════════════════════════════════════════════════

const SCAN_INTERVAL = parseInt(process.env.SCAN_INTERVAL_HOURS || "4", 10) * 3_600_000;

export async function startDaemon() {
  console.log("🔮 ASTRALMIA Catalog Daemon started");
  console.log(`   Scan interval: every ${SCAN_INTERVAL / 3_600_000}h`);

  // Run immediately on start
  try {
    await runFullScan();
  } catch (err) {
    console.error("❌ Initial scan failed:", err.message);
  }

  // Schedule recurring scans
  setInterval(async () => {
    try {
      console.log(`\n🔄 Scheduled scan starting at ${new Date().toISOString()}`);
      await runFullScan();
    } catch (err) {
      console.error("❌ Scheduled scan failed:", err.message);
    }
  }, SCAN_INTERVAL);
}

// ── Direct execution ──
if (process.argv[1] && process.argv[1].includes("catalog-scanner")) {
  const isDaemon = process.argv.includes("--daemon");
  if (isDaemon) {
    startDaemon().catch(console.error);
  } else {
    runFullScan().then(stats => {
      process.exit(stats.errors > 10 ? 1 : 0);
    }).catch(err => {
      console.error("FATAL:", err);
      process.exit(1);
    });
  }
}

export default { runFullScan, startDaemon, CatalogManager };
