/**
 * ASTRALMIA — Product Manager
 * Manages CJ product search, pricing, translations, and caching
 * 
 * Features:
 * - Smart search with spiritual keywords
 * - Portuguese product translations
 * - Margin & pricing calculation
 * - Product caching (1h TTL)
 * - Featured product curation
 * - Shipping calculation
 */

const { Cache } = require("./cache");

const USD_TO_EUR = 0.92;
const DEFAULT_MARKUP = 2.5;
const MAX_CJ_PRICE_USD = 20;
const MAX_SHIPPING_USD = 8;
const MAX_RETAIL_EUR = 49.99;

// ── Translation rules (EN → PT-PT) ─────────────────────────────────────────

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

// ── Featured Keywords (curated for best-selling spiritual products) ──────────

const FEATURED_KEYWORDS = [
  { kw: "crystal pendant", label: "Cristais", tag: "Energia" },
  { kw: "evil eye bracelet", label: "Joias", tag: "Protecção" },
  { kw: "pendulum dowsing", label: "Adivinhação", tag: "Divinação" },
  { kw: "backflow incense", label: "Incenso", tag: "Ritual" },
  { kw: "tarot deck", label: "Tarot", tag: "Sabedoria" },
  { kw: "zodiac necklace", label: "Joias", tag: "Zodíaco" },
  { kw: "crystal tree", label: "Decoração", tag: "Abundância" },
  { kw: "singing bowl", label: "Meditação", tag: "Meditação" },
];

class ProductManager {
  constructor(cjClient) {
    this.cj = cjClient;
    this.cache = new Cache(3600_000); // 1h TTL
    this.detailCache = new Cache(7200_000); // 2h TTL for details
  }

  // ── Search Products ───────────────────────────────────────────────────────

  async search(keyword, limit = 8, page = 1) {
    const cacheKey = `search:${keyword}:${page}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { list } = await this.cj.searchProducts(keyword, page, limit);
      if (!list || list.length === 0) return [];

      const results = [];

      for (const p of list.slice(0, limit)) {
        try {
          if (!this._isValidImage(p.productImage)) continue;
          if (!this._isRelevant(p.productNameEn || p.productName, keyword)) continue;

          const cjPrice = this._safeFloat(p.sellPrice);
          if (cjPrice <= 0 || cjPrice > MAX_CJ_PRICE_USD) continue;

          // Get first variant for VID
          let variants = [];
          try {
            variants = await this.cj.getProductVariants(p.pid);
          } catch { /* skip */ }

          const firstVariant = variants[0];
          const vid = firstVariant?.vid || "";

          // Calculate shipping to Portugal
          let shipping = [];
          if (vid) {
            try {
              shipping = await this.cj.calculateFreight("PT", [{ quantity: 1, vid }]);
            } catch { /* skip */ }
          }

          const cheapest = shipping.length
            ? shipping.reduce((a, b) => (this._safeFloat(a.logisticPrice) <= this._safeFloat(b.logisticPrice) ? a : b))
            : null;

          const pricing = this._calculatePricing(cjPrice, cheapest);
          if (pricing.suggestedPriceEur > MAX_RETAIL_EUR) continue;
          if (cheapest && this._safeFloat(cheapest.logisticPrice) > MAX_SHIPPING_USD) continue;

          // Translate to Portuguese
          const translation = this._translate(p.productNameEn || p.productName);

          results.push({
            pid: p.pid,
            vid,
            name: p.productNameEn || p.productName,
            namePt: translation.namePt,
            descPt: translation.descPt,
            categoryPt: translation.categoryPt,
            tagPt: translation.tagPt,
            accent: translation.accent,
            image: p.productImage,
            priceEur: pricing.suggestedPriceEur,
            cjPriceEur: pricing.cjPriceEur,
            totalCostEur: pricing.totalCostEur,
            marginPct: pricing.marginPct,
            freeShipping: pricing.freeShipping,
            shippingLabel: pricing.freeShipping
              ? "Envio Grátis 🎉"
              : `Portes ~€${pricing.shippingEur.toFixed(2)}`,
            shippingDays: cheapest?.logisticAging || "7-15",
            opportunityScore: pricing.opportunityScore,
          });
        } catch {
          // Skip individual product errors
        }
      }

      // Sort by opportunity score
      results.sort((a, b) => b.opportunityScore - a.opportunityScore);

      this.cache.set(cacheKey, results);
      return results;
    } catch (err) {
      console.error("[ProductManager] Search error:", err.message);
      return [];
    }
  }

  // ── Get Product Detail ────────────────────────────────────────────────────

  async getDetail(pid) {
    const cacheKey = `detail:${pid}`;
    const cached = this.detailCache.get(cacheKey);
    if (cached) return cached;

    try {
      const detail = await this.cj.getProductDetail(pid);
      if (!detail) return null;

      let variants = [];
      try {
        variants = await this.cj.getProductVariants(pid);
      } catch { /* skip */ }

      const vid = variants[0]?.vid || "";
      const cjPrice = this._safeFloat(detail.sellPrice);

      // Shipping
      let shipping = [];
      if (vid) {
        try {
          shipping = await this.cj.calculateFreight("PT", [{ quantity: 1, vid }]);
        } catch { /* skip */ }
      }

      const cheapest = shipping.length
        ? shipping.reduce((a, b) => (this._safeFloat(a.logisticPrice) <= this._safeFloat(b.logisticPrice) ? a : b))
        : null;

      const pricing = this._calculatePricing(cjPrice, cheapest);
      const translation = this._translate(detail.productNameEn || detail.productName);

      const result = {
        pid: detail.pid,
        vid,
        name: detail.productNameEn || detail.productName,
        namePt: translation.namePt,
        descPt: translation.descPt,
        categoryPt: translation.categoryPt,
        tagPt: translation.tagPt,
        accent: translation.accent,
        image: detail.productImage,
        description: detail.description || "",
        priceEur: pricing.suggestedPriceEur,
        cjPriceEur: pricing.cjPriceEur,
        totalCostEur: pricing.totalCostEur,
        marginPct: pricing.marginPct,
        freeShipping: pricing.freeShipping,
        shippingLabel: pricing.freeShipping
          ? "Envio Grátis 🎉"
          : `Portes ~€${pricing.shippingEur.toFixed(2)}`,
        shippingDays: cheapest?.logisticAging || "7-15",
        shippingOptions: shipping,
        variants: variants.slice(0, 10).map(v => ({
          vid: v.vid,
          name: v.variantNameEn || v.variantKey || v.variantName || "",
          price: v.variantSellPrice,
          image: v.variantImage,
        })),
        opportunityScore: pricing.opportunityScore,
      };

      this.detailCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error("[ProductManager] Detail error:", err.message);
      return null;
    }
  }

  // ── Get Featured Products ─────────────────────────────────────────────────

  async getFeatured() {
    const cached = this.cache.get("featured");
    if (cached) return cached;

    const all = [];
    for (const entry of FEATURED_KEYWORDS) {
      try {
        const results = await this.search(entry.kw, 3);
        all.push(...results);
      } catch { /* skip */ }
    }

    // Deduplicate by pid
    const seen = new Set();
    const unique = all.filter(p => {
      if (seen.has(p.pid)) return false;
      seen.add(p.pid);
      return true;
    });

    // Sort by opportunity score
    unique.sort((a, b) => b.opportunityScore - a.opportunityScore);
    const featured = unique.slice(0, 12);

    this.cache.set("featured", featured);
    return featured;
  }

  // ── Get Shipping Options ──────────────────────────────────────────────────

  async getShipping(vid) {
    if (!vid) return [];
    try {
      const options = await this.cj.calculateFreight("PT", [{ quantity: 1, vid }]);
      return (options || []).sort((a, b) => this._safeFloat(a.logisticPrice) - this._safeFloat(b.logisticPrice));
    } catch {
      return [];
    }
  }

  // ── Pricing Logic ─────────────────────────────────────────────────────────

  _calculatePricing(cjPriceUsd, cheapestShipping, markup = DEFAULT_MARKUP) {
    const shippingUsd = cheapestShipping ? this._safeFloat(cheapestShipping.logisticPrice) : 0;
    const totalCostUsd = cjPriceUsd + shippingUsd;
    const totalCostEur = this._usdToEur(totalCostUsd);
    const freeShipping = shippingUsd < 0.01;

    // Smart pricing: round to .99 price points
    const rawPrice = totalCostEur * markup;
    let suggestedPriceEur;
    if (rawPrice < 10) suggestedPriceEur = Math.ceil(rawPrice) - 0.01;
    else if (rawPrice < 30) suggestedPriceEur = Math.ceil(rawPrice / 5) * 5 - 0.01;
    else suggestedPriceEur = Math.ceil(rawPrice / 10) * 10 - 0.01;

    const marginEur = Math.round((suggestedPriceEur - totalCostEur) * 100) / 100;
    const marginPct = suggestedPriceEur > 0 ? (marginEur / suggestedPriceEur) * 100 : 0;

    // Opportunity score
    const marginScore = Math.min(marginPct / 70, 1) * 40;
    const shippingScore = freeShipping ? 30 : shippingUsd < 2 ? 25 : shippingUsd < 5 ? 15 : 0;
    const absoluteMarginScore = Math.min(marginEur / 20, 1) * 20;
    const pricePointScore = suggestedPriceEur >= 9.99 && suggestedPriceEur <= 49.99 ? 10 : 5;
    const opportunityScore = Math.round(marginScore + shippingScore + absoluteMarginScore + pricePointScore);

    return {
      cjPriceUsd,
      cjPriceEur: this._usdToEur(cjPriceUsd),
      shippingUsd,
      shippingEur: this._usdToEur(shippingUsd),
      totalCostUsd: Math.round(totalCostUsd * 100) / 100,
      totalCostEur,
      suggestedPriceEur,
      marginEur,
      marginPct: Math.round(marginPct * 10) / 10,
      freeShipping,
      opportunityScore,
    };
  }

  // ── Translation ───────────────────────────────────────────────────────────

  _translate(nameEn) {
    const lower = (nameEn || "").toLowerCase();
    for (const rule of TRANSLATION_RULES) {
      if (rule.match(lower)) {
        return {
          namePt: rule.namePt,
          descPt: rule.descPt,
          categoryPt: rule.categoryPt,
          tagPt: rule.tagPt,
          accent: rule.accent,
        };
      }
    }
    return {
      namePt: this._cleanName(nameEn),
      descPt: "Artefacto espiritual seleccionado com intenção. Qualidade verificada antes do envio.",
      categoryPt: "Artefactos",
      tagPt: "Espiritual",
      accent: "#c9a84c",
    };
  }

  _cleanName(name) {
    return (name || "")
      .replace(/\[.*?\]/g, "")
      .replace(/\{.*?\}/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  _isRelevant(productName, keyword) {
    const lower = (productName || "").toLowerCase();
    const primaryWord = keyword.split(" ")[0].toLowerCase();
    return lower.includes(primaryWord);
  }

  _isValidImage(url) {
    if (!url || url.length < 10) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  }

  _safeFloat(v) {
    if (v === null || v === undefined || v === "") return 0;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return isNaN(n) ? 0 : n;
  }

  _usdToEur(usd) {
    return Math.round(usd * USD_TO_EUR * 100) / 100;
  }
}

module.exports = { ProductManager };
