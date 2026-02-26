"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_KEY_STORAGE = "astralmia_admin_key";

interface OrderItem {
  pid: string;
  vid: string;
  name: string;
  image?: string;
  priceEur?: number;
  retailPrice?: number;
  qty?: number;
  quantity?: number;
  subtotal?: number;
  shippingLabel?: string;
}

interface Order {
  orderRef: string;
  orderDate: string;
  status: string;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  amountPaid?: number;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    zip: string;
    country?: string;
    notes?: string;
  };
  items: OrderItem[];
  total: number;
  approvedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
  engineStatus?: {
    cjOrderId: string | null;
    status: string;
    trackingNumber?: string;
    cjCost?: number;
  } | null;
}

interface DashboardData {
  orders: Order[];
  stats: {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    engineOrders: number;
  };
  engineStats: Record<string, unknown> | null;
  engineHealth: {
    status: string;
    service: string;
    uptime: number;
    catalogSize: number;
    cjApiCalls: number;
    subsystems: Record<string, string>;
  } | null;
  balance: { balance: number; currency: string } | null;
}

// Styles
const s = {
  bg: "#07060b",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  gold: "#c9a84c",
  goldDim: "rgba(201,168,76,0.4)",
  text: "#f0ebe2",
  textDim: "rgba(240,235,226,0.5)",
  textFaint: "rgba(240,235,226,0.3)",
  green: "#4ade80",
  red: "#ef4444",
  blue: "#60a5fa",
  orange: "#f59e0b",
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PAID: { bg: "rgba(74,222,128,0.15)", text: s.green },
    APPROVED: { bg: "rgba(96,165,250,0.15)", text: s.blue },
    PENDING: { bg: "rgba(245,158,11,0.15)", text: s.orange },
    REJECTED: { bg: "rgba(239,68,68,0.15)", text: s.red },
    pending: { bg: "rgba(245,158,11,0.15)", text: s.orange },
    submitted: { bg: "rgba(96,165,250,0.15)", text: s.blue },
    confirmed: { bg: "rgba(74,222,128,0.15)", text: s.green },
    paid: { bg: "rgba(74,222,128,0.15)", text: s.green },
    shipped: { bg: "rgba(74,222,128,0.15)", text: s.green },
    failed: { bg: "rgba(239,68,68,0.15)", text: s.red },
  };
  const c = colors[status] || { bg: "rgba(255,255,255,0.08)", text: s.textDim };

  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", fontSize: "10px",
      fontFamily: "'Inter'", fontWeight: 600, letterSpacing: "0.1em",
      textTransform: "uppercase", background: c.bg, color: c.text,
      borderRadius: "3px",
    }}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [notification, setNotification] = useState("");

  // Load saved key
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_KEY_STORAGE);
      if (saved) {
        setAdminKey(saved);
        setAuthenticated(true);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-key": adminKey },
      });
      if (res.status === 401) {
        setAuthenticated(false);
        setError("Palavra-passe incorrecta");
        setLoading(false);
        return;
      }
      const d = await res.json();
      setData(d);
      setAuthenticated(true);
      localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
    } catch {
      setError("Erro ao carregar dados");
    }
    setLoading(false);
  }, [adminKey]);

  useEffect(() => {
    if (authenticated && adminKey) fetchData();
  }, [authenticated, adminKey, fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [authenticated, fetchData]);

  async function handleAction(orderRef: string, action: string, reason?: string) {
    setActionLoading(orderRef);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ action, orderRef, reason }),
      });
      const result = await res.json();
      if (result.success) {
        setNotification(`✓ ${result.message}`);
        setTimeout(() => setNotification(""), 3000);
        fetchData();
      } else {
        setNotification(`✗ ${result.error || "Erro"}`);
        setTimeout(() => setNotification(""), 4000);
      }
    } catch {
      setNotification("✗ Erro de ligação");
      setTimeout(() => setNotification(""), 3000);
    }
    setActionLoading(null);
  }

  async function handleSync() {
    setActionLoading("sync");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ action: "sync", orderRef: "all" }),
      });
      const result = await res.json();
      setNotification(result.success ? "✓ Sincronização concluída" : `✗ ${result.error}`);
      setTimeout(() => setNotification(""), 3000);
      fetchData();
    } catch {
      setNotification("✗ Erro de ligação");
      setTimeout(() => setNotification(""), 3000);
    }
    setActionLoading(null);
  }

  // Login screen
  if (!authenticated) {
    return (
      <main style={{ paddingTop: "72px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: s.bg }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", maxWidth: "380px", padding: "0 24px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: s.gold, marginBottom: "12px" }}>
              PAINEL DE ADMINISTRAÇÃO
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "36px", fontWeight: 300, color: s.text }}>
              ASTRALMIA
            </h1>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setAuthenticated(true); fetchData(); }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="password"
              placeholder="Palavra-passe"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px", boxSizing: "border-box",
                background: s.card, border: `1px solid ${s.border}`, color: s.text,
                fontFamily: "'Inter'", fontSize: "14px", outline: "none",
              }}
            />
            {error && (
              <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.red }}>{error}</p>
            )}
            <button type="submit" style={{
              width: "100%", padding: "14px", cursor: "pointer",
              background: "rgba(201,168,76,0.12)", border: `1px solid ${s.goldDim}`,
              color: s.gold, fontFamily: "'Inter'", fontSize: "11px",
              fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase",
            }}>
              Entrar
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  const filteredOrders = data?.orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "paid") return o.status === "PAID" || o.stripeSessionId;
    if (filter === "pending") return o.status === "PENDING" && !o.stripeSessionId;
    if (filter === "approved") return o.status === "APPROVED";
    if (filter === "rejected") return o.status === "REJECTED";
    return true;
  }) || [];

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  };

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", background: s.bg }}>
      <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 24px 120px" }}>

        {/* Notification toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: "fixed", top: "80px", right: "24px", zIndex: 999,
                padding: "14px 24px", background: notification.startsWith("✓") ? "rgba(74,222,128,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${notification.startsWith("✓") ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: notification.startsWith("✓") ? s.green : s.red,
                fontFamily: "'Inter'", fontSize: "13px", fontWeight: 500,
              }}
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: s.gold, marginBottom: "8px" }}>
              PAINEL DE ADMINISTRAÇÃO
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 300, color: s.text, lineHeight: 1.1 }}>
              Dashboard
            </h1>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={fetchData} disabled={loading}
              style={{
                padding: "10px 20px", cursor: "pointer",
                background: s.card, border: `1px solid ${s.border}`,
                color: s.textDim, fontFamily: "'Inter'", fontSize: "11px",
                letterSpacing: "0.1em",
              }}>
              {loading ? "..." : "↻ Atualizar"}
            </button>
            <button onClick={handleSync} disabled={actionLoading === "sync"}
              style={{
                padding: "10px 20px", cursor: "pointer",
                background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)",
                color: s.blue, fontFamily: "'Inter'", fontSize: "11px",
                letterSpacing: "0.1em",
              }}>
              {actionLoading === "sync" ? "..." : "⟳ Sync CJ"}
            </button>
            <button onClick={() => { localStorage.removeItem(ADMIN_KEY_STORAGE); setAuthenticated(false); setAdminKey(""); }}
              style={{
                padding: "10px 16px", cursor: "pointer",
                background: "none", border: `1px solid ${s.border}`,
                color: s.textFaint, fontFamily: "'Inter'", fontSize: "11px",
              }}>
              Sair
            </button>
          </div>
        </div>

        {/* Stats cards */}
        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "40px" }}>
            {[
              { label: "Receita Total", value: `€${data.stats.totalRevenue.toFixed(2)}`, color: s.green },
              { label: "Encomendas Pagas", value: String(data.stats.paidOrders), color: s.green },
              { label: "Pendentes", value: String(data.stats.pendingOrders), color: s.orange },
              { label: "Total Encomendas", value: String(data.stats.totalOrders), color: s.gold },
              { label: "No CJ Engine", value: String(data.stats.engineOrders), color: s.blue },
              { label: "Catálogo", value: data.engineHealth ? `${data.engineHealth.catalogSize} produtos` : "—", color: s.textDim },
              { label: "Engine", value: data.engineHealth ? `${data.engineHealth.status.toUpperCase()} · ${formatUptime(data.engineHealth.uptime)}` : "Offline", color: data.engineHealth ? s.green : s.red },
              { label: "CJ API Calls", value: data.engineHealth ? String(data.engineHealth.cjApiCalls) : "—", color: s.textDim },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: "20px", background: s.card, border: `1px solid ${s.border}`,
              }}>
                <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: s.textFaint, marginBottom: "8px" }}>{label}</p>
                <p style={{ fontFamily: "'Inter'", fontSize: "20px", fontWeight: 500, color }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "Todas" },
            { key: "paid", label: "Pagas" },
            { key: "pending", label: "Pendentes" },
            { key: "approved", label: "Aprovadas" },
            { key: "rejected", label: "Rejeitadas" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                padding: "8px 16px", cursor: "pointer",
                background: filter === key ? "rgba(201,168,76,0.12)" : "transparent",
                border: `1px solid ${filter === key ? s.goldDim : s.border}`,
                color: filter === key ? s.gold : s.textDim,
                fontFamily: "'Inter'", fontSize: "10px", fontWeight: 500,
                letterSpacing: "0.15em", textTransform: "uppercase",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading && !data && (
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", color: s.textDim, textAlign: "center", padding: "60px 0" }}>
            A carregar...
          </p>
        )}

        {data && filteredOrders.length === 0 && (
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", color: s.textFaint, textAlign: "center", padding: "60px 0" }}>
            Nenhuma encomenda encontrada
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const isExpanded = selectedOrder === order.orderRef;
              const isPaid = order.status === "PAID" || !!order.stripeSessionId;
              const itemQty = (item: OrderItem) => item.qty || item.quantity || 1;
              const itemPrice = (item: OrderItem) => item.priceEur || item.retailPrice || 0;

              return (
                <motion.div
                  key={order.orderRef}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{
                    background: s.card,
                    border: `1px solid ${isPaid ? "rgba(74,222,128,0.15)" : s.border}`,
                    overflow: "hidden",
                  }}
                >
                  {/* Order row */}
                  <div
                    onClick={() => setSelectedOrder(isExpanded ? null : order.orderRef)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto auto auto",
                      gap: "16px",
                      alignItems: "center",
                      padding: "16px 20px",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "'Inter'", fontSize: "13px", fontWeight: 500, color: s.text, marginBottom: "4px" }}>
                        {order.customer.name}
                      </p>
                      <p style={{ fontFamily: "'Inter'", fontSize: "10px", color: s.textFaint }}>
                        {order.orderRef} · {formatDate(order.orderDate)}
                      </p>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontFamily: "'Inter'", fontSize: "10px", color: s.textFaint, marginBottom: "2px" }}>
                        {order.items.length} artigo{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div>
                      <StatusBadge status={order.status} />
                    </div>

                    {order.engineStatus && (
                      <StatusBadge status={order.engineStatus.status} />
                    )}

                    <p style={{ fontFamily: "'Inter'", fontSize: "16px", fontWeight: 500, color: s.gold, minWidth: "80px", textAlign: "right" }}>
                      €{(order.amountPaid || order.total || 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${s.border}`, paddingTop: "20px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            {/* Customer info */}
                            <div>
                              <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: s.textFaint, marginBottom: "12px" }}>CLIENTE</p>
                              <p style={{ fontFamily: "'Inter'", fontSize: "13px", color: s.text, marginBottom: "4px" }}>{order.customer.name}</p>
                              <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.textDim, marginBottom: "4px" }}>{order.customer.email}</p>
                              {order.customer.phone && <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.textDim, marginBottom: "4px" }}>{order.customer.phone}</p>}
                              <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.textDim, marginBottom: "2px" }}>{order.customer.address}</p>
                              <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.textDim }}>{order.customer.zip} {order.customer.city}</p>
                              {order.customer.notes && (
                                <p style={{ fontFamily: "'Inter'", fontSize: "11px", color: s.orange, marginTop: "8px", fontStyle: "italic" }}>
                                  Nota: {order.customer.notes}
                                </p>
                              )}
                            </div>

                            {/* Payment & CJ info */}
                            <div>
                              <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: s.textFaint, marginBottom: "12px" }}>PAGAMENTO & ENVIO</p>
                              {order.stripeSessionId && (
                                <p style={{ fontFamily: "'Inter'", fontSize: "11px", color: s.green, marginBottom: "4px" }}>
                                  ✓ Pago via Stripe
                                </p>
                              )}
                              {order.amountPaid && (
                                <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.textDim, marginBottom: "4px" }}>
                                  Valor pago: €{order.amountPaid.toFixed(2)}
                                </p>
                              )}
                              {order.engineStatus?.cjOrderId && (
                                <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.blue, marginBottom: "4px" }}>
                                  CJ Order: {order.engineStatus.cjOrderId}
                                </p>
                              )}
                              {order.engineStatus?.trackingNumber && (
                                <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.green, marginBottom: "4px" }}>
                                  Tracking: {order.engineStatus.trackingNumber}
                                </p>
                              )}
                              {order.engineStatus?.cjCost && (
                                <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.textDim, marginBottom: "4px" }}>
                                  Custo CJ: ${order.engineStatus.cjCost}
                                </p>
                              )}
                              {order.approvedAt && (
                                <p style={{ fontFamily: "'Inter'", fontSize: "11px", color: s.blue, marginTop: "8px" }}>
                                  Aprovada: {formatDate(order.approvedAt)}
                                </p>
                              )}
                              {order.rejectedAt && (
                                <>
                                  <p style={{ fontFamily: "'Inter'", fontSize: "11px", color: s.red, marginTop: "8px" }}>
                                    Rejeitada: {formatDate(order.rejectedAt)}
                                  </p>
                                  {order.rejectReason && (
                                    <p style={{ fontFamily: "'Inter'", fontSize: "11px", color: s.textDim }}>
                                      Motivo: {order.rejectReason}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Items */}
                          <div style={{ marginTop: "20px" }}>
                            <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: s.textFaint, marginBottom: "10px" }}>ARTIGOS</p>
                            {order.items.map((item, i) => (
                              <div key={i} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "8px 0", borderBottom: i < order.items.length - 1 ? `1px solid ${s.border}` : "none",
                              }}>
                                <div>
                                  <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.text }}>
                                    {item.name || `${item.pid}`}
                                  </p>
                                  <p style={{ fontFamily: "'Inter'", fontSize: "10px", color: s.textFaint }}>
                                    PID: {item.pid} · VID: {item.vid} · Qty: {itemQty(item)}
                                  </p>
                                </div>
                                <p style={{ fontFamily: "'Inter'", fontSize: "13px", color: s.gold }}>
                                  €{(itemPrice(item) * itemQty(item)).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
                            {(order.status === "PENDING" || order.status === "PAID") && (
                              <button
                                onClick={() => handleAction(order.orderRef, "approve")}
                                disabled={actionLoading === order.orderRef}
                                style={{
                                  padding: "10px 24px", cursor: "pointer",
                                  background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)",
                                  color: s.green, fontFamily: "'Inter'", fontSize: "10px",
                                  fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
                                }}>
                                {actionLoading === order.orderRef ? "..." : "✓ Aprovar & Enviar ao CJ"}
                              </button>
                            )}

                            {(order.status === "PENDING" || order.status === "PAID") && (
                              <button
                                onClick={() => {
                                  const reason = prompt("Motivo da rejeição (opcional):");
                                  handleAction(order.orderRef, "reject", reason || undefined);
                                }}
                                disabled={actionLoading === order.orderRef}
                                style={{
                                  padding: "10px 24px", cursor: "pointer",
                                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                                  color: s.red, fontFamily: "'Inter'", fontSize: "10px",
                                  fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
                                }}>
                                ✗ Rejeitar
                              </button>
                            )}

                            {(order.status === "APPROVED" || order.status === "PAID") && (
                              <button
                                onClick={() => handleAction(order.orderRef, "resend")}
                                disabled={actionLoading === order.orderRef}
                                style={{
                                  padding: "10px 24px", cursor: "pointer",
                                  background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)",
                                  color: s.blue, fontFamily: "'Inter'", fontSize: "10px",
                                  fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
                                }}>
                                ↻ Reenviar ao CJ
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Engine subsystems */}
        {data?.engineHealth && (
          <div style={{ marginTop: "48px" }}>
            <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: s.textFaint, marginBottom: "16px" }}>
              SUBSISTEMAS DO ENGINE
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
              {Object.entries(data.engineHealth.subsystems).map(([name, status]) => (
                <div key={name} style={{
                  padding: "16px", background: s.card, border: `1px solid ${s.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <p style={{ fontFamily: "'Inter'", fontSize: "12px", color: s.text, textTransform: "capitalize" }}>{name}</p>
                  <span style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: status === "active" ? s.green : s.red,
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
