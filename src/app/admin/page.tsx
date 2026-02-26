"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_KEY_STORAGE = "astralmia_admin_key";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

interface OrderItem {
  pid: string; vid: string; name: string; image?: string;
  priceEur?: number; retailPrice?: number; qty?: number; quantity?: number;
  subtotal?: number; shippingLabel?: string;
}

interface Order {
  orderRef: string; orderDate: string; status: string;
  stripeSessionId?: string; stripePaymentIntent?: string; amountPaid?: number;
  customer: { name: string; email: string; phone?: string; address: string; city: string; zip: string; country?: string; notes?: string };
  items: OrderItem[]; total: number;
  approvedAt?: string; rejectedAt?: string; rejectReason?: string;
  engineStatus?: { cjOrderId: string | null; status: string; trackingNumber?: string; cjCost?: number } | null;
}

interface EngineHealth {
  status: string; service: string; uptime: number; catalogSize: number;
  totalProducts: number; lastScan: string; cjApiCalls: number;
  subsystems: Record<string, string>;
}

interface DashboardData {
  orders: Order[];
  stats: { totalOrders: number; paidOrders: number; pendingOrders: number; totalRevenue: number; engineOrders: number };
  engineStats: Record<string, unknown> | null;
  engineHealth: EngineHealth | null;
  balance: { balance: number; currency: string } | null;
}

interface FullDashData {
  health: EngineHealth | null;
  orderStats: Record<string, unknown> | null;
  balance: { balance: number } | null;
  catalog: { total: number; categories: string[]; sample: Array<Record<string, unknown>> } | null;
  inventoryStats: Record<string, unknown> | null;
  inventoryAlerts: { alerts: Array<Record<string, unknown>> } | null;
  disputes: Record<string, unknown> | null;
  webhookEvents: { events: Array<Record<string, unknown>>; total: number } | null;
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */

const C = {
  bg: "#07060b", card: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)",
  gold: "#c9a84c", goldDim: "rgba(201,168,76,0.4)", goldBg: "rgba(201,168,76,0.1)",
  text: "#f0ebe2", dim: "rgba(240,235,226,0.5)", faint: "rgba(240,235,226,0.3)",
  green: "#4ade80", red: "#ef4444", blue: "#60a5fa", orange: "#f59e0b", purple: "#a78bfa",
};

const cardStyle: React.CSSProperties = {
  padding: "20px", background: C.card, border: `1px solid ${C.border}`,
};

/* ═══════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════ */

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = {
    PAID: C.green, APPROVED: C.blue, PENDING: C.orange, REJECTED: C.red,
    pending: C.orange, submitted: C.blue, confirmed: C.green, paid: C.green,
    shipped: C.green, failed: C.red, active: C.green, inactive: "#666",
  };
  const color = m[status] || C.dim;
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", fontSize: "9px",
      fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.1em",
      textTransform: "uppercase", background: `${color}15`, color,
      borderRadius: "3px", border: `1px solid ${color}30`,
    }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={cardStyle}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.faint, marginBottom: "8px" }}>{label}</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 600, color }}>{value}</p>
      {sub && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.faint, marginTop: "4px" }}>{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "20px", marginTop: "40px" }}>
      <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "24px", fontWeight: 300, color: C.text, marginBottom: "4px" }}>{title}</h2>
      {sub && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.faint }}>{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

type Tab = "overview" | "orders" | "catalog" | "cj" | "engine";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [orderData, setOrderData] = useState<DashboardData | null>(null);
  const [dashData, setDashData] = useState<FullDashData | null>(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<Record<string, unknown>> | null>(null);
  const [trackInput, setTrackInput] = useState("");
  const [trackResult, setTrackResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => { try { const k = localStorage.getItem(ADMIN_KEY_STORAGE); if (k) { setAdminKey(k); setAuthenticated(true); } } catch { /* noop */ } }, []);

  const headers = useCallback(() => ({ "x-admin-key": adminKey, "Content-Type": "application/json" }), [adminKey]);

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(""), 4000); };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { headers: { "x-admin-key": adminKey } });
      if (res.status === 401) { setAuthenticated(false); setError("Palavra-passe incorrecta"); return; }
      setOrderData(await res.json());
    } catch { setError("Erro ao carregar"); }
  }, [adminKey]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard", { headers: { "x-admin-key": adminKey } });
      if (res.status === 401) { setAuthenticated(false); return; }
      setDashData(await res.json());
    } catch { /* ignore */ }
  }, [adminKey]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchDashboard()]);
    setLoading(false);
    setAuthenticated(true);
    localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
  }, [fetchOrders, fetchDashboard, adminKey]);

  useEffect(() => { if (authenticated && adminKey) { fetchAll(); } }, [authenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!authenticated) return; const i = setInterval(fetchAll, 45000); return () => clearInterval(i); }, [authenticated, fetchAll]);

  async function orderAction(orderRef: string, action: string, reason?: string) {
    setActionLoading(orderRef);
    try {
      const res = await fetch("/api/admin/orders", { method: "POST", headers: headers(), body: JSON.stringify({ action, orderRef, reason }) });
      const r = await res.json();
      notify(r.success ? `✓ ${r.message}` : `✗ ${r.error}`);
      fetchOrders();
    } catch { notify("✗ Erro"); }
    setActionLoading(null);
  }

  async function engineAction(action: string, extra?: Record<string, unknown>) {
    setActionLoading(action);
    try {
      const res = await fetch("/api/admin/dashboard", { method: "POST", headers: headers(), body: JSON.stringify({ action, ...extra }) });
      const r = await res.json();
      notify(r.error ? `✗ ${r.error}` : `✓ ${action} concluído`);
      if (action === "search-products" && r.products) setSearchResults(r.products);
      if (action === "get-tracking") setTrackResult(r);
      fetchAll();
    } catch { notify("✗ Erro"); }
    setActionLoading(null);
  }

  /* ─── LOGIN ─── */
  if (!authenticated) {
    return (
      <main style={{ paddingTop: "72px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: "380px", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: "12px" }}>PAINEL DE ADMINISTRAÇÃO</p>
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "36px", fontWeight: 300, color: C.text }}>ASTRALMIA</h1>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); fetchAll(); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input type="password" placeholder="Palavra-passe" value={adminKey} onChange={(e) => setAdminKey(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", boxSizing: "border-box", background: C.card, border: `1px solid ${C.border}`, color: C.text, fontFamily: "Inter, sans-serif", fontSize: "14px", outline: "none" }} />
            {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.red }}>{error}</p>}
            <button type="submit" style={{ width: "100%", padding: "14px", cursor: "pointer", background: C.goldBg, border: `1px solid ${C.goldDim}`, color: C.gold, fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Entrar
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  /* ─── HELPERS ─── */
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return d; } };
  const fmtUptime = (s: number) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };
  const itemQty = (i: OrderItem) => i.qty || i.quantity || 1;
  const itemPrice = (i: OrderItem) => i.priceEur || i.retailPrice || 0;

  const filteredOrders = (orderData?.orders || []).filter((o) => {
    if (orderFilter === "all") return true;
    if (orderFilter === "paid") return o.status === "PAID" || !!o.stripeSessionId;
    if (orderFilter === "pending") return o.status === "PENDING" && !o.stripeSessionId;
    if (orderFilter === "approved") return o.status === "APPROVED";
    if (orderFilter === "rejected") return o.status === "REJECTED";
    return true;
  });

  const h = dashData?.health;
  const stats = orderData?.stats;

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", background: C.bg }}>
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: "fixed", top: "80px", right: "24px", zIndex: 999, padding: "14px 24px",
              background: notification.startsWith("✓") ? "rgba(74,222,128,0.15)" : "rgba(239,68,68,0.15)",
              border: `1px solid ${notification.startsWith("✓") ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: notification.startsWith("✓") ? C.green : C.red, fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <section style={{ maxWidth: "1440px", margin: "0 auto", padding: "32px 24px 120px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: "6px" }}>PAINEL DE ADMINISTRAÇÃO</p>
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 300, color: C.text }}>Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={fetchAll} disabled={loading} style={{ padding: "8px 16px", cursor: "pointer", background: C.card, border: `1px solid ${C.border}`, color: C.dim, fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em" }}>
              {loading ? "⟳" : "↻ Atualizar"}
            </button>
            <button onClick={() => { localStorage.removeItem(ADMIN_KEY_STORAGE); setAuthenticated(false); setAdminKey(""); }}
              style={{ padding: "8px 16px", cursor: "pointer", background: "none", border: `1px solid ${C.border}`, color: C.faint, fontFamily: "Inter, sans-serif", fontSize: "10px" }}>
              Sair
            </button>
          </div>
        </div>

        {/* ─── TABS ─── */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "32px", flexWrap: "wrap", borderBottom: `1px solid ${C.border}`, paddingBottom: "12px" }}>
          {([
            { key: "overview" as Tab, label: "Visão Geral", icon: "◈" },
            { key: "orders" as Tab, label: "Encomendas", icon: "◉" },
            { key: "catalog" as Tab, label: "Catálogo", icon: "◎" },
            { key: "cj" as Tab, label: "CJ API", icon: "⟐" },
            { key: "engine" as Tab, label: "Engine", icon: "⚙" },
          ]).map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "10px 20px", cursor: "pointer",
              background: tab === key ? C.goldBg : "transparent",
              border: `1px solid ${tab === key ? C.goldDim : "transparent"}`,
              color: tab === key ? C.gold : C.dim,
              fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: tab === key ? 600 : 400,
              letterSpacing: "0.1em", transition: "all 0.2s",
            }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "32px" }}>
              <StatCard label="Receita Total" value={`€${(stats?.totalRevenue || 0).toFixed(2)}`} color={C.green} />
              <StatCard label="Encomendas Pagas" value={String(stats?.paidOrders || 0)} color={C.green} />
              <StatCard label="Pendentes" value={String(stats?.pendingOrders || 0)} color={C.orange} />
              <StatCard label="Total Encomendas" value={String(stats?.totalOrders || 0)} color={C.gold} />
              <StatCard label="Saldo CJ" value={dashData?.balance ? `$${Number(dashData.balance.balance || 0).toFixed(2)}` : "—"} color={dashData?.balance && (dashData.balance.balance || 0) > 10 ? C.green : C.red} sub={dashData?.balance && (dashData.balance.balance || 0) < 10 ? "⚠ Saldo baixo!" : ""} />
              <StatCard label="Catálogo" value={h ? `${h.catalogSize}` : "—"} color={C.blue} sub="produtos activos" />
              <StatCard label="Engine" value={h ? h.status.toUpperCase() : "OFFLINE"} color={h ? C.green : C.red} sub={h ? `Uptime: ${fmtUptime(h.uptime)}` : ""} />
              <StatCard label="CJ API Calls" value={h ? String(h.cjApiCalls) : "—"} color={C.purple} sub={h?.lastScan ? `Último scan: ${fmtDate(h.lastScan)}` : ""} />
            </div>

            {/* Quick actions */}
            <SectionHeader title="Ações Rápidas" sub="Gestão do sistema" />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "32px" }}>
              {[
                { label: "⟳ Sync Encomendas", action: "sync-orders", color: C.blue },
                { label: "⟳ Sync CJ", action: "sync-cj-orders", color: C.blue },
                { label: "▶ Processar Encomendas", action: "process-orders", color: C.green },
                { label: "Scan Catálogo", action: "scan-catalog", color: C.gold },
                { label: "Verificar Inventário", action: "check-inventory", color: C.orange },
                { label: "Ativar Webhooks", action: "enable-webhooks", color: C.purple },
              ].map(({ label, action, color }) => (
                <button key={action} onClick={() => engineAction(action)} disabled={actionLoading === action}
                  style={{ padding: "10px 20px", cursor: "pointer", background: `${color}15`, border: `1px solid ${color}30`,
                    color, fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {actionLoading === action ? "..." : label}
                </button>
              ))}
            </div>

            {/* Subsystems status */}
            {h && (
              <>
                <SectionHeader title="Subsistemas" sub="Estado dos módulos do engine" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "32px" }}>
                  {Object.entries(h.subsystems).map(([name, status]) => (
                    <div key={name} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.text, textTransform: "capitalize" }}>{name}</p>
                      <Badge status={status} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Recent orders */}
            <SectionHeader title="Últimas Encomendas" sub="As 5 mais recentes" />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(orderData?.orders || []).slice(0, 5).map((o) => (
                <div key={o.orderRef} style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "16px", alignItems: "center", cursor: "pointer" }}
                  onClick={() => { setTab("orders"); setSelectedOrder(o.orderRef); }}>
                  <div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: C.text }}>{o.customer.name}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.faint }}>{o.orderRef} · {fmtDate(o.orderDate)}</p>
                  </div>
                  <Badge status={o.status} />
                  {o.engineStatus && <Badge status={o.engineStatus.status} />}
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 500, color: C.gold }}>€{(o.amountPaid || o.total || 0).toFixed(2)}</p>
                </div>
              ))}
              {(orderData?.orders || []).length === 0 && (
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: C.faint, textAlign: "center", padding: "40px 0" }}>Nenhuma encomenda registada</p>
              )}
            </div>

            {/* Inventory alerts */}
            {dashData?.inventoryAlerts?.alerts && dashData.inventoryAlerts.alerts.length > 0 && (
              <>
                <SectionHeader title="⚠ Alertas de Inventário" sub="Produtos com stock baixo" />
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {dashData.inventoryAlerts.alerts.slice(0, 5).map((a, i) => (
                    <div key={i} style={{ ...cardStyle, borderColor: "rgba(245,158,11,0.2)" }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.orange }}>{String(a.message || a.productName || a.pid)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Webhook events */}
            {dashData?.webhookEvents?.events && dashData.webhookEvents.events.length > 0 && (
              <>
                <SectionHeader title="Últimos Webhooks" sub={`${dashData.webhookEvents.total} eventos registados`} />
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {dashData.webhookEvents.events.slice(0, 5).map((e, i) => (
                    <div key={i} style={{ ...cardStyle, padding: "12px 20px" }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.dim }}>
                        <span style={{ color: C.blue }}>{String(e.type || e.event)}</span>
                        {e.timestamp ? <span style={{ color: C.faint }}> · {fmtDate(String(e.timestamp))}</span> : null}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ═══════════════ ORDERS TAB ═══════════════ */}
        {tab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Filters */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {[{ key: "all", label: "Todas" }, { key: "paid", label: "Pagas" }, { key: "pending", label: "Pendentes" }, { key: "approved", label: "✓ Aprovadas" }, { key: "rejected", label: "✗ Rejeitadas" }].map(({ key, label }) => (
                <button key={key} onClick={() => setOrderFilter(key)} style={{
                  padding: "8px 16px", cursor: "pointer",
                  background: orderFilter === key ? C.goldBg : "transparent",
                  border: `1px solid ${orderFilter === key ? C.goldDim : C.border}`,
                  color: orderFilter === key ? C.gold : C.dim,
                  fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase",
                }}>{label}</button>
              ))}
              <div style={{ flex: 1 }} />
              <button onClick={() => orderAction("all", "sync")} disabled={actionLoading === "all"} style={{
                padding: "8px 16px", cursor: "pointer", background: `${C.blue}15`, border: `1px solid ${C.blue}30`,
                color: C.blue, fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em" }}>
                {actionLoading === "all" ? "..." : "⟳ Sync CJ"}
              </button>
            </div>

            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.faint, marginBottom: "16px" }}>
              {filteredOrders.length} encomenda{filteredOrders.length !== 1 ? "s" : ""}
            </p>

            {filteredOrders.length === 0 && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: C.faint, textAlign: "center", padding: "60px 0" }}>Nenhuma encomenda</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <AnimatePresence>
                {filteredOrders.map((order) => {
                  const expanded = selectedOrder === order.orderRef;
                  const isPaid = order.status === "PAID" || !!order.stripeSessionId;
                  return (
                    <motion.div key={order.orderRef} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                      style={{ background: C.card, border: `1px solid ${isPaid ? "rgba(74,222,128,0.15)" : C.border}`, overflow: "hidden" }}>

                      {/* Row */}
                      <div onClick={() => setSelectedOrder(expanded ? null : order.orderRef)}
                        style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: "12px", alignItems: "center", padding: "14px 20px", cursor: "pointer" }}>
                        <div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: C.text, marginBottom: "3px" }}>{order.customer.name}</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.faint }}>{order.orderRef} · {fmtDate(order.orderDate)}</p>
                        </div>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.faint }}>{order.items.length} art.</p>
                        <Badge status={order.status} />
                        {order.engineStatus ? <Badge status={order.engineStatus.status} /> : <span />}
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 500, color: C.gold, minWidth: "80px", textAlign: "right" }}>
                          €{(order.amountPaid || order.total || 0).toFixed(2)}
                        </p>
                      </div>

                      {/* Expanded */}
                      <AnimatePresence>
                        {expanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                            <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}`, paddingTop: "20px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                {/* Customer */}
                                <div>
                                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.faint, marginBottom: "10px" }}>CLIENTE</p>
                                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: C.text, marginBottom: "3px" }}>{order.customer.name}</p>
                                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.dim, marginBottom: "3px" }}>{order.customer.email}</p>
                                  {order.customer.phone && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.dim, marginBottom: "3px" }}>{order.customer.phone}</p>}
                                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.dim }}>{order.customer.address}, {order.customer.zip} {order.customer.city}</p>
                                  {order.customer.notes && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.orange, marginTop: "6px", fontStyle: "italic" }}>Nota: {order.customer.notes}</p>}
                                </div>
                                {/* Payment & CJ */}
                                <div>
                                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.faint, marginBottom: "10px" }}>PAGAMENTO & CJ</p>
                                  {order.stripeSessionId && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.green, marginBottom: "3px" }}>✓ Pago via Stripe</p>}
                                  {order.amountPaid != null && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.dim, marginBottom: "3px" }}>Pago: €{order.amountPaid.toFixed(2)}</p>}
                                  {order.stripePaymentIntent && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.faint, marginBottom: "3px" }}>PI: {order.stripePaymentIntent}</p>}
                                  {order.engineStatus?.cjOrderId && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.blue, marginBottom: "3px" }}>CJ Order: {order.engineStatus.cjOrderId}</p>}
                                  {order.engineStatus?.trackingNumber && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.green, marginBottom: "3px" }}>Tracking: {order.engineStatus.trackingNumber}</p>}
                                  {order.engineStatus?.cjCost != null && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.dim }}>Custo CJ: ${order.engineStatus.cjCost}</p>}
                                  {order.engineStatus && order.amountPaid != null && order.engineStatus.cjCost != null && (
                                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: C.green, marginTop: "8px" }}>
                                      Lucro: €{(order.amountPaid - (order.engineStatus.cjCost || 0)).toFixed(2)}
                                    </p>
                                  )}
                                  {order.approvedAt && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.blue, marginTop: "6px" }}>Aprovada: {fmtDate(order.approvedAt)}</p>}
                                  {order.rejectedAt && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.red, marginTop: "6px" }}>Rejeitada: {fmtDate(order.rejectedAt)} {order.rejectReason ? `— ${order.rejectReason}` : ""}</p>}
                                </div>
                              </div>

                              {/* Items */}
                              <div style={{ marginTop: "16px" }}>
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.faint, marginBottom: "8px" }}>ARTIGOS</p>
                                {order.items.map((item, i) => (
                                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < order.items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                                    <div>
                                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.text }}>{item.name || item.pid}</p>
                                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: C.faint }}>PID: {item.pid} · VID: {item.vid} · x{itemQty(item)}</p>
                                    </div>
                                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: C.gold }}>€{(itemPrice(item) * itemQty(item)).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Actions */}
                              <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                                {(order.status === "PENDING" || order.status === "PAID") && (
                                  <button onClick={() => orderAction(order.orderRef, "approve")} disabled={actionLoading === order.orderRef}
                                    style={{ padding: "9px 20px", cursor: "pointer", background: `${C.green}15`, border: `1px solid ${C.green}30`, color: C.green,
                                      fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                    {actionLoading === order.orderRef ? "..." : "✓ Aprovar & Enviar ao CJ"}
                                  </button>
                                )}
                                {(order.status === "PENDING" || order.status === "PAID") && (
                                  <button onClick={() => { const r = prompt("Motivo (opcional):"); orderAction(order.orderRef, "reject", r || undefined); }}
                                    disabled={actionLoading === order.orderRef}
                                    style={{ padding: "9px 20px", cursor: "pointer", background: `${C.red}15`, border: `1px solid ${C.red}30`, color: C.red,
                                      fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                    ✗ Rejeitar
                                  </button>
                                )}
                                {(order.status === "APPROVED" || order.status === "PAID") && (
                                  <button onClick={() => orderAction(order.orderRef, "resend")} disabled={actionLoading === order.orderRef}
                                    style={{ padding: "9px 20px", cursor: "pointer", background: `${C.blue}15`, border: `1px solid ${C.blue}30`, color: C.blue,
                                      fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
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
          </motion.div>
        )}

        {/* ═══════════════ CATALOG TAB ═══════════════ */}
        {tab === "catalog" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "32px" }}>
              <StatCard label="Produtos no Catálogo" value={String(dashData?.catalog?.total || h?.catalogSize || 0)} color={C.blue} />
              <StatCard label="Categorias" value={String(dashData?.catalog?.categories?.length || 0)} color={C.purple} />
            </div>

            {/* Search */}
            <SectionHeader title="Pesquisar Produtos CJ" sub="Pesquisa directa na API CJ" />
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) engineAction("search-products", { query: searchQuery }); }}
              style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              <input type="text" placeholder="Ex: crystal pendant, moon necklace..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: "12px 16px", background: C.card, border: `1px solid ${C.border}`, color: C.text, fontFamily: "Inter, sans-serif", fontSize: "13px", outline: "none" }} />
              <button type="submit" disabled={actionLoading === "search-products"}
                style={{ padding: "12px 24px", cursor: "pointer", background: C.goldBg, border: `1px solid ${C.goldDim}`, color: C.gold,
                  fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {actionLoading === "search-products" ? "..." : "Pesquisar"}
              </button>
            </form>

            {searchResults && (
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.faint, marginBottom: "12px" }}>{searchResults.length} resultados</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                  {searchResults.slice(0, 20).map((p, i) => (
                    <div key={i} style={cardStyle}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500, color: C.text, marginBottom: "4px" }}>
                        {String(p.productNameEn || p.name || p.pid).slice(0, 60)}
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.gold }}>
                        ${Number(p.sellPrice || p.price || 0).toFixed(2)}
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: C.faint, marginTop: "4px" }}>{String(p.pid || p.productId || "")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan button */}
            <SectionHeader title="Gestão do Catálogo" />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => engineAction("scan-catalog")} disabled={actionLoading === "scan-catalog"}
                style={{ padding: "12px 24px", cursor: "pointer", background: `${C.gold}15`, border: `1px solid ${C.goldDim}`, color: C.gold,
                  fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {actionLoading === "scan-catalog" ? "A scanear..." : "Scan Completo do Catálogo"}
              </button>
            </div>

            {/* Sample products from catalog */}
            {dashData?.catalog?.sample && dashData.catalog.sample.length > 0 && (
              <>
                <SectionHeader title="Amostra do Catálogo" sub="Últimos produtos adicionados" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                  {dashData.catalog.sample.map((p, i) => (
                    <div key={i} style={cardStyle}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500, color: C.text, marginBottom: "4px" }}>
                        {String(p.name || p.productNameEn || "").slice(0, 60)}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.gold }}>€{Number(p.priceEur || p.sellPrice || 0).toFixed(2)}</p>
                        {p.score ? <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: C.faint }}>Score: {String(p.score)}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ═══════════════ CJ API TAB ═══════════════ */}
        {tab === "cj" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "32px" }}>
              <StatCard label="Saldo CJ" value={dashData?.balance ? `$${Number(dashData.balance.balance || 0).toFixed(2)}` : "—"} color={dashData?.balance && (dashData.balance.balance || 0) > 10 ? C.green : C.red} />
              <StatCard label="API Calls" value={h ? String(h.cjApiCalls) : "—"} color={C.purple} />
              <StatCard label="Último Scan" value={h?.lastScan ? fmtDate(h.lastScan) : "—"} color={C.dim} />
            </div>

            {/* Tracking */}
            <SectionHeader title="Rastrear Encomenda" sub="Insere o número de tracking CJ" />
            <form onSubmit={(e) => { e.preventDefault(); if (trackInput.trim()) engineAction("get-tracking", { trackNumber: trackInput }); }}
              style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              <input type="text" placeholder="Número de tracking..." value={trackInput} onChange={(e) => setTrackInput(e.target.value)}
                style={{ flex: 1, padding: "12px 16px", background: C.card, border: `1px solid ${C.border}`, color: C.text, fontFamily: "Inter, sans-serif", fontSize: "13px", outline: "none" }} />
              <button type="submit" disabled={actionLoading === "get-tracking"}
                style={{ padding: "12px 24px", cursor: "pointer", background: `${C.blue}15`, border: `1px solid ${C.blue}30`, color: C.blue,
                  fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {actionLoading === "get-tracking" ? "..." : "Rastrear"}
              </button>
            </form>

            {trackResult && (
              <div style={{ ...cardStyle, marginBottom: "32px" }}>
                <pre style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: C.dim, whiteSpace: "pre-wrap", overflowX: "auto" }}>
                  {JSON.stringify(trackResult, null, 2)}
                </pre>
              </div>
            )}

            {/* CJ Actions */}
            <SectionHeader title="CJ API Actions" sub="Controlo directo da API CJ" />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "32px" }}>
              {[
                { label: "⟳ Sync Encomendas CJ", action: "sync-cj-orders", color: C.blue },
                { label: "▶ Processar Pipeline", action: "process-orders", color: C.green },
                { label: "Ativar Webhooks", action: "enable-webhooks", color: C.purple },
                { label: "Desativar Webhooks", action: "disable-webhooks", color: C.red },
                { label: "⚙ Configurações CJ", action: "get-cj-settings", color: C.gold },
              ].map(({ label, action, color }) => (
                <button key={action} onClick={() => engineAction(action)} disabled={actionLoading === action}
                  style={{ padding: "10px 20px", cursor: "pointer", background: `${color}15`, border: `1px solid ${color}30`, color,
                    fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {actionLoading === action ? "..." : label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ ENGINE TAB ═══════════════ */}
        {tab === "engine" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {h ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "32px" }}>
                  <StatCard label="Serviço" value={h.service} color={C.gold} />
                  <StatCard label="Estado" value={h.status.toUpperCase()} color={C.green} />
                  <StatCard label="Uptime" value={fmtUptime(h.uptime)} color={C.blue} />
                  <StatCard label="Catálogo" value={`${h.catalogSize} produtos`} color={C.purple} />
                  <StatCard label="API Calls" value={String(h.cjApiCalls)} color={C.orange} />
                  <StatCard label="Último Scan" value={h.lastScan ? fmtDate(h.lastScan) : "—"} color={C.dim} />
                </div>

                <SectionHeader title="Subsistemas" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "32px" }}>
                  {Object.entries(h.subsystems).map(([name, status]) => (
                    <div key={name} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: C.text, textTransform: "capitalize" }}>{name}</p>
                      <Badge status={status} />
                    </div>
                  ))}
                </div>

                <SectionHeader title="Controlo do Engine" />
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {[
                    { label: "▶ Processar Ciclo Completo", action: "process-orders", color: C.green },
                    { label: "⟳ Sync Encomendas", action: "sync-orders", color: C.blue },
                    { label: "Scan Catálogo", action: "scan-catalog", color: C.gold },
                    { label: "Check Inventário", action: "check-inventory", color: C.orange },
                    { label: "⚖ Processar Disputas", action: "process-disputes", color: C.red },
                  ].map(({ label, action, color }) => (
                    <button key={action} onClick={() => engineAction(action)} disabled={actionLoading === action}
                      style={{ padding: "12px 24px", cursor: "pointer", background: `${color}15`, border: `1px solid ${color}30`, color,
                        fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {actionLoading === action ? "A processar..." : label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: C.red, marginBottom: "12px" }}>Engine Offline</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.faint }}>O engine não está a responder</p>
              </div>
            )}

            {/* Webhook events in engine tab */}
            {dashData?.webhookEvents?.events && dashData.webhookEvents.events.length > 0 && (
              <>
                <SectionHeader title="Log de Webhooks" sub={`${dashData.webhookEvents.total} eventos`} />
                <div style={{ ...cardStyle, maxHeight: "300px", overflowY: "auto" }}>
                  {dashData.webhookEvents.events.map((e, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.dim }}>
                        <span style={{ color: C.blue, fontWeight: 500 }}>{String(e.type || e.event)}</span>
                        {e.timestamp ? <span style={{ color: C.faint }}> · {fmtDate(String(e.timestamp))}</span> : null}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </section>
    </main>
  );
}
