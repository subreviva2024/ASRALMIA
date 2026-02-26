"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SPIRITUAL_KEYWORDS, KEYWORD_CATEGORIES, TOP_OPPORTUNITY_KEYWORDS } from "@/data/keywords";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const CATEGORY_LABELS: Record<string, string> = {
  cristais: "Cristais & Pedras",
  tarot: "Tarot & Oráculos",
  incenso: "Incenso & Limpeza",
  velas: "Velas & Rituais",
  decoracao: "Decoração Espiritual",
  joias: "Jóias Espirituais",
  meditacao: "Meditação & Yoga",
  aromaterapia: "Aromaterapia",
  astrologia: "Astrologia",
  livros: "Livros",
  ferramentas: "Ferramentas Mágicas",
};

interface ShippingOption {
  logisticName: string;
  logisticPrice: number;
  logisticPriceCn: number;
  logisticAging: string;
  channelId: string | null;
  /** Customs/tax fee (EU VAT) */
  taxesFee: number;
  clearanceOperationFee: number;
  /** True landed cost to PT = logisticPrice + taxesFee + clearanceOperationFee */
  totalPostageFee: number;
  errorEn: string | null;
}

interface CJProductResult {
  pid: string;
  name: string;
  image: string;
  sku: string;
  category: string;
  weight: number;
  cjPrice: number;
  cjPriceEur?: number;
  cheapestShipping: ShippingOption | null;
  allShipping: ShippingOption[];
  totalCost: number;
  totalCostEur?: number;
  suggestedSellPrice: number;
  margin: number;
  marginPct: number;
  shippingDays: string;
  freeShipping: boolean;
  opportunityScore?: number;
  keyword?: string;
  variants?: { vid: string; name: string; price: number; image: string }[];
}

interface SearchResult {
  keyword: string;
  products: CJProductResult[];
  total: number;
  page: number;
  cheapShipping: number;
  freeShipping: number;
  avgMargin: number;
  error?: string;
}

interface ScanResult {
  mode: string;
  category?: string;
  keywordsScanned: number;
  products: CJProductResult[];
  total: number;
  stats: {
    freeShipping: number;
    cheapShipping: number;
    avgMarginPct: number;
    avgOpportunityScore: number;
    bestMargin: number;
    bestScore: number;
  };
  errors?: string[];
}

type ViewMode = "search" | "scan";
type SortBy = "score" | "margin" | "shipping" | "price";

export default function SourcingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [keyword, setKeyword] = useState("");
  const [markup, setMarkup] = useState("2.5");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [scanCategory, setScanCategory] = useState("top");
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [scanProgress, setScanProgress] = useState("");

  const search = useCallback(
    async (overrideKeyword?: string) => {
      setLoading(true);
      setError(null);
      setViewMode("search");
      try {
        const kw = overrideKeyword || keyword;
        const params = new URLSearchParams({
          keyword: kw,
          size: "20",
          markup: markup,
          maxShip: "5",
        });
        const res = await fetch(`/api/shop/products?${params}`);
        const data: SearchResult = await res.json();
        if (data.error) throw new Error(data.error);
        setResults(data);
        setScanResults(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    },
    [keyword, markup]
  );

  const bulkScan = useCallback(
    async (mode: string = scanCategory) => {
      setLoading(true);
      setError(null);
      setViewMode("scan");
      setScanProgress("A iniciar scan de oportunidades...");
      try {
        const params = new URLSearchParams({
          mode: mode === "top" ? "top" : "category",
          markup: markup,
          maxShip: "5",
          limit: "5",
          minMargin: "35",
        });
        if (mode !== "top") {
          params.set("category", mode);
        }
        setScanProgress(`A procurar em ${mode === "top" ? "top keywords" : CATEGORY_LABELS[mode] || mode}...`);
        const res = await fetch(`/api/shop/scan?${params}`);
        const data: ScanResult = await res.json();
        if ((data as unknown as { error: string }).error) {
          throw new Error((data as unknown as { error: string }).error);
        }
        setScanResults(data);
        setResults(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
        setScanProgress("");
      }
    },
    [scanCategory, markup]
  );

  const quickSearch = (kw: string) => {
    setKeyword(kw);
    search(kw);
  };

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ padding: "80px 24px 48px", maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.8 }}>
          <p
            style={{
              fontFamily: "'Inter'",
              fontSize: "10px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#c9a84c",
              marginBottom: "16px",
            }}
          >
            CJ Dropshipping · Sourcing
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(36px,6vw,64px)",
              fontWeight: 300,
              color: "#f0ebe2",
              lineHeight: 1.05,
              marginBottom: "24px",
            }}
          >
            Descobrir Produtos
          </h1>
          <p
            style={{
              fontFamily: "'Inter'",
              fontSize: "14px",
              fontWeight: 300,
              color: "rgba(240,235,226,0.45)",
              maxWidth: "600px",
              lineHeight: 1.8,
            }}
          >
            Produtos espirituais no CJ Dropshipping. Portes para Portugal calculados
            automaticamente. Ordenados por margem, oportunidade e custo de envio.
          </p>
        </motion.div>
      </section>

      {/* Mode toggle */}
      <section style={{ padding: "0 24px 16px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "2px" }}>
          <ModeTab active={viewMode === "search"} onClick={() => setViewMode("search")} label="Pesquisa" />
          <ModeTab active={viewMode === "scan"} onClick={() => setViewMode("scan")} label="Scanner de Oportunidades" />
        </div>
      </section>

      {/* Search mode */}
      {viewMode === "search" && (
      <section style={{ padding: "0 24px 32px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="crystal, tarot, incense, chakra..."
            style={{
              flex: 1,
              minWidth: "240px",
              fontFamily: "'Inter'",
              fontSize: "13px",
              padding: "12px 18px",
              background: "#13131f",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "#f0ebe2",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              style={{
                fontFamily: "'Inter'",
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(240,235,226,0.4)",
              }}
            >
              Markup
            </label>
            <input
              type="number"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              step="0.1"
              min="1.5"
              max="5"
              style={{
                width: "70px",
                fontFamily: "'Inter'",
                fontSize: "13px",
                padding: "12px 10px",
                background: "#13131f",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "#c9a84c",
                textAlign: "center",
                outline: "none",
              }}
            />
            <span style={{ fontFamily: "'Inter'", fontSize: "11px", color: "rgba(240,235,226,0.3)" }}>x</span>
          </div>
          <button
            onClick={() => search()}
            disabled={loading}
            style={{
              fontFamily: "'Inter'",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "12px 28px",
              background: loading ? "rgba(201,168,76,0.1)" : "linear-gradient(135deg,#c9a84c,#e8cc80)",
              border: "none",
              color: loading ? "#c9a84c" : "#08080f",
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "A procurar..." : "Procurar"}
          </button>
        </div>

        {/* Quick search tags */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {TOP_OPPORTUNITY_KEYWORDS.slice(0, 15).map((kw) => (
            <button
              key={kw}
              onClick={() => quickSearch(kw)}
              style={{
                fontFamily: "'Inter'",
                fontSize: "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "5px 12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(240,235,226,0.35)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                e.currentTarget.style.color = "#c9a84c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "rgba(240,235,226,0.35)";
              }}
            >
              {kw}
            </button>
          ))}
        </div>
      </section>
      )}

      {/* Scan mode */}
      {viewMode === "scan" && (
      <section style={{ padding: "0 24px 32px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
          <select
            value={scanCategory}
            onChange={(e) => setScanCategory(e.target.value)}
            style={{
              fontFamily: "'Inter'",
              fontSize: "13px",
              padding: "12px 18px",
              background: "#13131f",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "#f0ebe2",
              outline: "none",
              minWidth: "200px",
            }}
          >
            <option value="top">Top Oportunidades</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              style={{
                fontFamily: "'Inter'",
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(240,235,226,0.4)",
              }}
            >
              Markup
            </label>
            <input
              type="number"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              step="0.1"
              min="1.5"
              max="5"
              style={{
                width: "70px",
                fontFamily: "'Inter'",
                fontSize: "13px",
                padding: "12px 10px",
                background: "#13131f",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "#c9a84c",
                textAlign: "center",
                outline: "none",
              }}
            />
            <span style={{ fontFamily: "'Inter'", fontSize: "11px", color: "rgba(240,235,226,0.3)" }}>x</span>
          </div>
          <button
            onClick={() => bulkScan(scanCategory)}
            disabled={loading}
            style={{
              fontFamily: "'Inter'",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "12px 28px",
              background: loading ? "rgba(201,168,76,0.1)" : "linear-gradient(135deg,#c9a84c,#e8cc80)",
              border: "none",
              color: loading ? "#c9a84c" : "#08080f",
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "A scanear..." : "Scanear Oportunidades"}
          </button>
        </div>

        {/* Sort controls */}
        {scanResults && !loading && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)", alignSelf: "center", marginRight: "8px" }}>
              Ordenar:
            </span>
            {([["score", "Oportunidade"], ["margin", "Margem %"], ["shipping", "Portes"], ["price", "Preço"]] as [SortBy, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                style={{
                  fontFamily: "'Inter'",
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "5px 12px",
                  background: sortBy === key ? "rgba(201,168,76,0.15)" : "transparent",
                  border: `1px solid ${sortBy === key ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`,
                  color: sortBy === key ? "#c9a84c" : "rgba(240,235,226,0.35)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {scanProgress && loading && (
          <div style={{ padding: "12px 0" }}>
            <p style={{ fontFamily: "'Inter'", fontSize: "11px", color: "#c9a84c" }}>{scanProgress}</p>
          </div>
        )}
      </section>
      )}

      {/* Error */}
      {error && (
        <section style={{ padding: "0 24px 24px", maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(200,50,50,0.1)",
              border: "1px solid rgba(200,50,50,0.3)",
              fontFamily: "'Inter'",
              fontSize: "12px",
              color: "#e88",
            }}
          >
            {error}
          </div>
        </section>
      )}

      {/* Stats bar - Search mode */}
      {results && !loading && viewMode === "search" && (
        <section style={{ padding: "0 24px 32px", maxWidth: "1280px", margin: "0 auto" }}>
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5 }}>
            <div
              style={{
                display: "flex",
                gap: "24px",
                flexWrap: "wrap",
                padding: "16px 24px",
                background: "#13131f",
                border: "1px solid rgba(201,168,76,0.1)",
              }}
            >
              <Stat label="Keyword" value={results.keyword} />
              <Stat label="Produtos" value={String(results.products.length)} />
              <Stat label="Portes grátis" value={String(results.freeShipping)} accent={results.freeShipping > 0 ? "#4ade80" : undefined} />
              <Stat label="Portes < $5" value={String(results.cheapShipping)} accent={results.cheapShipping > 0 ? "#c9a84c" : undefined} />
              <Stat label="Margem média" value={`${results.avgMargin}%`} accent="#c9a84c" />
            </div>
          </motion.div>
        </section>
      )}

      {/* Stats bar - Scan mode */}
      {scanResults && !loading && viewMode === "scan" && (
        <section style={{ padding: "0 24px 32px", maxWidth: "1280px", margin: "0 auto" }}>
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5 }}>
            <div
              style={{
                display: "flex",
                gap: "24px",
                flexWrap: "wrap",
                padding: "16px 24px",
                background: "#13131f",
                border: "1px solid rgba(201,168,76,0.1)",
              }}
            >
              <Stat label="Keywords" value={String(scanResults.keywordsScanned)} />
              <Stat label="Oportunidades" value={String(scanResults.total)} accent="#c9a84c" />
              <Stat label="Portes grátis" value={String(scanResults.stats.freeShipping)} accent={scanResults.stats.freeShipping > 0 ? "#4ade80" : undefined} />
              <Stat label="Portes baratos" value={String(scanResults.stats.cheapShipping)} accent={scanResults.stats.cheapShipping > 0 ? "#c9a84c" : undefined} />
              <Stat label="Margem média" value={`${scanResults.stats.avgMarginPct}%`} accent="#c9a84c" />
              <Stat label="Melhor margem" value={`${scanResults.stats.bestMargin.toFixed(0)}%`} accent="#4ade80" />
              <Stat label="Score médio" value={`${scanResults.stats.avgOpportunityScore}/100`} accent="#c9a84c" />
            </div>
          </motion.div>
        </section>
      )}

      {/* Results - Search */}
      {results && !loading && viewMode === "search" && (
        <section style={{ padding: "0 24px 120px", maxWidth: "1280px", margin: "0 auto" }}>
          {results.products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: "24px",
                fontWeight: 300,
                color: "rgba(240,235,226,0.3)",
              }}
            >
              Nenhum produto encontrado
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {results.products.map((p, i) => (
                <motion.div
                  key={p.pid}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.04 }}
                >
                  <ProductRow
                    product={p}
                    markup={parseFloat(markup)}
                    expanded={expandedProduct === p.pid}
                    onToggle={() => setExpandedProduct(expandedProduct === p.pid ? null : p.pid)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Results - Scan */}
      {scanResults && !loading && viewMode === "scan" && (
        <section style={{ padding: "0 24px 120px", maxWidth: "1280px", margin: "0 auto" }}>
          {scanResults.products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: "24px",
                fontWeight: 300,
                color: "rgba(240,235,226,0.3)",
              }}
            >
              Nenhuma oportunidade encontrada com esses critérios
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {sortProducts(scanResults.products, sortBy).map((p, i) => (
                <motion.div
                  key={p.pid}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.04 }}
                >
                  <ProductRow
                    product={p}
                    markup={parseFloat(markup)}
                    expanded={expandedProduct === p.pid}
                    onToggle={() => setExpandedProduct(expandedProduct === p.pid ? null : p.pid)}
                    showScore
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Loading skeleton */}
      {loading && (
        <section style={{ padding: "0 24px 120px", maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "16px",
                  background: "#13131f",
                  alignItems: "center",
                }}
              >
                <div style={{ width: "80px", height: "80px", background: "rgba(255,255,255,0.04)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: "14px", width: "60%", background: "rgba(255,255,255,0.06)", marginBottom: "8px" }} />
                  <div style={{ height: "10px", width: "40%", background: "rgba(255,255,255,0.04)" }} />
                </div>
                <div style={{ width: "80px", height: "30px", background: "rgba(201,168,76,0.08)" }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function sortProducts(products: CJProductResult[], by: SortBy): CJProductResult[] {
  return [...products].sort((a, b) => {
    switch (by) {
      case "score":
        return (b.opportunityScore || 0) - (a.opportunityScore || 0);
      case "margin":
        return b.marginPct - a.marginPct;
      case "shipping":
        return (a.cheapestShipping?.logisticPrice ?? 99) - (b.cheapestShipping?.logisticPrice ?? 99);
      case "price":
        return a.cjPrice - b.cjPrice;
      default:
        return 0;
    }
  });
}

function ModeTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Inter'",
        fontSize: "10px",
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        padding: "10px 20px",
        background: active ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`,
        color: active ? "#c9a84c" : "rgba(240,235,226,0.4)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </button>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p
        style={{
          fontFamily: "'Inter'",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(240,235,226,0.3)",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      <p style={{ fontFamily: "'Inter'", fontSize: "15px", fontWeight: 500, color: accent || "#f0ebe2" }}>{value}</p>
    </div>
  );
}

function ProductRow({
  product: p,
  markup,
  expanded,
  onToggle,
  showScore,
}: {
  product: CJProductResult;
  markup: number;
  expanded: boolean;
  onToggle: () => void;
  showScore?: boolean;
}) {
  const shippingColor = p.freeShipping
    ? "#4ade80"
    : (p.cheapestShipping?.logisticPrice ?? 99) < 3
    ? "#c9a84c"
    : (p.cheapestShipping?.logisticPrice ?? 99) < 5
    ? "rgba(240,235,226,0.5)"
    : "#e88";

  const marginColor = p.marginPct > 60 ? "#4ade80" : p.marginPct > 45 ? "#c9a84c" : "rgba(240,235,226,0.4)";

  return (
    <div style={{ background: "#0e0e1a", overflow: "hidden" }}>
      {/* Main row */}
      <div
        onClick={onToggle}
        style={{
          display: "grid",
          gridTemplateColumns: showScore
            ? "80px 1fr 80px 100px 120px 100px 120px 40px"
            : "80px 1fr 100px 120px 100px 120px 40px",
          gap: "12px",
          padding: "14px 16px",
          alignItems: "center",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(201,168,76,0.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Image */}
        <div style={{ width: "80px", height: "80px", position: "relative", overflow: "hidden", flexShrink: 0, background: "#0a0a12" }}>
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,235,226,0.15)", fontSize: "10px" }}>
              Sem img
            </div>
          )}
        </div>

        {/* Name & category */}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'Inter'",
              fontSize: "12px",
              fontWeight: 500,
              color: "#f0ebe2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: "4px",
            }}
          >
            {p.name}
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)" }}>
            {p.keyword ? `${p.keyword} · ` : ""}{p.category} · {p.weight}g
          </p>
        </div>

        {/* Opportunity Score (scan mode) */}
        {showScore && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)", marginBottom: "2px" }}>
              Score
            </p>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: (p.opportunityScore || 0) >= 70
                ? "rgba(74,222,128,0.15)"
                : (p.opportunityScore || 0) >= 50
                ? "rgba(201,168,76,0.15)"
                : "rgba(240,235,226,0.05)",
              border: `2px solid ${(p.opportunityScore || 0) >= 70
                ? "rgba(74,222,128,0.4)"
                : (p.opportunityScore || 0) >= 50
                ? "rgba(201,168,76,0.4)"
                : "rgba(240,235,226,0.1)"}`,
            }}>
              <span style={{
                fontFamily: "'Inter'",
                fontSize: "13px",
                fontWeight: 700,
                color: (p.opportunityScore || 0) >= 70 ? "#4ade80" : (p.opportunityScore || 0) >= 50 ? "#c9a84c" : "rgba(240,235,226,0.4)",
              }}>
                {p.opportunityScore || 0}
              </span>
            </div>
          </div>
        )}

        {/* CJ Price */}
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)", marginBottom: "2px" }}>
            Custo CJ
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 500, color: "rgba(240,235,226,0.7)" }}>
            ${p.cjPrice.toFixed(2)}
          </p>
        </div>

        {/* Shipping */}
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)", marginBottom: "2px" }}>
            Portes PT
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 500, color: shippingColor }}>
            {p.freeShipping ? "GRÁTIS" : p.cheapestShipping ? `$${p.cheapestShipping.logisticPrice.toFixed(2)}` : "N/A"}
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: "9px", color: "rgba(240,235,226,0.25)" }}>{p.shippingDays}</p>
        </div>

        {/* Sell price suggestion */}
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)", marginBottom: "2px" }}>
            Vender a
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 600, color: "#c9a84c" }}>
            €{p.suggestedSellPrice.toFixed(2)}
          </p>
        </div>

        {/* Margin */}
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)", marginBottom: "2px" }}>
            Margem
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: "16px", fontWeight: 700, color: marginColor }}>
            {p.marginPct.toFixed(0)}%
          </p>
        </div>

        {/* Expand arrow */}
        <div style={{ textAlign: "center", color: "rgba(240,235,226,0.3)", fontSize: "14px", transition: "transform 0.2s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingTop: "16px" }}>
            {/* Shipping options */}
            <div>
              <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "10px" }}>
                Opções de envio para Portugal
              </p>
              {p.allShipping.length === 0 ? (
                <p style={{ fontFamily: "'Inter'", fontSize: "11px", color: "rgba(240,235,226,0.3)" }}>Sem opções calculadas</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {p.allShipping
                    .sort((a, b) => a.logisticPrice - b.logisticPrice)
                    .map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          background: i === 0 ? "rgba(201,168,76,0.06)" : "transparent",
                          border: i === 0 ? "1px solid rgba(201,168,76,0.15)" : "1px solid transparent",
                        }}
                      >
                        <span style={{ fontFamily: "'Inter'", fontSize: "11px", color: "rgba(240,235,226,0.6)" }}>
                          {s.logisticName}
                        </span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontFamily: "'Inter'", fontSize: "11px", color: i === 0 ? "#c9a84c" : "rgba(240,235,226,0.4)" }}>
                            ${s.logisticPrice.toFixed(2)} · {s.logisticAging} dias
                          </span>
                          {s.taxesFee > 0 && (
                            <span style={{ fontFamily: "'Inter'", fontSize: "9px", color: "rgba(240,235,226,0.3)", display: "block" }}>
                              +${s.taxesFee.toFixed(2)} impostos → total ${(s.totalPostageFee || s.logisticPrice + s.taxesFee).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Margin breakdown */}
            <div>
              <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "10px" }}>
                Análise de margem ({markup}x markup)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <MarginRow label="Preço CJ" value={`$${p.cjPrice.toFixed(2)} (€${(p.cjPriceEur ?? p.cjPrice * 0.92).toFixed(2)})`} />
                <MarginRow label="Portes (mais barato)" value={p.cheapestShipping ? `$${p.cheapestShipping.logisticPrice.toFixed(2)} (€${(p.cheapestShipping.logisticPrice * 0.92).toFixed(2)})` : "N/A"} />
                <MarginRow label="Custo total" value={`€${(p.totalCostEur ?? p.totalCost * 0.92).toFixed(2)}`} bold />
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                <MarginRow label="Preço de venda sugerido" value={`€${p.suggestedSellPrice.toFixed(2)}`} accent />
                <MarginRow label="Lucro por unidade" value={`€${p.margin.toFixed(2)}`} accent />
                <MarginRow label="Margem" value={`${p.marginPct.toFixed(1)}%`} accent />
                {p.opportunityScore != null && (
                  <MarginRow label="Score de oportunidade" value={`${p.opportunityScore}/100`} accent />
                )}
              </div>

              {/* Variants preview */}
              {p.variants && p.variants.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)", marginBottom: "6px" }}>
                    Variantes ({p.variants.length})
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {p.variants.map((v) => (
                      <div
                        key={v.vid}
                        style={{
                          padding: "4px 8px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          fontFamily: "'Inter'",
                          fontSize: "9px",
                          color: "rgba(240,235,226,0.5)",
                        }}
                      >
                        {v.name} · ${v.price.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SKU & PID */}
          <div style={{ marginTop: "12px", display: "flex", gap: "16px" }}>
            <p style={{ fontFamily: "'Inter'", fontSize: "9px", color: "rgba(240,235,226,0.2)" }}>PID: {p.pid}</p>
            <p style={{ fontFamily: "'Inter'", fontSize: "9px", color: "rgba(240,235,226,0.2)" }}>SKU: {p.sku}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MarginRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "'Inter'", fontSize: "11px", fontWeight: bold ? 600 : 400, color: accent ? "#c9a84c" : "rgba(240,235,226,0.5)" }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Inter'", fontSize: "11px", fontWeight: bold || accent ? 600 : 400, color: accent ? "#c9a84c" : "#f0ebe2" }}>
        {value}
      </span>
    </div>
  );
}
