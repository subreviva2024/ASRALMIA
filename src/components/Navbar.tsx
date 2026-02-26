"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const links = [
  { label: "Loja", href: "/loja" },
  { label: "Mapa Astral", href: "/mapa-astral" },
  { label: "Compatibilidade", href: "/compatibilidade" },
  { label: "Quiz Lunar ☽", href: "/quiz-lunar" },
  { label: "Tarot", href: "/tarot" },
  { label: "Caela", href: "/caela" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "background 0.4s ease, border-color 0.4s ease",
          background: scrolled ? "rgba(8,8,15,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>
          {/* Nav links left */}
          <nav style={{ display: "flex", gap: "36px", alignItems: "center" }} className="hidden md:flex">
            {links.slice(0, 3).map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: pathname === l.href ? "#c9a84c" : "rgba(240,235,226,0.6)",
                  transition: "color 0.3s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={e => { if (pathname !== l.href) (e.target as HTMLElement).style.color = "#f0ebe2"; }}
                onMouseLeave={e => { if (pathname !== l.href) (e.target as HTMLElement).style.color = "rgba(240,235,226,0.6)"; }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Brand centre */}
          <Link
            href="/"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "22px",
              fontWeight: 300,
              letterSpacing: "0.35em",
              color: "#f0ebe2",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            ASTRALMIA
          </Link>

          {/* Nav links right */}
          <nav style={{ display: "flex", gap: "36px", alignItems: "center" }} className="hidden md:flex">
            {links.slice(3).map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: pathname === l.href ? "#c9a84c" : "rgba(240,235,226,0.6)",
                  transition: "color 0.3s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={e => { if (pathname !== l.href) (e.target as HTMLElement).style.color = "#f0ebe2"; }}
                onMouseLeave={e => { if (pathname !== l.href) (e.target as HTMLElement).style.color = "rgba(240,235,226,0.6)"; }}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/loja" className="btn-primary" style={{ padding: "9px 24px", fontSize: "10px" }}>
              Entrar
            </Link>
            {/* Cart icon */}
            <Link
              href="/carrinho"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                color: count > 0 ? "#c9a84c" : "rgba(240,235,226,0.5)",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe2")}
              onMouseLeave={e => (e.currentTarget.style.color = count > 0 ? "#c9a84c" : "rgba(240,235,226,0.5)")}
              aria-label={`Carrinho (${count})`}
            >
              {/* Bag icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && (
                <span style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#c9a84c",
                  color: "#08080f",
                  fontFamily: "'Inter'",
                  fontSize: "9px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}>
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#f0ebe2", marginLeft: "auto" }}
            aria-label="Menu"
          >
            <span style={{ display: "block", width: "22px", height: "1px", background: "currentColor", marginBottom: "6px", transition: "transform 0.3s", transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ display: "block", width: "22px", height: "1px", background: "currentColor", marginBottom: "6px", opacity: open ? 0 : 1, transition: "opacity 0.3s" }} />
            <span style={{ display: "block", width: "22px", height: "1px", background: "currentColor", transition: "transform 0.3s", transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(8,8,15,0.98)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "36px" }}>
          <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "rgba(240,235,226,0.5)", fontSize: "24px", cursor: "pointer" }}>✕</button>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 300, letterSpacing: "0.2em", color: pathname === l.href ? "#c9a84c" : "#f0ebe2", textDecoration: "none" }}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/quem-e-caela" onClick={() => setOpen(false)} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 300, letterSpacing: "0.2em", color: "rgba(240,235,226,0.45)", textDecoration: "none" }}>
            Caela
          </Link>
        </div>
      )}
    </>
  );
}