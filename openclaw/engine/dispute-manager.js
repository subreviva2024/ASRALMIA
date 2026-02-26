/**
 * ASTRALMIA — Dispute Manager (Automated Dispute Handling)
 * 
 * Handles the complete dispute lifecycle:
 * 
 * ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
 * │ DETECT ISSUE │ ──► │CREATE DISPUTE│ ──► │  RESOLUTION  │
 * └──────────────┘     └──────────────┘     └──────────────┘
 * 
 * Auto-detection triggers:
 * - Order not shipped after 7 days
 * - Tracking shows no movement after 15 days
 * - Delivery significantly delayed (>30 days)
 * 
 * Features:
 * - Automated dispute creation for problematic orders
 * - Dispute status tracking
 * - Auto-escalation for unresolved disputes
 * - Dispute history and reporting
 * 
 * Runs every 30 minutes as part of the engine.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const DISPUTES_FILE = join(DATA_DIR, "disputes.json");
const ORDERS_FILE = join(DATA_DIR, "orders.json");

// Thresholds (days)
const MAX_DAYS_NO_SHIP = 7;
const MAX_DAYS_NO_TRACKING_MOVE = 15;
const MAX_DAYS_DELIVERY = 45;

// ═══════════════════════════════════════════════════════════
// Dispute Manager
// ═══════════════════════════════════════════════════════════

export class DisputeManager {
  #cj;
  #disputes = [];
  #stats = {
    total: 0,
    open: 0,
    resolved: 0,
    cancelled: 0,
    autoCreated: 0,
    lastCheck: null,
  };

  constructor(cjClient) {
    this.#cj = cjClient;
    this.load();
  }

  load() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    try {
      if (existsSync(DISPUTES_FILE)) {
        const data = JSON.parse(readFileSync(DISPUTES_FILE, "utf8"));
        this.#disputes = data.disputes || [];
        this.#stats = data.stats || this.#stats;
      }
    } catch { /* defaults */ }
  }

  save() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DISPUTES_FILE, JSON.stringify({
      disputes: this.#disputes,
      stats: this.#stats,
    }, null, 2));
  }

  getStats() { return { ...this.#stats }; }
  getDisputes(filter = {}) {
    let disputes = [...this.#disputes];
    if (filter.status) disputes = disputes.filter(d => d.status === filter.status);
    if (filter.orderId) disputes = disputes.filter(d => d.orderId === filter.orderId);
    return disputes.slice(-(filter.limit || 50));
  }

  // ═══════════════════════════════════════════════════════════
  // DETECT PROBLEMS — Scan orders for issues
  // ═══════════════════════════════════════════════════════════

  async detectProblems() {
    console.log(`\n⚠️ [DISPUTE] Problem detection — ${new Date().toISOString()}`);

    // Load orders
    let orders;
    try {
      orders = JSON.parse(readFileSync(ORDERS_FILE, "utf8"));
    } catch {
      return { checked: 0, problems: [] };
    }

    if (!Array.isArray(orders)) return { checked: 0, problems: [] };

    const now = Date.now();
    const dayMs = 86_400_000;
    const problems = [];

    for (const order of orders) {
      // Skip completed/cancelled/already disputed orders
      if (["delivered", "cancelled", "failed", "disputed"].includes(order.status)) continue;
      if (this.#disputes.some(d => d.orderId === order.localId && d.status === "open")) continue;

      const ageDs = (now - new Date(order.createdAt).getTime()) / dayMs;

      // Problem 1: Paid but not shipped after MAX_DAYS_NO_SHIP days
      if (order.status === "paid" && ageDs > MAX_DAYS_NO_SHIP) {
        problems.push({
          type: "NOT_SHIPPED",
          orderId: order.localId,
          cjOrderId: order.cjOrderId,
          ageDays: Math.round(ageDs),
          message: `Order not shipped after ${Math.round(ageDs)} days`,
        });
      }

      // Problem 2: Shipped but no tracking movement after MAX_DAYS_NO_TRACKING_MOVE
      if (["shipped", "in_transit"].includes(order.status)) {
        const lastTrackingUpdate = order.trackingHistory?.length > 0
          ? new Date(order.trackingHistory[order.trackingHistory.length - 1].date).getTime()
          : new Date(order.updatedAt).getTime();
        
        const trackingAgeDays = (now - lastTrackingUpdate) / dayMs;
        
        if (trackingAgeDays > MAX_DAYS_NO_TRACKING_MOVE) {
          problems.push({
            type: "TRACKING_STALE",
            orderId: order.localId,
            cjOrderId: order.cjOrderId,
            ageDays: Math.round(trackingAgeDays),
            message: `No tracking updates for ${Math.round(trackingAgeDays)} days`,
          });
        }
      }

      // Problem 3: Order too old (>MAX_DAYS_DELIVERY days and not delivered)
      if (ageDs > MAX_DAYS_DELIVERY && order.status !== "delivered") {
        problems.push({
          type: "DELIVERY_TIMEOUT",
          orderId: order.localId,
          cjOrderId: order.cjOrderId,
          ageDays: Math.round(ageDs),
          message: `Order not delivered after ${Math.round(ageDs)} days`,
        });
      }
    }

    console.log(`⚠️ [DISPUTE] Found ${problems.length} problems in ${orders.length} orders`);
    return { checked: orders.length, problems };
  }

  // ═══════════════════════════════════════════════════════════
  // CREATE DISPUTE — Auto-create for detected problems
  // ═══════════════════════════════════════════════════════════

  async createDisputeForOrder(orderId, reason, details = {}) {
    // Check if already disputed
    if (this.#disputes.some(d => d.orderId === orderId && d.status === "open")) {
      return { error: "Already has open dispute" };
    }

    const dispute = {
      id: `DSP-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      orderId,
      cjOrderId: details.cjOrderId || null,
      cjDisputeId: null,
      reason,
      type: details.type || "OTHER",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolution: null,
      history: [{ ts: new Date().toISOString(), action: "CREATED", message: reason }],
    };

    // Try to create on CJ
    if (details.cjOrderId) {
      try {
        // First get dispute-eligible products
        const products = await this.#cj.getDisputeProducts(details.cjOrderId);
        
        if (products && (Array.isArray(products) ? products.length > 0 : true)) {
          // Confirm dispute info
          const confirmData = {
            orderId: details.cjOrderId,
            disputeType: this.#mapReasonToType(details.type),
            description: reason,
          };

          try {
            await this.#cj.confirmDisputeInfo(confirmData);
          } catch {
            // Confirm may not be required for all disputes
          }

          // Create the dispute on CJ
          const result = await this.#cj.createDispute({
            orderId: details.cjOrderId,
            disputeType: this.#mapReasonToType(details.type),
            description: reason,
          });

          if (result?.disputeId) {
            dispute.cjDisputeId = result.disputeId;
            dispute.status = "open";
            dispute.history.push({
              ts: new Date().toISOString(),
              action: "CJ_DISPUTE_CREATED",
              message: `CJ dispute ID: ${result.disputeId}`,
            });
          }
        }
      } catch (err) {
        dispute.history.push({
          ts: new Date().toISOString(),
          action: "CJ_CREATE_FAILED",
          message: err.message,
        });
        dispute.status = "open"; // Still track locally
      }
    } else {
      dispute.status = "open";
    }

    this.#disputes.push(dispute);
    this.#stats.total++;
    this.#stats.open++;
    this.save();

    console.log(`⚠️ [DISPUTE] Created: ${dispute.id} for order ${orderId} — ${reason}`);
    return dispute;
  }

  #mapReasonToType(type) {
    const map = {
      "NOT_SHIPPED": 1,
      "TRACKING_STALE": 2,
      "DELIVERY_TIMEOUT": 3,
      "DAMAGED": 4,
      "WRONG_ITEM": 5,
      "QUALITY": 6,
    };
    return map[type] || 1;
  }

  // ═══════════════════════════════════════════════════════════
  // SYNC DISPUTES — Pull status from CJ
  // ═══════════════════════════════════════════════════════════

  async syncDisputes() {
    // Sync open disputes
    const openDisputes = this.#disputes.filter(d => d.status === "open" && d.cjDisputeId);

    // Also pull from CJ dispute list
    try {
      const cjDisputes = await this.#cj.listDisputes({ pageNum: 1, pageSize: 50 });
      const disputeList = cjDisputes?.list || (Array.isArray(cjDisputes) ? cjDisputes : []);

      for (const cjD of disputeList) {
        const existing = this.#disputes.find(d => d.cjDisputeId === cjD.disputeId);
        if (existing) {
          // Update status
          const newStatus = this.#mapCjDisputeStatus(cjD.disputeStatus || cjD.status);
          if (newStatus !== existing.status) {
            existing.status = newStatus;
            existing.updatedAt = new Date().toISOString();
            existing.history.push({
              ts: new Date().toISOString(),
              action: "STATUS_CHANGED",
              message: `Status → ${newStatus}`,
            });

            if (newStatus === "resolved") {
              existing.resolution = cjD.resolution || cjD.result || "resolved";
              this.#stats.resolved++;
              this.#stats.open = Math.max(0, this.#stats.open - 1);
            }
          }
        }
      }
    } catch (err) {
      console.error("⚠️ [DISPUTE] Sync failed:", err.message);
    }

    this.save();
  }

  #mapCjDisputeStatus(status) {
    const s = String(status).toLowerCase();
    if (s.includes("resolved") || s.includes("closed") || s.includes("complete")) return "resolved";
    if (s.includes("cancel")) return "cancelled";
    if (s.includes("pending") || s.includes("process")) return "open";
    return "open";
  }

  // ═══════════════════════════════════════════════════════════
  // CANCEL DISPUTE
  // ═══════════════════════════════════════════════════════════

  async cancelDispute(disputeId) {
    const dispute = this.#disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error(`Dispute ${disputeId} not found`);
    if (dispute.status !== "open") throw new Error(`Cannot cancel ${dispute.status} dispute`);

    if (dispute.cjDisputeId) {
      try {
        await this.#cj.cancelDispute({ disputeId: dispute.cjDisputeId });
      } catch (err) {
        console.error(`⚠️ [DISPUTE] CJ cancel failed: ${err.message}`);
      }
    }

    dispute.status = "cancelled";
    dispute.updatedAt = new Date().toISOString();
    dispute.history.push({
      ts: new Date().toISOString(),
      action: "CANCELLED",
      message: "Dispute cancelled",
    });

    this.#stats.cancelled++;
    this.#stats.open = Math.max(0, this.#stats.open - 1);
    this.save();
    return dispute;
  }

  // ═══════════════════════════════════════════════════════════
  // AUTO-DISPUTE — Full cycle: detect + create + sync
  // ═══════════════════════════════════════════════════════════

  async processCycle() {
    console.log(`\n⚠️ [DISPUTE] Processing cycle — ${new Date().toISOString()}`);

    // 1. Detect problems
    const { problems } = await this.detectProblems();

    // 2. Auto-create disputes for problems
    let created = 0;
    for (const problem of problems) {
      try {
        await this.createDisputeForOrder(problem.orderId, problem.message, {
          cjOrderId: problem.cjOrderId,
          type: problem.type,
        });
        created++;
        this.#stats.autoCreated++;
      } catch (err) {
        console.error(`⚠️ [DISPUTE] Auto-create failed for ${problem.orderId}:`, err.message);
      }
    }

    // 3. Sync existing disputes
    await this.syncDisputes();

    this.#stats.lastCheck = new Date().toISOString();
    this.save();

    console.log(`⚠️ [DISPUTE] Cycle complete: ${problems.length} problems, ${created} disputes created`);
    return { problems: problems.length, created, synced: true };
  }
}

// ═══════════════════════════════════════════════════════════
// Dispute Daemon
// ═══════════════════════════════════════════════════════════

const DISPUTE_CHECK_INTERVAL = parseInt(process.env.DISPUTE_CHECK_MINUTES || "30", 10) * 60_000;

export async function startDisputeDaemon(cjClient) {
  const manager = new DisputeManager(cjClient);

  console.log("⚠️ [DISPUTE] Dispute Manager daemon started");
  console.log(`   Check interval: every ${DISPUTE_CHECK_INTERVAL / 60_000} minutes`);

  // Initial check (delayed 5 min)
  setTimeout(async () => {
    try {
      await manager.processCycle();
    } catch (err) {
      console.error("⚠️ [DISPUTE] Initial cycle failed:", err.message);
    }
  }, 300_000);

  // Scheduled cycles
  setInterval(async () => {
    try {
      await manager.processCycle();
    } catch (err) {
      console.error("⚠️ [DISPUTE] Scheduled cycle failed:", err.message);
    }
  }, DISPUTE_CHECK_INTERVAL);

  return manager;
}

export default DisputeManager;
