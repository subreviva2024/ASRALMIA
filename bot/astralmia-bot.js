#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           ASTRALMIA — Bot de Vendas Profissional            ║
 * ║          Telegram + CJ Dropshipping Integration             ║
 * ║                                                              ║
 * ║  Funcionalidades:                                            ║
 * ║  • Catálogo de produtos CJ em tempo real                    ║
 * ║  • Pesquisa de produtos espirituais                         ║
 * ║  • Carrinho de compras no chat                              ║
 * ║  • Cálculo de envio para Portugal                           ║
 * ║  • Procesamento de encomendas                               ║
 * ║  • Horóscopo diário                                         ║
 * ║  • Leitura de Tarot                                         ║
 * ║  • Painel admin                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

require("dotenv").config({ path: __dirname + "/.env" });

const { Bot, InlineKeyboard, session } = require("grammy");
const { CJClient } = require("./cj-client");
const { ProductManager } = require("./product-manager");
const { OrderManager } = require("./order-manager");
const { HoroscopeEngine } = require("./horoscope");
const { TarotEngine } = require("./tarot-engine");
const { MSG, formatPrice, formatProduct, formatProductCard, formatOrderSummary, formatShippingOptions } = require("./messages");
const { KB } = require("./keyboards");
const { Analytics } = require("./analytics");
const { Cache } = require("./cache");

// ── Configuration ───────────────────────────────────────────────────────────

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
const SITE_URL = process.env.SITE_URL || "https://astralmia.com";
const BOT_PORT = parseInt(process.env.BOT_PORT || "4002", 10);

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN não definido no .env");
  process.exit(1);
}

// ── Initialize Services ─────────────────────────────────────────────────────

const cj = new CJClient();
const products = new ProductManager(cj);
const orders = new OrderManager();
const horoscope = new HoroscopeEngine();
const tarot = new TarotEngine();
const analytics = new Analytics();
const cache = new Cache();

// ── Initialize Bot ──────────────────────────────────────────────────────────

const bot = new Bot(BOT_TOKEN);

// Session middleware for cart state per user
bot.use(session({
  initial: () => ({
    cart: [],
    lastCategory: null,
    lastSearch: null,
    awaitingAddress: false,
    customerData: {},
    language: "pt",
    state: "idle", // idle, browsing, checkout, awaiting_name, awaiting_email, etc.
  }),
}));

// ── Error Handler ───────────────────────────────────────────────────────────

bot.catch((err) => {
  console.error("[ASTRALMIA BOT] Error:", err.message);
  analytics.trackError(err.message);
});

// ── /start — Welcome ────────────────────────────────────────────────────────

bot.command("start", async (ctx) => {
  analytics.trackUser(ctx.from.id, ctx.from.first_name);
  analytics.trackEvent("start");
  
  const name = ctx.from.first_name || "Alma";
  await ctx.reply(MSG.welcome(name), {
    parse_mode: "HTML",
    reply_markup: KB.mainMenu(),
  });
});

// ── /ajuda — Help ───────────────────────────────────────────────────────────

bot.command("ajuda", async (ctx) => {
  await ctx.reply(MSG.help(), { parse_mode: "HTML" });
});

bot.command("help", async (ctx) => {
  await ctx.reply(MSG.help(), { parse_mode: "HTML" });
});

// ── /loja — Shop Categories ─────────────────────────────────────────────────

bot.command("loja", async (ctx) => {
  analytics.trackEvent("loja");
  await ctx.reply(MSG.shopIntro(), {
    parse_mode: "HTML",
    reply_markup: KB.categories(),
  });
});

// ── /pesquisar — Search products ────────────────────────────────────────────

bot.command("pesquisar", async (ctx) => {
  const query = ctx.match?.trim();
  if (!query) {
    await ctx.reply(MSG.searchPrompt(), { parse_mode: "HTML" });
    ctx.session.state = "awaiting_search";
    return;
  }
  await handleSearch(ctx, query);
});

bot.command("search", async (ctx) => {
  const query = ctx.match?.trim();
  if (!query) {
    await ctx.reply(MSG.searchPrompt(), { parse_mode: "HTML" });
    ctx.session.state = "awaiting_search";
    return;
  }
  await handleSearch(ctx, query);
});

// ── /carrinho — View Cart ───────────────────────────────────────────────────

bot.command("carrinho", async (ctx) => {
  await showCart(ctx);
});

bot.command("cart", async (ctx) => {
  await showCart(ctx);
});

// ── /horoscopo [signo] — Daily Horoscope ────────────────────────────────────

bot.command("horoscopo", async (ctx) => {
  const sign = ctx.match?.trim().toLowerCase();
  if (!sign) {
    await ctx.reply(MSG.horoscopePrompt(), {
      parse_mode: "HTML",
      reply_markup: KB.zodiacSigns(),
    });
    return;
  }
  await sendHoroscope(ctx, sign);
});

// ── /tarot — Tarot Reading ──────────────────────────────────────────────────

bot.command("tarot", async (ctx) => {
  analytics.trackEvent("tarot");
  await sendTarotReading(ctx);
});

// ── /destaques — Featured products ──────────────────────────────────────────

bot.command("destaques", async (ctx) => {
  analytics.trackEvent("destaques");
  await showFeatured(ctx);
});

// ── /catalogo — Full catalog ────────────────────────────────────────────────

bot.command("catalogo", async (ctx) => {
  analytics.trackEvent("catalogo");
  await showCatalog(ctx);
});

// ── /encomenda — Order status ───────────────────────────────────────────────

bot.command("encomenda", async (ctx) => {
  const ref = ctx.match?.trim();
  if (!ref) {
    await ctx.reply(MSG.orderCheckPrompt(), { parse_mode: "HTML" });
    return;
  }
  await checkOrder(ctx, ref);
});

// ── /admin — Admin Panel ────────────────────────────────────────────────────

bot.command("admin", async (ctx) => {
  if (!isAdmin(ctx.from.id)) {
    await ctx.reply("⛔ Acesso restrito.");
    return;
  }
  await showAdminPanel(ctx);
});

// ── Callback Queries (Inline Buttons) ───────────────────────────────────────

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  analytics.trackEvent("callback", { action: data });

  try {
    // Category browsing
    if (data.startsWith("cat:")) {
      const category = data.replace("cat:", "");
      await browseCategory(ctx, category);
    }
    // Product detail
    else if (data.startsWith("prod:")) {
      const pid = data.replace("prod:", "");
      await showProductDetail(ctx, pid);
    }
    // Add to cart
    else if (data.startsWith("cart_add:")) {
      const [pid, vid] = data.replace("cart_add:", "").split("|");
      await addToCart(ctx, pid, vid);
    }
    // Remove from cart
    else if (data.startsWith("cart_rm:")) {
      const pid = data.replace("cart_rm:", "");
      await removeFromCart(ctx, pid);
    }
    // Checkout
    else if (data === "checkout") {
      await startCheckout(ctx);
    }
    // Clear cart
    else if (data === "clear_cart") {
      ctx.session.cart = [];
      await ctx.answerCallbackQuery("🗑 Carrinho limpo");
      await showCart(ctx);
    }
    // View cart
    else if (data === "view_cart") {
      await showCart(ctx);
    }
    // Continue shopping
    else if (data === "continue_shopping") {
      await ctx.answerCallbackQuery();
      await ctx.reply(MSG.shopIntro(), {
        parse_mode: "HTML",
        reply_markup: KB.categories(),
      });
    }
    // Main menu
    else if (data === "menu") {
      await ctx.answerCallbackQuery();
      await ctx.reply(MSG.mainMenuText(), {
        parse_mode: "HTML",
        reply_markup: KB.mainMenu(),
      });
    }
    // Horoscope sign
    else if (data.startsWith("horoscopo:")) {
      const sign = data.replace("horoscopo:", "");
      await sendHoroscope(ctx, sign);
    }
    // Tarot reading
    else if (data === "tarot") {
      await sendTarotReading(ctx);
    }
    // Page navigation
    else if (data.startsWith("page:")) {
      const [category, page] = data.replace("page:", "").split("|");
      await browseCategory(ctx, category, parseInt(page));
    }
    // Shipping calc
    else if (data.startsWith("ship:")) {
      const vid = data.replace("ship:", "");
      await showShipping(ctx, vid);
    }
    // Search again
    else if (data === "search_again") {
      await ctx.answerCallbackQuery();
      await ctx.reply(MSG.searchPrompt(), { parse_mode: "HTML" });
      ctx.session.state = "awaiting_search";
    }
    // Menu: categories
    else if (data === "menu_categories") {
      await ctx.answerCallbackQuery();
      await ctx.reply(MSG.shopIntro(), {
        parse_mode: "HTML",
        reply_markup: KB.categories(),
      });
    }
    // Menu: featured
    else if (data === "menu_featured") {
      await ctx.answerCallbackQuery();
      await showFeatured(ctx);
    }
    // Menu: horoscope
    else if (data === "menu_horoscope") {
      await ctx.answerCallbackQuery();
      await ctx.reply(MSG.horoscopePrompt(), {
        parse_mode: "HTML",
        reply_markup: KB.zodiacSigns(),
      });
    }
    // Admin actions
    else if (data.startsWith("admin:")) {
      if (!isAdmin(ctx.from.id)) return;
      const action = data.replace("admin:", "");
      await handleAdminAction(ctx, action);
    }
    else {
      await ctx.answerCallbackQuery("🔮");
    }
  } catch (err) {
    console.error("[Callback Error]", err.message);
    await ctx.answerCallbackQuery("❌ Erro momentâneo. Tenta novamente.");
  }
});

// ── Text Message Handler ────────────────────────────────────────────────────

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();
  const state = ctx.session.state;

  // Handle state-based input
  if (state === "awaiting_search") {
    ctx.session.state = "idle";
    await handleSearch(ctx, text);
    return;
  }

  if (state === "awaiting_name") {
    ctx.session.customerData.name = text;
    ctx.session.state = "awaiting_email";
    await ctx.reply(MSG.askEmail(), { parse_mode: "HTML" });
    return;
  }

  if (state === "awaiting_email") {
    if (!isValidEmail(text)) {
      await ctx.reply("❌ Email inválido. Tenta novamente:");
      return;
    }
    ctx.session.customerData.email = text;
    ctx.session.state = "awaiting_phone";
    await ctx.reply(MSG.askPhone(), { parse_mode: "HTML" });
    return;
  }

  if (state === "awaiting_phone") {
    ctx.session.customerData.phone = text;
    ctx.session.state = "awaiting_address";
    await ctx.reply(MSG.askAddress(), { parse_mode: "HTML" });
    return;
  }

  if (state === "awaiting_address") {
    ctx.session.customerData.address = text;
    ctx.session.state = "awaiting_city";
    await ctx.reply(MSG.askCity(), { parse_mode: "HTML" });
    return;
  }

  if (state === "awaiting_city") {
    ctx.session.customerData.city = text;
    ctx.session.state = "awaiting_zip";
    await ctx.reply(MSG.askZip(), { parse_mode: "HTML" });
    return;
  }

  if (state === "awaiting_zip") {
    if (!isValidPTZip(text)) {
      await ctx.reply("❌ Código postal inválido (formato: ####-###). Tenta novamente:");
      return;
    }
    ctx.session.customerData.zip = text;
    ctx.session.state = "awaiting_notes";
    await ctx.reply(MSG.askNotes(), { parse_mode: "HTML" });
    return;
  }

  if (state === "awaiting_notes") {
    ctx.session.customerData.notes = text === "-" || text.toLowerCase() === "não" ? "" : text;
    ctx.session.state = "confirming_order";
    await showOrderConfirmation(ctx);
    return;
  }

  if (state === "confirming_order") {
    if (text.toLowerCase() === "sim" || text.toLowerCase() === "confirmar") {
      await processOrder(ctx);
    } else if (text.toLowerCase() === "não" || text.toLowerCase() === "cancelar") {
      ctx.session.state = "idle";
      await ctx.reply("❌ Encomenda cancelada.", {
        reply_markup: KB.mainMenu(),
      });
    } else {
      await ctx.reply('Responde <b>"sim"</b> para confirmar ou <b>"não"</b> para cancelar.', { parse_mode: "HTML" });
    }
    return;
  }

  // Natural language intents
  const lower = text.toLowerCase();
  
  if (lower.includes("cristal") || lower.includes("crystal") || lower.includes("pedra")) {
    await browseCategory(ctx, "cristais");
  } else if (lower.includes("tarot") || lower.includes("oracle")) {
    await browseCategory(ctx, "tarot");
  } else if (lower.includes("incenso") || lower.includes("palo santo")) {
    await browseCategory(ctx, "incenso");
  } else if (lower.includes("vela") || lower.includes("candle")) {
    await browseCategory(ctx, "velas");
  } else if (lower.includes("joia") || lower.includes("jewelry") || lower.includes("pulseira") || lower.includes("colar")) {
    await browseCategory(ctx, "joias");
  } else if (lower.includes("meditação") || lower.includes("meditation") || lower.includes("singing bowl")) {
    await browseCategory(ctx, "meditacao");
  } else if (lower.includes("horóscopo") || lower.includes("horoscopo") || lower.includes("signo")) {
    await ctx.reply(MSG.horoscopePrompt(), {
      parse_mode: "HTML",
      reply_markup: KB.zodiacSigns(),
    });
  } else if (lower.includes("comprar") || lower.includes("loja") || lower.includes("produtos")) {
    await ctx.reply(MSG.shopIntro(), {
      parse_mode: "HTML",
      reply_markup: KB.categories(),
    });
  } else if (lower.includes("carrinho") || lower.includes("cart")) {
    await showCart(ctx);
  } else if (lower.includes("ajuda") || lower.includes("help")) {
    await ctx.reply(MSG.help(), { parse_mode: "HTML" });
  } else {
    // Default: treat as product search
    await handleSearch(ctx, text);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Core Functions ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

async function handleSearch(ctx, query) {
  analytics.trackEvent("search", { query });
  
  await ctx.reply(`🔍 A pesquisar "${query}"...`, { parse_mode: "HTML" });

  try {
    const results = await products.search(query, 8);
    
    if (!results || results.length === 0) {
      await ctx.reply(MSG.noResults(query), {
        parse_mode: "HTML",
        reply_markup: KB.searchAgain(),
      });
      return;
    }

    ctx.session.lastSearch = query;

    let message = MSG.searchResults(query, results.length);
    
    const keyboard = new InlineKeyboard();
    
    for (let i = 0; i < results.length; i++) {
      const p = results[i];
      message += formatProductCard(p, i + 1);
      keyboard.text(`🔍 ${i + 1}. Ver Detalhes`, `prod:${p.pid}`);
      if (i % 2 === 1 || i === results.length - 1) keyboard.row();
    }

    message += `\n\n🛒 Toca num produto para ver detalhes e adicionar ao carrinho.`;

    await ctx.reply(message, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  } catch (err) {
    console.error("[Search Error]", err.message);
    await ctx.reply(MSG.error(), { parse_mode: "HTML" });
  }
}

async function browseCategory(ctx, category, page = 1) {
  await ctx.answerCallbackQuery?.();
  analytics.trackEvent("browse", { category, page });

  try {
    const categoryKeywords = {
      cristais: "crystal pendant",
      tarot: "tarot deck",
      incenso: "incense holder",
      velas: "candle ritual",
      joias: "zodiac necklace",
      meditacao: "singing bowl",
      decoracao: "buddha statue",
      aromaterapia: "essential oil",
      astrologia: "zodiac",
    };

    const kw = categoryKeywords[category] || category;
    const pageSize = 6;
    const results = await products.search(kw, pageSize, page);

    if (!results || results.length === 0) {
      await ctx.reply(MSG.noResultsCategory(category), {
        parse_mode: "HTML",
        reply_markup: KB.backToCategories(),
      });
      return;
    }

    const categoryLabels = {
      cristais: "🔮 Cristais & Pedras",
      tarot: "🃏 Tarot & Oráculo",
      incenso: "🌿 Incenso & Purificação",
      velas: "🕯️ Velas Rituais",
      joias: "💎 Joias Espirituais",
      meditacao: "🧘 Meditação & Yoga",
      decoracao: "🏛️ Decoração Espiritual",
      aromaterapia: "🌸 Aromaterapia",
      astrologia: "⭐ Astrologia",
    };

    let message = `${categoryLabels[category] || category}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    const keyboard = new InlineKeyboard();

    for (let i = 0; i < results.length; i++) {
      const p = results[i];
      message += formatProductCard(p, i + 1);
      keyboard.text(`${i + 1}. Ver`, `prod:${p.pid}`).text(`🛒 Add`, `cart_add:${p.pid}|${p.vid || ""}`);
      keyboard.row();
    }

    // Pagination
    if (page > 1) {
      keyboard.text("◀️ Anterior", `page:${category}|${page - 1}`);
    }
    if (results.length === pageSize) {
      keyboard.text("Seguinte ▶️", `page:${category}|${page + 1}`);
    }
    keyboard.row();
    keyboard.text("📂 Categorias", "menu_categories").text("🛒 Carrinho", "view_cart");

    await ctx.reply(message, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  } catch (err) {
    console.error("[Browse Error]", err.message);
    await ctx.reply(MSG.error(), { parse_mode: "HTML" });
  }
}

async function showProductDetail(ctx, pid) {
  await ctx.answerCallbackQuery?.();
  analytics.trackEvent("product_view", { pid });

  try {
    const product = await products.getDetail(pid);
    if (!product) {
      await ctx.reply("❌ Produto não encontrado.");
      return;
    }

    const message = formatProduct(product);
    const keyboard = new InlineKeyboard();
    
    keyboard.text("🛒 Adicionar ao Carrinho", `cart_add:${product.pid}|${product.vid || ""}`);
    keyboard.row();
    keyboard.text("📦 Ver Envio", `ship:${product.vid || product.pid}`);
    keyboard.row();
    keyboard.text("◀️ Voltar", "continue_shopping").text("🛒 Carrinho", "view_cart");

    // Send image if available
    if (product.image && product.image.startsWith("http")) {
      try {
        await ctx.replyWithPhoto(product.image, {
          caption: message,
          parse_mode: "HTML",
          reply_markup: keyboard,
        });
        return;
      } catch {
        // Fall back to text if image fails
      }
    }

    await ctx.reply(message, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  } catch (err) {
    console.error("[Product Detail Error]", err.message);
    await ctx.reply(MSG.error(), { parse_mode: "HTML" });
  }
}

async function addToCart(ctx, pid, vid) {
  analytics.trackEvent("add_to_cart", { pid });

  try {
    let product = await products.getDetail(pid);
    if (!product) {
      await ctx.answerCallbackQuery("❌ Produto não encontrado");
      return;
    }

    // Check if already in cart
    const existing = ctx.session.cart.find(item => item.pid === pid);
    if (existing) {
      existing.qty += 1;
      await ctx.answerCallbackQuery(`✅ ${existing.name} — agora ${existing.qty}x`);
    } else {
      ctx.session.cart.push({
        pid: product.pid,
        vid: vid || product.vid || "",
        name: product.namePt || product.name,
        image: product.image,
        priceEur: product.priceEur,
        qty: 1,
        shippingLabel: product.shippingLabel || "A calcular",
      });
      await ctx.answerCallbackQuery(`🛒 ${product.namePt || product.name} adicionado!`);
    }

    const cartCount = ctx.session.cart.reduce((s, i) => s + i.qty, 0);
    const keyboard = new InlineKeyboard()
      .text(`🛒 Ver Carrinho (${cartCount})`, "view_cart")
      .text("🔮 Continuar", "continue_shopping");

    await ctx.reply(
      `✅ <b>${product.namePt || product.name}</b> adicionado ao carrinho!\n\n` +
      `🛒 Carrinho: ${cartCount} artigo(s)`,
      { parse_mode: "HTML", reply_markup: keyboard }
    );
  } catch (err) {
    console.error("[Add to Cart Error]", err.message);
    await ctx.answerCallbackQuery("❌ Erro ao adicionar");
  }
}

async function removeFromCart(ctx, pid) {
  ctx.session.cart = ctx.session.cart.filter(item => item.pid !== pid);
  await ctx.answerCallbackQuery("🗑 Removido do carrinho");
  await showCart(ctx);
}

async function showCart(ctx) {
  await ctx.answerCallbackQuery?.();
  const cart = ctx.session.cart;

  if (!cart || cart.length === 0) {
    await ctx.reply(MSG.emptyCart(), {
      parse_mode: "HTML",
      reply_markup: KB.emptyCartActions(),
    });
    return;
  }

  let total = 0;
  let message = `🛒 <b>O Teu Carrinho</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  const keyboard = new InlineKeyboard();

  for (const item of cart) {
    const subtotal = item.priceEur * item.qty;
    total += subtotal;
    message += `• <b>${item.name}</b>\n`;
    message += `  ${item.qty}× ${formatPrice(item.priceEur)} = ${formatPrice(subtotal)}\n`;
    message += `  📦 ${item.shippingLabel}\n\n`;
    keyboard.text(`❌ ${item.name.substring(0, 15)}...`, `cart_rm:${item.pid}`).row();
  }

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 <b>Total: ${formatPrice(total)}</b>\n`;
  message += `\n📦 Envio calculado no checkout.`;

  keyboard.text("🗑 Limpar Carrinho", "clear_cart").row();
  keyboard.text("✅ Finalizar Encomenda", "checkout").row();
  keyboard.text("🔮 Continuar Comprando", "continue_shopping");

  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

async function showShipping(ctx, vid) {
  await ctx.answerCallbackQuery?.();
  await ctx.reply("📦 A calcular envio para Portugal...");

  try {
    const options = await products.getShipping(vid);
    if (!options || options.length === 0) {
      await ctx.reply("📦 Envio disponível após finalização da encomenda. Portes estimados: €3-8");
      return;
    }
    await ctx.reply(formatShippingOptions(options), { parse_mode: "HTML" });
  } catch (err) {
    console.error("[Shipping Error]", err.message);
    await ctx.reply("📦 Não foi possível calcular o envio. Portes estimados: €3-8");
  }
}

async function startCheckout(ctx) {
  await ctx.answerCallbackQuery?.();

  if (!ctx.session.cart || ctx.session.cart.length === 0) {
    await ctx.reply("🛒 O teu carrinho está vazio!");
    return;
  }

  analytics.trackEvent("checkout_start");
  ctx.session.state = "awaiting_name";
  ctx.session.customerData = {};

  await ctx.reply(MSG.checkoutStart(), { parse_mode: "HTML" });
  await ctx.reply(MSG.askName(), { parse_mode: "HTML" });
}

async function showOrderConfirmation(ctx) {
  const cart = ctx.session.cart;
  const customer = ctx.session.customerData;
  const total = cart.reduce((s, i) => s + i.priceEur * i.qty, 0);

  const message = formatOrderSummary(cart, customer, total);

  await ctx.reply(message, { parse_mode: "HTML" });
  await ctx.reply(
    '✨ Escreve <b>"sim"</b> para confirmar ou <b>"não"</b> para cancelar.',
    { parse_mode: "HTML" }
  );
}

async function processOrder(ctx) {
  analytics.trackEvent("order_placed");
  
  try {
    const order = await orders.create({
      customer: ctx.session.customerData,
      items: ctx.session.cart,
      telegramUserId: ctx.from.id,
      telegramUsername: ctx.from.username,
    });

    // Clear cart and state
    ctx.session.cart = [];
    ctx.session.state = "idle";
    ctx.session.customerData = {};

    await ctx.reply(MSG.orderConfirmed(order), { parse_mode: "HTML" });

    // Notify admins
    for (const adminId of ADMIN_IDS) {
      try {
        await bot.api.sendMessage(adminId, MSG.adminNewOrder(order), { parse_mode: "HTML" });
      } catch (e) {
        console.error("[Admin Notify Error]", e.message);
      }
    }
  } catch (err) {
    console.error("[Order Error]", err.message);
    await ctx.reply(MSG.orderError(), { parse_mode: "HTML" });
  }
}

async function checkOrder(ctx, ref) {
  const order = orders.getByRef(ref.toUpperCase());
  if (!order) {
    await ctx.reply(`❌ Encomenda <b>${ref}</b> não encontrada.`, { parse_mode: "HTML" });
    return;
  }
  await ctx.reply(MSG.orderStatus(order), { parse_mode: "HTML" });
}

// ── Featured & Catalog ──────────────────────────────────────────────────────

async function showFeatured(ctx) {
  await ctx.reply("✨ A carregar destaques...");

  try {
    const featured = await products.getFeatured();
    if (!featured || featured.length === 0) {
      await ctx.reply("Sem destaques disponíveis. Tenta /loja para explorar categorias.");
      return;
    }

    let message = `✨ <b>Destaques ASTRALMIA</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    const keyboard = new InlineKeyboard();

    for (let i = 0; i < Math.min(featured.length, 8); i++) {
      const p = featured[i];
      message += formatProductCard(p, i + 1);
      keyboard.text(`${i + 1}. Ver`, `prod:${p.pid}`);
      if (i % 2 === 1) keyboard.row();
    }
    keyboard.row();
    keyboard.text("📂 Categorias", "menu_categories").text("🛒 Carrinho", "view_cart");

    await ctx.reply(message, { parse_mode: "HTML", reply_markup: keyboard });
  } catch (err) {
    console.error("[Featured Error]", err.message);
    await ctx.reply(MSG.error(), { parse_mode: "HTML" });
  }
}

async function showCatalog(ctx) {
  await ctx.reply(MSG.shopIntro(), {
    parse_mode: "HTML",
    reply_markup: KB.categories(),
  });
}

// ── Horoscope & Tarot ───────────────────────────────────────────────────────

async function sendHoroscope(ctx, sign) {
  await ctx.answerCallbackQuery?.();
  analytics.trackEvent("horoscope", { sign });

  const reading = horoscope.getDailyReading(sign);
  if (!reading) {
    await ctx.reply("❌ Signo não reconhecido. Usa: áries, touro, gémeos, etc.");
    return;
  }

  const keyboard = new InlineKeyboard()
    .text("🃏 Tirar Tarot", "tarot")
    .text("🔮 Loja", "menu");

  await ctx.reply(MSG.horoscopeReading(reading), {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

async function sendTarotReading(ctx) {
  await ctx.answerCallbackQuery?.();
  analytics.trackEvent("tarot_reading");

  const reading = tarot.threeCardReading();
  
  const keyboard = new InlineKeyboard()
    .text("🔮 Novo Tiragem", "tarot")
    .row()
    .text("⭐ Horóscopo", "menu_horoscope")
    .text("🛒 Loja", "menu");

  await ctx.reply(MSG.tarotReading(reading), {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

// ── Admin Panel ─────────────────────────────────────────────────────────────

async function showAdminPanel(ctx) {
  const stats = analytics.getStats();
  const orderStats = orders.getStats();

  let message = `⚙️ <b>Painel Admin ASTRALMIA</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👥 Utilizadores: ${stats.totalUsers}\n`;
  message += `🔍 Pesquisas: ${stats.totalSearches}\n`;
  message += `🛒 Add to Cart: ${stats.totalAddToCart}\n`;
  message += `📦 Encomendas: ${orderStats.totalOrders}\n`;
  message += `💰 Volume: €${orderStats.totalRevenue.toFixed(2)}\n`;
  message += `📊 Eventos hoje: ${stats.todayEvents}\n`;
  message += `\n⏰ Uptime: ${formatUptime(process.uptime())}\n`;

  const keyboard = new InlineKeyboard()
    .text("📦 Encomendas Pendentes", "admin:pending")
    .row()
    .text("📊 Estatísticas", "admin:stats")
    .row()
    .text("🔄 Refresh CJ Cache", "admin:refresh");

  await ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

async function handleAdminAction(ctx, action) {
  await ctx.answerCallbackQuery();

  if (action === "pending") {
    const pending = orders.getPending();
    if (pending.length === 0) {
      await ctx.reply("✅ Sem encomendas pendentes.");
      return;
    }
    let msg = `📦 <b>Encomendas Pendentes (${pending.length})</b>\n\n`;
    for (const o of pending) {
      msg += `• <b>${o.orderRef}</b> — ${o.customer.name}\n`;
      msg += `  €${o.total.toFixed(2)} · ${o.items.length} artigos\n`;
      msg += `  ${o.orderDate}\n\n`;
    }
    await ctx.reply(msg, { parse_mode: "HTML" });
  }

  if (action === "stats") {
    const stats = analytics.getDetailedStats();
    let msg = `📊 <b>Estatísticas Detalhadas</b>\n\n`;
    msg += `Top pesquisas:\n`;
    for (const [kw, count] of Object.entries(stats.topSearches).slice(0, 10)) {
      msg += `  • ${kw}: ${count}\n`;
    }
    msg += `\nTop categorias:\n`;
    for (const [cat, count] of Object.entries(stats.topCategories).slice(0, 5)) {
      msg += `  • ${cat}: ${count}\n`;
    }
    await ctx.reply(msg, { parse_mode: "HTML" });
  }

  if (action === "refresh") {
    cache.clear();
    await ctx.reply("✅ Cache CJ limpo. Próximas pesquisas serão frescas.");
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isAdmin(userId) {
  return ADMIN_IDS.includes(String(userId));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPTZip(zip) {
  return /^\d{4}[\s-]?\d{3}$/.test(zip.trim());
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

// ── Start Bot ───────────────────────────────────────────────────────────────

async function main() {
  console.log("");
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║    ASTRALMIA — Bot de Vendas Telegram    ║");
  console.log("  ║    Powered by CJ Dropshipping API        ║");
  console.log("  ╚══════════════════════════════════════════╝");
  console.log("");

  // Initialize CJ auth
  try {
    await cj.init();
    console.log("  ✅ CJ Dropshipping API conectada");
  } catch (err) {
    console.error("  ⚠️  CJ API: " + err.message + " (modo offline)");
  }

  // Set bot commands
  await bot.api.setMyCommands([
    { command: "start", description: "🌟 Iniciar — Menu principal" },
    { command: "loja", description: "🔮 Explorar loja por categorias" },
    { command: "pesquisar", description: "🔍 Pesquisar produtos" },
    { command: "destaques", description: "✨ Produtos em destaque" },
    { command: "carrinho", description: "🛒 Ver o meu carrinho" },
    { command: "horoscopo", description: "⭐ Horóscopo diário" },
    { command: "tarot", description: "🃏 Tiragem de tarot" },
    { command: "encomenda", description: "📦 Verificar encomenda" },
    { command: "ajuda", description: "❓ Ajuda e comandos" },
  ]);

  console.log("  ✅ Comandos do bot configurados");

  // Start polling
  await bot.start({
    onStart: () => {
      console.log("  ✅ Bot ativo e a receber mensagens");
      console.log("  📱 @" + (bot.botInfo?.username || "astralmia_bot"));
      console.log("");
    },
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

module.exports = { bot };
