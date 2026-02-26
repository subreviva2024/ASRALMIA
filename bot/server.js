#!/usr/bin/env node
// Caela — Motor de Fornecedores ASTRALMIA
// Porta: 4001 | Auto-refresh cada 12h | REST API
require("dotenv").config({ path: __dirname + "/.env" });
const http  = require("http");
const fss   = require("fs");
const pathm = require("path");
const cron  = require("node-cron");
const { SUPPLIERS } = require("./suppliers");
const { buildCatalog, getBestDeals, getCheapestByCategory, getFastestDelivery, getActivePromos, DEFAULT_MARKUP } = require("./pricing");
const PORT          = parseInt(process.env.BOT_PORT || "4001", 10);
const MARKUP_FACTOR = parseFloat(process.env.MARKUP || DEFAULT_MARKUP);
const CATALOG_PATH  = pathm.join(__dirname, "catalog.json");
let catalog = [], lastUpdate = null, cycleCount = 0;
function refreshCatalog() {
  cycleCount++;
  catalog    = buildCatalog(SUPPLIERS, MARKUP_FACTOR);
  lastUpdate = new Date().toISOString();
  fss.writeFileSync(CATALOG_PATH, JSON.stringify({ lastUpdate, markup: MARKUP_FACTOR + "x", products: catalog }, null, 2));
  console.log("[Caela] Ciclo #" + cycleCount + " — " + catalog.length + " produtos | markup " + MARKUP_FACTOR + "x | " + lastUpdate);
}
function buildReport(opts) {
  const o = opts || {}, limit = o.limit || 10, category = o.category;
  let data = category ? catalog.filter(function(p) { return p.category === category; }) : catalog;
  return { best: getBestDeals(data, limit), promos: getActivePromos(data), cheap: getCheapestByCategory(data), fast: getFastestDelivery(data, 10), total: data.length, lastUpdate: lastUpdate, cycleCount: cycleCount };
}
function jsonOk(res, data) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data, null, 2));
}
const server = http.createServer(function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
  const url = req.url.split("?")[0];
  if (url === "/health")     return jsonOk(res, { status: "ok", engine: "Caela", products: catalog.length, lastUpdate: lastUpdate, markup: MARKUP_FACTOR + "x", cycleCount: cycleCount });
  if (url === "/catalog")    return jsonOk(res, { lastUpdate: lastUpdate, markup: MARKUP_FACTOR + "x", products: catalog });
  if (url === "/best-deals") return jsonOk(res, getBestDeals(catalog, 10));
  if (url === "/cheapest")   return jsonOk(res, getCheapestByCategory(catalog));
  if (url === "/promos")     return jsonOk(res, getActivePromos(catalog));
  if (url === "/fast")       return jsonOk(res, getFastestDelivery(catalog, 10));
  if (url === "/report")     return jsonOk(res, buildReport({ limit: 10 }));
  if (url === "/refresh")    { refreshCatalog(); return jsonOk(res, { ok: true, products: catalog.length, lastUpdate: lastUpdate }); }
  if (url === "/categories") {
    const cats = Array.from(new Set(catalog.map(function(p) { return p.category; })));
    return jsonOk(res, cats.map(function(cat) {
      const items = catalog.filter(function(p) { return p.category === cat; });
      return { category: cat, count: items.length, avgMarginPct: (items.reduce(function(s, p) { return s + parseFloat(p.sell.marginPct); }, 0) / items.length).toFixed(0) + "%" };
    }));
  }
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Not found", available: ["/health","/catalog","/best-deals","/cheapest","/promos","/fast","/report","/refresh","/categories"] }));
});
refreshCatalog();
cron.schedule("0 */12 * * *", function() { console.log("[Caela][CRON] Auto-refresh 12h"); refreshCatalog(); }, { timezone: "Europe/Lisbon" });
server.listen(PORT, function() {
  console.log("");
  console.log("  Caela — Motor de Fornecedores ASTRALMIA");
  console.log("  Porta:    " + PORT);
  console.log("  Produtos: " + catalog.length + " | Markup: " + MARKUP_FACTOR + "x");
  console.log("  Ciclo:    a cada 12 horas");
  console.log("  API:      /health /catalog /best-deals /cheapest /promos /fast /report /refresh /categories");
  console.log("");
});
module.exports = server;