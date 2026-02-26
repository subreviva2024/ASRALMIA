"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

/**
 * Legacy product page — redirects to the main shop.
 * All products are now served from /loja/produto/[pid].
 */
export default function LegacyProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    // Auto-redirect to shop after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/loja");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, id]);

  return (
    <main style={{ paddingTop: "120px", minHeight: "100vh", textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "32px", fontWeight: 300, color: "#f0ebe2", marginBottom: "20px" }}>
        Produto actualizado
      </h1>
      <p style={{ fontFamily: "'Inter'", fontSize: "13px", color: "rgba(240,235,226,0.45)", marginBottom: "24px" }}>
        Este produto foi movido para a nova loja. A redirecionar…
      </p>
      <Link
        href="/loja"
        style={{
          fontFamily: "'Inter'",
          fontSize: "12px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#c9a84c",
          textDecoration: "none",
          borderBottom: "1px solid rgba(201,168,76,0.3)",
          paddingBottom: "2px",
        }}
      >
        Ir para a Loja →
      </Link>
    </main>
  );
}