"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface OrderForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  notes: string;
}

const emptyForm: OrderForm = {
  name: "", email: "", phone: "", address: "", city: "", zip: "", notes: "",
};

export default function CarrinhoPage() {
  const { items, removeItem, updateQty, total, count, clear } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items, total }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Erro ao processar encomenda. Tente novamente.");
        setSubmitting(false);
        return;
      }
      setOrderRef(data.orderRef || "");
      setSubmitting(false);
      setSuccess(true);
      clear();
    } catch {
      setError("Erro de ligação. Verifique a sua internet e tente novamente.");
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main style={{ paddingTop: "72px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", maxWidth: "520px", padding: "0 24px" }}
        >
          <div style={{ fontSize: "48px", marginBottom: "32px" }}>✦</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(32px,5vw,48px)", fontWeight: 300, color: "#f0ebe2", marginBottom: "20px", lineHeight: 1.2 }}>
            Encomenda Recebida
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 300, color: "rgba(240,235,226,0.55)", lineHeight: 1.9, marginBottom: "40px" }}>
            A sua encomenda foi registada com sucesso. Entraremos em contacto em até 2 horas para confirmar os detalhes e o pagamento.
          </p>
          <Link
            href="/loja"
            style={{
              fontFamily: "'Inter'", fontSize: "11px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#c9a84c", textDecoration: "none", borderBottom: "1px solid rgba(201,168,76,0.4)", paddingBottom: "2px",
            }}
          >
            Continuar a Comprar
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px 120px" }}>
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.6 }} style={{ marginBottom: "60px" }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "12px" }}>
            {count} {count === 1 ? "artigo" : "artigos"}
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(40px,6vw,64px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.1 }}>
            Carrinho
          </h1>
        </motion.div>

        {/* Empty state */}
        {items.length === 0 && (
          <motion.div variants={fade} initial="hidden" animate="show" style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "28px", fontWeight: 300, color: "rgba(240,235,226,0.3)", marginBottom: "32px" }}>
              O seu carrinho está vazio
            </p>
            <Link href="/loja" style={{
              fontFamily: "'Inter'", fontSize: "11px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#c9a84c", textDecoration: "none", borderBottom: "1px solid rgba(201,168,76,0.35)", paddingBottom: "2px",
            }}>
              Explorar a Loja →
            </Link>
          </motion.div>
        )}

        {items.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr min(380px,40%)", gap: "60px", alignItems: "start" }}>
            {/* Items list */}
            <div>
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={`${item.pid}-${item.vid}`}
                    variants={fade}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      gap: "20px",
                      padding: "24px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      alignItems: "center",
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", width: "80px", height: "80px", background: "#0a0a12", overflow: "hidden", flexShrink: 0 }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="80px" style={{ objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#0e0a1a,#1a1030)" }} />
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "6px" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "18px", fontWeight: 400, color: "#f0ebe2", lineHeight: 1.3 }}>
                          {item.name.length > 50 ? item.name.slice(0, 50) + "…" : item.name}
                        </p>
                        <button
                          onClick={() => removeItem(item.pid, item.vid)}
                          style={{ background: "none", border: "none", color: "rgba(240,235,226,0.25)", cursor: "pointer", fontSize: "16px", flexShrink: 0, padding: "0", transition: "color 0.2s ease" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "rgba(240,235,226,0.8)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,226,0.25)")}
                          aria-label="Remover"
                        >
                          ×
                        </button>
                      </div>

                      <p style={{ fontFamily: "'Inter'", fontSize: "10px", color: "rgba(240,235,226,0.35)", letterSpacing: "0.1em", marginBottom: "12px" }}>
                        {item.shippingLabel}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {/* Qty controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px" }}>
                          <button
                            onClick={() => updateQty(item.pid, item.vid, item.qty - 1)}
                            style={{ background: "none", border: "none", color: "rgba(240,235,226,0.5)", cursor: "pointer", fontSize: "16px", padding: "0", lineHeight: 1 }}
                          >
                            −
                          </button>
                          <span style={{ fontFamily: "'Inter'", fontSize: "12px", color: "#f0ebe2", minWidth: "16px", textAlign: "center" }}>
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.pid, item.vid, item.qty + 1)}
                            style={{ background: "none", border: "none", color: "rgba(240,235,226,0.5)", cursor: "pointer", fontSize: "16px", padding: "0", lineHeight: 1 }}
                          >
                            +
                          </button>
                        </div>

                        <p style={{ fontFamily: "'Inter'", fontSize: "15px", fontWeight: 400, color: "#c9a84c" }}>
                          € {(item.priceEur * item.qty).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order summary + checkout */}
            <div style={{ position: "sticky", top: "96px" }}>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "32px" }}>
                <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "24px" }}>
                  Resumo
                </p>

                {/* Line items */}
                {items.map((item) => (
                  <div key={`${item.pid}-${item.vid}`} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: "rgba(240,235,226,0.5)" }}>
                      {item.name.length > 28 ? item.name.slice(0, 28) + "…" : item.name} × {item.qty}
                    </p>
                    <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: "rgba(240,235,226,0.7)" }}>
                      € {(item.priceEur * item.qty).toFixed(2)}
                    </p>
                  </div>
                ))}

                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "20px 0" }} />

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "20px", fontWeight: 300, color: "#f0ebe2" }}>Total</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: "22px", fontWeight: 400, color: "#c9a84c" }}>
                    € {total.toFixed(2).replace(".", ",")}
                  </p>
                </div>

                {!showForm ? (
                  <button
                    onClick={() => setShowForm(true)}
                    style={{
                      width: "100%", padding: "16px", cursor: "pointer", transition: "all 0.3s ease",
                      background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.4)", color: "#c9a84c",
                      fontFamily: "'Inter'", fontSize: "11px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.12)"; }}
                  >
                    Finalizar Encomenda
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {[
                      { key: "name", label: "Nome Completo", type: "text", required: true },
                      { key: "email", label: "Email", type: "email", required: true },
                      { key: "phone", label: "Telemóvel", type: "tel", required: false },
                      { key: "address", label: "Morada", type: "text", required: true },
                      { key: "city", label: "Cidade", type: "text", required: true },
                      { key: "zip", label: "Código Postal", type: "text", required: true },
                    ].map(({ key, label, type, required }) => (
                      <div key={key}>
                        <label style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,226,0.4)", display: "block", marginBottom: "6px" }}>
                          {label}{required && " *"}
                        </label>
                        <input
                          type={type}
                          required={required}
                          value={form[key as keyof OrderForm]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          style={{
                            width: "100%", padding: "10px 14px", boxSizing: "border-box",
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#f0ebe2", fontFamily: "'Inter'", fontSize: "13px",
                            outline: "none", transition: "border-color 0.2s ease",
                          }}
                          onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,226,0.4)", display: "block", marginBottom: "6px" }}>
                        Observações
                      </label>
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        style={{
                          width: "100%", padding: "10px 14px", boxSizing: "border-box", resize: "vertical",
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                          color: "#f0ebe2", fontFamily: "'Inter'", fontSize: "13px",
                          outline: "none", transition: "border-color 0.2s ease",
                        }}
                        onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: "100%", padding: "16px", cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.3s ease",
                        background: submitting ? "rgba(201,168,76,0.06)" : "rgba(201,168,76,0.12)",
                        border: "1px solid rgba(201,168,76,0.4)", color: "#c9a84c",
                        fontFamily: "'Inter'", fontSize: "11px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase",
                        marginTop: "4px",
                      }}
                    >
                      {submitting ? "A enviar..." : "Confirmar Encomenda"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
                        color: "rgba(240,235,226,0.3)", textAlign: "center", transition: "color 0.2s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(240,235,226,0.6)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,226,0.3)")}
                    >
                      Cancelar
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
