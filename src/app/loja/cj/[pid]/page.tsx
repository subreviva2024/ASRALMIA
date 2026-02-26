"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { analyzePricing, safeFloat, type CJProductDetail, type CJVariant, type CJFreightOption } from "@/lib/cj";
import { translateProduct } from "@/data/translations";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface ProductResponse {
  product: CJProductDetail;
  variants: CJVariant[];
  shipping: CJFreightOption[];
}

export default function CJProductPage() {
  const params = useParams();
  const pid = params.pid as string;
  const { addItem, items } = useCart();

  const [data, setData] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<CJVariant | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!pid) return;
    fetch(`/api/cj/product/${pid}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
        setSelectedVariant(json.variants?.[0] ?? null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [pid]);

  if (loading) {
    return (
      <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px" }}>
            <div style={{ paddingBottom: "120%", background: "linear-gradient(135deg,#0e0e1a,#1a1a2a)", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)", animation: "shimmer 1.5s infinite" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "20px" }}>
              {[80, 50, 100, 40].map((w, i) => (
                <div key={i} style={{ height: i === 0 ? "40px" : "14px", width: `${w}%`, background: "rgba(255,255,255,0.07)", borderRadius: "2px" }} />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main style={{ paddingTop: "120px", minHeight: "100vh", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "32px", color: "#f0ebe2", marginBottom: "20px" }}>
          Produto não encontrado
        </h1>
        <p style={{ color: "rgba(240,235,226,0.4)", fontFamily: "'Inter'", fontSize: "13px", marginBottom: "24px" }}>
          {error ?? "Este produto não está disponível"}
        </p>
        <Link href="/loja" style={{ color: "#c9a84c", fontFamily: "'Inter'", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          ← Voltar à Loja
        </Link>
      </main>
    );
  }

  const { product, variants, shipping } = data;

  // Translate to Portuguese
  const translation = translateProduct(product.productNameEn || product.productName);

  // Cheapest shipping option
  const cheapest = shipping.length
    ? shipping.reduce((a, b) => (safeFloat(a.logisticPrice) <= safeFloat(b.logisticPrice) ? a : b))
    : null;

  // Calculate EUR pricing with 2.5x markup
  const pricing = analyzePricing(safeFloat(product.sellPrice), cheapest, 2.5);

  // Variant display price
  const variantPrice = selectedVariant
    ? analyzePricing(safeFloat(selectedVariant.variantSellPrice) || safeFloat(product.sellPrice), cheapest, 2.5).suggestedPriceEur
    : pricing.suggestedPriceEur;

  const displayImage = selectedVariant?.variantImage || product.productImage;
  const isInCart = items.some((i) => i.pid === pid && i.vid === (selectedVariant?.vid ?? ""));

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      pid,
      vid: selectedVariant.vid,
      name: translation.namePt,
      image: displayImage,
      priceEur: variantPrice,
      costEur: pricing.totalCostEur,
      shippingLabel: cheapest
        ? pricing.freeShipping
          ? "Envio Grátis"
          : `${cheapest.logisticName} · ${cheapest.logisticAging} dias`
        : "Portes a calcular",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Back link */}
        <Link
          href="/loja"
          style={{
            fontFamily: "'Inter'", fontSize: "11px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(240,235,226,0.5)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
            marginBottom: "40px", transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,226,0.5)")}
        >
          <span>←</span> Voltar à Loja
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px", alignItems: "start" }}>
          {/* Left: Image */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "110%", background: "#0a0a12", overflow: "hidden" }}>
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={translation.namePt}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                  priority
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0e0a1a 0%, #1a1030 100%)" }} />
              )}
              {pricing.freeShipping && (
                <div style={{
                  position: "absolute", top: "16px", right: "16px",
                  fontFamily: "'Inter'", fontSize: "9px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#6fc98b", background: "rgba(8,8,15,0.85)", padding: "6px 14px", backdropFilter: "blur(10px)",
                  border: "1px solid rgba(111,201,139,0.3)",
                }}>
                  Envio Grátis
                </div>
              )}
            </div>

            {/* Variant image thumbnails */}
            {variants.length > 1 && (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                {variants.slice(0, 6).map((v) => (
                  <button
                    key={v.vid}
                    onClick={() => setSelectedVariant(v)}
                    style={{
                      width: "64px", height: "64px", padding: 0, border: "none",
                      outline: selectedVariant?.vid === v.vid ? "2px solid #c9a84c" : "2px solid transparent",
                      cursor: "pointer", background: "#0a0a12", position: "relative", overflow: "hidden",
                      transition: "outline 0.2s ease",
                    }}
                  >
                    {v.variantImage ? (
                      <Image src={v.variantImage} alt={v.variantKey || ""} fill sizes="64px" style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "rgba(201,168,76,0.1)" }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Info */}
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.6, delay: 0.15 }}>
            {/* Category */}
            <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: translation.accent || "#c9a84c", marginBottom: "16px" }}>
              {translation.categoryPt || product.categoryName || "Artefactos"}
            </p>

            {/* Name */}
            <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.15, marginBottom: "28px" }}>
              {translation.namePt}
            </h1>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "20px", marginBottom: "32px" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: "28px", fontWeight: 400, color: "#c9a84c", letterSpacing: "0.03em" }}>
                € {variantPrice.toFixed(2).replace(".", ",")}
              </p>
              <p style={{ fontFamily: "'Inter'", fontSize: "11px", color: "rgba(240,235,226,0.3)", letterSpacing: "0.08em" }}>
                {pricing.freeShipping ? "Envio incluído" : cheapest ? `+ €${(safeFloat(cheapest.logisticPrice) * 0.92).toFixed(2)} portes` : "Portes a calcular"}
              </p>
            </div>

            {/* Variants dropdown */}
            {variants.length > 1 && (
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,226,0.45)", marginBottom: "12px" }}>
                  Variante
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {variants.map((v) => (
                    <button
                      key={v.vid}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        fontFamily: "'Inter'", fontSize: "11px", letterSpacing: "0.1em",
                        padding: "8px 18px", cursor: "pointer", transition: "all 0.2s ease",
                        background: selectedVariant?.vid === v.vid ? "rgba(201,168,76,0.12)" : "transparent",
                        border: selectedVariant?.vid === v.vid ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.1)",
                        color: selectedVariant?.vid === v.vid ? "#c9a84c" : "rgba(240,235,226,0.55)",
                      }}
                    >
                      {v.variantKey || v.variantNameEn || `Variante ${variants.indexOf(v) + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping info */}
            {shipping.length > 0 && (
              <div style={{
                marginBottom: "32px",
                padding: "16px 20px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}>
                <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,226,0.35)", marginBottom: "10px" }}>
                  Envio para Portugal
                </p>
                {shipping.slice(0, 3).map((opt, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: i < 2 ? "8px" : 0 }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: "rgba(240,235,226,0.6)" }}>
                      {opt.logisticName} · {opt.logisticAging} dias
                    </p>
                    <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: safeFloat(opt.logisticPrice) === 0 ? "#6fc98b" : "#c9a84c" }}>
                      {safeFloat(opt.logisticPrice) === 0 ? "Grátis" : `€ ${(safeFloat(opt.logisticPrice) * 0.92).toFixed(2)}`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              style={{
                width: "100%",
                padding: "18px 32px",
                fontFamily: "'Inter'",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                cursor: selectedVariant ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                background: added ? "rgba(111,201,139,0.12)" : "rgba(201,168,76,0.1)",
                border: added ? "1px solid rgba(111,201,139,0.4)" : "1px solid rgba(201,168,76,0.35)",
                color: added ? "#6fc98b" : "#c9a84c",
                marginBottom: "16px",
              }}
            >
              {added ? "✦ Adicionado ao Carrinho" : "Adicionar ao Carrinho"}
            </button>

            {/* View cart shortcut */}
            {isInCart && (
              <Link
                href="/carrinho"
                style={{
                  display: "block", textAlign: "center",
                  fontFamily: "'Inter'", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "rgba(240,235,226,0.45)", textDecoration: "none", transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe2")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,226,0.45)")}
              >
                Ver Carrinho →
              </Link>
            )}

            {/* Trust signals */}
            <div style={{ marginTop: "36px", paddingTop: "28px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[
                { icon: "✦", text: "Pagamento Seguro" },
                { icon: "✦", text: "Envio Rastreado" },
                { icon: "✦", text: "Devoluções 14 dias" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#c9a84c", fontSize: "8px" }}>{item.icon}</span>
                  <p style={{ fontFamily: "'Inter'", fontSize: "10px", color: "rgba(240,235,226,0.35)", letterSpacing: "0.1em" }}>{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Description section */}
        <motion.section
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: "80px", paddingTop: "60px", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: translation.accent || "#c9a84c", marginBottom: "20px" }}>
            Descrição
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 300, color: "rgba(240,235,226,0.6)", lineHeight: 1.9, maxWidth: "720px", marginBottom: "32px" }}>
            {translation.descPt}
          </p>
          {/* Show raw CJ images gallery if description has them */}
          {product.description && (() => {
            // Sanitize: strip all tags except <img>, remove scripts/iframes/event handlers
            const sanitized = product.description
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
              .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // remove event handlers
              .replace(/<(?!img\s|br\s|br>)[^>]*>/gi, " ") // keep only <img> and <br>
              .replace(/\s+/g, " ")
              .trim();
            // Only show if there are actual images
            if (!/<img/i.test(sanitized)) return null;
            return (
              <div
                style={{
                  fontFamily: "'Inter'", fontSize: "13px", fontWeight: 300, color: "rgba(240,235,226,0.4)", lineHeight: 1.9, maxWidth: "720px",
                }}
                dangerouslySetInnerHTML={{
                  __html: `<style>img { max-width: 100%; height: auto; border-radius: 4px; margin: 12px 0; }</style>${sanitized}`,
                }}
              />
            );
          })()}
        </motion.section>
      </section>
    </main>
  );
}
