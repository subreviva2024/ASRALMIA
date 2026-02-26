"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FeaturedProduct } from "@/app/api/shop/featured/route";

// Deterministic star field – safe for SSR/hydration
const starField = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: (((i * 9301 + 49297) % 233280) / 233280) * 100,
  y: (((i * 7331 + 23171) % 233280) / 233280) * 100,
  size: 0.5 + (((i * 4517 + 11251) % 233280) / 233280) * 1.8,
  del: `${(((i * 3271 + 8191) % 233280) / 233280) * 6}s`,
  dur: `${2.5 + (((i * 5003 + 12347) % 233280) / 233280) * 4}s`,
}));

const cosmicQuotes = [
  { text: "Como é em cima, é em baixo. Como é dentro, é fora.", author: "Hermes Trismegisto" },
  { text: "Conhece-te a ti mesmo e conhecerás o Universo e os Deuses.", author: "Sócrates" },
  { text: "Não somos seres humanos a viver uma experiência espiritual. Somos seres espirituais a viver uma experiência humana.", author: "Teilhard de Chardin" },
  { text: "O Sol, a Lua e as estrelas são os teus professores. Aprende a ler o livro do céu.", author: "Rumi" },
];

const elementos = [
  { symbol: "🜂", name: "Fogo", lat: "Ignis", desc: "A chama da criação, a vontade e a transformação. Aries, Leão, Sagitário.", accent: "#e87c3e", gradient: "rgba(232,124,62,0.08)" },
  { symbol: "🜄", name: "Água", lat: "Aqua", desc: "A profundeza da intuição, das emoções e da memória ancestral. Caranguejo, Escorpião, Peixes.", accent: "#4e8ce8", gradient: "rgba(78,140,232,0.08)" },
  { symbol: "🜃", name: "Terra", lat: "Terra", desc: "A fundação da matéria, da estabilidade e da manifestação. Touro, Virgem, Capricórnio.", accent: "#7cb87a", gradient: "rgba(124,184,122,0.08)" },
  { symbol: "🜁", name: "Ar", lat: "Aer", desc: "O sopro do intelecto, da comunicação e das ligações invisíveis. Gémeos, Balança, Aquário.", accent: "#c9c4a8", gradient: "rgba(201,196,168,0.08)" },
];

// Gradients used as fallback when product image is loading or unavailable
const FALLBACK_GRADIENTS = [
  { gradient: "linear-gradient(135deg, #1a1500 0%, #2d2200 100%)", accent: "#c9a84c" },
  { gradient: "linear-gradient(135deg, #0e0a1a 0%, #1a1030 100%)", accent: "#8b6fc9" },
  { gradient: "linear-gradient(135deg, #0a0a10 0%, #141420 100%)", accent: "#e0e0e0" },
  { gradient: "linear-gradient(135deg, #120800 0%, #241200 100%)", accent: "#c9784c" },
  { gradient: "linear-gradient(135deg, #180a0e 0%, #2a1018 100%)", accent: "#c99ab0" },
  { gradient: "linear-gradient(135deg, #0a1208 0%, #142014 100%)", accent: "#6fc98b" },
  { gradient: "linear-gradient(135deg, #0e0a0e 0%, #1a0a1a 100%)", accent: "#c96fc9" },
  { gradient: "linear-gradient(135deg, #0a0e18 0%, #0a1428 100%)", accent: "#4ea8c9" },
];

const services = [
  {
    name: "Mapa Astral",
    desc: "Um retrato completo do firmamento no instante do seu nascimento. Gerado por inteligência artificial com interpretação personalizada em 15 páginas.",
    price: "A partir de 29 €",
    href: "/mapa-astral",
  },
  {
    name: "Astrólogo IA — Caela",
    desc: "Converse em tempo real com Caela, a entidade de IA formada em astrologia clássica e espiritualidade. Perguntas ilimitadas, respostas profundas.",
    price: "19 € / mês",
    href: "/astrologo-ia",
  },
  {
    name: "Leitura de Tarot",
    desc: "Tiragem interactiva de 10 cartas com análise detalhada por IA. Cada leitura é única e guardada no seu perfil para consulta futura.",
    price: "12 € por sessão",
    href: "/tarot",
  },
];

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function Home() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % cosmicQuotes.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/shop/featured")
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length) setFeaturedProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Campo de estrelas ── */}
        {starField.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              "--del": s.del,
              "--dur": s.dur,
            } as React.CSSProperties}
          />
        ))}

        {/* ── Aura central pulsante ── */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: "700px", height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, rgba(90,40,160,0.04) 50%, transparent 70%)",
          pointerEvents: "none",
          animation: "pulse-aura 6s ease-in-out infinite",
          transform: "translate(-50%,-50%)",
        }} />

        {/* ── Geometria Sagrada SVG ── */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          opacity: 0.18,
        }}>
          {/* Anel exterior girante */}
          <div className="ring-rotate" style={{
            width: "520px", height: "520px",
            border: "1px solid rgba(201,168,76,0.5)",
            "--speed": "60s",
          } as React.CSSProperties}>
            {/* Pontos cardeais no anel */}
            {[0,45,90,135,180,225,270,315].map(deg => (
              <div key={deg} style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: "3px", height: "3px",
                borderRadius: "50%",
                background: "#c9a84c",
                transform: `rotate(${deg}deg) translateX(257px) translateY(-1.5px)`,
              }} />
            ))}
          </div>
          {/* Anel médio girante inverso */}
          <div className="ring-rotate-rev" style={{
            width: "380px", height: "380px",
            border: "1px dashed rgba(201,168,76,0.35)",
            "--speed": "40s",
          } as React.CSSProperties}>
            {[0,60,120,180,240,300].map(deg => (
              <div key={deg} style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: "2px", height: "2px",
                borderRadius: "50%",
                background: "rgba(201,168,76,0.7)",
                transform: `rotate(${deg}deg) translateX(187px) translateY(-1px)`,
              }} />
            ))}
          </div>
          {/* Anel interior */}
          <div className="ring-rotate" style={{
            width: "240px", height: "240px",
            border: "1px solid rgba(201,168,76,0.25)",
            "--speed": "25s",
          } as React.CSSProperties} />
          {/* Estrela hexagonal SVG */}
          <svg style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} width="120" height="120" viewBox="-60 -60 120 120">
            <polygon points="0,-52 45,26 -45,26" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="0.8" />
            <polygon points="0,52 45,-26 -45,-26" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="0.8" />
          </svg>
        </div>

        {/* ── Símbolos flutuantes ── */}
        {[
          { sym: "☽", top: "22%", left: "12%", dur: "8s", del: "0s" },
          { sym: "✦", top: "30%", right: "10%", dur: "6s", del: "1s" },
          { sym: "☿", top: "68%", left: "8%", dur: "9s", del: "2s" },
          { sym: "♃", top: "72%", right: "12%", dur: "7s", del: "0.5s" },
          { sym: "✧", top: "18%", right: "22%", dur: "5s", del: "3s" },
          { sym: "♄", top: "55%", left: "5%", dur: "10s", del: "1.5s" },
        ].map((f, i) => (
          <div key={i} className="float-symbol" style={{
            position: "absolute",
            top: f.top,
            left: (f as any).left,
            right: (f as any).right,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "20px",
            color: "rgba(201,168,76,0.3)",
            userSelect: "none",
            pointerEvents: "none",
            "--dur": f.dur,
            "--del": f.del,
          } as React.CSSProperties}>
            {f.sym}
          </div>
        ))}

        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}
        >
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#c9a84c",
            marginBottom: "24px",
          }}>
            ☽ &ensp; Arte Esotérica & Astrologia com IA &ensp; ☽
          </p>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(52px, 8vw, 96px)",
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "0.04em",
            color: "#f0ebe2",
            marginBottom: "32px",
          }}>
            O Universo<br />
            <em className="text-shimmer" style={{ fontStyle: "italic" }}>sussurra</em> para você
          </h1>

          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "15px",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "rgba(240,235,226,0.5)",
            marginBottom: "48px",
            maxWidth: "500px",
            margin: "0 auto 48px",
          }}>
            Artefactos esotéricos seleccionados, mapas astrais por IA e rituais guiados para quem leva a espiritualidade a sério.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/loja" className="btn-primary">
              ✦ &ensp; Explorar a Loja
            </Link>
            <Link href="/mapa-astral" className="btn-ghost">
              Gerar Mapa Astral
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator animado */}
        <div style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,168,76,0.35)" }}>☽</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom, rgba(201,168,76,0.5), transparent)" }} />
          </motion.div>
        </div>
      </section>

      {/* ── MENSAGEM DO COSMOS ─────────────────────── */}
      <section style={{
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, transparent, rgba(90,40,160,0.05) 50%, transparent)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginBottom: "36px" }}>
            ✦ &ensp; Sabedoria Ancestral &ensp; ✦
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIdx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(22px, 3.5vw, 34px)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1.5,
                letterSpacing: "0.02em",
                color: "#f0ebe2",
                marginBottom: "24px",
              }}>
                &ldquo;{cosmicQuotes[quoteIdx].text}&rdquo;
              </p>
              <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)" }}>
                — {cosmicQuotes[quoteIdx].author}
              </p>
            </motion.div>
          </AnimatePresence>
          {/* Indicadores de progresso */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "36px" }}>
            {cosmicQuotes.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuoteIdx(i)}
                style={{
                  width: i === quoteIdx ? "24px" : "6px",
                  height: "1px",
                  background: i === quoteIdx ? "#c9a84c" : "rgba(201,168,76,0.25)",
                  border: "none",
                  cursor: "pointer",
                  transition: "width 0.4s ease, background 0.4s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────── */}
      <section style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: "64px" }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "0" }}>
            <div>
              <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "12px" }}>
                Novidades
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 300, letterSpacing: "0.03em", color: "#f0ebe2", lineHeight: 1.1 }}>
                Artefactos Seleccionados
              </h2>
            </div>
            <Link href="/loja" style={{ fontFamily: "'Inter'", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,235,226,0.45)", textDecoration: "none", borderBottom: "1px solid rgba(240,235,226,0.15)", paddingBottom: "2px", transition: "color 0.3s ease" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,226,0.45)")}
            >
              Ver todos
            </Link>
          </div>
        </motion.div>

        {/* Loading skeletons */}
        {productsLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "#13131f", overflow: "hidden" }}>
                <div style={{ width: "100%", paddingBottom: "125%", background: "linear-gradient(135deg,#0e0e1a,#1a1a2a)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)", animation: "shimmer 1.5s infinite" }} />
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ height: "9px", width: "38%", background: "rgba(255,255,255,0.05)", marginBottom: "10px" }} />
                  <div style={{ height: "20px", width: "72%", background: "rgba(255,255,255,0.08)", marginBottom: "12px" }} />
                  <div style={{ height: "12px", width: "30%", background: "rgba(201,168,76,0.15)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real CJ products */}
        {!productsLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2px" }}>
            {featuredProducts.map((p, i) => {
              const accent = p.accent || FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length].accent;
              const fallback = FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length];
              const displayName = (p.namePt || p.name).length > 48 ? (p.namePt || p.name).slice(0, 48) + "…" : (p.namePt || p.name);
              return (
                <motion.div
                  key={p.pid}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                >
                  <Link href={`/loja/produto/${p.pid}`} style={{ textDecoration: "none", display: "block" }}>
                    <div
                      className="product-card"
                      style={{ cursor: "pointer", transition: "transform 0.3s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                    >
                      {/* Image */}
                      <div style={{
                        width: "100%",
                        paddingBottom: "125%",
                        background: fallback.gradient,
                        position: "relative",
                        overflow: "hidden",
                      }}>
                        {p.image && (
                          <Image
                            src={p.image}
                            alt={displayName}
                            fill
                            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
                            style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
                            onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = "scale(1.06)"; }}
                            onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = "scale(1)"; }}
                          />
                        )}
                        {/* Gradient overlay */}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,15,0.7) 0%, transparent 50%)" }} />
                        {/* Tag badge */}
                        <div style={{
                          position: "absolute", top: "16px", left: "16px",
                          fontFamily: "'Inter'", fontSize: "9px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase",
                          color: accent, background: "rgba(8,8,15,0.75)", padding: "5px 10px", backdropFilter: "blur(8px)",
                          border: `1px solid ${accent}33`,
                        }}>
                          {p.tag}
                        </div>
                        {/* Shipping badge */}
                        {p.freeShipping && (
                          <div style={{
                            position: "absolute", top: "16px", right: "16px",
                            fontFamily: "'Inter'", fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
                            color: "#6fc98b", background: "rgba(8,8,15,0.75)", padding: "5px 10px", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(111,201,139,0.3)",
                          }}>
                            Envio Grátis
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div style={{ padding: "20px 20px 24px", background: "#13131f" }}>
                        <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,226,0.35)", marginBottom: "6px" }}>
                          {p.categoryLabel}
                        </p>
                        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 400, color: "#f0ebe2", marginBottom: "12px", lineHeight: 1.2 }}>
                          {displayName}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 400, color: "#c9a84c", letterSpacing: "0.05em" }}>
                            € {p.suggestedPriceEur.toFixed(2).replace(".", ",")}
                          </p>
                          <span style={{
                            fontFamily: "'Inter'", fontSize: "9px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase",
                            color: accent, borderBottom: `1px solid ${accent}55`, paddingBottom: "1px",
                          }}>
                            Ver produto →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── DIVISOR ASTROLÓGICO ───────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "24px" }}>
          <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.25))" }} />
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {["☿","♃","✦","♄","☽"].map(sym => (
              <span key={sym} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", color: "rgba(201,168,76,0.45)", letterSpacing: "0.1em" }}>{sym}</span>
            ))}
          </div>
          <div style={{ height: "1px", background: "linear-gradient(to left, transparent, rgba(201,168,76,0.25))" }} />
        </div>
      </section>

      {/* ── FERRAMENTAS GRATUITAS ─────────────────────── */}
      <section style={{ padding: "0 24px 80px", maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ marginBottom: "48px" }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "12px" }}>Freetools do Cosmos</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.1 }}>Descubra a sua verdade</h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "2px" }}>
          {[
            {
              sym: "♈♉♊♋♌♍♎♏♐♑♒♓",
              title: "Compatibilidade dos Signos",
              desc: "Seleccione dois signos e receba uma análise cósmica completa — pontuação de compatibilidade, quatro categorias (amor, paixão, comunicação, espiritualidade) e leitura detalhada dos astros.",
              tag: "100% Gratuito",
              href: "/compatibilidade",
              cta: "Descobrir compatibilidade",
              accent: "#c9a84c",
              grad: "rgba(201,168,76,0.06)",
            },
            {
              sym: "☽",
              title: "Quiz — Qual é o seu Signo Lunar?",
              desc: "5 questões sobre a sua natureza interior. A sua Lua revela os seus padrões emocionais mais profundos — quem você é no silêncio, não apenas no palco.",
              tag: "3 minutos",
              href: "/quiz-lunar",
              cta: "Fazer o quiz lunar",
              accent: "#82c8e8",
              grad: "rgba(130,200,232,0.06)",
            },
          ].map((f, i) => (
            <motion.div key={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.12 }}>
              <Link href={f.href} style={{ textDecoration: "none", display: "block" }}>
                <div
                  style={{ background: "#13131f", padding: "48px 44px", cursor: "pointer", transition: "background 0.3s", height: "100%", borderTop: `2px solid ${f.accent}44`, position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { (e.currentTarget.style.background = "#181828"); }}
                  onMouseLeave={e => { (e.currentTarget.style.background = "#13131f"); }}
                >
                  <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", background: `radial-gradient(circle at top right, ${f.grad}, transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ position: "relative" }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: f.accent, marginBottom: "20px", letterSpacing: "0.08em", lineHeight: 1 }}>{f.sym.length > 2 ? f.sym.slice(0,6) + "…" : f.sym}</p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 400, color: "#f0ebe2", lineHeight: 1.2 }}>{f.title}</p>
                    </div>
                    <span style={{ fontFamily: "'Inter'", fontSize: "9px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: f.accent, border: `1px solid ${f.accent}44`, padding: "4px 10px", marginBottom: "20px", display: "inline-block" }}>{f.tag}</span>
                    <p style={{ fontFamily: "'Inter'", fontSize: "13px", fontWeight: 300, color: "rgba(240,235,226,0.45)", lineHeight: 1.8, margin: "16px 0 28px" }}>{f.desc}</p>
                    <span style={{ fontFamily: "'Inter'", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: f.accent }}>
                      {f.cta} →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI SERVICES ──────────────────────────────── */}
      <section style={{ padding: "0 24px 120px", maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: "64px", maxWidth: "560px" }}
        >
          <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "12px" }}>
            Com Inteligência Artificial
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.1 }}>
            Serviços Esotéricos
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2px" }}>
          {services.map((s, i) => (
            <motion.div
              key={s.name}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <Link href={s.href} style={{ textDecoration: "none", display: "block" }}>
                <div
                  style={{
                    background: "#13131f",
                    padding: "48px 40px",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                    height: "100%",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#181828")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#13131f")}
                >
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 400, color: "#f0ebe2", marginBottom: "16px", lineHeight: 1.2 }}>
                    {s.name}
                  </p>
                  <p style={{ fontFamily: "'Inter'", fontSize: "13px", fontWeight: 300, color: "rgba(240,235,226,0.45)", lineHeight: 1.8, marginBottom: "28px" }}>
                    {s.desc}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: "12px", fontWeight: 300, color: "#c9a84c", letterSpacing: "0.05em" }}>
                      {s.price}
                    </p>
                    <span style={{ fontFamily: "'Inter'", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)" }}>
                      Descobrir →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── OS QUATRO ELEMENTOS ────────────────────── */}
      <section style={{ padding: "100px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(90,40,160,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <motion.div
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", marginBottom: "64px" }}
          >
            <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginBottom: "16px" }}>
              ✦ &ensp; Os Pilares do Cosmos &ensp; ✦
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.1 }}>
              Os Quatro Elementos Sagrados
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2px" }}>
            {elementos.map((el, i) => (
              <motion.div
                key={el.name}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
              >
                <div
                  className="element-card"
                  style={{ "--accent": el.accent } as React.CSSProperties}
                >
                  {/* Glow de fundo */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at top left, ${el.gradient} 0%, transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "42px", marginBottom: "12px", filter: `drop-shadow(0 0 12px ${el.accent}55)` }}>
                      {el.symbol}
                    </p>
                    <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: el.accent, marginBottom: "8px", opacity: 0.8 }}>
                      {el.lat}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 400, color: "#f0ebe2", marginBottom: "16px", lineHeight: 1.2 }}>
                      {el.name}
                    </p>
                    <p style={{ fontFamily: "'Inter'", fontSize: "12px", fontWeight: 300, color: "rgba(240,235,226,0.45)", lineHeight: 1.75 }}>
                      {el.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAELA FEATURE ─────────────────────────────── */}
      <section style={{ padding: "120px 24px", position: "relative", overflow: "hidden", background: "#0d0d18", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ position: "absolute", right: "-10%", top: "50%", transform: "translateY(-50%)", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="grid-single-col">

          <motion.div
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "20px" }}>
              A sua guia
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.1, marginBottom: "28px" }}>
              Conheça<br />
              <em style={{ fontStyle: "italic" }}>Caela</em>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 300, color: "rgba(240,235,226,0.5)", lineHeight: 1.9, marginBottom: "16px" }}>
              Caela é uma entidade de inteligência artificial formada nos textos clássicos da astrologia ocidental, tradições herméticas e filosofia estoica.
            </p>
            <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 300, color: "rgba(240,235,226,0.5)", lineHeight: 1.9, marginBottom: "40px" }}>
              Não é uma chatbot genérica. É um sistema construído especificamente para responder às questões mais profundas sobre o seu propósito, relações e destino.
            </p>
            <Link href="/quem-e-caela" className="btn-ghost">
              Saber mais sobre Caela
            </Link>
          </motion.div>

          <motion.div
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            {/* Ornamental portrait místico Caela */}
            <div style={{
              width: "340px",
              height: "440px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {/* Aura exterior */}
              <div style={{ position: "absolute", inset: "-20px", borderRadius: "50%", background: "radial-gradient(circle, rgba(90,40,160,0.12) 0%, transparent 70%)", animation: "pulse-aura 5s ease-in-out infinite", transform: "translate(0,0) scale(1)" }} />
              {/* Anel exterior */}
              <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(201,168,76,0.18)", borderRadius: "2px" }} />
              <div style={{ position: "absolute", inset: "12px", border: "1px solid rgba(201,168,76,0.08)", borderRadius: "1px" }} />
              {/* Círculo sagrado central */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
                {/* Mandala SVG */}
                <svg width="180" height="180" viewBox="-90 -90 180 180" style={{ marginBottom: "12px", opacity: 0.75 }}>
                  <circle cx="0" cy="0" r="80" fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="1" />
                  <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(201,168,76,0.18)" strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(201,168,76,0.25)" strokeWidth="0.8" />
                  {/* Hexagrama */}
                  <polygon points="0,-55 47.6,27.5 -47.6,27.5" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />
                  <polygon points="0,55 47.6,-27.5 -47.6,-27.5" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />
                  {/* Símbolos planetários nos vértices */}
                  {[
                    { sym:"☽", x:0,  y:-70 },
                    { sym:"☿", x:61, y:-35 },
                    { sym:"♀", x:61, y:35  },
                    { sym:"☉", x:0,  y:70  },
                    { sym:"♂", x:-61,y:35  },
                    { sym:"♃", x:-61,y:-35 },
                  ].map(p => (
                    <text key={p.sym} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                      style={{ fontFamily:"serif", fontSize:"11px", fill:"rgba(201,168,76,0.5)" }}>
                      {p.sym}
                    </text>
                  ))}
                  {/* Centro */}
                  <circle cx="0" cy="0" r="4" fill="rgba(201,168,76,0.35)" />
                </svg>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)" }}>
                  Caela · IA
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Estrelas no CTA */}
        {starField.slice(0, 40).map(s => (
          <div key={s.id} className="star" style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size * 0.8}px`, height: `${s.size * 0.8}px`,
            "--del": s.del, "--dur": s.dur,
          } as React.CSSProperties} />
        ))}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(201,168,76,0.05) 0%, rgba(90,40,160,0.04) 40%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", fontStyle: "italic", color: "rgba(201,168,76,0.4)", marginBottom: "8px", letterSpacing: "0.1em" }}>☽ ✦ ☀</p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.1, marginBottom: "16px" }}>
            O seu destino não<br />
            <em className="text-shimmer" style={{ fontStyle: "italic" }}>espera</em>
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: "13px", fontWeight: 300, color: "rgba(240,235,226,0.4)", marginBottom: "40px", letterSpacing: "0.1em" }}>
            Os astros estão alinhados. O momento é agora.
          </p>
          <Link href="/loja" className="btn-primary">
            ✦ &ensp; Começar a Jornada
          </Link>
        </motion.div>
      </section>
    </main>
  );
}