/**
 * ASTRALMIA — Order Manager (Full Lifecycle Automation)
 * 
 * Handles the complete order pipeline:
 * 
 *  ┌────────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
 *  │ NEW ORDER  │ ──► │ CONFIRM  │ ──► │  PAY    │ ──► │ SHIPPED  │
 *  └────────────┘     └──────────┘     └─────────┘     └──────────┘
 *        │                                                   │
 *        ▼                                                   ▼
 *  ┌────────────┐                                     ┌──────────┐
 *  │  CANCEL    │                                     │ TRACKING │
 *  └────────────┘                                     └──────────┘
 *                                                          │
 *                                                          ▼
 *                                                    ┌──────────┐
 *                                                    │ DELIVERED│
 *                                                    └──────────┘
 * 
 * Features:
 * - Auto-create orders from shopping cart
 * - Auto-confirm and pay with balance
 * - Real-time tracking sync
 * - Low balance alerts
 * - Order status history
 * - Failed order retry queue
 * 
 * Runs as a daemon checking every 5 minutes.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const ORDERS_FILE = join(DATA_DIR, "orders.json");
const ORDER_HISTORY_FILE = join(DATA_DIR, "order-history.json");

// ═══════════════════════════════════════════════════════════
// Order Status Flow
// ═══════════════════════════════════════════════════════════

const STATUS = {
  PENDING: "pending",          // Created locally, not yet sent to CJ
  CREATED: "created",          // Created on CJ, awaiting confirmation
  CONFIRMED: "confirmed",      // Confirmed on CJ, ready for payment
  PAID: "paid",                // Paid via CJ balance
  PROCESSING: "processing",    // CJ is processing/sourcing
  SHIPPED: "shipped",          // Shipped, has tracking number
  IN_TRANSIT: "in_transit",    // In transit (tracking updated)
  DELIVERED: "delivered",      // Delivered to customer
  CANCELLED: "cancelled",     // Cancelled
  FAILED: "failed",            // Failed (see error field)
  DISPUTED: "disputed",       // Dispute opened
};

const CJ_STATUS_MAP = {
  "CREATED": STATUS.CREATED,
  "IN_CART": STATUS.PENDING,
  "UNPAID": STATUS.CONFIRMED,
  "UNSHIPPED": STATUS.PAID,
  "SHIPPED": STATUS.SHIPPED,
  "DELIVERED": STATUS.DELIVERED,
  "CANCELLED": STATUS.CANCELLED,
};

// ═══════════════════════════════════════════════════════════
// Order Manager Class
// ═══════════════════════════════════════════════════════════

export class OrderManager {
  #cj;
  #orders = [];
  #history = [];
  #stats = {
    totalOrders: 0,
    totalRevenue: 0,
    totalCost: 0,
    ordersToday: 0,
    failedOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
  };

  constructor(cjClient) {
    this.#cj = cjClient;
    this.load();
  }

  // ── Persistence ────────────────────────────────────────

  load() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    try {
      if (existsSync(ORDERS_FILE)) {
        this.#orders = JSON.parse(readFileSync(ORDERS_FILE, "utf8"));
      }
    } catch { this.#orders = []; }
    try {
      if (existsSync(ORDER_HISTORY_FILE)) {
        this.#history = JSON.parse(readFileSync(ORDER_HISTORY_FILE, "utf8"));
      }
    } catch { this.#history = []; }
  }

  save() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(ORDERS_FILE, JSON.stringify(this.#orders, null, 2));
    this.#history = this.#history.slice(-500);
    writeFileSync(ORDER_HISTORY_FILE, JSON.stringify(this.#history, null, 2));
  }

  #log(orderId, action, data = {}) {
    const entry = {
      ts: new Date().toISOString(),
      orderId,
      action,
      ...data,
    };
    this.#history.push(entry);
    console.log(`[ORDER] ${action}: ${orderId}`, data.error || "");
  }

  // ── Order Getters ──────────────────────────────────────

  getOrders(filter = {}) {
    let orders = [...this.#orders];
    if (filter.status) orders = orders.filter(o => o.status === filter.status);
    if (filter.email) orders = orders.filter(o => o.customer?.email === filter.email);
    if (filter.limit) orders = orders.slice(0, filter.limit);
    return orders;
  }

  getOrder(localId) {
    return this.#orders.find(o => o.localId === localId || o.cjOrderId === localId);
  }

  getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    return {
      total: this.#orders.length,
      pending: this.#orders.filter(o => o.status === STATUS.PENDING).length,
      created: this.#orders.filter(o => o.status === STATUS.CREATED).length,
      confirmed: this.#orders.filter(o => o.status === STATUS.CONFIRMED).length,
      paid: this.#orders.filter(o => o.status === STATUS.PAID).length,
      processing: this.#orders.filter(o => o.status === STATUS.PROCESSING).length,
      shipped: this.#orders.filter(o => o.status === STATUS.SHIPPED).length,
      inTransit: this.#orders.filter(o => o.status === STATUS.IN_TRANSIT).length,
      delivered: this.#orders.filter(o => o.status === STATUS.DELIVERED).length,
      cancelled: this.#orders.filter(o => o.status === STATUS.CANCELLED).length,
      failed: this.#orders.filter(o => o.status === STATUS.FAILED).length,
      disputed: this.#orders.filter(o => o.status === STATUS.DISPUTED).length,
      todayOrders: this.#orders.filter(o => o.createdAt >= todayStart).length,
      totalRevenue: this.#orders
        .filter(o => ![STATUS.CANCELLED, STATUS.FAILED].includes(o.status))
        .reduce((sum, o) => sum + (o.retailPrice || 0), 0),
      totalCost: this.#orders
        .filter(o => ![STATUS.CANCELLED, STATUS.FAILED].includes(o.status))
        .reduce((sum, o) => sum + (o.cjCost || 0), 0),
    };
  }

  getHistory(limit = 50) {
    return this.#history.slice(-limit);
  }

  // ═══════════════════════════════════════════════════════════
  // CREATE ORDER — From customer purchase
  // ═══════════════════════════════════════════════════════════

  /**
   * Create a new order from a store purchase
   * @param {Object} orderData - Order details
   * @param {Object} orderData.customer - { name, email, phone, address }
   * @param {Array}  orderData.items - [{ pid, vid, quantity, retailPrice }]
   * @param {string} orderData.shippingCountry - Country code (default: PT)
   * @param {number} orderData.retailPrice - Total retail price charged to customer
   */
  async createOrder(orderData) {
    const localId = `AST-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    
    const order = {
      localId,
      cjOrderId: null,
      status: STATUS.PENDING,
      customer: orderData.customer,
      items: orderData.items,
      shippingCountry: orderData.shippingCountry || "PT",
      retailPrice: orderData.retailPrice || 0,
      cjCost: 0,
      trackingNumber: null,
      trackingUrl: null,
      trackingHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      error: null,
      retries: 0,
    };

    this.#orders.push(order);
    this.#log(localId, "ORDER_CREATED", { items: order.items.length });

    // Auto-submit to CJ
    try {
      await this.#submitToCJ(order);
    } catch (err) {
      order.error = err.message;
      this.#log(localId, "SUBMIT_FAILED", { error: err.message });
    }

    this.save();
    return order;
  }

  // ── Submit order to CJ ────────────────────────────────

  async #submitToCJ(order) {
    const cjItems = order.items.map(item => ({
      vid: item.vid,
      quantity: item.quantity || 1,
    }));

    const cjOrderData = {
      orderNumber: order.localId,
      shippingZip: order.customer.address?.zip || order.customer.address?.postalCode || "",
      shippingCountryCode: order.shippingCountry,
      shippingCountry: order.shippingCountry,
      shippingProvince: order.customer.address?.province || order.customer.address?.state || "",
      shippingCity: order.customer.address?.city || "",
      shippingAddress: order.customer.address?.line1 || order.customer.address?.address || "",
      shippingAddress2: order.customer.address?.line2 || "",
      shippingCustomerName: order.customer.name || "",
      shippingPhone: order.customer.phone || "",
      remark: `ASTRALMIA Order ${order.localId}`,
      products: cjItems,
    };

    const result = await this.#cj.createOrder(cjOrderData);
    
    if (result?.orderId || result?.orderNum) {
      order.cjOrderId = result.orderId || result.orderNum;
      order.cjCost = parseFloat(result.totalAmount) || 0;
      order.status = STATUS.CREATED;
      order.updatedAt = new Date().toISOString();
      this.#log(order.localId, "CJ_ORDER_CREATED", { cjOrderId: order.cjOrderId });
    } else {
      throw new Error("CJ returned no orderId");
    }
  }

  // ═══════════════════════════════════════════════════════════
  // AUTO-CONFIRM — Batch confirm all created orders
  // ═══════════════════════════════════════════════════════════

  async autoConfirmOrders() {
    const toConfirm = this.#orders.filter(o => o.status === STATUS.CREATED && o.cjOrderId);
    let confirmed = 0;

    for (const order of toConfirm) {
      try {
        await this.#cj.confirmOrder(order.cjOrderId);
        order.status = STATUS.CONFIRMED;
        order.updatedAt = new Date().toISOString();
        confirmed++;
        this.#log(order.localId, "ORDER_CONFIRMED");
      } catch (err) {
        order.error = err.message;
        this.#log(order.localId, "CONFIRM_FAILED", { error: err.message });
      }
    }

    if (confirmed > 0) this.save();
    return confirmed;
  }

  // ═══════════════════════════════════════════════════════════
  // AUTO-PAY — Pay confirmed orders with CJ balance
  // ═══════════════════════════════════════════════════════════

  async autoPayOrders() {
    const toPay = this.#orders.filter(o => o.status === STATUS.CONFIRMED && o.cjOrderId);
    if (toPay.length === 0) return { paid: 0, balance: null };

    // Check balance first
    let balance;
    try {
      balance = await this.#cj.getBalance();
    } catch (err) {
      console.error("[ORDER] Balance check failed:", err.message);
      return { paid: 0, balance: null, error: err.message };
    }

    const availableBalance = parseFloat(balance?.amount || balance?.balance || 0);
    this.#log("SYSTEM", "BALANCE_CHECK", { balance: availableBalance, ordersToPay: toPay.length });

    let paid = 0;
    let totalSpent = 0;

    for (const order of toPay) {
      if (totalSpent + (order.cjCost || 5) > availableBalance) {
        this.#log(order.localId, "PAY_SKIPPED_LOW_BALANCE", {
          needed: order.cjCost,
          available: availableBalance - totalSpent,
        });
        continue;
      }

      try {
        await this.#cj.payBalance(order.cjOrderId);
        order.status = STATUS.PAID;
        order.updatedAt = new Date().toISOString();
        totalSpent += order.cjCost || 0;
        paid++;
        this.#log(order.localId, "ORDER_PAID", { cost: order.cjCost });
      } catch (err) {
        order.error = err.message;
        this.#log(order.localId, "PAY_FAILED", { error: err.message });
      }
    }

    if (paid > 0) this.save();
    return { paid, totalSpent, balance: availableBalance - totalSpent };
  }

  // ═══════════════════════════════════════════════════════════
  // SYNC ORDERS — Pull latest status from CJ
  // ═══════════════════════════════════════════════════════════

  async syncOrderStatuses() {
    const activeOrders = this.#orders.filter(o =>
      ![STATUS.DELIVERED, STATUS.CANCELLED, STATUS.FAILED].includes(o.status) &&
      o.cjOrderId
    );

    let synced = 0;
    let updated = 0;

    for (const order of activeOrders) {
      try {
        const detail = await this.#cj.getOrder(order.cjOrderId);
        if (!detail) continue;
        synced++;

        // Map CJ status to our status
        const cjStatus = detail.orderStatus || detail.status || "";
        const newStatus = CJ_STATUS_MAP[cjStatus] || order.status;

        // Extract tracking info
        if (detail.trackNumber && !order.trackingNumber) {
          order.trackingNumber = detail.trackNumber;
          order.trackingUrl = detail.trackUrl || null;
          if (order.status !== STATUS.SHIPPED) {
            order.status = STATUS.SHIPPED;
            this.#log(order.localId, "ORDER_SHIPPED", { tracking: detail.trackNumber });
          }
        }

        // Update status if changed
        if (newStatus !== order.status && order.status !== STATUS.SHIPPED) {
          const oldStatus = order.status;
          order.status = newStatus;
          this.#log(order.localId, "STATUS_CHANGED", { from: oldStatus, to: newStatus });
          updated++;
        }

        // Update cost if available
        if (detail.productAmount) {
          order.cjCost = parseFloat(detail.productAmount) || order.cjCost;
        }

        order.updatedAt = new Date().toISOString();
      } catch (err) {
        // Don't fail the whole sync for one order
        this.#log(order.localId, "SYNC_ERROR", { error: err.message });
      }
    }

    if (updated > 0) this.save();
    return { synced, updated, total: activeOrders.length };
  }

  // ═══════════════════════════════════════════════════════════
  // TRACKING — Update tracking info for shipped orders
  // ═══════════════════════════════════════════════════════════

  async syncTracking() {
    const shippedOrders = this.#orders.filter(o =>
      [STATUS.SHIPPED, STATUS.IN_TRANSIT].includes(o.status) && o.trackingNumber
    );

    let tracked = 0;
    let delivered = 0;

    for (const order of shippedOrders) {
      try {
        const trackInfo = await this.#cj.trackShipment(order.trackingNumber);
        if (!trackInfo) continue;
        tracked++;

        // Store tracking history
        const events = trackInfo.trackInfoList || trackInfo.details || [];
        if (events.length > 0) {
          order.trackingHistory = events.map(e => ({
            date: e.date || e.acceptTime || "",
            location: e.location || e.acceptAddress || "",
            status: e.status || e.trackContent || "",
          }));
        }

        // Check if delivered
        const isDelivered = events.some(e => {
          const status = (e.status || e.trackContent || "").toLowerCase();
          return status.includes("delivered") || status.includes("entregue") ||
                 status.includes("signed") || status.includes("pickup");
        });

        if (isDelivered && order.status !== STATUS.DELIVERED) {
          order.status = STATUS.DELIVERED;
          order.deliveredAt = new Date().toISOString();
          delivered++;
          this.#log(order.localId, "ORDER_DELIVERED", { tracking: order.trackingNumber });
        } else if (order.status === STATUS.SHIPPED) {
          order.status = STATUS.IN_TRANSIT;
        }

        order.updatedAt = new Date().toISOString();
      } catch (err) {
        this.#log(order.localId, "TRACKING_ERROR", { error: err.message });
      }
    }

    if (delivered > 0 || tracked > 0) this.save();
    return { tracked, delivered, total: shippedOrders.length };
  }

  // ═══════════════════════════════════════════════════════════
  // RETRY — Retry failed order submissions
  // ═══════════════════════════════════════════════════════════

  async retryFailedOrders(maxRetries = 3) {
    const failed = this.#orders.filter(o =>
      o.status === STATUS.PENDING && o.retries < maxRetries
    );

    let retried = 0;

    for (const order of failed) {
      try {
        order.retries++;
        await this.#submitToCJ(order);
        retried++;
      } catch (err) {
        order.error = err.message;
        if (order.retries >= maxRetries) {
          order.status = STATUS.FAILED;
          this.#log(order.localId, "ORDER_PERMANENTLY_FAILED", {
            error: err.message,
            retries: order.retries,
          });
        }
      }
    }

    if (retried > 0 || failed.length > 0) this.save();
    return { retried, remaining: failed.length - retried };
  }

  // ═══════════════════════════════════════════════════════════
  // CANCEL ORDER
  // ═══════════════════════════════════════════════════════════

  async cancelOrder(localId) {
    const order = this.getOrder(localId);
    if (!order) throw new Error(`Order ${localId} not found`);
    
    if ([STATUS.SHIPPED, STATUS.DELIVERED].includes(order.status)) {
      throw new Error(`Cannot cancel order in ${order.status} status`);
    }

    if (order.cjOrderId) {
      try {
        await this.#cj.deleteOrder(order.cjOrderId);
      } catch (err) {
        this.#log(order.localId, "CJ_CANCEL_FAILED", { error: err.message });
        // Still cancel locally
      }
    }

    order.status = STATUS.CANCELLED;
    order.updatedAt = new Date().toISOString();
    this.#log(order.localId, "ORDER_CANCELLED");
    this.save();
    return order;
  }

  // ═══════════════════════════════════════════════════════════
  // CJ ORDER SYNC — Pull all orders from CJ API
  // ═══════════════════════════════════════════════════════════

  async syncFromCJ(params = {}) {
    const { pageNum = 1, pageSize = 50 } = params;
    try {
      const data = await this.#cj.listOrders({ pageNum, pageSize });
      const cjOrders = data?.list || data || [];
      
      let newOrders = 0;
      for (const cjOrder of (Array.isArray(cjOrders) ? cjOrders : [])) {
        const cjId = cjOrder.orderId || cjOrder.orderNum;
        if (!cjId) continue;
        
        // Check if we already have this order
        const existing = this.#orders.find(o => o.cjOrderId === cjId);
        if (existing) continue;

        // New order from CJ (probably created externally)
        const order = {
          localId: `CJ-${cjId}`,
          cjOrderId: cjId,
          status: CJ_STATUS_MAP[cjOrder.orderStatus] || STATUS.CREATED,
          customer: {
            name: cjOrder.shippingCustomerName || "",
            address: {
              line1: cjOrder.shippingAddress || "",
              city: cjOrder.shippingCity || "",
              country: cjOrder.shippingCountryCode || "",
            },
          },
          items: [],
          shippingCountry: cjOrder.shippingCountryCode || "PT",
          retailPrice: 0,
          cjCost: parseFloat(cjOrder.productAmount) || 0,
          trackingNumber: cjOrder.trackNumber || null,
          createdAt: cjOrder.createDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          error: null,
          retries: 0,
        };
        this.#orders.push(order);
        newOrders++;
      }

      if (newOrders > 0) this.save();
      return { total: cjOrders.length, newOrders };
    } catch (err) {
      console.error("[ORDER] CJ sync failed:", err.message);
      return { error: err.message };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // BALANCE CHECK
  // ═══════════════════════════════════════════════════════════

  async checkBalance() {
    try {
      const balance = await this.#cj.getBalance();
      const amount = parseFloat(balance?.amount || balance?.balance || 0);
      this.#log("SYSTEM", "BALANCE_CHECK", { balance: amount });
      
      // Low balance warning
      if (amount < 10) {
        console.warn(`⚠️ [ORDER] LOW BALANCE: $${amount.toFixed(2)}`);
      }
      
      return { balance: amount, currency: balance?.currency || "USD" };
    } catch (err) {
      return { error: err.message };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DAEMON — Auto-process loop
  // ═══════════════════════════════════════════════════════════

  /**
   * Run a full order processing cycle:
   * 1. Retry failed orders
   * 2. Auto-confirm created orders
   * 3. Auto-pay confirmed orders
   * 4. Sync order statuses from CJ
   * 5. Update tracking info
   * 6. Check balance
   */
  async processCycle() {
    console.log(`\n📦 [ORDER] Processing cycle — ${new Date().toISOString()}`);

    const results = {};

    // 1. Retry failed
    results.retry = await this.retryFailedOrders();

    // 2. Auto-confirm
    results.confirmed = await this.autoConfirmOrders();

    // 3. Auto-pay
    results.payment = await this.autoPayOrders();

    // 4. Sync statuses
    results.sync = await this.syncOrderStatuses();

    // 5. Track shipments
    results.tracking = await this.syncTracking();

    // 6. Balance
    results.balance = await this.checkBalance();

    console.log(`📦 [ORDER] Cycle complete:`, JSON.stringify(results, null, 2));
    return results;
  }
}

// ═══════════════════════════════════════════════════════════
// Order Daemon — runs every CHECK_INTERVAL minutes
// ═══════════════════════════════════════════════════════════

const ORDER_CHECK_INTERVAL = parseInt(process.env.ORDER_CHECK_MINUTES || "5", 10) * 60_000;

export async function startOrderDaemon(cjClient) {
  const manager = new OrderManager(cjClient);
  
  console.log("📦 [ORDER] Order Manager daemon started");
  console.log(`   Check interval: every ${ORDER_CHECK_INTERVAL / 60_000} minutes`);

  // Initial cycle
  try {
    await manager.processCycle();
  } catch (err) {
    console.error("📦 [ORDER] Initial cycle failed:", err.message);
  }

  // Scheduled cycles
  setInterval(async () => {
    try {
      await manager.processCycle();
    } catch (err) {
      console.error("📦 [ORDER] Scheduled cycle failed:", err.message);
    }
  }, ORDER_CHECK_INTERVAL);

  return manager;
}

export { STATUS };
export default OrderManager;
