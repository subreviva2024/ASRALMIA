/**
 * ASTRALMIA — Order Manager
 * Handles order creation, persistence, and status tracking
 */

const fs = require("fs");
const path = require("path");

const ORDERS_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(ORDERS_DIR, "orders.json");

class OrderManager {
  constructor() {
    this.orders = this._loadOrders();
  }

  // ── Create Order ──────────────────────────────────────────────────────────

  create({ customer, items, telegramUserId, telegramUsername }) {
    const orderRef = `AST-${Date.now().toString(36).toUpperCase()}`;
    const orderDate = new Date().toISOString();

    // Recalculate total server-side
    const total = items.reduce((sum, item) => sum + (item.priceEur || 0) * (item.qty || 1), 0);

    const order = {
      orderRef,
      orderDate,
      status: "PENDING",
      customer: {
        name: (customer.name || "").trim(),
        email: (customer.email || "").trim().toLowerCase(),
        phone: (customer.phone || "").trim(),
        address: (customer.address || "").trim(),
        city: (customer.city || "").trim(),
        zip: (customer.zip || "").trim(),
        country: "PT",
        notes: (customer.notes || "").trim(),
      },
      telegram: {
        userId: telegramUserId,
        username: telegramUsername || null,
      },
      items: items.map(item => ({
        pid: item.pid,
        vid: item.vid,
        name: item.name,
        image: item.image,
        priceEur: item.priceEur,
        qty: item.qty || 1,
        subtotal: Math.round((item.priceEur || 0) * (item.qty || 1) * 100) / 100,
        shippingLabel: item.shippingLabel || "",
      })),
      total: Math.round(total * 100) / 100,
      cjOrderId: null,
      trackingNumber: null,
      trackingUrl: null,
      updatedAt: orderDate,
    };

    this.orders.push(order);
    this._save();

    console.log("═══════════════════════════════════════");
    console.log("  NOVA ENCOMENDA ASTRALMIA");
    console.log("═══════════════════════════════════════");
    console.log(`  Ref:     ${orderRef}`);
    console.log(`  Data:    ${orderDate}`);
    console.log(`  Cliente: ${customer.name} <${customer.email}>`);
    console.log(`  Morada:  ${customer.address}, ${customer.zip} ${customer.city}`);
    if (customer.phone) console.log(`  Tel:     ${customer.phone}`);
    if (customer.notes) console.log(`  Notas:   ${customer.notes}`);
    console.log(`  Telegram: @${telegramUsername} (${telegramUserId})`);
    console.log(`  Artigos:`);
    for (const item of order.items) {
      console.log(`    - ${item.name} × ${item.qty} = €${item.subtotal.toFixed(2)}`);
    }
    console.log(`  Total: €${order.total.toFixed(2)}`);
    console.log("═══════════════════════════════════════");

    return order;
  }

  // ── Get Orders ────────────────────────────────────────────────────────────

  getByRef(ref) {
    return this.orders.find(o => o.orderRef === ref) || null;
  }

  getPending() {
    return this.orders.filter(o => o.status === "PENDING");
  }

  getAll() {
    return [...this.orders];
  }

  // ── Update Order ──────────────────────────────────────────────────────────

  updateStatus(ref, status, extra = {}) {
    const order = this.getByRef(ref);
    if (!order) return null;
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (extra.cjOrderId) order.cjOrderId = extra.cjOrderId;
    if (extra.trackingNumber) order.trackingNumber = extra.trackingNumber;
    if (extra.trackingUrl) order.trackingUrl = extra.trackingUrl;
    
    this._save();
    return order;
  }

  // ── Statistics ────────────────────────────────────────────────────────────

  getStats() {
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((s, o) => s + (o.total || 0), 0);
    const pendingOrders = this.orders.filter(o => o.status === "PENDING").length;
    const completedOrders = this.orders.filter(o => o.status === "COMPLETED").length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
    };
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  _loadOrders() {
    try {
      if (!fs.existsSync(ORDERS_DIR)) {
        fs.mkdirSync(ORDERS_DIR, { recursive: true });
      }
      if (fs.existsSync(ORDERS_FILE)) {
        const data = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
        return Array.isArray(data) ? data : [];
      }
    } catch (err) {
      console.error("[OrderManager] Load error:", err.message);
    }
    return [];
  }

  _save() {
    try {
      if (!fs.existsSync(ORDERS_DIR)) {
        fs.mkdirSync(ORDERS_DIR, { recursive: true });
      }
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(this.orders, null, 2));
    } catch (err) {
      console.error("[OrderManager] Save error:", err.message);
    }
  }
}

module.exports = { OrderManager };
