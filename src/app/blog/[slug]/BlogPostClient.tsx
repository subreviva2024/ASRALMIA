"use client";

import Link from "next/link";
import { BlogPost, BlogSection } from "@/data/blogPosts";

interface Props {
  post: BlogPost;
  related: BlogPost[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

function renderSection(section: BlogSection, idx: number) {
  switch (section.type) {
    case "heading":
      return (
        <h2
          key={idx}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(22px, 2.5vw, 30px)",
            fontWeight: 400,
            color: "#f0ebe2",
            letterSpacing: "0.03em",
            lineHeight: 1.3,
            marginTop: "48px",
            marginBottom: "20px",
            borderLeft: "2px solid rgba(201,168,76,0.4)",
            paddingLeft: "20px",
          }}
        >
          {section.text}
        </h2>
      );

    case "paragraph":
      return (
        <p
          key={idx}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "15px",
            fontWeight: 300,
            color: "rgba(240,235,226,0.75)",
            lineHeight: 1.9,
            marginBottom: "24px",
          }}
        >
          {section.text}
        </p>
      );

    case "list":
      return (
        <ul key={idx} style={{ marginBottom: "28px", paddingLeft: "0", listStyle: "none" }}>
          {section.items?.map((item, i) => (
            <li
              key={i}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 300,
                color: "rgba(240,235,226,0.7)",
                lineHeight: 1.8,
                paddingLeft: "20px",
                position: "relative",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "10px",
                  width: "6px",
                  height: "1px",
                  background: "rgba(201,168,76,0.6)",
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote
          key={idx}
          style={{
            margin: "40px 0",
            padding: "28px 36px",
            background: "rgba(201,168,76,0.04)",
            borderLeft: "2px solid rgba(201,168,76,0.5)",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(18px, 2vw, 24px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "rgba(240,235,226,0.75)",
            lineHeight: 1.6,
            letterSpacing: "0.02em",
          }}
        >
          "{section.text}"
        </blockquote>
      );

    case "tip":
      return (
        <div
          key={idx}
          style={{
            margin: "36px 0",
            padding: "24px 28px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,168,76,0.2)",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "2px" }}>✦</span>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 300,
              color: "rgba(240,235,226,0.65)",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {section.text}
          </p>
        </div>
      );

    default:
      return null;
  }
}

const starField = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: (((i * 9301 + 49297) % 233280) / 233280) * 100,
  y: (((i * 7331 + 23171) % 233280) / 233280) * 100,
  size: 0.4 + (((i * 4517 + 11251) % 233280) / 233280) * 1.2,
  opacity: 0.15 + (((i * 3271 + 8191) % 233280) / 233280) * 0.35,
}));

export default function BlogPostClient({ post, related }: Props) {
  return (
    <main style={{ minHeight: "100vh", background: "#08080f", paddingTop: "100px" }}>
      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {starField.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: "50%",
              background: "#f0ebe2",
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: "48px", display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/blog" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,235,226,0.35)", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,226,0.35)")}
          >
            Blog
          </Link>
          <span style={{ color: "rgba(240,235,226,0.2)", fontSize: "10px" }}>›</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.12em", color: post.accentColor }}>{post.category}</span>
        </nav>

        {/* Hero */}
        <header style={{ marginBottom: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(64px, 10vw, 100px)", lineHeight: 1, marginBottom: "36px" }}>
            {post.image}
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: post.accentColor }}>
              {post.category}
            </span>
            <span style={{ color: "rgba(240,235,226,0.2)" }}>·</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(240,235,226,0.35)" }}>
              {post.readTime} minutos de leitura
            </span>
            <span style={{ color: "rgba(240,235,226,0.2)" }}>·</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(240,235,226,0.35)" }}>
              {formatDate(post.date)}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(30px, 5vw, 52px)",
              fontWeight: 300,
              letterSpacing: "0.04em",
              color: "#f0ebe2",
              lineHeight: 1.2,
              marginBottom: "24px",
            }}
          >
            {post.title}
          </h1>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              fontWeight: 300,
              color: "rgba(240,235,226,0.55)",
              lineHeight: 1.75,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {post.excerpt}
          </p>
        </header>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "48px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          <span style={{ color: "rgba(201,168,76,0.4)", fontSize: "12px" }}>✦</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Content */}
        <article style={{ marginBottom: "80px" }}>
          {post.content.map((section, idx) => renderSection(section, idx))}
        </article>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "64px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {post.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(240,235,226,0.4)",
                padding: "5px 14px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Author byline */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            padding: "28px 32px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: "80px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            ✦
          </div>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 400, color: "#c9a84c", marginBottom: "4px", letterSpacing: "0.05em" }}>
              Caela
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 300, color: "rgba(240,235,226,0.45)", letterSpacing: "0.05em" }}>
              Guardiã dos Mistérios Celestes · Inteligência Esotérica da ASTRALMIA
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link
              href="/quem-e-caela"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(240,235,226,0.4)",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "8px 16px",
                display: "block",
                whiteSpace: "nowrap",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)";
                (e.currentTarget as HTMLElement).style.color = "#c9a84c";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.color = "rgba(240,235,226,0.4)";
              }}
            >
              Conhecer Caela
            </Link>
          </div>
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "64px", paddingBottom: "80px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "12px", textAlign: "center" }}>
              Continue a Explorar
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 300, color: "#f0ebe2", letterSpacing: "0.06em", marginBottom: "48px", textAlign: "center" }}>
              Artigos Relacionados
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none" }}>
                  <article
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      padding: "28px",
                      height: "100%",
                      transition: "border-color 0.3s, transform 0.3s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.2)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ fontSize: "36px", marginBottom: "16px" }}>{p.image}</div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: p.accentColor, display: "block", marginBottom: "10px" }}>
                      {p.category}
                    </span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 400, color: "#f0ebe2", lineHeight: 1.3, marginBottom: "10px" }}>
                      {p.title}
                    </h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(240,235,226,0.45)", lineHeight: 1.7 }}>
                      {p.readTime} min de leitura — {formatDate(p.date)}
                    </p>
                  </article>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "48px" }}>
              <Link
                href="/blog"
                style={{
                  display: "inline-block",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(240,235,226,0.55)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "14px 40px",
                  textDecoration: "none",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)";
                  (e.currentTarget as HTMLElement).style.color = "#c9a84c";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(240,235,226,0.55)";
                }}
              >
                ← Ver Todos os Artigos
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
