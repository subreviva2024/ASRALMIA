/**
 * ASTRALMIA — Message Templates
 * All Portuguese (PT-PT) messages for the Telegram bot
 * Professional, mystical, customer-friendly tone
 */

// ── Price Formatting ────────────────────────────────────────────────────────

function formatPrice(eur) {
  if (typeof eur !== "number" || isNaN(eur)) return "€0,00";
  return `€${eur.toFixed(2).replace(".", ",")}`;
}

// ── Product Card (compact, for lists) ───────────────────────────────────────

function formatProductCard(product, index) {
  const badge = product.tagPt ? `[${product.tagPt}]` : "";
  const shipping = product.freeShipping ? "✈️ Envio Grátis" : `📦 ${product.shippingLabel || ""}`;
  
  return (
    `<b>${index}. ${product.namePt || product.name}</b> ${badge}\n` +
    `   💰 ${formatPrice(product.priceEur)}  ${shipping}\n` +
    `   📅 Entrega: ${product.shippingDays || "7-15"} dias\n\n`
  );
}

// ── Detailed Product ────────────────────────────────────────────────────────

function formatProduct(product) {
  const badge = product.tagPt ? `✦ ${product.tagPt}` : "";
  const shipping = product.freeShipping ? "✈️ Envio Grátis" : `📦 ${product.shippingLabel}`;
  
  let msg = `🔮 <b>${product.namePt || product.name}</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  if (badge) msg += `${badge}\n`;
  if (product.categoryPt) msg += `📂 ${product.categoryPt}\n`;
  msg += `\n`;
  if (product.descPt) msg += `${product.descPt}\n\n`;
  msg += `💰 <b>${formatPrice(product.priceEur)}</b>\n`;
  msg += `${shipping}\n`;
  msg += `📅 Entrega: ${product.shippingDays || "7-15"} dias (Portugal)\n`;
  
  if (product.variants && product.variants.length > 1) {
    msg += `\n🎨 ${product.variants.length} variantes disponíveis\n`;
  }

  return msg;
}

// ── Order Summary ───────────────────────────────────────────────────────────

function formatOrderSummary(cart, customer, total) {
  let msg = `📋 <b>Resumo da Encomenda</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  msg += `👤 <b>Dados do Cliente</b>\n`;
  msg += `   Nome: ${customer.name}\n`;
  msg += `   Email: ${customer.email}\n`;
  if (customer.phone) msg += `   Tel: ${customer.phone}\n`;
  msg += `   Morada: ${customer.address}\n`;
  msg += `   ${customer.zip} ${customer.city}, Portugal\n`;
  if (customer.notes) msg += `   Notas: ${customer.notes}\n`;
  
  msg += `\n🛒 <b>Artigos</b>\n`;
  for (const item of cart) {
    const subtotal = (item.priceEur || 0) * (item.qty || 1);
    msg += `   • ${item.name}\n`;
    msg += `     ${item.qty}× ${formatPrice(item.priceEur)} = ${formatPrice(subtotal)}\n`;
  }
  
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 <b>Total: ${formatPrice(total)}</b>\n`;

  return msg;
}

// ── Shipping Options ────────────────────────────────────────────────────────

function formatShippingOptions(options) {
  let msg = `📦 <b>Opções de Envio para Portugal</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const opt of options.slice(0, 5)) {
    const price = typeof opt.logisticPrice === "number" ? opt.logisticPrice : parseFloat(opt.logisticPrice || "0");
    const priceEur = Math.round(price * 0.92 * 100) / 100;
    const label = price < 0.01 ? "GRÁTIS 🎉" : formatPrice(priceEur);
    
    msg += `• <b>${opt.logisticName || "Standard"}</b>\n`;
    msg += `  💰 ${label}  📅 ${opt.logisticAging || "7-15"} dias\n\n`;
  }

  return msg;
}

// ── Static Messages ─────────────────────────────────────────────────────────

const MSG = {
  // ── Welcome ────────────────────────────────────────────────────────────
  welcome: (name) => (
    `✨ <b>Bem-vindo/a à ASTRALMIA, ${name}!</b> ✨\n\n` +
    `Sou a <b>Caela</b>, a tua guia espiritual e assistente de compras.\n\n` +
    `🔮 Explora a nossa loja de produtos esotéricos\n` +
    `⭐ Recebe o teu horóscopo diário\n` +
    `🃏 Faz uma tiragem de tarot\n` +
    `🛒 Compra directamente por aqui\n\n` +
    `<i>Escolhe uma opção abaixo ou escreve o que procuras.</i>`
  ),

  mainMenuText: () => (
    `🌙 <b>ASTRALMIA</b> — Menu Principal\n\n` +
    `O que gostarias de explorar?`
  ),

  // ── Help ───────────────────────────────────────────────────────────────
  help: () => (
    `❓ <b>Comandos ASTRALMIA</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🔮 /loja — Explorar loja por categorias\n` +
    `🔍 /pesquisar [texto] — Pesquisar produtos\n` +
    `✨ /destaques — Produtos em destaque\n` +
    `🛒 /carrinho — Ver o teu carrinho\n` +
    `⭐ /horoscopo [signo] — Horóscopo diário\n` +
    `🃏 /tarot — Tiragem de 3 cartas\n` +
    `📦 /encomenda [ref] — Estado da encomenda\n` +
    `❓ /ajuda — Esta mensagem\n\n` +
    `<i>Ou simplesmente escreve o que procuras — eu encontro!</i> 🌟`
  ),

  // ── Shop ───────────────────────────────────────────────────────────────
  shopIntro: () => (
    `🔮 <b>Loja ASTRALMIA</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Explora as nossas categorias de produtos espirituais.\n` +
    `Todos os produtos são enviados directamente para Portugal.\n\n` +
    `<i>Escolhe uma categoria:</i>`
  ),

  // ── Search ─────────────────────────────────────────────────────────────
  searchPrompt: () => (
    `🔍 <b>Pesquisar Produtos</b>\n\n` +
    `Escreve o que procuras e eu encontro os melhores produtos para ti.\n\n` +
    `<i>Exemplos: cristal, tarot, incenso, pulseira, colar zodíaco...</i>`
  ),

  searchResults: (query, count) => (
    `🔍 <b>Resultados para "${query}"</b>\n` +
    `Encontrei ${count} produto(s):\n━━━━━━━━━━━━━━━━━━━━\n\n`
  ),

  noResults: (query) => (
    `😔 Sem resultados para "<b>${query}</b>".\n\n` +
    `<i>Sugestões:</i>\n` +
    `• Tenta termos em inglês (ex: "crystal", "tarot")\n` +
    `• Usa palavras mais genéricas\n` +
    `• Explora as categorias da /loja`
  ),

  noResultsCategory: (category) => (
    `😔 Sem produtos disponíveis nesta categoria de momento.\n\n` +
    `Volta mais tarde ou explora outras categorias.`
  ),

  // ── Cart ───────────────────────────────────────────────────────────────
  emptyCart: () => (
    `🛒 <b>Carrinho vazio</b>\n\n` +
    `Ainda não adicionaste nenhum produto.\n` +
    `Explora a /loja ou /pesquisar para encontrar algo especial! 🔮`
  ),

  // ── Checkout ──────────────────────────────────────────────────────────
  checkoutStart: () => (
    `✅ <b>Finalizar Encomenda</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Vou precisar de alguns dados para processar a tua encomenda.\n` +
    `Vamos por passos — responde a cada pergunta. 📝`
  ),

  askName: () => `📝 Qual é o teu <b>nome completo</b>?`,
  askEmail: () => `📧 Qual é o teu <b>email</b>?`,
  askPhone: () => `📱 <b>Telemóvel</b> (para contacto de entrega):`,
  askAddress: () => `🏠 <b>Morada completa</b> (rua e número):`,
  askCity: () => `🏙️ <b>Cidade</b>:`,
  askZip: () => `📮 <b>Código postal</b> (formato ####-###):`,
  askNotes: () => (
    `📝 <b>Notas adicionais</b> para a encomenda?\n` +
    `<i>(Escreve "-" ou "não" se não tiveres nenhuma)</i>`
  ),

  // ── Order Confirmed ──────────────────────────────────────────────────
  orderConfirmed: (order) => (
    `🎉 <b>Encomenda Confirmada!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📋 Referência: <b>${order.orderRef}</b>\n` +
    `💰 Total: <b>${formatPrice(order.total)}</b>\n\n` +
    `📧 Vais receber um email de confirmação em breve.\n` +
    `📦 Podes verificar o estado com /encomenda ${order.orderRef}\n\n` +
    `✨ <i>Que o universo abençoe a tua compra!</i> 🌟\n\n` +
    `💳 <b>Dados para pagamento:</b>\n` +
    `Enviaremos os dados de pagamento por email.\n` +
    `Após confirmação, a encomenda é processada em 24-48h.`
  ),

  orderError: () => (
    `❌ <b>Erro ao processar encomenda</b>\n\n` +
    `Houve um problema técnico. Por favor tenta novamente ou contacta-nos directamente.\n` +
    `📧 suporte@astralmia.com`
  ),

  orderCheckPrompt: () => (
    `📦 Para verificar o estado da tua encomenda, escreve:\n` +
    `/encomenda AST-XXXXXX\n\n` +
    `<i>Substitui AST-XXXXXX pela tua referência.</i>`
  ),

  orderStatus: (order) => {
    const statusLabels = {
      PENDING: "⏳ Pendente — à espera de pagamento",
      PAID: "💳 Pago — a processar",
      PROCESSING: "📦 Em processamento",
      SHIPPED: "🚚 Enviado",
      DELIVERED: "✅ Entregue",
      CANCELLED: "❌ Cancelado",
    };
    let msg = `📋 <b>Encomenda ${order.orderRef}</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `Estado: ${statusLabels[order.status] || order.status}\n`;
    msg += `Data: ${new Date(order.orderDate).toLocaleDateString("pt-PT")}\n`;
    msg += `Total: ${formatPrice(order.total)}\n`;
    if (order.trackingNumber) {
      msg += `\n📦 Tracking: <code>${order.trackingNumber}</code>\n`;
      if (order.trackingUrl) msg += `🔗 ${order.trackingUrl}\n`;
    }
    msg += `\n<b>Artigos:</b>\n`;
    for (const item of order.items) {
      msg += `  • ${item.name} × ${item.qty}\n`;
    }
    return msg;
  },

  // ── Horoscope ─────────────────────────────────────────────────────────
  horoscopePrompt: () => (
    `⭐ <b>Horóscopo Diário</b>\n\n` +
    `Escolhe o teu signo zodiacal:`
  ),

  horoscopeReading: (reading) => {
    let msg = `${reading.symbol} <b>${reading.sign}</b> — Horóscopo de Hoje\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📅 ${reading.dates} · ${reading.element} · ${reading.planet}\n\n`;
    msg += `🌟 <b>Geral</b>\n${reading.general}\n\n`;
    msg += `💕 <b>Amor</b>\n${reading.love}\n\n`;
    msg += `💼 <b>Trabalho</b>\n${reading.work}\n\n`;
    msg += `🧘 <b>Bem-Estar</b>\n${reading.wellness}\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🔮 Cristal do Dia: ${reading.luckyCrystal}\n`;
    msg += `🔢 Número: ${reading.luckyNumber}\n`;
    msg += `${reading.energyLevel} Energia: ${reading.mood}\n`;
    return msg;
  },

  // ── Tarot ─────────────────────────────────────────────────────────────
  tarotReading: (reading) => {
    let msg = `🃏 <b>Tiragem de Tarot — ${reading.spread}</b>\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (const card of reading.cards) {
      const arrow = card.isReversed ? "↓" : "↑";
      msg += `<b>${card.position}</b> ${arrow}\n`;
      msg += `🎴 <b>${card.card}</b>`;
      if (card.isReversed) msg += ` (Invertida)`;
      msg += `\n`;
      if (card.suit) msg += `   Naipe: ${card.suit} · ${card.element}\n`;
      msg += `   <i>${card.meaning}</i>\n\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `✨ <b>Síntese</b>\n`;
    msg += `<i>${reading.synthesis}</i>\n\n`;
    msg += `<i>Leitura gerada a ${new Date().toLocaleDateString("pt-PT")}</i>`;

    return msg;
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  adminNewOrder: (order) => (
    `🔔 <b>NOVA ENCOMENDA!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📋 Ref: <b>${order.orderRef}</b>\n` +
    `👤 ${order.customer.name} <${order.customer.email}>\n` +
    `🏠 ${order.customer.address}, ${order.customer.zip} ${order.customer.city}\n` +
    `💰 Total: <b>${formatPrice(order.total)}</b>\n` +
    `📦 ${order.items.length} artigo(s)\n` +
    `🕐 ${new Date(order.orderDate).toLocaleString("pt-PT")}\n` +
    (order.telegram?.username ? `💬 @${order.telegram.username}` : "")
  ),

  // ── Error ─────────────────────────────────────────────────────────────
  error: () => (
    `❌ Ocorreu um erro momentâneo. Por favor tenta novamente.\n` +
    `Se o problema persistir, contacta-nos: suporte@astralmia.com`
  ),
};

module.exports = { MSG, formatPrice, formatProduct, formatProductCard, formatOrderSummary, formatShippingOptions };
