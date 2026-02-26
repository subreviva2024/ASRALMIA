/**
 * ASTRALMIA — Horoscope Engine
 * Generates daily horoscope readings for all 12 zodiac signs
 * Content is seeded by date for consistency throughout the day
 */

const SIGNS = {
  aries: { name: "Áries", symbol: "♈", element: "Fogo", planet: "Marte", dates: "21 Mar – 19 Abr" },
  touro: { name: "Touro", symbol: "♉", element: "Terra", planet: "Vénus", dates: "20 Abr – 20 Mai" },
  gemeos: { name: "Gémeos", symbol: "♊", element: "Ar", planet: "Mercúrio", dates: "21 Mai – 20 Jun" },
  caranguejo: { name: "Caranguejo", symbol: "♋", element: "Água", planet: "Lua", dates: "21 Jun – 22 Jul" },
  leao: { name: "Leão", symbol: "♌", element: "Fogo", planet: "Sol", dates: "23 Jul – 22 Ago" },
  virgem: { name: "Virgem", symbol: "♍", element: "Terra", planet: "Mercúrio", dates: "23 Ago – 22 Set" },
  balanca: { name: "Balança", symbol: "♎", element: "Ar", planet: "Vénus", dates: "23 Set – 22 Out" },
  escorpiao: { name: "Escorpião", symbol: "♏", element: "Água", planet: "Plutão", dates: "23 Out – 21 Nov" },
  sagitario: { name: "Sagitário", symbol: "♐", element: "Fogo", planet: "Júpiter", dates: "22 Nov – 21 Dez" },
  capricornio: { name: "Capricórnio", symbol: "♑", element: "Terra", planet: "Saturno", dates: "22 Dez – 19 Jan" },
  aquario: { name: "Aquário", symbol: "♒", element: "Ar", planet: "Úrano", dates: "20 Jan – 18 Fev" },
  peixes: { name: "Peixes", symbol: "♓", element: "Água", planet: "Neptuno", dates: "19 Fev – 20 Mar" },
};

// Aliases for user input
const SIGN_ALIASES = {
  aries: "aries", áries: "aries", carneiro: "aries",
  touro: "touro", taurus: "touro",
  gemeos: "gemeos", gémeos: "gemeos", gemini: "gemeos",
  caranguejo: "caranguejo", cancer: "caranguejo", câncer: "caranguejo",
  leao: "leao", leão: "leao", leo: "leao",
  virgem: "virgem", virgo: "virgem",
  balanca: "balanca", balança: "balanca", libra: "balanca",
  escorpiao: "escorpiao", escorpião: "escorpiao", scorpio: "escorpiao",
  sagitario: "sagitario", sagitário: "sagitario", sagittarius: "sagitario",
  capricornio: "capricornio", capricórnio: "capricornio", capricorn: "capricornio",
  aquario: "aquario", aquário: "aquario", aquarius: "aquario",
  peixes: "peixes", pisces: "peixes",
};

// Horoscope text pools
const GENERAL_THEMES = [
  "O cosmos convida-te a olhar para dentro hoje. A tua energia interior é o teu maior aliado.",
  "Novos caminhos revelam-se. O universo conspira quando estás alinhado com a tua verdade.",
  "Dia de transformação suave. Deixa ir o que já não te serve com gratidão.",
  "As estrelas iluminam a tua criatividade hoje. Expressa aquilo que vive no teu coração.",
  "Energia de abundância flui na tua direcção. Mantém os teus canais receptivos abertos.",
  "Hoje a Lua traz clareza emocional. Honra os teus sentimentos sem julgamento.",
  "Período favorável para conexões profundas. Aproxima-te daqueles que vibram na tua frequência.",
  "O universo testa a tua paciência hoje — mas cada desafio é uma porta para crescimento.",
  "Energia magnética envolve-te. A tua presença tem impacto onde quer que vás.",
  "Dia de revelações internas. Presta atenção aos sinais subtis que surgem.",
  "A harmonia cósmica favorece decisões importantes. Confia na tua intuição.",
  "Fluxo de energia renovadora. Ideal para começar projectos ou retomar sonhos antigos.",
  "Os astros pedem equilíbrio entre acção e contemplação. Sabe quando avançar e quando pausar.",
  "Período de cura emocional. As feridas que enfrentas hoje tornam-se a tua sabedoria amanhã.",
  "Alinhamento planetário favorece a tua evolução pessoal. Cada passo conta, mesmo os pequenos.",
];

const LOVE_THEMES = [
  "No amor, a vulnerabilidade é força. Abre o teu coração com coragem.",
  "Romance no ar. Uma conexão inesperada pode iluminar o teu dia.",
  "Dia para fortalecer laços. Uma conversa honesta vale mais que mil gestos vazios.",
  "A energia de Vénus favorece encontros significativos. Mantém-te receptivo/a.",
  "Amor próprio é a base de todo o amor. Dedica tempo a ti hoje.",
  "Energia magnética nas relações. Atrais o que vibras — eleva a tua frequência.",
  "Momento de clareza sentimental. Saberás exactamente o que o teu coração precisa.",
  "Uma surpresa agradável pode surgir no campo dos afectos. Fica atento/a.",
];

const WORK_THEMES = [
  "No trabalho, a tua visão criativa destaca-te. Apresenta as tuas ideias com confiança.",
  "Prosperidade em movimento. Oportunidades financeiras surgem de fontes inesperadas.",
  "Dia produtivo. Foca-te nas prioridades e os resultados seguir-se-ão naturalmente.",
  "Colaboração é a chave hoje. Une forças com quem complementa os teus talentos.",
  "Reconhecimento profissional está próximo. O teu esforço silencioso será visto.",
  "Ideias inovadoras fluem hoje. Anota tudo — uma delas pode mudar a tua trajectória.",
  "Cuidado com decisões financeiras impulsivas. Reflecte antes de agir.",
  "Dia favorável para negociações. A tua diplomacia natural será a tua arma.",
];

const WELLNESS_THEMES = [
  "Cuida do teu templo — o corpo pede-te atenção e carinho hoje.",
  "Meditação e silêncio serão os teus maiores aliados para recarregar energias.",
  "Energia vital elevada. Aproveita para actividade física ou contacto com a natureza.",
  "Descansa sem culpa. O repouso é parte essencial da jornada espiritual.",
  "Presta atenção à tua alimentação energética — não só o que comes, mas o que consomes emotivamente.",
  "Dia ideal para práticas de limpeza energética. Queima sálvia ou palo santo.",
  "Os teus chakras pedem equilibração. Uma meditação guiada pode fazer maravilhas.",
];

const LUCKY_CRYSTALS = [
  "Ametista — para intuição e protecção",
  "Quartzo Rosa — para amor e harmonia",
  "Turmalina Negra — para protecção energética",
  "Citrino — para abundância e manifestação",
  "Selenite — para clareza e paz",
  "Obsidiana — para verdade e purificação",
  "Labradorite — para transformação",
  "Olho de Tigre — para coragem e confiança",
  "Lápis Lazúli — para sabedoria e comunicação",
  "Jade — para sorte e prosperidade",
  "Aventurina — para oportunidades",
  "Cornalina — para vitalidade e criatividade",
];

class HoroscopeEngine {
  constructor() {
    this.todayCache = {};
    this.lastCacheDate = null;
  }

  getDailyReading(signInput) {
    const signKey = SIGN_ALIASES[(signInput || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
    if (!signKey) return null;

    const sign = SIGNS[signKey];
    if (!sign) return null;

    // Check if we need to regenerate for today
    const today = new Date().toISOString().split("T")[0];
    if (this.lastCacheDate !== today) {
      this.todayCache = {};
      this.lastCacheDate = today;
    }

    if (this.todayCache[signKey]) return this.todayCache[signKey];

    // Seed-based selection for consistency throughout the day
    const seed = this._dateSeed(today, signKey);

    const reading = {
      sign: sign.name,
      symbol: sign.symbol,
      element: sign.element,
      planet: sign.planet,
      dates: sign.dates,
      date: today,
      general: this._pick(GENERAL_THEMES, seed, 0),
      love: this._pick(LOVE_THEMES, seed, 1),
      work: this._pick(WORK_THEMES, seed, 2),
      wellness: this._pick(WELLNESS_THEMES, seed, 3),
      luckyCrystal: this._pick(LUCKY_CRYSTALS, seed, 4),
      luckyNumber: (seed % 99) + 1,
      energyLevel: ["🌑", "🌒", "🌓", "🌔", "🌕"][seed % 5],
      mood: ["Introspectivo", "Energético", "Criativo", "Receptivo", "Determinado", "Sereno", "Apaixonado"][seed % 7],
    };

    this.todayCache[signKey] = reading;
    return reading;
  }

  _dateSeed(dateStr, signKey) {
    let hash = 0;
    const str = dateStr + signKey;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  _pick(arr, seed, offset) {
    return arr[(seed + offset * 7) % arr.length];
  }
}

module.exports = { HoroscopeEngine, SIGNS, SIGN_ALIASES };
