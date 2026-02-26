/**
 * ASTRALMIA — Pricing & Markup Engine
 * Converts supplier costs into sellable catalog with margins
 */

const DEFAULT_MARKUP = 2.8;
const MIN_MARGIN_EUR = 5.00;
const SHIPPING_TO_CUSTOMER = 4.50;

// Multiplicadores médios de mercado por categoria (para simular o "valor de mercado")
const CATEGORY_MARKET_MULTIPLIER = {
  cristais: 3.5,
  tarot: 3.0,
  incenso: 4.0,
  velas: 3.5,
  livros: 2.5,
  joias: 4.5
};

/**
 * Build the full saleable catalog from supplier data.
 * @param {Array} suppliers
 * @param {number} markupMultiplier - default 2.8x
 * @returns {Array} catalog items
 */
function buildCatalog(suppliers, markupMultiplier = DEFAULT_MARKUP) {
  const catalog = [];

  for (const supplier of suppliers) {
    for (const product of supplier.products) {
      if (!product.inStock) continue;

      const totalCost = product.unitCost + (supplier.shippingCost / Math.max(product.moq, 1));
      
      // 1. Calcular o valor de mercado normal para este tipo de produto
      const marketMultiplier = CATEGORY_MARKET_MULTIPLIER[supplier.category] || 3.0;
      const marketPrice = Math.floor(totalCost * marketMultiplier) + 0.99;

      // 2. Calcular o nosso preço base com a margem definida
      let rawPrice = totalCost * markupMultiplier;
      
      // 3. Verificar oportunidades e limites de mercado
      const maxAllowedPrice = marketPrice * 1.05; // Não passar muito o valor de mercado (máx 5% acima)
      const opportunityPrice = marketPrice * 0.90; // Oportunidade: se o mercado cobra muito mais, ajustamos para 10% abaixo do mercado

      if (rawPrice > maxAllowedPrice) {
        rawPrice = maxAllowedPrice; // Cap para não ficar demasiado caro
      } else if (rawPrice < opportunityPrice) {
        rawPrice = opportunityPrice; // Aproveitar a oportunidade de aumentar a margem mantendo-se competitivo
      }

      const salePrice = Math.floor(rawPrice) + 0.99;
      const marginEur = salePrice - totalCost - SHIPPING_TO_CUSTOMER;
      const marginPct = Math.round((marginEur / salePrice) * 100);

      if (marginEur < MIN_MARGIN_EUR) continue;

      catalog.push({
        id: `${supplier.id}-${product.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
        name: product.name,
        category: supplier.category,
        salePrice,
        marketPrice, // Expor o preço de mercado para análise
        supplierPrice: product.unitCost,
        totalCost: parseFloat(totalCost.toFixed(2)),
        marginEur: parseFloat(marginEur.toFixed(2)),
        marginPct,
        moq: product.moq,
        supplier: {
          id: supplier.id,
          name: supplier.name,
          platform: supplier.platform,
          url: supplier.url,
          deliveryDays: supplier.deliveryDays,
          rating: supplier.rating,
          promo: supplier.promo || null,
        },
      });
    }
  }

  return catalog;
}

/**
 * Get topN best deals sorted by composite score (margin + delivery speed).
 */
function getBestDeals(catalog, topN = 10) {
  return [...catalog]
    .sort((a, b) => {
      const scoreA = a.marginPct * 0.7 + (30 - a.supplier.deliveryDays.max) * 0.3;
      const scoreB = b.marginPct * 0.7 + (30 - b.supplier.deliveryDays.max) * 0.3;
      return scoreB - scoreA;
    })
    .slice(0, topN);
}

/**
 * Get the cheapest item per category (by salePrice).
 */
function getCheapestByCategory(catalog) {
  const result = {};
  for (const item of catalog) {
    if (!result[item.category] || item.salePrice < result[item.category].salePrice) {
      result[item.category] = item;
    }
  }
  return result;
}

/**
 * Get all items with delivery within maxDays, sorted by price.
 */
function getFastestDelivery(catalog, maxDays = 7) {
  return catalog
    .filter((i) => i.supplier.deliveryDays.max <= maxDays)
    .sort((a, b) => a.salePrice - b.salePrice);
}

/**
 * Get items from suppliers with active promos.
 */
function getActivePromos(catalog) {
  return catalog.filter((i) => i.supplier.promo);
}

module.exports = {
  buildCatalog,
  getBestDeals,
  getCheapestByCategory,
  getFastestDelivery,
  getActivePromos,
  DEFAULT_MARKUP,
  MIN_MARGIN_EUR,
  SHIPPING_TO_CUSTOMER,
};
