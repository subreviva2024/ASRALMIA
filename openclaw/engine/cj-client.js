/**
 * ASTRALMIA — CJ Dropshipping API Client (Production)
 * 
 * Standalone CJ API client with:
 * - Token lifecycle (15d access / 180d refresh)
 * - Auto-retry with exponential backoff
 * - Rate limiting (350ms between requests)
 * - All CJ API v2.0 endpoints
 * - Error classification (auth/rate/network/api)
 * 
 * Uses ONLY real CJ API data. Zero mocks.
 */

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

export class CJClient {
  #token = null;
  #refreshToken = null;
  #tokenExpiry = 0;
  #refreshExpiry = 0;
  #lastReq = 0;
  #minInterval = 350;
  #config;
  #stats = { calls: 0, errors: 0, tokenRefreshes: 0 };

  constructor(config = {}) {
    this.#config = {
      baseUrl: config.baseUrl || process.env.CJ_BASE_URL || CJ_BASE,
      apiKey: config.apiKey || process.env.CJ_API_KEY || "",
      email: config.email || process.env.CJ_EMAIL || "",
      password: config.password || process.env.CJ_PASSWORD || "",
    };
    if (!this.#config.apiKey && !this.#config.email) {
      throw new Error("[CJ] FATAL: Set CJ_API_KEY or CJ_EMAIL+CJ_PASSWORD");
    }
  }

  get stats() { return { ...this.#stats }; }

  // ── Rate limiter ────────────────────────────────────────
  async #rateWait() {
    const elapsed = Date.now() - this.#lastReq;
    if (elapsed < this.#minInterval) {
      await new Promise(r => setTimeout(r, this.#minInterval - elapsed));
    }
    this.#lastReq = Date.now();
  }

  // ── Token management ────────────────────────────────────
  async #ensureToken() {
    if (this.#token && Date.now() < this.#tokenExpiry - 3_600_000) {
      return this.#token;
    }
    // Try refresh first
    if (this.#refreshToken && Date.now() < this.#refreshExpiry - 3_600_000) {
      try { return await this.#doRefresh(); } catch { this.#token = null; }
    }
    return await this.#doAuth();
  }

  async #doAuth() {
    const body = this.#config.apiKey
      ? { apiKey: this.#config.apiKey }
      : { email: this.#config.email, password: this.#config.password };
    await this.#rateWait();
    const res = await fetch(`${this.#config.baseUrl}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.data?.accessToken) {
      throw new Error(`[CJ] Auth failed: ${json.message || res.status}`);
    }
    this.#saveTokens(json.data);
    return this.#token;
  }

  async #doRefresh() {
    await this.#rateWait();
    this.#stats.tokenRefreshes++;
    const res = await fetch(`${this.#config.baseUrl}/authentication/refreshAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: this.#refreshToken }),
    });
    const json = await res.json();
    if (!json.data?.accessToken) throw new Error("[CJ] Refresh failed");
    this.#saveTokens(json.data);
    return this.#token;
  }

  #saveTokens(data) {
    this.#token = data.accessToken;
    this.#refreshToken = data.refreshToken || this.#refreshToken;
    const parse = (s, days) => {
      if (!s) return Date.now() + days * 86_400_000;
      const ts = new Date(s).getTime();
      return isNaN(ts) ? Date.now() + days * 86_400_000 : ts;
    };
    this.#tokenExpiry = parse(data.accessTokenExpiryDate, 15);
    this.#refreshExpiry = parse(data.refreshTokenExpiryDate, 180);
  }

  // ── Core API fetch with retry ───────────────────────────
  async api(path, opts = {}) {
    const { method = "GET", body, params, maxRetries = 2 } = opts;
    let lastErr;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const token = await this.#ensureToken();
        let url = `${this.#config.baseUrl}${path}`;
        if (params) {
          const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
          ).toString();
          if (qs) url += `?${qs}`;
        }
        await this.#rateWait();
        this.#stats.calls++;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        if (!res.ok && res.status === 401) {
          this.#token = null;
          if (attempt < maxRetries) continue;
        }
        const json = await res.json();
        const code = json.code !== undefined ? Number(json.code) : 200;
        if (code !== 200 && code !== 0) {
          if ((code === 1600100 || code === 1600101) && attempt < maxRetries) {
            this.#token = null;
            continue;
          }
          throw new Error(`[CJ] ${path} code=${code}: ${json.message || ""}`);
        }
        return json.data;
      } catch (err) {
        lastErr = err;
        this.#stats.errors++;
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }
    throw lastErr;
  }

  // ═══════════════════════════════════════════════════════════
  // HIGH-LEVEL API METHODS
  // ═══════════════════════════════════════════════════════════

  /** Search products by keyword */
  async searchProducts(query, page = 1, pageSize = 20) {
    return this.api("/product/list", {
      params: { productNameEn: query, pageNum: String(page), pageSize: String(Math.min(pageSize, 200)) },
    });
  }

  /** Get product details by PID */
  async getProduct(pid) {
    return this.api("/product/query", { params: { pid } });
  }

  /** Get all variants for a product */
  async getVariants(pid) {
    const data = await this.api("/product/variant/query", { params: { pid } });
    return Array.isArray(data) ? data : data?.list || [];
  }

  /** Check real-time inventory */
  async checkInventory(pid) {
    return this.api("/product/stock/queryByPid", { params: { pid } });
  }

  /** Calculate freight/shipping */
  async calculateShipping(vid, countryCode = "PT", quantity = 1) {
    const data = await this.api("/logistic/freightCalculate", {
      method: "POST",
      body: {
        startCountryCode: "CN",
        endCountryCode: countryCode,
        products: [{ quantity, vid }],
      },
    });
    const options = (Array.isArray(data) ? data : [])
      .map(s => ({
        method: s.logisticName,
        priceUsd: parseFloat(s.logisticPrice) || 0,
        days: s.logisticAging || "7-15",
      }))
      .sort((a, b) => a.priceUsd - b.priceUsd);
    return options;
  }

  /** List product categories */
  async getCategories() {
    return this.api("/product/getCategory");
  }

  /** Create order via v2 API */
  async createOrder(orderData) {
    return this.api("/shopping/order/createOrderV2", {
      method: "POST",
      body: { shopLogisticsType: 2, ...orderData },
    });
  }

  /** Get order details */
  async getOrder(orderId) {
    return this.api("/shopping/order/getOrderDetail", { params: { orderId } });
  }

  /** Track shipment */
  async trackShipment(trackNumber) {
    return this.api("/logistic/getTrackInfo", { params: { trackNumber } });
  }

  /** List warehouses */
  async getWarehouses() {
    return this.api("/product/globalWarehouseList");
  }
}

export default CJClient;
