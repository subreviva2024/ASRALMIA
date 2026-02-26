"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface Health {
  status: string;
  engine: string;
  products: number;
  lastUpdate: string;
  markup: string;
  cycleCount: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  salePrice: number;
  marketPrice: number;
  supplierPrice: number;
  marginEur: number;
  marginPct: number;
  supplier: { name: string; platform: string; deliveryDays: { min: number; max: number }; promo: string | null; rating: number };
}

interface Report {
  best: Product[];
  promos: Product[];
  fast: Product[];
  total: number;
  lastUpdate: string;
  cycleCount: number;
}

const cell: React.CSSProperties = {
  fontFamily: "'Inter'",
  fontSize: "12px",
  fontWeight: 300,
  color: "rgba(240,235,226,0.7)",
  padding: "14px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const gold: React.CSSProperties = { color: "#c9a84c" };

export default function CaelaPage() {
  const [health,  setHealth]  = useState<Health | null>(null);
  const [report,  setReport]  = useState<Report | null>(null);
  const [tab,     setTab]     = useState<"melhores" | "promos" | "rapidos">("melhores");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/caela").then((r) => r.json()),
      fetch("/api/caela/report").then((r) => r.json()),
    ]).then(([h, rep]) => {
      setHealth(h);
      setReport(rep);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const forceRefresh = () => {
    setRefreshing(true);
    fetch("/api/caela/refresh")
      .then(() => { load(); setRefreshing(false); })
      .catch(() => setRefreshing(false));
  };

  const tableItems: Product[] = tab === "melhores"
    ? (report?.best ?? [])
    : tab === "promos"
    ? (report?.promos ?? [])
    : (report?.fast ?? []);

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section style={{ padding: "80px 24px 48px", maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.8 }}>
          <p style={{ fontFamily:"'Inter'", fontSize:"10px", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"16px" }}>Motor Autónomo</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(44px,6vw,72px)", fontWeight:300, color:"#f0ebe2", lineHeight:1.05, marginBottom:"16px" }}>
            Caela
          </h1>
          <p style={{ fontFamily:"'Inter'", fontSize:"14px", fontWeight:300, color:"rgba(240,235,226,0.45)", maxWidth:"520px", lineHeight:1.8 }}>
            Caela monitoriza automaticamente os fornecedores esotéricos, compara preços, aplica o markup e actualiza a loja a cada 12 horas — sem intervenção humana.
          </p>
        </motion.div>
      </section>

      {/* Status cards */}
      <section style={{ padding: "0 24px 48px", maxWidth: "1280px", margin: "0 auto" }}>
        {loading ? (
          <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"22px", fontWeight:300, color:"rgba(240,235,226,0.25)" }}>
            A sincronizar com Caela…
          </p>
        ) : health ? (
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.6 }}
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"2px" }}>
            {[
              { label: "Estado",      value: health.status === "ok" ? "Operacional" : "Offline",  accent: health.status === "ok" },
              { label: "Produtos",    value: health.products + " activos",  accent: false },
              { label: "Markup",      value: health.markup,                  accent: false },
              { label: "Ciclos",      value: "#" + health.cycleCount,        accent: false },
              { label: "Frequência",  value: "12 horas",                     accent: false },
              { label: "Sincronizado", value: health.lastUpdate ? new Date(health.lastUpdate).toLocaleString("pt-PT") : "—", accent: false },
            ].map((item) => (
              <div key={item.label} style={{ background:"#13131f", padding:"28px 24px" }}>
                <p style={{ fontFamily:"'Inter'", fontSize:"9px", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(240,235,226,0.25)", marginBottom:"10px" }}>{item.label}</p>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"22px", fontWeight:400, color: item.accent ? "#6fc98b" : "#f0ebe2" }}>{item.value}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <div style={{ background:"#13131f", padding:"40px 32px", maxWidth:"480px" }}>
            <p style={{ fontFamily:"'Inter'", fontSize:"13px", color:"rgba(240,235,226,0.5)" }}>
              Caela não está acessível. Certifica-te que o bot está a correr:
            </p>
            <code style={{ fontFamily:"monospace", fontSize:"12px", color:"#c9a84c", display:"block", marginTop:"12px" }}>
              cd bot &amp;&amp; node server.js
            </code>
          </div>
        )}
      </section>

      {/* Action */}
      {health && (
        <section style={{ padding: "0 24px 48px", maxWidth: "1280px", margin: "0 auto" }}>
          <button onClick={forceRefresh} disabled={refreshing} style={{
            fontFamily:"'Inter'", fontSize:"10px", fontWeight:500, letterSpacing:"0.2em", textTransform:"uppercase",
            padding:"14px 32px",
            background: refreshing ? "rgba(201,168,76,0.05)" : "rgba(201,168,76,0.1)",
            border:"1px solid rgba(201,168,76,0.3)",
            color: refreshing ? "rgba(201,168,76,0.4)" : "#c9a84c",
            cursor: refreshing ? "not-allowed" : "pointer",
            transition:"all 0.3s ease",
          }}>
            {refreshing ? "A actualizar…" : "Forçar actualização agora"}
          </button>
          <p style={{ fontFamily:"'Inter'", fontSize:"10px", color:"rgba(240,235,226,0.2)", marginTop:"10px", letterSpacing:"0.08em" }}>
            Caela actualiza automaticamente. Usa este botão apenas se necessário.
          </p>
        </section>
      )}

      {/* Report tabs */}
      {report && (
        <section style={{ padding: "0 24px 120px", maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display:"flex", gap:"2px", marginBottom:"2px" }}>
            {(["melhores", "promos", "rapidos"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily:"'Inter'", fontSize:"10px", fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase",
                padding:"10px 24px",
                background: tab === t ? "rgba(201,168,76,0.12)" : "transparent",
                border: tab === t ? "1px solid rgba(201,168,76,0.3)" : "1px solid rgba(255,255,255,0.07)",
                color: tab === t ? "#c9a84c" : "rgba(240,235,226,0.35)",
                cursor:"pointer",
              }}>
                {t === "melhores" ? "Melhores Margens" : t === "promos" ? "Promoções" : "Entrega Rápida"}
              </button>
            ))}
          </div>

          <div style={{ background:"#13131f", overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                  {["Produto","Categoria","Fornecedor","Custo","PVP","Mercado","Margem","Entrega","Promo"].map((h) => (
                    <th key={h} style={{ fontFamily:"'Inter'", fontSize:"9px", fontWeight:500, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(240,235,226,0.25)", padding:"14px 16px", textAlign:"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ ...cell, textAlign:"center", padding:"40px", color:"rgba(240,235,226,0.2)", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"20px" }}>
                      Nenhum item nesta categoria
                    </td>
                  </tr>
                ) : tableItems.map((p) => (
                  <tr key={p.id} style={{ transition:"background 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="rgba(201,168,76,0.03)")}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                  >
                    <td style={{ ...cell, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"17px", color:"#f0ebe2", minWidth:"180px" }}>{p.name}</td>
                    <td style={{ ...cell, textTransform:"capitalize" }}>{p.category}</td>
                    <td style={{ ...cell }}>{p.supplier.platform}</td>
                    <td style={{ ...cell }}>€ {p.supplierPrice.toFixed(2)}</td>
                    <td style={{ ...cell, ...gold, fontWeight:400 }}>€ {p.salePrice.toFixed(2)}</td>
                    <td style={{ ...cell, color:"rgba(240,235,226,0.4)" }}>€ {p.marketPrice?.toFixed(2) ?? "—"}</td>
                    <td style={{ ...cell, color: p.marginPct >= 45 ? "#6fc98b" : "rgba(240,235,226,0.7)" }}>{p.marginPct}%</td>
                    <td style={{ ...cell }}>{p.supplier.deliveryDays.min}–{p.supplier.deliveryDays.max}d</td>
                    <td style={{ ...cell, color:"#c9a84c", fontSize:"10px" }}>{p.supplier.promo ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
