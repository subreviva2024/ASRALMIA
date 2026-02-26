/**
 * CJ Dropshipping API Client
 * Handles authentication, product search, freight calculation, and product details.
 * Based on: https://developers.cjdropshipping.cn/en/api/start/
 */

const CJ_BASE = process.env.CJ_BASE_URL || "https://developers.cjdropshipping.com/api2.0/v1";
// Auth: CJ API supports both apiKey and email/password.
// If CJ_API_KEY is set, use it (newer flow). Otherwise fall back to email/password.
const CJ_API_KEY = process.env.CJ_API_KEY || "";
const CJ_EMAIL = process.env.CJ_EMAIL || "";
const CJ_PASSWORD = process.env.CJ_PASSWORD || "";

// ── Token cache (in-memory, server-side only) ──────────────────────────────
let cachedToken: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
} | null = null;

// ── Rate limiter (CJ limits: 10 req/s per IP, 1 req/s for Free tier) ──────
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = parseInt(process.env.CJ_RATE_LIMIT_MS || "350", 10); // ~3 req/s safe default

async function rateLimitWait(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

/** Parse CJ date string to timestamp. Returns fallback if parsing fails. */
function parseCJDate(dateStr: string | undefined, fallbackDays: number): number {
  if (!dateStr) return Date.now() + fallbackDays * 24 * 3600_000;
  const ts = new Date(dateStr).getTime();
  return isNaN(ts) ? Date.now() + fallbackDays * 24 * 3600_000 : ts;
}

// ── Authentication ──────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 1h safety buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 3600_000) {
    return cachedToken.accessToken;
  }

  // Try refresh first if we have a valid refresh token
  if (cachedToken?.refreshToken && Date.now() < cachedToken.refreshExpiresAt - 3600_000) {
    try {
      return await refreshAccessToken(cachedToken.refreshToken);
    } catch {
      // Refresh failed, get new token
      cachedToken = null;
    }
  }

  // Build auth body: apiKey takes priority, otherwise email/password per CJ docs
  const authBody = CJ_API_KEY
    ? { apiKey: CJ_API_KEY }
    : { email: CJ_EMAIL, password: CJ_PASSWORD };

  if (!CJ_API_KEY && !CJ_EMAIL) {
    throw new Error("CJ auth: set CJ_API_KEY or CJ_EMAIL+CJ_PASSWORD in .env");
  }

  await rateLimitWait();
  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(authBody),
  });

  const json = await res.json();
  if (!json.data?.accessToken) {
    throw new Error(`CJ auth failed: ${json.message || JSON.stringify(json)}`);
  }

  cachedToken = {
    accessToken: json.data.accessToken,
    refreshToken: json.data.refreshToken,
    expiresAt: parseCJDate(json.data.accessTokenExpiryDate, 15),
    refreshExpiresAt: parseCJDate(json.data.refreshTokenExpiryDate, 180),
  };

  return cachedToken.accessToken;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  await rateLimitWait();
  const res = await fetch(`${CJ_BASE}/authentication/refreshAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const json = await res.json();
  if (!json.data?.accessToken) {
    throw new Error("CJ refresh failed");
  }

  cachedToken = {
    accessToken: json.data.accessToken,
    refreshToken: json.data.refreshToken || refreshToken,
    expiresAt: parseCJDate(json.data.accessTokenExpiryDate, 15),
    refreshExpiresAt: parseCJDate(json.data.refreshTokenExpiryDate, 180),
  };

  return cachedToken.accessToken;
}

// ── Authenticated fetch helper ──────────────────────────────────────────────

async function cjFetch<T = Record<string, unknown>>(
  path: string,
  options: { method?: string; body?: Record<string, unknown>; params?: Record<string, string>; retry?: boolean } = {}
): Promise<T> {
  const token = await getAccessToken();
  const { method = "GET", body, params, retry = true } = options;

  let url = `${CJ_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  await rateLimitWait();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // Handle HTTP-level errors
  if (!res.ok && res.status === 401 && retry) {
    // Token expired mid-flight — force re-auth and retry once
    cachedToken = null;
    return cjFetch<T>(path, { ...options, retry: false });
  }

  const json = await res.json();
  // CJ API success: code=200 OR code=0 (warehouse endpoint) OR no code field
  const code = json.code !== undefined ? Number(json.code) : 200;
  if (code !== 200 && code !== 0) {
    // Token-level auth error — retry once with fresh token
    if ((code === 1600100 || code === 1600101) && retry) {
      cachedToken = null;
      return cjFetch<T>(path, { ...options, retry: false });
    }
    throw new Error(`CJ API error (${path}): code=${code} ${json.message || JSON.stringify(json)}`);
  }

  return json.data as T;
}

// ── Safe number parser (CJ returns many numbers as strings) ────────────────
export function safeFloat(v: string | number | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

// ── Product Types ───────────────────────────────────────────────────────────

export interface CJProduct {
  pid: string;
  productName: string;
  productNameEn: string;
  productSku: string;
  productImage: string;
  /** API returns this as a string e.g. "30.00" — use safeFloat() */
  productWeight: string | number;
  productType: string;
  categoryId: string;
  categoryName: string;
  /** API returns this as a string e.g. "5.47" — use safeFloat() */
  sellPrice: string | number;
  /** "0" = CJ warehouse | "1" = supplier direct */
  sourceFrom: string | number;
  isFreeShipping: boolean;
  saleStatus: number;
  /** V2 description (only if features=enable_description) */
  description?: string;
  /** V2 delivery cycle in days */
  deliveryCycle?: string;
  // Variants (only present when fetched via variant/query)
  variants?: CJVariant[];
}

export interface CJVariant {
  vid: string;
  pid: string;
  variantName: string | null;
  variantNameEn: string;
  variantSku: string;
  variantImage: string;
  /** variantKey is the human-readable name e.g. "Lithium Violet" */
  variantKey: string;
  variantSellPrice: number;
  variantWeight: number;
  variantVolume: number;
  variantLength: number;
  variantWidth: number;
  variantHeight: number;
}

export interface CJCategory {
  categoryFirstId: string;
  categoryFirstName: string;
  /** API key is "categoryFirstList" (not categorySecondList) */
  categoryFirstList: {
    categorySecondId: string;
    categorySecondName: string;
    categorySecondList: {
      categoryThirdId: string;
      categoryThirdName: string;
    }[];
  }[];
}

export interface CJFreightOption {
  logisticName: string;
  /** Shipping cost in USD */
  logisticPrice: number;
  /** Shipping cost in CNY */
  logisticPriceCn: number;
  /** Estimated delivery e.g. "10-15" (days) */
  logisticAging: string;
  channelId: string | null;
  /** Portuguese tax/customs fee in USD */
  taxesFee: number;
  clearanceOperationFee: number;
  /** True landed cost = logisticPrice + taxesFee + clearanceOperationFee */
  totalPostageFee: number;
  errorEn: string | null;
}

export interface CJProductDetail extends CJProduct {
  description: string;
  productVideo: string;
  materialKey: string;
  entryCode: string;
  entryName: string;
}

// ── Product Search ──────────────────────────────────────────────────────────

export interface SearchProductsParams {
  keyword?: string;
  categoryId?: string;
  page?: number;
  size?: number;
  countryCode?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductListResult {
  list: CJProduct[];
  pageNum: number;
  pageSize: number;
  total: number;
}

export async function searchProducts(params: SearchProductsParams): Promise<ProductListResult> {
  const queryParams: Record<string, string> = {};
  // CRITICAL: The correct search param is `productNameEn` — NOT `keyWord`.
  // `keyWord` returns the entire catalog unfiltered (1.3M results).
  // `productNameEn` actually filters by product name.
  if (params.keyword) queryParams.productNameEn = params.keyword;
  if (params.categoryId) queryParams.categoryId = params.categoryId;
  queryParams.pageNum = String(params.page ?? 1);
  queryParams.pageSize = String(params.size ?? 20);
  // NOTE: countryCode=PT returns 0 results on /product/list — do NOT pass it
  if (params.minPrice) queryParams.minPrice = String(params.minPrice);
  if (params.maxPrice) queryParams.maxPrice = String(params.maxPrice);

  return cjFetch<ProductListResult>("/product/list", { params: queryParams });
}

// ── V2 Product Search (Elasticsearch) ────────────────────────────────────────
// V2 returns a DIFFERENT format: data.content[].productList[]
// Products use: id (not pid), nameEn (not productNameEn), bigImage (not productImage)

export interface CJProductV2 {
  id: string;
  nameEn: string;
  sku: string;
  spu: string;
  bigImage: string;
  sellPrice: string | number;
  nowPrice: string | number;
  discountPrice: string | number;
  discountPriceRate: string;
  listedNum: number;
  categoryId: string;
  threeCategoryName?: string;
  twoCategoryName?: string;
  oneCategoryName?: string;
  addMarkStatus: number; // 0=paid shipping, 1=free shipping
  isVideo: number;
  productType: string;
  supplierName: string;
  warehouseInventoryNum: number;
  description?: string; // only with features=enable_description
  deliveryCycle?: string;
  saleStatus: string;
}

interface V2ContentItem {
  productList: CJProductV2[];
  relatedCategoryList?: { categoryId: string; categoryName: string }[];
  keyWord: string;
}

interface V2Response {
  pageSize: number;
  pageNumber: number;
  totalRecords: number;
  totalPages: number;
  content: V2ContentItem[];
}

export interface SearchProductsV2Params {
  keyword?: string;
  categoryId?: string;
  page?: number;
  size?: number;
  features?: string[]; // enable_description, enable_category, enable_video
  orderBy?: number; // 0=best match, 1=listing count, 2=sell price, 3=create time
  sort?: 'asc' | 'desc';
  startSellPrice?: number;
  endSellPrice?: number;
}

export async function searchProductsV2(params: SearchProductsV2Params): Promise<{ products: CJProductV2[]; total: number }> {
  const queryParams: Record<string, string> = {};
  // V2 uses 'keyWord' for search (NOT productNameEn)
  if (params.keyword) queryParams.keyWord = params.keyword;
  if (params.categoryId) queryParams.categoryId = params.categoryId;
  queryParams.page = String(params.page ?? 1);
  queryParams.size = String(params.size ?? 20);
  if (params.orderBy !== undefined) queryParams.orderBy = String(params.orderBy);
  if (params.sort) queryParams.sort = params.sort;
  if (params.startSellPrice) queryParams.startSellPrice = String(params.startSellPrice);
  if (params.endSellPrice) queryParams.endSellPrice = String(params.endSellPrice);
  if (params.features?.length) queryParams.features = params.features.join(',');

  const data = await cjFetch<V2Response>("/product/listV2", { params: queryParams });

  // Flatten V2 nested content[].productList[] into a flat array
  const products: CJProductV2[] = [];
  if (data?.content) {
    for (const group of data.content) {
      if (group.productList) {
        products.push(...group.productList);
      }
    }
  }

  return { products, total: data?.totalRecords ?? products.length };
}

/** Convert V2 product to V1-compatible CJProduct for backward compat */
export function v2ToV1(p: CJProductV2): CJProduct {
  return {
    pid: p.id,
    productName: p.nameEn,
    productNameEn: p.nameEn,
    productSku: p.sku || p.spu,
    productImage: p.bigImage,
    productWeight: 0,
    productType: p.productType,
    categoryId: p.categoryId,
    categoryName: p.threeCategoryName || '',
    sellPrice: p.nowPrice || p.sellPrice,
    sourceFrom: '0',
    isFreeShipping: p.addMarkStatus === 1,
    saleStatus: Number(p.saleStatus) || 3,
  };
}

// ── Product Details ─────────────────────────────────────────────────────────

export async function getProductDetail(pid: string): Promise<CJProductDetail> {
  return cjFetch<CJProductDetail>("/product/query", { params: { pid } });
}

export async function getProductVariants(pid: string): Promise<CJVariant[]> {
  // The API returns data as a flat array, NOT wrapped in { list: [...] }
  const data = await cjFetch<CJVariant[] | { list: CJVariant[] }>("/product/variant/query", { params: { pid } });
  if (Array.isArray(data)) return data;
  // Fallback: some older products may return { list: [...] }
  return (data as { list: CJVariant[] }).list ?? [];
}

// ── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CJCategory[]> {
  return cjFetch<CJCategory[]>("/product/getCategory");
}

// ── Freight Calculation (Shipping to Portugal) ──────────────────────────────

export interface FreightParams {
  startCountryCode?: string;
  endCountryCode: string;
  products: { quantity: number; vid: string }[];
  zip?: string;
}

export async function calculateFreight(params: FreightParams): Promise<CJFreightOption[]> {
  return cjFetch<CJFreightOption[]>("/logistic/freightCalculate", {
    method: "POST",
    body: {
      startCountryCode: params.startCountryCode || "CN",
      endCountryCode: params.endCountryCode,
      products: params.products,
      ...(params.zip ? { zip: params.zip } : {}),
    },
  });
}

// ── Warehouses ──────────────────────────────────────────────────────────────

export async function getWarehouses(): Promise<unknown[]> {
  return cjFetch<unknown[]>("/product/globalWarehouseList");
}

// ── USD → EUR conversion (approximate, updated rarely) ─────────────────────

/** Approximate USD→EUR rate. Update periodically. */
export const USD_TO_EUR = 0.92;

export function usdToEur(usd: number): number {
  return Math.round(usd * USD_TO_EUR * 100) / 100;
}

// ── Margin & pricing helpers ────────────────────────────────────────────────

export interface PricingAnalysis {
  cjPriceUsd: number;
  cjPriceEur: number;
  shippingUsd: number;
  shippingEur: number;
  totalCostUsd: number;
  totalCostEur: number;
  suggestedPriceEur: number;
  marginEur: number;
  marginPct: number;
  freeShipping: boolean;
  shippingDays: string;
  /** Score 0-100: higher = better opportunity (considers margin, shipping, price point) */
  opportunityScore: number;
}

export function analyzePricing(
  cjPriceRaw: string | number,
  shippingOption: CJFreightOption | null,
  markup: number = 2.5
): PricingAnalysis {
  const cjPriceUsd = safeFloat(cjPriceRaw);
  const shippingUsd = safeFloat(shippingOption?.logisticPrice);
  const totalCostUsd = cjPriceUsd + shippingUsd;
  const totalCostEur = usdToEur(totalCostUsd);
  const freeShipping = shippingUsd < 0.01;

  // Smart pricing: round to .99 for clean price points
  const rawPrice = totalCostEur * markup;
  const suggestedPriceEur =
    rawPrice < 10
      ? Math.ceil(rawPrice) - 0.01 // e.g. 6.99
      : rawPrice < 30
      ? Math.ceil(rawPrice / 5) * 5 - 0.01 // e.g. 14.99, 19.99
      : Math.ceil(rawPrice / 10) * 10 - 0.01; // e.g. 29.99, 39.99

  const marginEur = Math.round((suggestedPriceEur - totalCostEur) * 100) / 100;
  const marginPct = suggestedPriceEur > 0 ? (marginEur / suggestedPriceEur) * 100 : 0;

  // Opportunity score: weights margin %, shipping cost, and absolute margin
  const marginScore = Math.min(marginPct / 70, 1) * 40; // max 40 pts
  const shippingScore = freeShipping ? 30 : shippingUsd < 2 ? 25 : shippingUsd < 5 ? 15 : 0; // max 30 pts
  const absoluteMarginScore = Math.min(marginEur / 20, 1) * 20; // max 20 pts
  const pricePointScore = suggestedPriceEur >= 9.99 && suggestedPriceEur <= 49.99 ? 10 : 5; // sweet spot
  const opportunityScore = Math.round(marginScore + shippingScore + absoluteMarginScore + pricePointScore);

  return {
    cjPriceUsd: cjPriceUsd,
    cjPriceEur: usdToEur(cjPriceUsd),
    shippingUsd: shippingUsd,
    shippingEur: usdToEur(shippingUsd),
    totalCostUsd: Math.round(totalCostUsd * 100) / 100,
    totalCostEur,
    suggestedPriceEur,
    marginEur,
    marginPct: Math.round(marginPct * 10) / 10,
    freeShipping,
    shippingDays: shippingOption?.logisticAging || "N/A",
    opportunityScore,
  };
}

// ── Spiritual product keywords for searching ────────────────────────────────

// Re-export keywords from shared location
export { SPIRITUAL_KEYWORDS, KEYWORD_CATEGORIES, TOP_OPPORTUNITY_KEYWORDS } from "@/data/keywords";
