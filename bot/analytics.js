/**
 * ASTRALMIA — Analytics Tracker
 * In-memory analytics for bot usage tracking
 */

class Analytics {
  constructor() {
    this.users = new Map();    // userId → { name, firstSeen, lastSeen }
    this.events = [];          // { type, data, timestamp }
    this.searches = {};        // keyword → count
    this.categories = {};      // category → count
    this.errors = [];          // error messages
    this.startedAt = Date.now();
  }

  // ── Track User ────────────────────────────────────────────────────────

  trackUser(userId, name) {
    const key = String(userId);
    if (!this.users.has(key)) {
      this.users.set(key, {
        name,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      });
    } else {
      this.users.get(key).lastSeen = new Date().toISOString();
    }
  }

  // ── Track Event ───────────────────────────────────────────────────────

  trackEvent(type, data = {}) {
    this.events.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    });

    // Track specific event types
    if (type === "search" && data.query) {
      this.searches[data.query] = (this.searches[data.query] || 0) + 1;
    }
    if (type === "browse" && data.category) {
      this.categories[data.category] = (this.categories[data.category] || 0) + 1;
    }

    // Keep events list manageable (max 10k)
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }
  }

  // ── Track Error ───────────────────────────────────────────────────────

  trackError(message) {
    this.errors.push({
      message,
      timestamp: new Date().toISOString(),
    });

    // Keep errors list manageable
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-500);
    }
  }

  // ── Get Stats ─────────────────────────────────────────────────────────

  getStats() {
    const today = new Date().toISOString().split("T")[0];
    const todayEvents = this.events.filter(e => e.timestamp.startsWith(today)).length;

    return {
      totalUsers: this.users.size,
      totalSearches: this.events.filter(e => e.type === "search").length,
      totalAddToCart: this.events.filter(e => e.type === "add_to_cart").length,
      todayEvents,
      uptime: Date.now() - this.startedAt,
    };
  }

  // ── Get Detailed Stats ────────────────────────────────────────────────

  getDetailedStats() {
    // Sort searches by count
    const topSearches = Object.fromEntries(
      Object.entries(this.searches)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
    );

    const topCategories = Object.fromEntries(
      Object.entries(this.categories)
        .sort(([, a], [, b]) => b - a)
    );

    return {
      topSearches,
      topCategories,
      totalEvents: this.events.length,
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-5),
    };
  }
}

module.exports = { Analytics };
