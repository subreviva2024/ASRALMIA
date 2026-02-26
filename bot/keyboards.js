/**
 * ASTRALMIA — Inline Keyboard Layouts
 * All Telegram inline keyboard configurations
 */

const { InlineKeyboard } = require("grammy");

const KB = {
  // ── Main Menu ─────────────────────────────────────────────────────────
  mainMenu: () => {
    return new InlineKeyboard()
      .text("🔮 Loja", "menu_categories")
      .text("🔍 Pesquisar", "search_again")
      .row()
      .text("✨ Destaques", "menu_featured")
      .text("🛒 Carrinho", "view_cart")
      .row()
      .text("⭐ Horóscopo", "menu_horoscope")
      .text("🃏 Tarot", "tarot")
      .row()
      .url("🌐 Website", "https://astralmia.com");
  },

  // ── Categories ────────────────────────────────────────────────────────
  categories: () => {
    return new InlineKeyboard()
      .text("🔮 Cristais", "cat:cristais")
      .text("🃏 Tarot", "cat:tarot")
      .row()
      .text("🌿 Incenso", "cat:incenso")
      .text("🕯️ Velas", "cat:velas")
      .row()
      .text("💎 Joias", "cat:joias")
      .text("🧘 Meditação", "cat:meditacao")
      .row()
      .text("🏛️ Decoração", "cat:decoracao")
      .text("🌸 Aromaterapia", "cat:aromaterapia")
      .row()
      .text("⭐ Astrologia", "cat:astrologia")
      .row()
      .text("🛒 Carrinho", "view_cart")
      .text("🏠 Menu", "menu");
  },

  // ── Zodiac Signs ──────────────────────────────────────────────────────
  zodiacSigns: () => {
    return new InlineKeyboard()
      .text("♈ Áries", "horoscopo:aries")
      .text("♉ Touro", "horoscopo:touro")
      .text("♊ Gémeos", "horoscopo:gemeos")
      .row()
      .text("♋ Caranguejo", "horoscopo:caranguejo")
      .text("♌ Leão", "horoscopo:leao")
      .text("♍ Virgem", "horoscopo:virgem")
      .row()
      .text("♎ Balança", "horoscopo:balanca")
      .text("♏ Escorpião", "horoscopo:escorpiao")
      .text("♐ Sagitário", "horoscopo:sagitario")
      .row()
      .text("♑ Capricórnio", "horoscopo:capricornio")
      .text("♒ Aquário", "horoscopo:aquario")
      .text("♓ Peixes", "horoscopo:peixes");
  },

  // ── Search Again ──────────────────────────────────────────────────────
  searchAgain: () => {
    return new InlineKeyboard()
      .text("🔍 Nova Pesquisa", "search_again")
      .text("📂 Categorias", "menu_categories")
      .row()
      .text("🏠 Menu", "menu");
  },

  // ── Back to Categories ────────────────────────────────────────────────
  backToCategories: () => {
    return new InlineKeyboard()
      .text("📂 Categorias", "menu_categories")
      .text("🛒 Carrinho", "view_cart")
      .row()
      .text("🏠 Menu", "menu");
  },

  // ── Empty Cart Actions ────────────────────────────────────────────────
  emptyCartActions: () => {
    return new InlineKeyboard()
      .text("🔮 Explorar Loja", "menu_categories")
      .text("🔍 Pesquisar", "search_again")
      .row()
      .text("✨ Destaques", "menu_featured");
  },
};

module.exports = { KB };
