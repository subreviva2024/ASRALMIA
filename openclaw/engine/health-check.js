/**
 * ASTRALMIA — Health Check (for PM2 & monitoring)
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const PORT = parseInt(process.env.ASTRALMIA_PORT || "4002", 10);

function loadJSON(path, fallback) {
  try { if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8")); } catch {}
  return fallback;
}

async function healthCheck() {
  const checks = { timestamp: new Date().toISOString(), checks: {} };
  let allOk = true;

  // 1. HTTP server reachable
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/health`);
    const data = await res.json();
    checks.checks.httpServer = { ok: res.ok, status: res.status, data };
  } catch (err) {
    checks.checks.httpServer = { ok: false, error: err.message };
    allOk = false;
  }

  // 2. Catalog file exists and has products
  const catalog = loadJSON(join(DATA_DIR, "catalog.json"), { products: [] });
  const catalogOk = catalog.products?.length > 0;
  checks.checks.catalog = {
    ok: catalogOk,
    products: catalog.products?.length || 0,
    updatedAt: catalog.updatedAt || null,
  };
  if (!catalogOk) allOk = false;

  // 3. Stats file exists
  const stats = loadJSON(join(DATA_DIR, "stats.json"), {});
  const statsOk = !!stats.completedAt;
  checks.checks.lastScan = {
    ok: statsOk,
    completedAt: stats.completedAt || null,
    productsAdded: stats.productsAdded || 0,
    errors: stats.errors || 0,
    cjApiCalls: stats.cjApiStats?.calls || 0,
  };

  // 4. CJ API connectivity
  if (process.env.CJ_API_KEY || process.env.CJ_EMAIL) {
    try {
      const { CJClient } = await import("./cj-client.js");
      const cj = new CJClient();
      const categories = await cj.getCategories();
      checks.checks.cjApi = { ok: true, categoriesAvailable: Array.isArray(categories) };
    } catch (err) {
      checks.checks.cjApi = { ok: false, error: err.message };
      allOk = false;
    }
  } else {
    checks.checks.cjApi = { ok: false, error: "No CJ credentials configured" };
    allOk = false;
  }

  checks.overall = allOk ? "HEALTHY" : "DEGRADED";

  console.log(JSON.stringify(checks, null, 2));
  process.exit(allOk ? 0 : 1);
}

healthCheck().catch(err => {
  console.error("Health check failed:", err);
  process.exit(1);
});
