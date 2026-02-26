/**
 * ASTRALMIA — Main Process (24/7 Autonomous Sales Machine)
 * 
 * This is the primary entry point that:
 * 1. Starts the catalog scanner daemon (auto-updates every 4h)
 * 2. Runs the HTTP API server for catalog access
 * 3. Provides health checks for monitoring
 * 4. Serves the catalog to the OpenClaw agent and website
 * 
 * Designed to run via PM2 for 24/7 uptime.
 */

import { createServer } from "http";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { startDaemon, runFullScan, CatalogManager } from "./catalog-scanner.js";
import CJClient from "./cj-client.js";
import { analyzeProduct, translateProduct, calculatePricing } from "./product-engine.js";

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

// ═══════════════════════════════════════════════════════════
// HTTP API Server — Serves catalog + admin endpoints
// ═══════════════════════════════════════════════════════════

function startServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    try {
      // ── GET /health ──
      if (path === "/health" || path === "/") {
        const stats = loadJSON(join(DATA_DIR, "stats.json"), {});
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        json(res, {
          status: "ok",
          service: "ASTRALMIA Sales Engine v3.0",
          uptime: process.uptime(),
          catalogSize: catalog.products?.length || 0,
          lastScan: stats.completedAt || null,
          cjApiCalls: stats.cjApiStats?.calls || 0,
        });
        return;
      }

      // ── GET /catalog ──
      if (path === "/catalog") {
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        const category = url.searchParams.get("category");
        const minScore = parseInt(url.searchParams.get("minScore") || "0", 10);
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
        const sort = url.searchParams.get("sort") || "score"; // score, price, margin

        let products = catalog.products || [];

        // Filter by category
        if (category) {
          products = products.filter(p =>
            p.categoryPt?.toLowerCase() === category.toLowerCase()
          );
        }

        // Filter by minimum score
        if (minScore > 0) {
          products = products.filter(p => p.pricing?.score >= minScore);
        }

        // Sort
        if (sort === "price") products.sort((a, b) => a.pricing.retailEur - b.pricing.retailEur);
        else if (sort === "margin") products.sort((a, b) => b.pricing.marginPct - a.pricing.marginPct);
        else products.sort((a, b) => b.pricing.score - a.pricing.score);

        // Limit
        products = products.slice(0, limit);

        json(res, {
          total: products.length,
          catalog: catalog.stats || {},
          products: products.map(p => ({
            pid: p.pid,
            namePt: p.namePt,
            descPt: p.descPt,
            categoryPt: p.categoryPt,
            tagPt: p.tagPt,
            accent: p.accent,
            image: p.image,
            images: p.images,
            price: p.pricing.retailEur,
            shipping: p.shipping,
            score: p.pricing.score,
            margin: p.pricing.marginPct,
            storeUrl: p.storeUrl,
          })),
        });
        return;
      }

      // ── GET /catalog/featured ──
      if (path === "/catalog/featured") {
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        const limit = parseInt(url.searchParams.get("limit") || "12", 10);
        const featured = (catalog.products || [])
          .filter(p => p.pricing?.score >= 65)
          .sort((a, b) => b.pricing.score - a.pricing.score)
          .slice(0, limit);
        json(res, {
          total: featured.length,
          products: featured.map(p => ({
            pid: p.pid,
            namePt: p.namePt,
            descPt: p.descPt,
            categoryPt: p.categoryPt,
            image: p.image,
            price: p.pricing.retailEur,
            shipping: p.shipping,
            score: p.pricing.score,
            storeUrl: p.storeUrl,
          })),
        });
        return;
      }

      // ── GET /catalog/categories ──
      if (path === "/catalog/categories") {
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        const categories = {};
        for (const p of catalog.products || []) {
          if (!categories[p.categoryPt]) {
            categories[p.categoryPt] = { count: 0, avgScore: 0, totalScore: 0 };
          }
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

      // ── GET /product/:pid ──
      if (path.startsWith("/product/")) {
        const pid = path.replace("/product/", "");
        const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
        const product = (catalog.products || []).find(p => p.pid === pid);
        if (!product) {
          json(res, { error: "Product not found" }, 404);
          return;
        }
        json(res, { product });
        return;
      }

      // ── GET /stats ──
      if (path === "/stats") {
        const stats = loadJSON(join(DATA_DIR, "stats.json"), {});
        const history = loadJSON(join(DATA_DIR, "scan-history.json"), []);
        json(res, { lastScan: stats, history: history.slice(-10) });
        return;
      }

      // ── POST /scan (trigger manual scan) ──
      if (path === "/scan" && req.method === "POST") {
        json(res, { message: "Scan started", startedAt: new Date().toISOString() });
        // Run async (don't block response)
        runFullScan().catch(err => console.error("Manual scan error:", err.message));
        return;
      }

      // ── POST /search (live CJ search) ──
      if (path === "/search" && req.method === "POST") {
        const body = await readBody(req);
        const { query, limit = 10 } = JSON.parse(body);
        if (!query) { json(res, { error: "query required" }, 400); return; }

        const cj = new CJClient();
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
      json(res, { error: "Not found" }, 404);
    } catch (err) {
      console.error(`[API] Error: ${err.message}`);
      json(res, { error: err.message }, 500);
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🌐 ASTRALMIA API server running on port ${PORT}`);
  });

  return server;
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

// ═══════════════════════════════════════════════════════════
// Main Entry Point
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ✨ ASTRALMIA — Autonomous Sales Engine v3.0");
  console.log("  🔮 24/7 CJ Dropshipping Integration");
  console.log("  🕐 " + new Date().toISOString());
  console.log("═══════════════════════════════════════════════════════\n");

  // Ensure data directory
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  // Start HTTP API
  startServer();

  // Start catalog scanner daemon
  await startDaemon();
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
