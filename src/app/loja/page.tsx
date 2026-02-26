"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface CatalogProduct {
  pid: string;
  vid: string;
  nameEn: string;
  namePt: string;
  descPt: string;
  categoryPt: string;
  tagPt: string;
  accent: string;
  image: string;
  priceEur: number;
  freeShipping: boolean;
  shippingLabel: string;
  shippingDays: string;
  opportunityScore: number;
}

const CATEGORIES = [
  { key: "all",       label: "Todos",      accent: "#c9a84c" },
  { key: "cristais",  label: "Cristais",   accent: "#c9a84c" },
  { key: "tarot",     label: "Tarot",      accent: "#8b6fc9" },
  { key: "incenso",   label: "Incenso",    accent: "#c9784c" },
  { key: "joias",     label: "Joias",      accent: "#4e8ce8" },
  { key: "meditacao", label: "Meditação",  accent: "#7cb87a" },
  { key: "decoracao", label: "Decoração",  accent: "#c9c4a8" },
  { key: "velas",     label: "Velas",      accent: "#d4b060" },
];

export default function LojaPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchProducts = useCallback((category: string) => {
    setLoading(true);
    const url = category === "all"
      ? "/api/shop/catalog"
      : `/api/shop/catalog?category=${category}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProducts(activeTab);
  }, [activeTab, fetchProducts]);

  function handleTabChange(key: string) {
    if (key === activeTab) return;
    setActiveTab(key);
  }

  return (
    <main style={{ paddingTop: "72px" }}>
      {/* Header */}
      <section style={{ padding: "80px 24px 48px", maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.8 }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "16px" }}>
            Artefactos · Caela
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(48px,7vw,80px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.05, marginBottom: "24px" }}>
            A Loja
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 300, color: "rgba(240,235,226,0.45)", maxWidth: "560px", lineHeight: 1.8 }}>
            Cristais, tarot, incenso e artefactos sagrados — curados com intenção, 
            com envio directo para Portugal. Cada peça é seleccionada pela sua energia e qualidade.
          </p>
        </motion.div>
      </section>

      {/* Category tabs */}
      <section style={{ padding: "0 24px 48px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => {
            const active = cat.key === activeTab;
            return (
              <button
                key={cat.key}
                onClick={() => handleTabChange(cat.key)}
                style={{
                  fontFamily: "'Inter'",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  padding: "10px 20px",
                  background: active ? `${cat.accent}1f` : "transparent",
                  border: active ? `1px solid ${cat.accent}4d` : "1px solid rgba(255,255,255,0.07)",
                  color: active ? cat.accent : "rgba(240,235,226,0.4)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product grid */}
      <section style={{ padding: "0 24px 120px", maxWidth: "1280px", margin: "0 auto" }}>
        {loading ? (
          /* Skeleton */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "2px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: "#13131f", overflow: "hidden" }}>
                <div style={{ width: "100%", paddingBottom: "125%", background: "linear-gradient(135deg,#0e0e1a,#1a1a2a)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)", animation: "shimmer 1.5s infinite" }} />
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ height: "9px", width: "38%", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "10px" }} />
                  <div style={{ height: "20px", width: "72%", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginBottom: "10px" }} />
                  <div style={{ height: "12px", width: "90%", background: "rgba(255,255,255,0.04)", borderRadius: "2px", marginBottom: "6px" }} />
                  <div style={{ height: "12px", width: "60%", background: "rgba(255,255,255,0.04)", borderRadius: "2px", marginBottom: "16px" }} />
                  <div style={{ height: "14px", width: "30%", background: "rgba(201,168,76,0.12)", borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "28px", fontWeight: 300, color: "rgba(240,235,226,0.3)", marginBottom: "16px" }}>
              Nenhum produto nesta categoria
            </p>
            <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: "rgba(240,235,226,0.2)" }}>
              Novos artefactos são adicionados regularmente. Volte em breve.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "2px" }}>
            {products.map((p, i) => (
              <motion.div
                key={p.pid}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.06 }}
              >
                <Link href={`/loja/produto/${p.pid}`} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    style={{ background: "#0e0e1a", overflow: "hidden", transition: "transform 0.3s ease", cursor: "pointer" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                  >
                    {/* Image */}
                    <div style={{ width: "100%", paddingBottom: "125%", position: "relative", overflow: "hidden", background: "#0a0a12" }}>
                      <Image
                        src={p.image}
                        alt={p.namePt}
                        fill
                        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
                        style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
                        onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = "scale(1.06)"; }}
                        onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = "scale(1)"; }}
                      />
                      {/* Overlay */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(8,8,15,0.7) 0%,transparent 50%)" }} />
                      {/* Tag badge */}
                      <div style={{
                        position: "absolute", top: "14px", left: "14px",
                        fontFamily: "'Inter'", fontSize: "9px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase",
                        color: p.accent, background: "rgba(8,8,15,0.75)", padding: "5px 11px", backdropFilter: "blur(10px)",
                        border: `1px solid ${p.accent}33`,
                      }}>
                        {p.tagPt}
                      </div>
                      {/* Free shipping badge */}
                      {p.freeShipping && (
                        <div style={{
                          position: "absolute", top: "14px", right: "14px",
                          fontFamily: "'Inter'", fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
                          color: "#6fc98b", background: "rgba(8,8,15,0.75)", padding: "5px 10px", backdropFilter: "blur(8px)",
                          border: "1px solid rgba(111,201,139,0.3)",
                        }}>
                          Envio Grátis
                        </div>
                      )}
                      {/* Delivery estimate */}
                      <div style={{
                        position: "absolute", bottom: "14px", right: "14px",
                        fontFamily: "'Inter'", fontSize: "9px", fontWeight: 400, letterSpacing: "0.12em",
                        color: "rgba(240,235,226,0.5)", background: "rgba(8,8,15,0.7)", padding: "4px 10px", backdropFilter: "blur(8px)",
                      }}>
                        {p.shippingDays} dias
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "20px 20px 24px", background: "#13131f" }}>
                      <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,235,226,0.25)", marginBottom: "6px" }}>
                        {p.categoryPt}
                      </p>
                      <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "20px", fontWeight: 400, color: "#f0ebe2", marginBottom: "8px", lineHeight: 1.2 }}>
                        {p.namePt}
                      </p>
                      <p style={{ fontFamily: "'Inter'", fontSize: "11px", fontWeight: 300, color: "rgba(240,235,226,0.35)", lineHeight: 1.7, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.descPt}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontFamily: "'Inter'", fontSize: "15px", fontWeight: 400, color: "#c9a84c", letterSpacing: "0.04em" }}>
                          € {p.priceEur.toFixed(2).replace(".", ",")}
                        </p>
                        <span style={{
                          fontFamily: "'Inter'", fontSize: "9px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase",
                          color: p.accent, borderBottom: `1px solid ${p.accent}55`, paddingBottom: "1px",
                        }}>
                          Ver produto →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trust footer */}
      <section style={{ padding: "0 24px 80px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "40px", display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
          {[
            { icon: "✦", text: "Envio para Portugal" },
            { icon: "✦", text: "Pagamento Seguro" },
            { icon: "✦", text: "Encomenda Rastreada" },
            { icon: "✦", text: "Devoluções 14 Dias" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#c9a84c", fontSize: "8px" }}>{item.icon}</span>
              <p style={{ fontFamily: "'Inter'", fontSize: "10px", color: "rgba(240,235,226,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
