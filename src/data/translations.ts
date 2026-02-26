/**
 * Portuguese product name/description translations for CJ products.
 * Maps English keywords to Portuguese display names and descriptions.
 * Used at the API layer so the frontend always receives Portuguese text.
 *
 * ALL text is real, curated Portuguese (PT-PT) — professional store quality.
 */

export interface ProductTranslation {
  /** Portuguese display name (short, for cards) */
  namePt: string;
  /** Portuguese description (2-3 sentences for product listing) */
  descPt: string;
  /** Category label in Portuguese */
  categoryPt: string;
  /** Tag / badge text */
  tagPt: string;
  /** Accent color for UI */
  accent: string;
}

/**
 * Match an English product name to a Portuguese translation.
 * Uses keyword matching — first match wins.
 */
export function translateProduct(nameEn: string): ProductTranslation {
  const lower = nameEn.toLowerCase();

  for (const rule of TRANSLATION_RULES) {
    if (rule.match(lower)) return rule.translation;
  }

  // Fallback: generic spiritual product keeping original English name
  return {
    namePt: cleanProductName(nameEn),
    descPt: "Artefacto espiritual seleccionado com intenção. Cada peça é verificada antes do envio para garantir qualidade e autenticidade energética.",
    categoryPt: "Artefactos",
    tagPt: "Espiritual",
    accent: "#c9a84c",
  };
}

/** Clean up CJ product names for display: remove brackets, fix casing */
function cleanProductName(name: string): string {
  return name
    .replace(/\[.*?\]/g, '') // remove [brackets]
    .replace(/\{.*?\}/g, '') // remove {brackets}
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

interface TranslationRule {
  match: (name: string) => boolean;
  translation: ProductTranslation;
}

const TRANSLATION_RULES: TranslationRule[] = [
  // ── Cristais & Pedras ────────────────────────────────────────
  {
    match: (n) => /amethyst|ametist/.test(n) && /pendant|necklace|colar/.test(n),
    translation: {
      namePt: "Colar de Ametista Natural",
      descPt: "Pendente de ametista natural com energia purificadora. Pedra da intuição e protecção espiritual, ideal para meditação e equilíbrio chakra do terceiro olho.",
      categoryPt: "Cristais",
      tagPt: "Intuição",
      accent: "#9b7cd4",
    },
  },
  {
    match: (n) => /amethyst|ametist/.test(n) && /bracelet|pulseira/.test(n),
    translation: {
      namePt: "Pulseira de Ametista Natural",
      descPt: "Pulseira de contas de ametista para protecção espiritual e clareza mental. Ativa o chakra coronário e promove serenidade interior.",
      categoryPt: "Cristais",
      tagPt: "Protecção",
      accent: "#9b7cd4",
    },
  },
  {
    match: (n) => /amethyst|ametist/.test(n),
    translation: {
      namePt: "Ametista Natural — Pedra da Intuição",
      descPt: "Cristal de ametista natural, pedra mestre de purificação e elevação espiritual. Transmuta energias negativas e potencia a intuição.",
      categoryPt: "Cristais",
      tagPt: "Intuição",
      accent: "#9b7cd4",
    },
  },
  {
    match: (n) => /rose quartz|quartzo rosa/.test(n),
    translation: {
      namePt: "Quartzo Rosa — Pedra do Amor",
      descPt: "Quartzo rosa natural, a pedra do amor incondicional e da cura emocional. Abre o chakra do coração e atrai relações harmoniosas.",
      categoryPt: "Cristais",
      tagPt: "Amor",
      accent: "#c99ab0",
    },
  },
  {
    match: (n) => /tourmaline|turmalina/.test(n),
    translation: {
      namePt: "Turmalina Negra — Protecção Absoluta",
      descPt: "Turmalina negra, a pedra de protecção mais poderosa. Cria um escudo energético contra negatividade e influências externas.",
      categoryPt: "Cristais",
      tagPt: "Protecção",
      accent: "#4a4a5a",
    },
  },
  {
    match: (n) => /crystal.*tree|tree.*crystal/.test(n),
    translation: {
      namePt: "Árvore de Cristal — Abundância",
      descPt: "Árvore decorativa com cristais naturais, símbolo de crescimento, prosperidade e abundância. Peça de decoração espiritual para casa ou altar.",
      categoryPt: "Decoração",
      tagPt: "Abundância",
      accent: "#6fc98b",
    },
  },
  {
    match: (n) => /crystal.*pendant|pendant.*crystal|crystal.*necklace|necklace.*crystal/.test(n),
    translation: {
      namePt: "Pendente de Cristal Natural",
      descPt: "Colar com pedra de cristal natural seleccionada. Cada peça é única, carregada com a energia da terra para protecção e equilíbrio.",
      categoryPt: "Cristais",
      tagPt: "Energia",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /crystal.*bracelet|bracelet.*crystal|bead.*bracelet|bracelet.*bead/.test(n),
    translation: {
      namePt: "Pulseira de Cristais Naturais",
      descPt: "Pulseira artesanal com contas de pedra natural. Cada cristal emite uma vibração única que harmoniza o campo energético de quem a usa.",
      categoryPt: "Cristais",
      tagPt: "Harmonia",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /crystal|quartz|stone.*natural|natural.*stone|gemstone/.test(n),
    translation: {
      namePt: "Cristal Natural — Energia Pura",
      descPt: "Pedra natural seleccionada pela sua qualidade energética. Ideal para meditação, cura energética e decoração de altares sagrados.",
      categoryPt: "Cristais",
      tagPt: "Energia",
      accent: "#c9a84c",
    },
  },

  // ── Tarot & Adivinhação ──────────────────────────────────────
  {
    match: (n) => /tarot/.test(n) && /card|deck|baralho/.test(n),
    translation: {
      namePt: "Baralho de Tarot — Edição Artística",
      descPt: "Baralho de tarot completo com arte original. 78 cartas (22 Arcanos Maiores + 56 Menores) com acabamento premium e detalhe místico.",
      categoryPt: "Tarot",
      tagPt: "Sabedoria",
      accent: "#8b6fc9",
    },
  },
  {
    match: (n) => /tarot/.test(n) && /stand|holder|display/.test(n),
    translation: {
      namePt: "Suporte para Cartas de Tarot",
      descPt: "Suporte artesanal em madeira para exposição de cartas de tarot. Peça decorativa e funcional para leituras e altares.",
      categoryPt: "Tarot",
      tagPt: "Ritual",
      accent: "#8b6fc9",
    },
  },
  {
    match: (n) => /tarot/.test(n),
    translation: {
      namePt: "Tarot — Oráculo Místico",
      descPt: "Instrumento divinatório completo para leituras de tarot. Criado com arte sagrada para conexão espiritual profunda.",
      categoryPt: "Tarot",
      tagPt: "Sabedoria",
      accent: "#8b6fc9",
    },
  },
  {
    match: (n) => /pendulum|p[eê]ndulo/.test(n),
    translation: {
      namePt: "Pêndulo de Cristal — Divinação",
      descPt: "Pêndulo de cristal natural para radiestesia e adivinhação. Ferramenta essencial para respostas do subconsciente e trabalho energético.",
      categoryPt: "Adivinhação",
      tagPt: "Divinação",
      accent: "#8b6fc9",
    },
  },
  {
    match: (n) => /rune|runas/.test(n),
    translation: {
      namePt: "Runas — Oráculo Nórdico",
      descPt: "Conjunto de runas em pedra natural para adivinhação e meditação. Tradição nórdica milenar, cada runa carrega um símbolo sagrado.",
      categoryPt: "Adivinhação",
      tagPt: "Oráculo",
      accent: "#c9c4a8",
    },
  },

  // ── Incenso ──────────────────────────────────────────────────
  {
    match: (n) => /backflow.*incense|incense.*backflow|waterfall.*incense/.test(n),
    translation: {
      namePt: "Cascata de Incenso — Fumo Místico",
      descPt: "Queimador de incenso cascata com efeito de fumo descendente hipnótico. Cria uma atmosfera mística e meditativa única no seu espaço sagrado.",
      categoryPt: "Incenso",
      tagPt: "Ritual",
      accent: "#c9784c",
    },
  },
  {
    match: (n) => /incense.*holder|incense.*burner|incense.*tray/.test(n),
    translation: {
      namePt: "Suporte para Incenso Artesanal",
      descPt: "Suporte decorativo para queima de incenso. Peça artesanal que alia funcionalidade e beleza para rituais de purificação.",
      categoryPt: "Incenso",
      tagPt: "Purificação",
      accent: "#c9784c",
    },
  },
  {
    match: (n) => /incense/.test(n),
    translation: {
      namePt: "Incenso Natural — Purificação",
      descPt: "Incenso natural para purificação de espaços e rituais. Aroma sagrado que eleva a vibração e conecta com o divino.",
      categoryPt: "Incenso",
      tagPt: "Purificação",
      accent: "#c9784c",
    },
  },

  // ── Joias Espirituais ────────────────────────────────────────
  {
    match: (n) => /evil.*eye|olho.*turco|nazar/.test(n),
    translation: {
      namePt: "Olho Turco — Protecção Ancestral",
      descPt: "Joia com olho turco (Nazar), amuleto milenar de protecção contra o mau-olhado. Tradição mediterrânica de poder protector.",
      categoryPt: "Joias",
      tagPt: "Protecção",
      accent: "#4e8ce8",
    },
  },
  {
    match: (n) => /chakra.*bracelet|bracelet.*chakra|7.*chakra/.test(n),
    translation: {
      namePt: "Pulseira dos 7 Chakras",
      descPt: "Pulseira com 7 pedras naturais representando os 7 chakras. Equilibra o sistema energético e promove bem-estar holístico.",
      categoryPt: "Joias",
      tagPt: "Equilíbrio",
      accent: "#e87c3e",
    },
  },
  {
    match: (n) => /zodiac|horoscope|constel/.test(n) && /necklace|pendant|colar/.test(n),
    translation: {
      namePt: "Colar Zodiacal — Signo Pessoal",
      descPt: "Colar com símbolo do signo zodiacal. Joia celestial personalizada que conecta com a sua identidade astrológica.",
      categoryPt: "Joias",
      tagPt: "Zodíaco",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /zodiac|horoscope/.test(n),
    translation: {
      namePt: "Joia Zodiacal — Astrologia",
      descPt: "Acessório com motivo astrológico e zodiacal. Peça que celebra a sua ligação com os astros.",
      categoryPt: "Joias",
      tagPt: "Zodíaco",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /hamsa|m[aã]o.*f[aá]tima/.test(n),
    translation: {
      namePt: "Mão de Fátima (Hamsa) — Protecção",
      descPt: "Joia com símbolo Hamsa, a Mão de Fátima protetora. Amuleto ancestral que afasta o mal e atrai bênçãos divinas.",
      categoryPt: "Joias",
      tagPt: "Protecção",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /mala.*bead|prayer.*bead|meditation.*bead/.test(n),
    translation: {
      namePt: "Mala de Meditação — 108 Contas",
      descPt: "Mala tradicional com 108 contas de pedras naturais para meditação e recitação de mantras. Instrumento sagrado de conexão interior.",
      categoryPt: "Meditação",
      tagPt: "Meditação",
      accent: "#c9c4a8",
    },
  },
  {
    match: (n) => /moon.*phase|luna|crescent|moon.*necklace/.test(n),
    translation: {
      namePt: "Joia Lunar — Fases da Lua",
      descPt: "Joia inspirada nas fases da Lua, símbolo de ciclos, feminino sagrado e intuição. Peça mística para quem honra a energia lunar.",
      categoryPt: "Joias",
      tagPt: "Lunar",
      accent: "#c9c4a8",
    },
  },

  // ── Meditação & Ritual ───────────────────────────────────────
  {
    match: (n) => /singing.*bowl|tibetan.*bowl/.test(n),
    translation: {
      namePt: "Taça Tibetana — Som Sagrado",
      descPt: "Taça tibetana de meditação com som ressonante e harmonizador. Instrumento ancestral para limpeza energética e estados meditativos profundos.",
      categoryPt: "Meditação",
      tagPt: "Meditação",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /dreamcatcher|apanha.*sonhos/.test(n),
    translation: {
      namePt: "Apanha-Sonhos — Protecção Nocturna",
      descPt: "Apanha-sonhos artesanal, tradição nativo-americana para filtrar sonhos e proteger durante o sono. Decoração sagrada para o quarto.",
      categoryPt: "Decoração",
      tagPt: "Protecção",
      accent: "#c9c4a8",
    },
  },
  {
    match: (n) => /sacred.*geometry|flower.*life|metatron/.test(n),
    translation: {
      namePt: "Geometria Sagrada — Flor da Vida",
      descPt: "Peça decorativa com padrões de geometria sagrada. A Flor da Vida é o padrão da criação, presente em todas as tradições espirituais.",
      categoryPt: "Decoração",
      tagPt: "Sagrado",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /candle.*spell|spell.*candle|ritual.*candle/.test(n),
    translation: {
      namePt: "Velas Rituais — Magia & Intenção",
      descPt: "Velas para rituais e magia intencional. Cada cor carrega uma vibração específica para manifestação, protecção ou purificação.",
      categoryPt: "Velas",
      tagPt: "Ritual",
      accent: "#d4b060",
    },
  },
  {
    match: (n) => /candle/.test(n),
    translation: {
      namePt: "Vela Decorativa Espiritual",
      descPt: "Vela decorativa com design espiritual. Cria uma atmosfera sagrada para meditação, rituais ou momentos de introspecção.",
      categoryPt: "Velas",
      tagPt: "Atmosfera",
      accent: "#d4b060",
    },
  },
  {
    match: (n) => /meditation|yoga.*mat|yoga/.test(n),
    translation: {
      namePt: "Acessório de Meditação",
      descPt: "Ferramenta essencial para a prática meditativa. Eleve a sua prática diária com instrumentos seleccionados para concentração e paz interior.",
      categoryPt: "Meditação",
      tagPt: "Meditação",
      accent: "#7cb87a",
    },
  },

  // ── Decoração Espiritual ─────────────────────────────────────
  {
    match: (n) => /buddha|buda/.test(n),
    translation: {
      namePt: "Estátua de Buda — Serenidade",
      descPt: "Figura decorativa de Buda, símbolo universal de paz interior e iluminação. Peça perfeita para altares, jardins e espaços de meditação.",
      categoryPt: "Decoração",
      tagPt: "Serenidade",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /elephant|elefante/.test(n),
    translation: {
      namePt: "Elefante — Sabedoria & Sorte",
      descPt: "Figura decorativa de elefante, símbolo de sabedoria, força e boa sorte. Na tradição indiana, Ganesha remove obstáculos.",
      categoryPt: "Decoração",
      tagPt: "Sorte",
      accent: "#c9a84c",
    },
  },
  {
    match: (n) => /witch|bruja|wicca/.test(n),
    translation: {
      namePt: "Artefacto Wicca — Magia Natural",
      descPt: "Peça de inspiração Wicca para praticantes de magia natural. Artigo seleccionado para rituais e decoração do altar sagrado.",
      categoryPt: "Ritual",
      tagPt: "Magia",
      accent: "#6fc98b",
    },
  },
  {
    match: (n) => /resin.*mold|silicone.*mold.*crystal/.test(n),
    translation: {
      namePt: "Molde para Cristais em Resina",
      descPt: "Molde de silicone para criação de cristais e pirâmides em resina. Crie as suas próprias peças energéticas com cristais e flores.",
      categoryPt: "Ferramentas",
      tagPt: "Criação",
      accent: "#c9c4a8",
    },
  },
];
