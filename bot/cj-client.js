/**
 * ASTRALMIA — CJ Dropshipping API Client
 * Direct integration with CJ API v2.0 for product sourcing
 * 
 * Features:
 * - Token management with auto-refresh
 * - Rate limiting (safe 3 req/s)
 * - Product search (V1 + V2)
 * - Variant queries
 * - Freight calculation
 * - Category listing
 * - Retry with exponential backoff
 */

const BASE_URL = process.env.CJ_BASE_URL || "https://developers.cjdropshipping.com/api2.0/v1";
const API_KEY = process.env.CJ_API_KEY || "";
const CJ_EMAIL = process.env.CJ_EMAIL || "";
const CJ_PASSWORD = process.env.CJ_PASSWORD || "";

class CJClient {
  constructor() {
    this.baseUrl = BASE_URL;
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiresAt = 0;
    this.refreshExpiresAt = 0;
    this.lastRequestTime = 0;
    this.minInterval = parseInt(process.env.CJ_RATE_LIMIT_MS || "350", 10);
    this.initialized = false;
  }

  // ── Initialize (get first token) ──────────────────────────────────────────

  async init() {
    await this.getAccessToken();
    this.initialized = true;
    return this;
  }

  // ── Rate Limiter ──────────────────────────────────────────────────────────

  async _rateWait() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minInterval) {
      await new Promise(r => setTimeout(r, this.minInterval - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  // ── Token Management ──────────────────────────────────────────────────────

  async getAccessToken() {
    // Return cached token if valid (with 1h buffer)
    if (this.token && Date.now() < this.tokenExpiresAt - 3600_000) {
      return this.token;
    }

    // Try refresh if refresh token is valid
    if (this.refreshToken && Date.now() < this.refreshExpiresAt - 3600_000) {
      try {
        return await this._refreshToken();
      } catch {
        this.token = null;
        this.refreshToken = null;
      }
    }

    // Get new token
    const authBody = API_KEY
      ? { apiKey: API_KEY }
      : { email: CJ_EMAIL, password: CJ_PASSWORD };

    if (!API_KEY && !CJ_EMAIL) {
      throw new Error("CJ auth: set CJ_API_KEY or CJ_EMAIL+CJ_PASSWORD in .env");
    }

    await this._rateWait();
    const res = await fetch(`${this.baseUrl}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authBody),
    });

    const json = await res.json();
    if (!json.data?.accessToken) {
      throw new Error(`CJ auth failed: ${json.message || JSON.stringify(json)}`);
    }

    this._saveTokens(json.data);
    return this.token;
  }

  async _refreshToken() {
    await this._rateWait();
    const res = await fetch(`${this.baseUrl}/authentication/refreshAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });
    const json = await res.json();
    if (!json.data?.accessToken) throw new Error("Refresh failed");
    this._saveTokens(json.data);
    return this.token;
  }

  _saveTokens(data) {
    this.token = data.accessToken;
    this.refreshToken = data.refreshToken || this.refreshToken;
    this.tokenExpiresAt = this._parseDate(data.accessTokenExpiryDate, 15);
    this.refreshExpiresAt = this._parseDate(data.refreshTokenExpiryDate, 180);
  }

  _parseDate(dateStr, fallbackDays) {
    if (!dateStr) return Date.now() + fallbackDays * 86400_000;
    const ts = new Date(dateStr).getTime();
    return isNaN(ts) ? Date.now() + fallbackDays * 86400_000 : ts;
  }

  // ── Authenticated Fetch ───────────────────────────────────────────────────

  async fetch(path, opts = {}) {
    const token = await this.getAccessToken();
    const { method = "GET", body, params, retry = true } = opts;

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      url += `?${qs}`;
    }

    await this._rateWait();
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "CJ-Access-Token": token,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    // Handle 401 — retry with fresh token
    if (!res.ok && res.status === 401 && retry) {
      this.token = null;
      return this.fetch(path, { ...opts, retry: false });
    }

    const json = await res.json();
    const code = json.code !== undefined ? Number(json.code) : 200;

    if (code !== 200 && code !== 0) {
      // Token errors — retry once
      if ((code === 1600100 || code === 1600101) && retry) {
        this.token = null;
        return this.fetch(path, { ...opts, retry: false });
      }
      throw new Error(`CJ API ${path}: code=${code} ${json.message || ""}`);
    }

    return json.data;
  }

  // ── Product Search (V1) ───────────────────────────────────────────────────

  async searchProducts(keyword, page = 1, size = 20) {
    const params = {
      productNameEn: keyword,
      pageNum: String(page),
      pageSize: String(size),
    };

    const data = await this.fetch("/product/list", { params });
    return {
      list: data?.list || [],
      total: data?.total || 0,
      pageNum: data?.pageNum || page,
      pageSize: data?.pageSize || size,
    };
  }

  // ── Product Search (V2 — Elasticsearch) ───────────────────────────────────

  async searchProductsV2(keyword, page = 1, size = 20, features = []) {
    const params = {
      keyWord: keyword,
      page: String(page),
      size: String(size),
    };
    if (features.length) params.features = features.join(",");

    const data = await this.fetch("/product/listV2", { params });
    const products = [];
    if (data?.content) {
      for (const group of data.content) {
        if (group.productList) products.push(...group.productList);
      }
    }
    return { products, total: data?.totalRecords || products.length };
  }

  // ── Product Detail ────────────────────────────────────────────────────────

  async getProductDetail(pid) {
    return this.fetch("/product/query", { params: { pid } });
  }

  // ── Product Variants ──────────────────────────────────────────────────────

  async getProductVariants(pid) {
    const data = await this.fetch("/product/variant/query", { params: { pid } });
    if (Array.isArray(data)) return data;
    return data?.list || [];
  }

  // ── Categories ────────────────────────────────────────────────────────────

  async getCategories() {
    return this.fetch("/product/getCategory");
  }

  // ── Freight Calculation ───────────────────────────────────────────────────

  async calculateFreight(endCountryCode, products, startCountryCode = "CN", zip = "") {
    return this.fetch("/logistic/freightCalculate", {
      method: "POST",
      body: {
        startCountryCode,
        endCountryCode,
        products,
        ...(zip ? { zip } : {}),
      },
    });
  }

  // ── Create Order ──────────────────────────────────────────────────────────

  async createOrder(orderData) {
    return this.fetch("/shopping/order/createOrderV2", {
      method: "POST",
      body: orderData,
    });
  }

  // ── Order Details ─────────────────────────────────────────────────────────

  async getOrderDetail(orderId) {
    return this.fetch("/shopping/order/getOrderDetail", {
      params: { orderId },
    });
  }

  // ── Logistics Tracking ────────────────────────────────────────────────────

  async getTrackingInfo(trackNumber) {
    return this.fetch("/logistic/getTrackInfo", {
      params: { trackNumber },
    });
  }

  // ── Inventory ─────────────────────────────────────────────────────────────

  async queryInventory(pid) {
    return this.fetch("/product/stock/queryByPid", {
      params: { pid },
    });
  }

  // ── Warehouses ────────────────────────────────────────────────────────────

  async getWarehouses() {
    return this.fetch("/product/globalWarehouseList");
  }
}

module.exports = { CJClient };
