"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.8 }}
        style={{ textAlign: "center", maxWidth: "560px", padding: "0 24px" }}
      >
        {/* Success icon */}
        <div style={{
          width: "80px", height: "80px", margin: "0 auto 32px",
          borderRadius: "50%", border: "2px solid rgba(201,168,76,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "36px",
        }}>
          ✓
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: "clamp(32px,5vw,48px)", fontWeight: 300,
          color: "#f0ebe2", marginBottom: "20px", lineHeight: 1.2,
        }}>
          Pagamento Confirmado
        </h1>

        <p style={{
          fontFamily: "'Inter'", fontSize: "14px", fontWeight: 300,
          color: "rgba(240,235,226,0.6)", lineHeight: 1.9, marginBottom: "16px",
        }}>
          O seu pagamento foi processado com sucesso.
          A sua encomenda está a ser preparada e será enviada automaticamente.
        </p>

        <p style={{
          fontFamily: "'Inter'", fontSize: "13px", fontWeight: 300,
          color: "rgba(240,235,226,0.45)", lineHeight: 1.8, marginBottom: "12px",
        }}>
          Receberá um email com os detalhes da encomenda e rastreamento.
        </p>

        <p style={{
          fontFamily: "'Inter'", fontSize: "12px", fontWeight: 300,
          color: "rgba(240,235,226,0.3)", lineHeight: 1.8, marginBottom: "40px",
        }}>
          Prazo estimado de entrega: 7-15 dias úteis para Portugal.
        </p>

        {sessionId && (
          <p style={{
            fontFamily: "'Inter'", fontSize: "10px", fontWeight: 500,
            color: "#c9a84c", letterSpacing: "0.1em", marginBottom: "24px",
          }}>
            Ref: {sessionId.slice(-8).toUpperCase()}
          </p>
        )}

        <Link
          href="/loja"
          style={{
            fontFamily: "'Inter'", fontSize: "11px", fontWeight: 500,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#c9a84c", textDecoration: "none",
            borderBottom: "1px solid rgba(201,168,76,0.4)", paddingBottom: "2px",
          }}
        >
          Continuar a Comprar
        </Link>
      </motion.div>
    </main>
  );
}

export default function CheckoutSucessoPage() {
  return (
    <Suspense fallback={
      <main style={{ paddingTop: "72px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Inter'", fontSize: "14px", color: "rgba(240,235,226,0.4)" }}>A carregar...</p>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
