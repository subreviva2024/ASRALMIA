/**
 * Spiritual product search keywords for CJ Dropshipping sourcing.
 * Shared between client (sourcing page) and server (API routes).
 *
 * Organized by category for the bulk scanner.
 * Focus: spiritual/esoteric products with good margins for the Portugal market.
 */

export const KEYWORD_CATEGORIES: Record<string, string[]> = {
  // ── Cristais & Pedras ─────────────────────────────────────────────────
  cristais: [
    "crystal",
    "amethyst",
    "rose quartz",
    "obsidian",
    "selenite",
    "pyrite",
    "citrine crystal",
    "tiger eye stone",
    "lapis lazuli",
    "moonstone",
    "labradorite",
    "tourmaline black",
    "clear quartz point",
    "fluorite crystal",
    "malachite stone",
    "jade stone",
    "carnelian crystal",
    "aventurine green",
    "agate stone",
    "crystal cluster",
    "raw crystal",
    "crystal tower",
    "crystal sphere",
    "crystal pyramid",
    "crystal heart",
    "crystal skull",
    "geode",
    "tumbled stones set",
    "crystal grid",
    "chakra stones set",
    "healing crystal set",
    "crystal wand",
    "worry stone",
    "palm stone",
    "crystal tree",
    "crystal angel",
  ],

  // ── Tarot & Oraculos ─────────────────────────────────────────────────
  tarot: [
    "tarot cards",
    "oracle cards",
    "tarot deck",
    "tarot cloth",
    "tarot bag",
    "tarot box",
    "divination cards",
    "angel cards",
    "rune stones",
    "rune set",
    "pendulum",
    "pendulum mat",
    "dowsing pendulum",
    "crystal pendulum",
    "scrying mirror",
  ],

  // ── Incenso & Limpeza Energética ──────────────────────────────────────
  incenso: [
    "incense",
    "incense sticks",
    "incense holder",
    "incense burner",
    "nag champa",
    "palo santo",
    "white sage",
    "sage smudge",
    "sage bundle",
    "smudge kit",
    "incense cones",
    "backflow incense",
    "dragon incense burner",
    "incense waterfall",
    "resin incense",
    "frankincense",
    "myrrh incense",
    "sandalwood incense",
    "copal incense",
  ],

  // ── Velas & Rituais ───────────────────────────────────────────────────
  velas: [
    "candle ritual",
    "spell candle",
    "chakra candle",
    "soy candle",
    "pillar candle",
    "candle holder",
    "candle mold",
    "beeswax candle",
    "black candle",
    "ritual candle set",
    "moon candle",
  ],

  // ── Estátuas & Decoração Espiritual ───────────────────────────────────
  decoracao: [
    "buddha statue",
    "ganesh statue",
    "shiva statue",
    "goddess statue",
    "fairy statue",
    "angel figurine",
    "moon lamp",
    "moon phase wall",
    "sun and moon decor",
    "mandala tapestry",
    "zodiac tapestry",
    "dreamcatcher",
    "evil eye decor",
    "hamsa hand",
    "tree of life",
    "altar table",
    "altar cloth",
    "crystal display",
    "moon phase garland",
    "celestial decor",
    "sacred geometry",
    "flower of life",
    "pentagram",
    "triquetra",
    "om symbol",
    "yin yang decor",
    "witch decor",
  ],

  // ── Joias Espirituais ─────────────────────────────────────────────────
  joias: [
    "crystal necklace",
    "gemstone ring",
    "energy bracelet",
    "chakra bracelet",
    "evil eye bracelet",
    "evil eye necklace",
    "hamsa necklace",
    "mala beads",
    "108 mala",
    "moon necklace",
    "zodiac necklace",
    "zodiac ring",
    "crystal earrings",
    "amethyst pendant",
    "rose quartz pendant",
    "lapis lazuli jewelry",
    "tiger eye bracelet",
    "obsidian bracelet",
    "tree of life necklace",
    "lotus jewelry",
    "ankh pendant",
    "pentagram ring",
    "moonstone ring",
    "labradorite ring",
  ],

  // ── Meditação & Yoga ──────────────────────────────────────────────────
  meditacao: [
    "singing bowl",
    "tibetan singing bowl",
    "crystal singing bowl",
    "meditation cushion",
    "yoga mat",
    "meditation timer",
    "mala necklace",
    "zen garden mini",
    "tibetan bell",
    "tingsha bells",
    "tuning fork healing",
    "sound healing",
    "eye pillow",
    "singing bowl set",
  ],

  // ── Aromaterapia & Óleos ──────────────────────────────────────────────
  aromaterapia: [
    "essential oil diffuser",
    "essential oil set",
    "aromatherapy",
    "oil burner",
    "wax melt warmer",
    "roller bottle",
    "essential oil bracelet",
    "aroma lamp",
  ],

  // ── Astrologia ────────────────────────────────────────────────────────
  astrologia: [
    "astrology",
    "zodiac poster",
    "birth chart",
    "zodiac mug",
    "constellation lamp",
    "zodiac sticker",
    "astrology book",
    "planet mobile",
    "star projector",
    "celestial jewelry",
    "moon phase calendar",
  ],

  // ── Livros & Conhecimento ─────────────────────────────────────────────
  livros: [
    "spiritual book",
    "tarot guide",
    "crystal book",
    "wicca book",
    "occult book",
    "journal blank",
    "grimoire journal",
    "book of shadows",
    "moon journal",
    "gratitude journal",
  ],

  // ── Ferramentas Mágicas ───────────────────────────────────────────────
  ferramentas: [
    "wand wood",
    "crystal ball",
    "mortar and pestle",
    "cauldron",
    "athame knife",
    "chalice cup",
    "witchcraft kit",
    "spell jar",
    "herb set ritual",
    "candle snuffer",
    "abalone shell",
    "feather smudge",
    "triquetra box",
    "pentacle plate",
  ],
};

/**
 * Flat list of all spiritual keywords — for backward compatibility and quick search tags.
 */
export const SPIRITUAL_KEYWORDS: string[] = Object.values(KEYWORD_CATEGORIES).flat();

/**
 * Top-priority keywords — products that typically have great margins
 * and low shipping costs to Portugal.
 */
export const TOP_OPPORTUNITY_KEYWORDS = [
  "crystal necklace",
  "evil eye bracelet",
  "chakra bracelet",
  "tarot cards",
  "incense sticks",
  "backflow incense",
  "incense holder",
  "pendulum",
  "tumbled stones set",
  "zodiac necklace",
  "mala beads",
  "crystal pendant",
  "rune stones",
  "spell candle",
  "moon phase wall",
  "hamsa necklace",
  "dreamcatcher",
  "crystal tree",
  "singing bowl",
  "sacred geometry",
];
