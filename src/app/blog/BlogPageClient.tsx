"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/data/blogPosts";

interface Props {
  posts: BlogPost[];
  categories: { label: string; slug: string }[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

const starField = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: (((i * 9301 + 49297) % 233280) / 233280) * 100,
  y: (((i * 7331 + 23171) % 233280) / 233280) * 100,
  size: 0.4 + (((i * 4517 + 11251) % 233280) / 233280) * 1.4,
  opacity: 0.2 + (((i * 3271 + 8191) % 233280) / 233280) * 0.5,
}));

export default function BlogPageClient({ posts, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === "todos" || p.categorySlug === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

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

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "20px" }}>
            Sabedoria Ancestral
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(42px, 6vw, 72px)", fontWeight: 300, letterSpacing: "0.1em", color: "#f0ebe2", lineHeight: 1.1, marginBottom: "20px" }}>
            Blog Esotérico
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 300, color: "rgba(240,235,226,0.55)", maxWidth: "520px", margin: "0 auto 40px" }}>
            Artigos sobre astrologia, cristais, tarot, rituais e espiritualidade — escritos com profundidade e intenção.
          </p>

          {/* Search */}
          <div style={{ maxWidth: "380px", margin: "0 auto" }}>
            <input
              type="text"
              placeholder="Pesquisar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "12px 20px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "#f0ebe2",
                outline: "none",
                letterSpacing: "0.02em",
              }}
            />
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "60px" }}>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "8px 20px",
                border: "1px solid",
                borderColor: activeCategory === cat.slug ? "#c9a84c" : "rgba(255,255,255,0.1)",
                background: activeCategory === cat.slug ? "rgba(201,168,76,0.1)" : "transparent",
                color: activeCategory === cat.slug ? "#c9a84c" : "rgba(240,235,226,0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(240,235,226,0.35)", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 300 }}>
            Nenhum artigo encontrado.
          </div>
        )}

        {/* Featured article */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: "64px" }}>
            <article
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                padding: "clamp(32px, 5vw, 64px)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "48px",
                alignItems: "center",
                transition: "border-color 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
              className="featured-article"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(80px, 12vw, 140px)", lineHeight: 1 }}>
                {featured.image}
              </div>
              <div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: featured.accentColor }}>
                    {featured.category}
                  </span>
                  <span style={{ color: "rgba(240,235,226,0.2)", fontSize: "10px" }}>·</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(240,235,226,0.35)", letterSpacing: "0.05em" }}>
                    {featured.readTime} min de leitura
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(240,235,226,0.2)", padding: "3px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    Destaque
                  </span>
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 300, letterSpacing: "0.02em", color: "#f0ebe2", lineHeight: 1.25, marginBottom: "16px" }}>
                  {featured.title}
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 300, color: "rgba(240,235,226,0.55)", lineHeight: 1.8, marginBottom: "28px" }}>
                  {featured.excerpt}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c" }}>
                    Ler Artigo
                  </span>
                  <span style={{ color: "#c9a84c", fontSize: "14px" }}>→</span>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Article Grid */}
        {rest.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", marginBottom: "80px" }}>
            {rest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <article
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    padding: "32px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.3s ease, transform 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.2)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Emoji visual */}
                  <div style={{ fontSize: "48px", marginBottom: "24px", lineHeight: 1 }}>{post.image}</div>

                  {/* Category + read time */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: post.accentColor }}>
                      {post.category}
                    </span>
                    <span style={{ color: "rgba(240,235,226,0.2)" }}>·</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(240,235,226,0.35)" }}>
                      {post.readTime} min
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 400, color: "#f0ebe2", lineHeight: 1.3, marginBottom: "12px", letterSpacing: "0.01em" }}>
                    {post.title}
                  </h3>

                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(240,235,226,0.5)", lineHeight: 1.8, flexGrow: 1, marginBottom: "24px" }}>
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "0.12em", color: "rgba(240,235,226,0.35)", padding: "3px 8px", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(240,235,226,0.3)" }}>
                      {formatDate(post.date)}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c" }}>
                      Ler →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "64px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 300, color: "rgba(240,235,226,0.6)", letterSpacing: "0.05em", marginBottom: "24px" }}>
            Quer uma leitura pessoal?
          </p>
          <Link
            href="/caela"
            style={{ display: "inline-block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#08080f", background: "#c9a84c", padding: "14px 40px", textDecoration: "none", transition: "opacity 0.3s ease" }}
          >
            Consultar Caela
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .featured-article {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
