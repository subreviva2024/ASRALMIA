/**
 * ASTRALMIA — CJ Dropshipping OpenClaw Plugin
 * 
 * Registers all CJ API tools with the OpenClaw Gateway agent.
 * Provides: product search, details, variants, inventory, shipping,
 *           pricing calculation, order management, tracking, and categories.
 * 
 * All tools are available to the agent via the OpenClaw tool system.
 * Config is read from the plugin config in openclaw.json or env vars.
 */

import { Type } from "@sinclair/typebox";

// ═══════════════════════════════════════════════════════════════════════════
// CJ API Client (embedded — self-contained for OpenClaw plugin isolation)
// ═══════════════════════════════════════════════════════════════════════════

class CJClient {
  constructor(config) {
    this.baseUrl = config.baseUrl || "https://developers.cjdropshipping.com/api2.0/v1";
    this.apiKey = config.apiKey || "";
    this.email = config.email || "";
    this.password = config.password || "";
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiresAt = 0;
    this.refreshExpiresAt = 0;
    this.lastRequestTime = 0;
    this.minInterval = 350; // ms between requests
  }

  async _rateWait() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minInterval) {
      await new Promise((r) => setTimeout(r, this.minInterval - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  async getAccessToken() {
    if (this.token && Date.now() < this.tokenExpiresAt - 3600_000) {
      return this.token;
    }
    if (this.refreshToken && Date.now() < this.refreshExpiresAt - 3600_000) {
      try {
        return await this._refreshAccessToken();
      } catch {
        this.token = null;
        this.refreshToken = null;
      }
    }
    const authBody = this.apiKey
      ? { apiKey: this.apiKey }
      : { email: this.email, password: this.password };
    if (!this.apiKey && !this.email) {
      throw new Error("CJ auth: set apiKey or email+password in plugin config");
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

  async _refreshAccessToken() {
    await this._rateWait();
    const res = await fetch(`${this.baseUrl}/authentication/refreshAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });
    const json = await res.json();
    if (!json.data?.accessToken) throw new Error("CJ token refresh failed");
    this._saveTokens(json.data);
    return this.token;
  }

  _saveTokens(data) {
    this.token = data.accessToken;
    this.refreshToken = data.refreshToken || this.refreshToken;
    const parse = (s, days) => {
      if (!s) return Date.now() + days * 86400_000;
      const ts = new Date(s).getTime();
      return isNaN(ts) ? Date.now() + days * 86400_000 : ts;
    };
    this.tokenExpiresAt = parse(data.accessTokenExpiryDate, 15);
    this.refreshExpiresAt = parse(data.refreshTokenExpiryDate, 180);
  }

  async apiFetch(path, opts = {}) {
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
    if (!res.ok && res.status === 401 && retry) {
      this.token = null;
      return this.apiFetch(path, { ...opts, retry: false });
    }
    const json = await res.json();
    const code = json.code !== undefined ? Number(json.code) : 200;
    if (code !== 200 && code !== 0) {
      if ((code === 1600100 || code === 1600101) && retry) {
        this.token = null;
        return this.apiFetch(path, { ...opts, retry: false });
      }
      throw new Error(`CJ API ${path}: code=${code} ${json.message || ""}`);
    }
    return json.data;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Translation Engine (EN → PT-PT)
// ═══════════════════════════════════════════════════════════════════════════

const TRANSLATION_RULES = [
  { match: (n) => /amethyst|ametist/.test(n) && /pendant|necklace/.test(n), namePt: "Colar de Ametista Natural", categoryPt: "Cristais", tagPt: "Intuição", accent: "#9b7cd4", descPt: "Pendente de ametista natural com energia purificadora. Ideal para meditação e protecção espiritual." },
  { match: (n) => /amethyst|ametist/.test(n) && /bracelet/.test(n), namePt: "Pulseira de Ametista", categoryPt: "Cristais", tagPt: "Protecção", accent: "#9b7cd4", descPt: "Pulseira de contas de ametista para protecção espiritual e clareza mental." },
  { match: (n) => /amethyst|ametist/.test(n), namePt: "Ametista Natural", categoryPt: "Cristais", tagPt: "Intuição", accent: "#9b7cd4", descPt: "Cristal de ametista natural, pedra de purificação e elevação espiritual." },
  { match: (n) => /rose quartz|quartzo rosa/.test(n), namePt: "Quartzo Rosa — Pedra do Amor", categoryPt: "Cristais", tagPt: "Amor", accent: "#c99ab0", descPt: "Quartzo rosa natural, pedra do amor incondicional e cura emocional." },
  { match: (n) => /tourmaline|turmalina/.test(n), namePt: "Turmalina Negra — Protecção", categoryPt: "Cristais", tagPt: "Protecção", accent: "#4a4a5a", descPt: "Turmalina negra, a pedra de protecção mais poderosa contra negatividade." },
  { match: (n) => /crystal.*tree|tree.*crystal/.test(n), namePt: "Árvore de Cristal", categoryPt: "Decoração", tagPt: "Abundância", accent: "#6fc98b", descPt: "Árvore decorativa com cristais naturais, símbolo de prosperidade e abundância." },
  { match: (n) => /crystal.*pendant|pendant.*crystal|crystal.*necklace/.test(n), namePt: "Pendente de Cristal Natural", categoryPt: "Cristais", tagPt: "Energia", accent: "#c9a84c", descPt: "Colar com pedra de cristal natural para protecção e equilíbrio energético." },
  { match: (n) => /crystal.*bracelet|bracelet.*crystal|bead.*bracelet/.test(n), namePt: "Pulseira de Cristais Naturais", categoryPt: "Cristais", tagPt: "Harmonia", accent: "#c9a84c", descPt: "Pulseira artesanal com contas de pedra natural para harmonização energética." },
  { match: (n) => /crystal|quartz|stone.*natural|gemstone/.test(n), namePt: "Cristal Natural", categoryPt: "Cristais", tagPt: "Energia", accent: "#c9a84c", descPt: "Pedra natural seleccionada pela sua qualidade energética. Ideal para meditação." },
  { match: (n) => /tarot.*card|tarot.*deck/.test(n), namePt: "Baralho de Tarot", categoryPt: "Tarot", tagPt: "Sabedoria", accent: "#8b6fc9", descPt: "Baralho de tarot completo com 78 cartas. Acabamento premium com arte mística." },
  { match: (n) => /oracle.*card/.test(n), namePt: "Oracle Cards", categoryPt: "Tarot", tagPt: "Oráculo", accent: "#8b6fc9", descPt: "Baralho oracle para leituras intuitivas e mensagens espirituais diárias." },
  { match: (n) => /tarot/.test(n), namePt: "Tarot — Oráculo Místico", categoryPt: "Tarot", tagPt: "Sabedoria", accent: "#8b6fc9", descPt: "Instrumento divinatório para leituras de tarot e conexão espiritual." },
  { match: (n) => /pendulum|pêndulo/.test(n), namePt: "Pêndulo de Cristal", categoryPt: "Adivinhação", tagPt: "Divinação", accent: "#8b6fc9", descPt: "Pêndulo de cristal natural para radiestesia e adivinhação." },
  { match: (n) => /rune|runas/.test(n), namePt: "Runas Nórdicas", categoryPt: "Adivinhação", tagPt: "Oráculo", accent: "#d4a837", descPt: "Conjunto de runas em pedra natural para adivinhação e meditação." },
  { match: (n) => /singing.*bowl|bowl.*singing|tibetan.*bowl/.test(n), namePt: "Taça Tibetana", categoryPt: "Meditação", tagPt: "Meditação", accent: "#c9a84c", descPt: "Taça tibetana artesanal para meditação, sound healing e purificação energética." },
  { match: (n) => /mala.*bead|prayer.*bead|108.*mala/.test(n), namePt: "Mala de Meditação — 108 Contas", categoryPt: "Meditação", tagPt: "Meditação", accent: "#6fc98b", descPt: "Mala de meditação com 108 contas de pedra natural para práticas contemplativas." },
  { match: (n) => /backflow.*incense|incense.*waterfall/.test(n), namePt: "Incensário Cascata", categoryPt: "Incenso", tagPt: "Ritual", accent: "#e8c170", descPt: "Incensário cascata com efeito de fumo descendente. Peça decorativa e funcional." },
  { match: (n) => /incense.*holder|incense.*burner/.test(n), namePt: "Suporte de Incenso", categoryPt: "Incenso", tagPt: "Purificação", accent: "#e8c170", descPt: "Suporte artístico para queima de incenso. Ritual de purificação e ambiente." },
  { match: (n) => /incense|nag champa|frankincense|sandalwood/.test(n), namePt: "Incenso Natural", categoryPt: "Incenso", tagPt: "Purificação", accent: "#e8c170", descPt: "Incenso artesanal para purificação energética e meditação." },
  { match: (n) => /palo santo/.test(n), namePt: "Palo Santo — Madeira Sagrada", categoryPt: "Incenso", tagPt: "Sagrado", accent: "#e8c170", descPt: "Palo santo selvagem colhido eticamente. Purificação energética ancestral." },
  { match: (n) => /white sage|sage.*smudge|sage.*bundle/.test(n), namePt: "Sálvia Branca — Limpeza", categoryPt: "Incenso", tagPt: "Limpeza", accent: "#6fc98b", descPt: "Bundle de sálvia branca para rituais de limpeza e purificação energética." },
  { match: (n) => /candle.*ritual|spell.*candle|ritual.*candle/.test(n), namePt: "Vela Ritual", categoryPt: "Velas", tagPt: "Ritual", accent: "#e85d75", descPt: "Vela artesanal para rituais de intenção, manifestação e meditação." },
  { match: (n) => /chakra.*candle/.test(n), namePt: "Velas dos 7 Chakras", categoryPt: "Velas", tagPt: "Chakras", accent: "#e85d75", descPt: "Conjunto de 7 velas nas cores dos chakras para equilibração energética." },
  { match: (n) => /candle/.test(n), namePt: "Vela Aromática", categoryPt: "Velas", tagPt: "Ambiente", accent: "#e85d75", descPt: "Vela aromática de cera natural para rituais e ambiente." },
  { match: (n) => /evil.*eye/.test(n), namePt: "Olho Grego — Protecção", categoryPt: "Joias", tagPt: "Protecção", accent: "#4a90d9", descPt: "Amuleto de olho grego para protecção contra mau-olhado e energias negativas." },
  { match: (n) => /zodiac.*necklace|zodiac.*pendant/.test(n), namePt: "Colar Zodíaco", categoryPt: "Joias", tagPt: "Zodíaco", accent: "#c9a84c", descPt: "Colar com pendente do signo zodiacal. Peça personalizada para a tua essência." },
  { match: (n) => /chakra.*bracelet/.test(n), namePt: "Pulseira dos 7 Chakras", categoryPt: "Joias", tagPt: "Chakras", accent: "#c9a84c", descPt: "Pulseira com 7 pedras naturais representando os chakras. Equilíbrio energético." },
  { match: (n) => /hamsa|hand.*fatima/.test(n), namePt: "Hamsa — Mão de Fátima", categoryPt: "Joias", tagPt: "Protecção", accent: "#c9a84c", descPt: "Amuleto Hamsa para protecção, sorte e afastamento de energias negativas." },
  { match: (n) => /moon.*necklace|moon.*pendant|moon.*phase/.test(n), namePt: "Colar Lua — Fases Lunares", categoryPt: "Joias", tagPt: "Lunar", accent: "#c0c0c0", descPt: "Colar com fases da lua. Conexão com os ciclos lunares e feminino sagrado." },
  { match: (n) => /dreamcatcher/.test(n), namePt: "Apanhador de Sonhos", categoryPt: "Decoração", tagPt: "Sonhos", accent: "#c9a84c", descPt: "Apanhador de sonhos artesanal para protecção durante o sono e decoração." },
  { match: (n) => /buddha.*statue|buddha.*figure/.test(n), namePt: "Estátua de Buda", categoryPt: "Decoração", tagPt: "Zen", accent: "#c9a84c", descPt: "Estátua decorativa de Buda para inspirar paz, meditação e serenidade." },
  { match: (n) => /sacred.*geometry|flower.*life/.test(n), namePt: "Geometria Sagrada", categoryPt: "Decoração", tagPt: "Sagrado", accent: "#c9a84c", descPt: "Peça com geometria sagrada. Padrões universais de criação e harmonia." },
  { match: (n) => /essential.*oil|aromatherapy/.test(n), namePt: "Óleos Essenciais", categoryPt: "Aromaterapia", tagPt: "Bem-estar", accent: "#6fc98b", descPt: "Óleos essenciais puros para aromaterapia, bem-estar e rituais." },
  { match: (n) => /diffuser|oil.*burner/.test(n), namePt: "Difusor de Aromas", categoryPt: "Aromaterapia", tagPt: "Ambiente", accent: "#6fc98b", descPt: "Difusor para óleos essenciais. Transforma o ambiente com aromas naturais." },
];

function translateProduct(nameEn) {
  const lower = (nameEn || "").toLowerCase();
  for (const rule of TRANSLATION_RULES) {
    if (rule.match(lower)) {
      return { namePt: rule.namePt, descPt: rule.descPt, categoryPt: rule.categoryPt, tagPt: rule.tagPt, accent: rule.accent };
    }
  }
  const cleaned = (nameEn || "")
    .replace(/\[.*?\]/g, "").replace(/\{.*?\}/g, "").replace(/\s+/g, " ").trim()
    .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return {
    namePt: cleaned,
    descPt: "Artefacto espiritual seleccionado com intenção. Qualidade verificada antes do envio.",
    categoryPt: "Artefactos", tagPt: "Espiritual", accent: "#c9a84c",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Pricing Engine
// ═══════════════════════════════════════════════════════════════════════════

function calculatePricing(cjPriceUsd, shippingUsd = 0, config = {}) {
  const USD_TO_EUR = config.usdToEur || 0.92;
  const markup = config.defaultMarkup || 2.5;

  const totalCostUsd = cjPriceUsd + shippingUsd;
  const totalCostEur = Math.round(totalCostUsd * USD_TO_EUR * 100) / 100;
  const cjPriceEur = Math.round(cjPriceUsd * USD_TO_EUR * 100) / 100;
  const shippingEur = Math.round(shippingUsd * USD_TO_EUR * 100) / 100;
  const freeShipping = shippingUsd < 0.01;

  const rawPrice = totalCostEur * markup;
  let suggestedPriceEur;
  if (rawPrice < 10) suggestedPriceEur = Math.ceil(rawPrice) - 0.01;
  else if (rawPrice < 30) suggestedPriceEur = Math.ceil(rawPrice / 5) * 5 - 0.01;
  else suggestedPriceEur = Math.ceil(rawPrice / 10) * 10 - 0.01;

  const marginEur = Math.round((suggestedPriceEur - totalCostEur) * 100) / 100;
  const marginPct = suggestedPriceEur > 0 ? Math.round((marginEur / suggestedPriceEur) * 1000) / 10 : 0;

  const marginScore = Math.min(marginPct / 70, 1) * 40;
  const shippingScore = freeShipping ? 30 : shippingUsd < 2 ? 25 : shippingUsd < 5 ? 15 : 0;
  const absoluteMarginScore = Math.min(marginEur / 20, 1) * 20;
  const pricePointScore = suggestedPriceEur >= 9.99 && suggestedPriceEur <= 49.99 ? 10 : 5;
  const opportunityScore = Math.round(marginScore + shippingScore + absoluteMarginScore + pricePointScore);

  return {
    cjPriceUsd, cjPriceEur, shippingUsd, shippingEur,
    totalCostUsd: Math.round(totalCostUsd * 100) / 100, totalCostEur,
    suggestedPriceEur, marginEur, marginPct, freeShipping, opportunityScore,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// OpenClaw Plugin Entry Point
// ═══════════════════════════════════════════════════════════════════════════

export default function cjDropshippingPlugin(api) {
  const pluginConfig = api.config || {};

  // Build CJ client from plugin config or env vars
  const cj = new CJClient({
    baseUrl: process.env.CJ_BASE_URL || "https://developers.cjdropshipping.com/api2.0/v1",
    apiKey: pluginConfig.apiKey || process.env.CJ_API_KEY || "",
    email: pluginConfig.email || process.env.CJ_EMAIL || "",
    password: pluginConfig.password || process.env.CJ_PASSWORD || "",
  });

  const defaultCountry = pluginConfig.defaultCountry || "PT";
  const maxCjPrice = pluginConfig.maxCjPriceUsd || 20;
  const maxRetail = pluginConfig.maxRetailEur || 49.99;

  // ─── Tool 1: Search Products ────────────────────────────────────────────

  api.registerTool({
    name: "cj_search_products",
    description:
      "Search the CJ Dropshipping catalog for products by keyword. " +
      "Use ENGLISH keywords for best results. Returns product list with " +
      "PID, name, price (USD), image, and category.",
    parameters: Type.Object({
      query: Type.String({ description: "Search keywords in English (e.g., 'crystal pendant', 'tarot deck', 'evil eye bracelet')" }),
      pageNum: Type.Optional(Type.Number({ default: 1, description: "Page number (default: 1)" })),
      pageSize: Type.Optional(Type.Number({ default: 20, description: "Results per page (default: 20, max: 200)" })),
    }),
    async execute(_id, params) {
      try {
        const data = await cj.apiFetch("/product/list", {
          params: {
            productNameEn: params.query,
            pageNum: String(params.pageNum || 1),
            pageSize: String(Math.min(params.pageSize || 20, 200)),
          },
        });
        const list = data?.list || [];
        const results = list.map((p) => ({
          pid: p.pid,
          name: p.productNameEn || p.productName,
          priceCjUsd: p.sellPrice,
          image: p.productImage,
          category: p.categoryName,
          sku: p.productSku,
          weight: p.productWeight,
        }));
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              total: data?.total || 0,
              page: data?.pageNum || 1,
              results,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 2: Product Detail ─────────────────────────────────────────────

  api.registerTool({
    name: "cj_product_detail",
    description:
      "Get detailed information about a specific CJ product by its PID. " +
      "Returns full description, images, weight, dimensions, variants info.",
    parameters: Type.Object({
      pid: Type.String({ description: "CJ Product ID (e.g., '9E5E1D2D-4A78-4B9C-...')" }),
    }),
    async execute(_id, params) {
      try {
        const detail = await cj.apiFetch("/product/query", { params: { pid: params.pid } });
        if (!detail) {
          return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Product not found" }) }] };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              product: {
                pid: detail.pid,
                name: detail.productNameEn || detail.productName,
                sku: detail.productSku,
                priceCjUsd: detail.sellPrice,
                image: detail.productImage,
                weight: detail.productWeight,
                category: detail.categoryName,
                categoryId: detail.categoryId,
                description: detail.description,
                materialName: detail.materialNameEn || detail.materialName,
                packWeight: detail.packWeight,
                packingName: detail.packingNameEn || detail.packingName,
                hsCode: detail.entryCode,
              },
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 3: Product Variants ───────────────────────────────────────────

  api.registerTool({
    name: "cj_product_variants",
    description:
      "Get all variants (sizes, colors, etc.) for a CJ product. " +
      "Returns variant IDs (VID), names, prices, dimensions, and images.",
    parameters: Type.Object({
      pid: Type.String({ description: "CJ Product ID" }),
    }),
    async execute(_id, params) {
      try {
        const data = await cj.apiFetch("/product/variant/query", { params: { pid: params.pid } });
        const variants = Array.isArray(data) ? data : data?.list || [];
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              pid: params.pid,
              totalVariants: variants.length,
              variants: variants.map((v) => ({
                vid: v.vid,
                name: v.variantNameEn || v.variantName || v.variantKey,
                sku: v.variantSku,
                priceCjUsd: v.variantSellPrice,
                weight: v.variantWeight,
                dimensions: { length: v.variantLength, width: v.variantWidth, height: v.variantHeight },
                image: v.variantImage,
              })),
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 4: Check Inventory ────────────────────────────────────────────

  api.registerTool({
    name: "cj_check_inventory",
    description:
      "Check real-time inventory/stock level for a CJ product. " +
      "Important: always verify stock before listing or ordering.",
    parameters: Type.Object({
      pid: Type.String({ description: "CJ Product ID" }),
    }),
    async execute(_id, params) {
      try {
        const data = await cj.apiFetch("/product/stock/queryByPid", { params: { pid: params.pid } });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, pid: params.pid, inventory: data }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 5: Calculate Shipping ─────────────────────────────────────────

  api.registerTool({
    name: "cj_calculate_shipping",
    description:
      "Calculate shipping/freight cost for a product to a destination country. " +
      "Returns available shipping methods with prices, delivery times, and names. " +
      "Default destination: Portugal (PT).",
    parameters: Type.Object({
      vid: Type.String({ description: "Variant ID (VID) — get from cj_product_variants" }),
      quantity: Type.Optional(Type.Number({ default: 1, description: "Quantity to ship" })),
      countryCode: Type.Optional(Type.String({ default: "PT", description: "ISO country code (default: PT for Portugal)" })),
      zip: Type.Optional(Type.String({ description: "Optional ZIP/postal code for more accurate calculation" })),
    }),
    async execute(_id, params) {
      try {
        const data = await cj.apiFetch("/logistic/freightCalculate", {
          method: "POST",
          body: {
            startCountryCode: "CN",
            endCountryCode: params.countryCode || defaultCountry,
            products: [{ quantity: params.quantity || 1, vid: params.vid }],
            ...(params.zip ? { zip: params.zip } : {}),
          },
        });
        const options = (Array.isArray(data) ? data : []).map((s) => ({
          method: s.logisticName,
          priceUsd: s.logisticPrice,
          priceCny: s.logisticPriceCn,
          deliveryDays: s.logisticAging,
        }));
        options.sort((a, b) => (a.priceUsd || 999) - (b.priceUsd || 999));
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              vid: params.vid,
              destination: params.countryCode || defaultCountry,
              totalOptions: options.length,
              cheapest: options[0] || null,
              allOptions: options,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 6: Calculate Pricing ──────────────────────────────────────────

  api.registerTool({
    name: "cj_calculate_pricing",
    description:
      "Calculate ASTRALMIA retail pricing for a product. " +
      "Takes CJ wholesale price + shipping, applies 2.5× markup, " +
      "rounds to .99 price points, and returns margin analysis + opportunity score (0-100).",
    parameters: Type.Object({
      cjPriceUsd: Type.Number({ description: "CJ wholesale price in USD" }),
      shippingUsd: Type.Optional(Type.Number({ default: 0, description: "Shipping cost in USD" })),
      customMarkup: Type.Optional(Type.Number({ description: "Optional custom markup multiplier (default: 2.5)" })),
    }),
    async execute(_id, params) {
      const cfg = { ...pluginConfig };
      if (params.customMarkup) cfg.defaultMarkup = params.customMarkup;
      const pricing = calculatePricing(params.cjPriceUsd, params.shippingUsd || 0, cfg);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: true, pricing }, null, 2),
        }],
      };
    },
  });

  // ─── Tool 7: Translate Product ──────────────────────────────────────────

  api.registerTool({
    name: "cj_translate_product",
    description:
      "Translate a CJ product name from English to Portuguese (PT-PT) " +
      "for the ASTRALMIA store. Returns translated name, description, " +
      "category, tag, and accent color.",
    parameters: Type.Object({
      nameEn: Type.String({ description: "Product name in English" }),
    }),
    async execute(_id, params) {
      const translation = translateProduct(params.nameEn);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: true, original: params.nameEn, ...translation }, null, 2),
        }],
      };
    },
  });

  // ─── Tool 8: Create Order ──────────────────────────────────────────────

  api.registerTool({
    name: "cj_create_order",
    description:
      "Create a new order on CJ Dropshipping. Requires shipping address " +
      "and at least one product/variant. Returns CJ order ID.",
    parameters: Type.Object({
      orderNumber: Type.String({ description: "Your unique order reference (e.g., 'AST-XXXXX')" }),
      shippingCountryCode: Type.String({ description: "ISO country code (e.g., 'PT')" }),
      shippingCountry: Type.String({ description: "Country name (e.g., 'Portugal')" }),
      shippingProvince: Type.String({ description: "Province/state" }),
      shippingCity: Type.String({ description: "City" }),
      shippingAddress: Type.String({ description: "Full street address" }),
      shippingZip: Type.String({ description: "Postal/ZIP code" }),
      shippingPhone: Type.String({ description: "Phone number with country code" }),
      shippingCustomerName: Type.String({ description: "Customer full name" }),
      logisticName: Type.String({ description: "Shipping method name (from cj_calculate_shipping)" }),
      products: Type.Array(
        Type.Object({
          vid: Type.String({ description: "Variant ID" }),
          quantity: Type.Number({ description: "Quantity" }),
        }),
        { description: "Array of products to order" }
      ),
    }),
    async execute(_id, params) {
      try {
        const data = await cj.apiFetch("/shopping/order/createOrderV2", {
          method: "POST",
          body: {
            orderNumber: params.orderNumber,
            shippingCountryCode: params.shippingCountryCode,
            shippingCountry: params.shippingCountry,
            shippingProvince: params.shippingProvince,
            shippingCity: params.shippingCity,
            shippingAddress: params.shippingAddress,
            shippingZip: params.shippingZip,
            shippingPhone: params.shippingPhone,
            shippingCustomerName: params.shippingCustomerName,
            logisticName: params.logisticName,
            shopLogisticsType: 2,
            products: params.products,
          },
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              cjOrderId: data?.orderId || data,
              orderNumber: params.orderNumber,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 9: Order Detail ──────────────────────────────────────────────

  api.registerTool({
    name: "cj_order_detail",
    description: "Get details for an existing CJ order by order ID.",
    parameters: Type.Object({
      orderId: Type.String({ description: "CJ Order ID" }),
    }),
    async execute(_id, params) {
      try {
        const data = await cj.apiFetch("/shopping/order/getOrderDetail", { params: { orderId: params.orderId } });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, order: data }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 10: Track Shipment ───────────────────────────────────────────

  api.registerTool({
    name: "cj_track_shipment",
    description:
      "Track a shipment by tracking number. Returns delivery status, " +
      "location history, and estimated delivery.",
    parameters: Type.Object({
      trackNumber: Type.String({ description: "Tracking/waybill number" }),
    }),
    async execute(_id, params) {
      try {
        const data = await cj.apiFetch("/logistic/getTrackInfo", { params: { trackNumber: params.trackNumber } });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, tracking: data }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 11: List Categories ──────────────────────────────────────────

  api.registerTool({
    name: "cj_list_categories",
    description: "List all available product categories in CJ Dropshipping.",
    parameters: Type.Object({}),
    async execute() {
      try {
        const data = await cj.apiFetch("/product/getCategory");
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, categories: data }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 12: List Warehouses ──────────────────────────────────────────

  api.registerTool({
    name: "cj_list_warehouses",
    description: "List all CJ global warehouses with IDs and names.",
    parameters: Type.Object({}),
    async execute() {
      try {
        const data = await cj.apiFetch("/product/globalWarehouseList");
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, warehouses: data }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 13: Full Product Analysis ────────────────────────────────────

  api.registerTool({
    name: "cj_analyze_product",
    description:
      "Complete analysis of a CJ product for ASTRALMIA. " +
      "Gets product detail + variants + cheapest shipping to Portugal + " +
      "pricing calculation + Portuguese translation. All-in-one tool " +
      "for evaluating whether a product should be listed in the store.",
    parameters: Type.Object({
      pid: Type.String({ description: "CJ Product ID" }),
    }),
    async execute(_id, params) {
      try {
        // 1. Get product detail
        const detail = await cj.apiFetch("/product/query", { params: { pid: params.pid } });
        if (!detail) return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Product not found" }) }] };

        const cjPriceUsd = parseFloat(detail.sellPrice || 0);
        const nameEn = detail.productNameEn || detail.productName;

        // 2. Get variants
        let variants = [];
        try {
          const vData = await cj.apiFetch("/product/variant/query", { params: { pid: params.pid } });
          variants = Array.isArray(vData) ? vData : vData?.list || [];
        } catch { /* skip */ }

        const vid = variants[0]?.vid || "";

        // 3. Get shipping to Portugal
        let shippingOptions = [];
        let cheapestShipping = null;
        if (vid) {
          try {
            const sData = await cj.apiFetch("/logistic/freightCalculate", {
              method: "POST",
              body: {
                startCountryCode: "CN",
                endCountryCode: defaultCountry,
                products: [{ quantity: 1, vid }],
              },
            });
            shippingOptions = Array.isArray(sData) ? sData : [];
            if (shippingOptions.length) {
              cheapestShipping = shippingOptions.reduce(
                (a, b) => ((parseFloat(a.logisticPrice) || 999) <= (parseFloat(b.logisticPrice) || 999) ? a : b)
              );
            }
          } catch { /* skip */ }
        }

        const shippingUsd = cheapestShipping ? parseFloat(cheapestShipping.logisticPrice) || 0 : 0;

        // 4. Calculate pricing
        const pricing = calculatePricing(cjPriceUsd, shippingUsd, pluginConfig);

        // 5. Translate
        const translation = translateProduct(nameEn);

        // 6. Check inventory
        let inventory = null;
        try {
          inventory = await cj.apiFetch("/product/stock/queryByPid", { params: { pid: params.pid } });
        } catch { /* skip */ }

        // 7. Evaluate
        const meetsPrice = cjPriceUsd <= maxCjPrice;
        const meetsRetail = pricing.suggestedPriceEur <= maxRetail;
        const hasImage = detail.productImage && detail.productImage.startsWith("http");
        const recommended = meetsPrice && meetsRetail && hasImage && pricing.opportunityScore >= 50;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              analysis: {
                product: {
                  pid: detail.pid, name: nameEn,
                  namePt: translation.namePt, descPt: translation.descPt,
                  categoryPt: translation.categoryPt, tagPt: translation.tagPt,
                  accent: translation.accent,
                  image: detail.productImage,
                  weight: detail.productWeight, sku: detail.productSku,
                },
                variants: {
                  total: variants.length,
                  firstVid: vid,
                  list: variants.slice(0, 5).map((v) => ({
                    vid: v.vid, name: v.variantNameEn || v.variantKey, price: v.variantSellPrice,
                  })),
                },
                shipping: {
                  cheapest: cheapestShipping
                    ? { method: cheapestShipping.logisticName, priceUsd: cheapestShipping.logisticPrice, days: cheapestShipping.logisticAging }
                    : null,
                  totalOptions: shippingOptions.length,
                },
                pricing,
                inventory,
                evaluation: {
                  recommended,
                  meetsPrice, meetsRetail, hasImage,
                  opportunityScore: pricing.opportunityScore,
                  verdict: recommended
                    ? `✅ RECOMENDADO — Score ${pricing.opportunityScore}/100 | ${translation.namePt} a €${pricing.suggestedPriceEur}`
                    : `⚠️ NÃO RECOMENDADO — ${!meetsPrice ? "preço CJ muito alto" : !meetsRetail ? "preço venda excede máximo" : !hasImage ? "sem imagem" : "score baixo"}`,
                },
                storeUrl: `https://astralmia.com/loja/cj/${detail.pid}`,
              },
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // ─── Tool 14: Bulk Search & Analyze ────────────────────────────────────

  api.registerTool({
    name: "cj_bulk_search",
    description:
      "Search CJ products by keyword and automatically analyze the top results. " +
      "Returns translated names, pricing, margins, and opportunity scores. " +
      "Perfect for discovering new products to add to the ASTRALMIA catalog.",
    parameters: Type.Object({
      query: Type.String({ description: "Search keywords in English" }),
      limit: Type.Optional(Type.Number({ default: 5, description: "Max products to analyze (default: 5, max: 10)" })),
    }),
    async execute(_id, params) {
      try {
        const limit = Math.min(params.limit || 5, 10);
        const data = await cj.apiFetch("/product/list", {
          params: {
            productNameEn: params.query,
            pageNum: "1",
            pageSize: String(limit * 2),
          },
        });

        const list = (data?.list || []).slice(0, limit * 2);
        const results = [];

        for (const p of list) {
          if (results.length >= limit) break;

          const cjPrice = parseFloat(p.sellPrice || 0);
          if (cjPrice <= 0 || cjPrice > maxCjPrice) continue;
          if (!p.productImage || !p.productImage.startsWith("http")) continue;

          const nameEn = p.productNameEn || p.productName;
          const translation = translateProduct(nameEn);

          // Get first variant + shipping
          let vid = "";
          let shippingUsd = 0;
          let shippingDays = "7-15";
          try {
            const vData = await cj.apiFetch("/product/variant/query", { params: { pid: p.pid } });
            const variants = Array.isArray(vData) ? vData : vData?.list || [];
            vid = variants[0]?.vid || "";
          } catch { /* skip */ }

          if (vid) {
            try {
              const sData = await cj.apiFetch("/logistic/freightCalculate", {
                method: "POST",
                body: {
                  startCountryCode: "CN",
                  endCountryCode: defaultCountry,
                  products: [{ quantity: 1, vid }],
                },
              });
              const options = Array.isArray(sData) ? sData : [];
              if (options.length) {
                const cheapest = options.reduce(
                  (a, b) => ((parseFloat(a.logisticPrice) || 999) <= (parseFloat(b.logisticPrice) || 999) ? a : b)
                );
                shippingUsd = parseFloat(cheapest.logisticPrice) || 0;
                shippingDays = cheapest.logisticAging || "7-15";
              }
            } catch { /* skip */ }
          }

          const pricing = calculatePricing(cjPrice, shippingUsd, pluginConfig);
          if (pricing.suggestedPriceEur > maxRetail) continue;

          results.push({
            rank: results.length + 1,
            pid: p.pid, vid,
            nameEn, namePt: translation.namePt,
            categoryPt: translation.categoryPt, tagPt: translation.tagPt,
            image: p.productImage,
            priceCjUsd: cjPrice,
            priceEur: pricing.suggestedPriceEur,
            marginPct: pricing.marginPct,
            opportunityScore: pricing.opportunityScore,
            shipping: pricing.freeShipping ? "Grátis" : `$${shippingUsd.toFixed(2)}`,
            shippingDays,
            storeUrl: `https://astralmia.com/loja/cj/${p.pid}`,
          });
        }

        results.sort((a, b) => b.opportunityScore - a.opportunityScore);
        results.forEach((r, i) => (r.rank = i + 1));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              query: params.query,
              totalAnalyzed: results.length,
              results,
              bestPick: results[0]
                ? `✅ #${results[0].rank} ${results[0].namePt} — €${results[0].priceEur} (Score: ${results[0].opportunityScore}/100)`
                : "Nenhum produto encontrado com critérios ASTRALMIA",
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: err.message }) }] };
      }
    },
  });

  // Log registration
  console.log("🔮 ASTRALMIA CJ Dropshipping plugin loaded — 14 tools registered");
}
