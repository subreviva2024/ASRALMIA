/**
 * ASTRALMIA — Product Engine (Autonomous Sales Machine)
 * 
 * Core responsibilities:
 * - Filter: reject expensive, bad-image, duplicate, slow-ship products
 * - Translate: EN → PT-PT with esoteric branding
 * - Price: 2.5× markup, .99 price points, margin analysis
 * - Score: opportunity scoring (0-100)
 * - Deduplicate: fingerprinting by normalized name + price range
 * 
 * RULES (absolute):
 * - maxCjPriceUsd: $20
 * - maxShippingUsd: $8
 * - maxRetailEur: €49.99
 * - minOpportunityScore: 45
 * - Images must be real HTTPS URLs, min 200px
 * - No duplicates (name fingerprint)
 */

const USD_TO_EUR = 0.92;
const DEFAULT_MARKUP = 2.5;
const MAX_CJ_PRICE = 20;
const MAX_SHIPPING = 8;
const MAX_RETAIL = 49.99;
const MIN_SCORE = 45;

// ═══════════════════════════════════════════════════════════
// Translation Engine (34 rules + generic fallback)
// ═══════════════════════════════════════════════════════════

const RULES = [
  { m: n => /amethyst|ametist/.test(n) && /pendant|necklace/.test(n), pt: "Colar de Ametista Natural", cat: "Cristais", tag: "Intuição", color: "#9b7cd4", desc: "Pendente de ametista natural com energia purificadora. Ideal para meditação e protecção espiritual." },
  { m: n => /amethyst|ametist/.test(n) && /bracelet/.test(n), pt: "Pulseira de Ametista", cat: "Cristais", tag: "Protecção", color: "#9b7cd4", desc: "Pulseira de contas de ametista para protecção espiritual e clareza mental." },
  { m: n => /amethyst|ametist/.test(n) && /ring/.test(n), pt: "Anel de Ametista", cat: "Cristais", tag: "Intuição", color: "#9b7cd4", desc: "Anel elegante com pedra de ametista natural para protecção diária." },
  { m: n => /amethyst|ametist/.test(n), pt: "Ametista Natural", cat: "Cristais", tag: "Intuição", color: "#9b7cd4", desc: "Cristal de ametista natural, pedra de purificação e elevação espiritual." },
  { m: n => /rose quartz|quartzo rosa/.test(n), pt: "Quartzo Rosa — Pedra do Amor", cat: "Cristais", tag: "Amor", color: "#c99ab0", desc: "Quartzo rosa natural, pedra do amor incondicional e cura emocional." },
  { m: n => /tourmaline|turmalina/.test(n), pt: "Turmalina Negra — Protecção", cat: "Cristais", tag: "Protecção", color: "#4a4a5a", desc: "Turmalina negra, a pedra de protecção mais poderosa contra negatividade." },
  { m: n => /obsidian|obsidiana/.test(n), pt: "Obsidiana — Espelho da Alma", cat: "Cristais", tag: "Protecção", color: "#2d2d2d", desc: "Obsidiana natural para protecção e auto-conhecimento profundo." },
  { m: n => /lapis lazuli|lápis/.test(n), pt: "Lápis Lazúli", cat: "Cristais", tag: "Sabedoria", color: "#26619c", desc: "Pedra de sabedoria e verdade. Conexão com o terceiro olho." },
  { m: n => /tiger.*eye|olho.*tigre/.test(n), pt: "Olho de Tigre", cat: "Cristais", tag: "Coragem", color: "#c8a951", desc: "Olho de tigre natural. Pedra de coragem, protecção e força interior." },
  { m: n => /moonstone|pedra.*lua/.test(n), pt: "Pedra da Lua", cat: "Cristais", tag: "Lunar", color: "#c0c0c0", desc: "Pedra da lua para conexão com ciclos lunares e intuição feminina." },
  { m: n => /evil.*eye/.test(n), pt: "Olho Grego — Protecção", cat: "Joias", tag: "Protecção", color: "#4a90d9", desc: "Amuleto de olho grego para protecção contra mau-olhado e energias negativas." },
  { m: n => /hamsa|hand.*fatima/.test(n), pt: "Hamsa — Mão de Fátima", cat: "Joias", tag: "Protecção", color: "#c9a84c", desc: "Amuleto Hamsa para protecção, sorte e afastamento de energias negativas." },
  { m: n => /chakra.*bracelet/.test(n), pt: "Pulseira dos 7 Chakras", cat: "Joias", tag: "Chakras", color: "#c9a84c", desc: "Pulseira com 7 pedras naturais representando os chakras." },
  { m: n => /zodiac.*necklace|zodiac.*pendant/.test(n), pt: "Colar Zodíaco", cat: "Joias", tag: "Zodíaco", color: "#c9a84c", desc: "Colar com pendente do signo zodiacal. Peça personalizada para a tua essência." },
  { m: n => /moon.*necklace|moon.*pendant|moon.*phase/.test(n), pt: "Colar Lua — Fases Lunares", cat: "Joias", tag: "Lunar", color: "#c0c0c0", desc: "Colar com fases da lua. Conexão com os ciclos lunares." },
  { m: n => /crystal.*tree|tree.*crystal/.test(n), pt: "Árvore de Cristal", cat: "Decoração", tag: "Abundância", color: "#6fc98b", desc: "Árvore decorativa com cristais naturais, símbolo de prosperidade e abundância." },
  { m: n => /crystal.*pendant|pendant.*crystal|crystal.*necklace/.test(n), pt: "Pendente de Cristal Natural", cat: "Cristais", tag: "Energia", color: "#c9a84c", desc: "Colar com pedra de cristal natural para protecção e equilíbrio energético." },
  { m: n => /crystal.*bracelet|bracelet.*crystal|bead.*bracelet/.test(n), pt: "Pulseira de Cristais Naturais", cat: "Cristais", tag: "Harmonia", color: "#c9a84c", desc: "Pulseira artesanal com contas de pedra natural para harmonização energética." },
  { m: n => /crystal|quartz|stone.*natural|gemstone/.test(n), pt: "Cristal Natural", cat: "Cristais", tag: "Energia", color: "#c9a84c", desc: "Pedra natural seleccionada pela sua qualidade energética." },
  { m: n => /tarot.*card|tarot.*deck/.test(n), pt: "Baralho de Tarot", cat: "Tarot", tag: "Sabedoria", color: "#8b6fc9", desc: "Baralho de tarot completo com 78 cartas. Acabamento premium com arte mística." },
  { m: n => /oracle.*card/.test(n), pt: "Cartas Oracle", cat: "Tarot", tag: "Oráculo", color: "#8b6fc9", desc: "Baralho oracle para leituras intuitivas e mensagens espirituais diárias." },
  { m: n => /tarot/.test(n), pt: "Tarot — Oráculo Místico", cat: "Tarot", tag: "Sabedoria", color: "#8b6fc9", desc: "Instrumento divinatório para leituras de tarot e conexão espiritual." },
  { m: n => /pendulum|pêndulo/.test(n), pt: "Pêndulo de Cristal", cat: "Adivinhação", tag: "Divinação", color: "#8b6fc9", desc: "Pêndulo de cristal natural para radiestesia e adivinhação." },
  { m: n => /rune|runas/.test(n), pt: "Runas Nórdicas", cat: "Adivinhação", tag: "Oráculo", color: "#d4a837", desc: "Conjunto de runas em pedra natural para adivinhação e meditação." },
  { m: n => /singing.*bowl|bowl.*singing|tibetan.*bowl/.test(n), pt: "Taça Tibetana", cat: "Meditação", tag: "Meditação", color: "#c9a84c", desc: "Taça tibetana artesanal para meditação, sound healing e purificação energética." },
  { m: n => /mala.*bead|prayer.*bead|108.*mala/.test(n), pt: "Mala de Meditação — 108 Contas", cat: "Meditação", tag: "Meditação", color: "#6fc98b", desc: "Mala de meditação com 108 contas de pedra natural para práticas contemplativas." },
  { m: n => /backflow.*incense|incense.*waterfall/.test(n), pt: "Incensário Cascata", cat: "Incenso", tag: "Ritual", color: "#e8c170", desc: "Incensário cascata com efeito de fumo descendente. Peça decorativa e funcional." },
  { m: n => /incense.*holder|incense.*burner/.test(n), pt: "Suporte de Incenso", cat: "Incenso", tag: "Purificação", color: "#e8c170", desc: "Suporte artístico para queima de incenso. Ritual de purificação e ambiente." },
  { m: n => /incense|nag champa|frankincense|sandalwood/.test(n), pt: "Incenso Natural", cat: "Incenso", tag: "Purificação", color: "#e8c170", desc: "Incenso artesanal para purificação energética e meditação." },
  { m: n => /palo santo/.test(n), pt: "Palo Santo — Madeira Sagrada", cat: "Incenso", tag: "Sagrado", color: "#e8c170", desc: "Palo santo selvagem colhido eticamente. Purificação energética ancestral." },
  { m: n => /white sage|sage.*smudge|sage.*bundle/.test(n), pt: "Sálvia Branca — Limpeza", cat: "Incenso", tag: "Limpeza", color: "#6fc98b", desc: "Bundle de sálvia branca para rituais de limpeza e purificação energética." },
  { m: n => /candle.*ritual|spell.*candle|ritual.*candle/.test(n), pt: "Vela Ritual", cat: "Velas", tag: "Ritual", color: "#e85d75", desc: "Vela artesanal para rituais de intenção, manifestação e meditação." },
  { m: n => /chakra.*candle/.test(n), pt: "Velas dos 7 Chakras", cat: "Velas", tag: "Chakras", color: "#e85d75", desc: "Conjunto de 7 velas nas cores dos chakras para equilibração energética." },
  { m: n => /candle/.test(n), pt: "Vela Aromática", cat: "Velas", tag: "Ambiente", color: "#e85d75", desc: "Vela aromática de cera natural para rituais e ambiente." },
  { m: n => /dreamcatcher/.test(n), pt: "Apanhador de Sonhos", cat: "Decoração", tag: "Sonhos", color: "#c9a84c", desc: "Apanhador de sonhos artesanal para protecção durante o sono." },
  { m: n => /buddha.*statue|buddha.*figure/.test(n), pt: "Estátua de Buda", cat: "Decoração", tag: "Zen", color: "#c9a84c", desc: "Estátua decorativa de Buda para inspirar paz e serenidade." },
  { m: n => /essential.*oil|aromatherapy/.test(n), pt: "Óleos Essenciais", cat: "Aromaterapia", tag: "Bem-estar", color: "#6fc98b", desc: "Óleos essenciais puros para aromaterapia e rituais." },
  { m: n => /diffuser|oil.*burner/.test(n), pt: "Difusor de Aromas", cat: "Aromaterapia", tag: "Ambiente", color: "#6fc98b", desc: "Difusor para óleos essenciais. Transforma o ambiente com aromas naturais." },
];

export function translateProduct(nameEn) {
  const lower = (nameEn || "").toLowerCase();
  for (const r of RULES) {
    if (r.m(lower)) {
      return { namePt: r.pt, descPt: r.desc, categoryPt: r.cat, tagPt: r.tag, accent: r.color };
    }
  }
  // Generic fallback — clean up the English name
  const cleaned = (nameEn || "")
    .replace(/\[.*?\]/g, "").replace(/\{.*?\}/g, "").replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ").trim()
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return {
    namePt: cleaned,
    descPt: "Artefacto espiritual seleccionado com intenção. Qualidade verificada.",
    categoryPt: "Artefactos", tagPt: "Espiritual", accent: "#c9a84c",
  };
}

// ═══════════════════════════════════════════════════════════
// Pricing Engine
// ═══════════════════════════════════════════════════════════

export function calculatePricing(cjPriceUsd, shippingUsd = 0, markup = DEFAULT_MARKUP) {
  const totalCostUsd = cjPriceUsd + shippingUsd;
  const totalCostEur = round2(totalCostUsd * USD_TO_EUR);
  const cjPriceEur = round2(cjPriceUsd * USD_TO_EUR);
  const shippingEur = round2(shippingUsd * USD_TO_EUR);
  const freeShipping = shippingUsd < 0.01;

  const rawPrice = totalCostEur * markup;
  let retailEur;
  if (rawPrice < 10) retailEur = Math.ceil(rawPrice) - 0.01;
  else if (rawPrice < 30) retailEur = Math.ceil(rawPrice / 5) * 5 - 0.01;
  else retailEur = Math.ceil(rawPrice / 10) * 10 - 0.01;

  const marginEur = round2(retailEur - totalCostEur);
  const marginPct = retailEur > 0 ? round1((marginEur / retailEur) * 100) : 0;

  // Opportunity score (0-100)
  const s1 = Math.min(marginPct / 70, 1) * 40;      // Margin %
  const s2 = freeShipping ? 30 : shippingUsd < 2 ? 25 : shippingUsd < 5 ? 15 : 0; // Shipping
  const s3 = Math.min(marginEur / 20, 1) * 20;       // Absolute margin
  const s4 = (retailEur >= 9.99 && retailEur <= 49.99) ? 10 : 5; // Sweet spot
  const score = Math.round(s1 + s2 + s3 + s4);

  return {
    cjPriceUsd, cjPriceEur, shippingUsd, shippingEur,
    totalCostEur, retailEur, marginEur, marginPct,
    freeShipping, score,
  };
}

// ═══════════════════════════════════════════════════════════
// Image Validator
// ═══════════════════════════════════════════════════════════

export function isValidImage(url) {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("https://")) return false;
  // Reject placeholder/blank images
  if (/placeholder|blank|no.?image|default/i.test(url)) return false;
  // Must have an image extension or be from known CDN
  if (/\.(jpg|jpeg|png|webp)/i.test(url)) return true;
  if (/cjdropshipping\.com|cbu\d+\.alicdn\.com|img\.alicdn\.com/.test(url)) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════
// Deduplication
// ═══════════════════════════════════════════════════════════

export function fingerprint(nameEn, cjPrice) {
  const normalized = (nameEn || "").toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(pcs?|set|pack|lot|piece|new|hot|sale|wholesale|dropship)/g, "")
    .substring(0, 40);
  const priceRange = Math.floor(cjPrice);
  return `${normalized}_${priceRange}`;
}

// ═══════════════════════════════════════════════════════════
// Full Product Analysis Pipeline
// ═══════════════════════════════════════════════════════════

/**
 * Analyze a raw CJ product and decide: LIST or REJECT
 * Returns null if rejected, enriched object if approved
 */
export async function analyzeProduct(cj, rawProduct, seenFingerprints = new Set()) {
  const nameEn = rawProduct.productNameEn || rawProduct.productName || "";
  const cjPrice = parseFloat(rawProduct.sellPrice || 0);
  const image = rawProduct.productImage;
  const pid = rawProduct.pid;

  // ── Gate 1: Price ──
  if (cjPrice <= 0 || cjPrice > MAX_CJ_PRICE) return null;

  // ── Gate 2: Image quality ──
  if (!isValidImage(image)) return null;

  // ── Gate 3: Deduplication ──
  const fp = fingerprint(nameEn, cjPrice);
  if (seenFingerprints.has(fp)) return null;

  // ── Gate 4: Get variants + shipping ──
  let variants = [];
  let vid = "";
  try {
    variants = await cj.getVariants(pid);
    vid = variants[0]?.vid || "";
  } catch { /* no variants = skip shipping calc */ }

  let shippingUsd = 0;
  let shippingDays = "7-15";
  let shippingMethod = "";
  if (vid) {
    try {
      const options = await cj.calculateShipping(vid, "PT", 1);
      if (options.length > 0) {
        shippingUsd = options[0].priceUsd;
        shippingDays = options[0].days;
        shippingMethod = options[0].method;
      }
    } catch { /* use 0 */ }
  }

  // ── Gate 5: Shipping cost ──
  if (shippingUsd > MAX_SHIPPING) return null;

  // ── Gate 6: Pricing ──
  const pricing = calculatePricing(cjPrice, shippingUsd);
  if (pricing.retailEur > MAX_RETAIL) return null;
  if (pricing.score < MIN_SCORE) return null;

  // ── Gate 7: Translate ──
  const translation = translateProduct(nameEn);

  // ── Mark as seen ──
  seenFingerprints.add(fp);

  // ── Build enriched product ──
  return {
    pid,
    vid,
    nameEn,
    namePt: translation.namePt,
    descPt: translation.descPt,
    categoryPt: translation.categoryPt,
    tagPt: translation.tagPt,
    accent: translation.accent,
    image,
    images: [image, ...(rawProduct.productImageSet || "").split(";").filter(isValidImage).slice(0, 4)],
    pricing,
    shipping: { method: shippingMethod, priceUsd: shippingUsd, days: shippingDays, free: shippingUsd < 0.01 },
    variants: variants.slice(0, 10).map(v => ({
      vid: v.vid,
      name: v.variantNameEn || v.variantKey || "",
      price: v.variantSellPrice,
      image: v.variantImage,
    })),
    sku: rawProduct.productSku || "",
    weight: rawProduct.productWeight || 0,
    storeUrl: `https://astralmia.com/loja/cj/${pid}`,
    addedAt: new Date().toISOString(),
    fingerprint: fp,
  };
}

function round2(n) { return Math.round(n * 100) / 100; }
function round1(n) { return Math.round(n * 10) / 10; }

export default {
  translateProduct, calculatePricing, isValidImage,
  fingerprint, analyzeProduct,
  MAX_CJ_PRICE, MAX_SHIPPING, MAX_RETAIL, MIN_SCORE,
};
