/**
 * ASTRALMIA — Tarot Engine
 * Professional tarot card readings with Portuguese interpretations
 * 
 * Features:
 * - Full 78-card Rider Waite deck
 * - 3-card spread (Past, Present, Future)
 * - Upright & reversed meanings
 * - Portuguese interpretations
 */

const MAJOR_ARCANA = [
  { id: 0, name: "O Louco", nameEn: "The Fool", upright: "Novos começos, aventura, espontaneidade, fé no universo", reversed: "Imprudência, medo de arriscar, estagnação" },
  { id: 1, name: "O Mago", nameEn: "The Magician", upright: "Manifestação, poder pessoal, recursos à disposição", reversed: "Manipulação, talentos desperdiçados, engano" },
  { id: 2, name: "A Sacerdotisa", nameEn: "The High Priestess", upright: "Intuição, mistério, sabedoria interior, paciência", reversed: "Segredos ocultos, desconexão da intuição" },
  { id: 3, name: "A Imperatriz", nameEn: "The Empress", upright: "Abundância, fertilidade, natureza, nutrição", reversed: "Dependência, criatividade bloqueada, negligência" },
  { id: 4, name: "O Imperador", nameEn: "The Emperor", upright: "Autoridade, estrutura, estabilidade, liderança", reversed: "Tirania, rigidez, falta de disciplina" },
  { id: 5, name: "O Hierofante", nameEn: "The Hierophant", upright: "Tradição, espiritualidade, orientação, conformidade", reversed: "Rebelião, quebra de tradições, novos caminhos" },
  { id: 6, name: "Os Amantes", nameEn: "The Lovers", upright: "Amor, harmonia, escolhas do coração, valores", reversed: "Desequilíbrio, conflito interno, valores em choque" },
  { id: 7, name: "O Carro", nameEn: "The Chariot", upright: "Determinação, vitória, controlo, disciplina", reversed: "Falta de direcção, agressividade, resistência" },
  { id: 8, name: "A Força", nameEn: "Strength", upright: "Coragem interior, compaixão, paciência, influência suave", reversed: "Insegurança, dúvida, fraqueza interior" },
  { id: 9, name: "O Eremita", nameEn: "The Hermit", upright: "Introspecção, busca interior, sabedoria, solidão sagrada", reversed: "Isolamento excessivo, recusa de ajuda" },
  { id: 10, name: "A Roda da Fortuna", nameEn: "Wheel of Fortune", upright: "Ciclos, destino, sorte, mudanças inevitáveis", reversed: "Resistência à mudança, azar, ciclos repetidos" },
  { id: 11, name: "A Justiça", nameEn: "Justice", upright: "Verdade, equilíbrio, responsabilidade, causa e efeito", reversed: "Injustiça, desonestidade, desequilíbrio" },
  { id: 12, name: "O Enforcado", nameEn: "The Hanged Man", upright: "Pausa, sacrifício, nova perspectiva, entrega", reversed: "Martírio desnecessário, indecisão, adiamento" },
  { id: 13, name: "A Morte", nameEn: "Death", upright: "Transformação profunda, fim de ciclo, renascimento", reversed: "Resistência à mudança, medo do desconhecido" },
  { id: 14, name: "A Temperança", nameEn: "Temperance", upright: "Equilíbrio, moderação, paciência, harmonia", reversed: "Excesso, impaciência, desequilíbrio" },
  { id: 15, name: "O Diabo", nameEn: "The Devil", upright: "Sombra, apego, materialismo, ilusão de controlo", reversed: "Libertação, quebra de cadeias, consciência" },
  { id: 16, name: "A Torre", nameEn: "The Tower", upright: "Destruição repentina, revelação, caos necessário", reversed: "Medo de mudança, desastre evitado" },
  { id: 17, name: "A Estrela", nameEn: "The Star", upright: "Esperança, inspiração, serenidade, renovação espiritual", reversed: "Desespero, falta de fé, desconexão" },
  { id: 18, name: "A Lua", nameEn: "The Moon", upright: "Ilusão, medos inconscientes, intuição profunda", reversed: "Clareza, superação de medos, verdade" },
  { id: 19, name: "O Sol", nameEn: "The Sun", upright: "Alegria, sucesso, vitalidade, verdade radiante", reversed: "Pessimismo temporário, alegria bloqueada" },
  { id: 20, name: "O Julgamento", nameEn: "Judgement", upright: "Renascimento, chamado interior, absolvição, reflexão", reversed: "Dúvida, autocrítica excessiva, recusa do chamado" },
  { id: 21, name: "O Mundo", nameEn: "The World", upright: "Completude, realização, integração, ciclo completo", reversed: "Incompletude, atrasos, falta de encerramento" },
];

// Simplified suit cards (Ace to 10 + Court)
const SUITS = [
  { suit: "Copas", suitEn: "Cups", element: "Água", theme: "Emoções, relações, intuição" },
  { suit: "Paus", suitEn: "Wands", element: "Fogo", theme: "Acção, criatividade, paixão" },
  { suit: "Espadas", suitEn: "Swords", element: "Ar", theme: "Mente, comunicação, verdade" },
  { suit: "Ouros", suitEn: "Pentacles", element: "Terra", theme: "Material, trabalho, saúde" },
];

const COURT = ["Pajem", "Cavaleiro", "Rainha", "Rei"];

const SUIT_MEANINGS = {
  Copas: [
    { rank: "Ás", upright: "Novo amor, emoção pura, inspiração", reversed: "Emoções bloqueadas, desilusão" },
    { rank: "2", upright: "Parceria, conexão, acordo mútuo", reversed: "Desequilíbrio na relação" },
    { rank: "3", upright: "Celebração, amizade, comunidade", reversed: "Excesso, solidão" },
    { rank: "4", upright: "Descontentamento, apatia, reavaliação", reversed: "Despertar, novas perspectivas" },
    { rank: "5", upright: "Perda, luto, arrependimento", reversed: "Aceitação, cura" },
    { rank: "6", upright: "Nostalgia, inocência, memórias", reversed: "Preso ao passado" },
    { rank: "7", upright: "Ilusão, escolhas, fantasia", reversed: "Clareza, decisão" },
    { rank: "8", upright: "Afastamento, busca mais profunda", reversed: "Medo de partir" },
    { rank: "9", upright: "Desejo realizado, satisfação", reversed: "Materialismo, insatisfação" },
    { rank: "10", upright: "Família, harmonia, felicidade plena", reversed: "Conflito familiar" },
    { rank: "Pajem", upright: "Mensagem emocional, intuição jovem", reversed: "Imaturidade emocional" },
    { rank: "Cavaleiro", upright: "Romance, convite, seguir o coração", reversed: "Humor instável" },
    { rank: "Rainha", upright: "Compaixão, cuidado, intuição madura", reversed: "Dependência emocional" },
    { rank: "Rei", upright: "Controlo emocional, sabedoria, generosidade", reversed: "Manipulação emocional" },
  ],
  Paus: [
    { rank: "Ás", upright: "Inspiração, novo projecto, potencial", reversed: "Atrasos, falta de direcção" },
    { rank: "2", upright: "Planeamento, decisão, progresso", reversed: "Indecisão, medo de agir" },
    { rank: "3", upright: "Expansão, visão, liderança", reversed: "Obstáculos, falta de visão" },
    { rank: "4", upright: "Celebração, estabilidade, conquista", reversed: "Insegurança, transição" },
    { rank: "5", upright: "Competição, conflito, desafio", reversed: "Evitar conflito, harmonizar" },
    { rank: "6", upright: "Vitória, reconhecimento, progresso", reversed: "Ego, falta de reconhecimento" },
    { rank: "7", upright: "Defesa, persistência, coragem", reversed: "Desistência, sobrecarga" },
    { rank: "8", upright: "Velocidade, acção rápida, alinhamento", reversed: "Atraso, dispersão" },
    { rank: "9", upright: "Resiliência, força final, perseverança", reversed: "Exaustão, desistência" },
    { rank: "10", upright: "Sobrecarga, responsabilidade, esforço", reversed: "Delegação, alívio" },
    { rank: "Pajem", upright: "Entusiasmo, descoberta, aventura", reversed: "Distracção, falta de foco" },
    { rank: "Cavaleiro", upright: "Acção, paixão, movimento", reversed: "Impulsividade, impaciência" },
    { rank: "Rainha", upright: "Confiança, determinação, carisma", reversed: "Dominação, ciúme" },
    { rank: "Rei", upright: "Visão, liderança, empreendedorismo", reversed: "Tirania, imprudência" },
  ],
  Espadas: [
    { rank: "Ás", upright: "Clareza mental, verdade, breakthrough", reversed: "Confusão, caos mental" },
    { rank: "2", upright: "Indecisão, bloqueio, negação", reversed: "Sobrecarga de informação" },
    { rank: "3", upright: "Dor, separação, coração partido", reversed: "Recuperação, perdão" },
    { rank: "4", upright: "Descanso, recuperação, contemplação", reversed: "Inquietação, burnout" },
    { rank: "5", upright: "Conflito, desonra, perda", reversed: "Reconciliação, aceitação" },
    { rank: "6", upright: "Transição, mudança, viagem", reversed: "Ficar preso, resistência" },
    { rank: "7", upright: "Engano, estratégia, astúcia", reversed: "Verdade revelada, honestidade" },
    { rank: "8", upright: "Prisão mental, restrição, vítima", reversed: "Libertação, auto-aceitação" },
    { rank: "9", upright: "Ansiedade, preocupação, insónia", reversed: "Esperança, libertação mental" },
    { rank: "10", upright: "Fim doloroso, crise, renascimento forçado", reversed: "Recuperação, sobrevivência" },
    { rank: "Pajem", upright: "Curiosidade, vigilância, espionagem", reversed: "Paranóia, rumores" },
    { rank: "Cavaleiro", upright: "Acção decisiva, ambição, intelecto", reversed: "Agressividade, imprudência" },
    { rank: "Rainha", upright: "Independência, verdade, percepção", reversed: "Frieza, amargura" },
    { rank: "Rei", upright: "Autoridade intelectual, verdade, ética", reversed: "Tirania mental, manipulação" },
  ],
  Ouros: [
    { rank: "Ás", upright: "Oportunidade material, prosperidade", reversed: "Oportunidade perdida" },
    { rank: "2", upright: "Equilíbrio, adaptação, prioridades", reversed: "Desequilíbrio, sobrecarga" },
    { rank: "3", upright: "Trabalho em equipa, competência, crescimento", reversed: "Falta de trabalho em equipa" },
    { rank: "4", upright: "Segurança, estabilidade, controlo", reversed: "Avareza, possessividade" },
    { rank: "5", upright: "Dificuldade financeira, pobreza, isolamento", reversed: "Recuperação, ajuda" },
    { rank: "6", upright: "Generosidade, partilha, prosperidade", reversed: "Dívidas, falta de reciprocidade" },
    { rank: "7", upright: "Investimento, paciência, crescimento lento", reversed: "Impaciência, maus investimentos" },
    { rank: "8", upright: "Maestria, dedicação, perfeccionismo", reversed: "Mediocridade, falta de empenho" },
    { rank: "9", upright: "Abundância, luxo, auto-suficiência", reversed: "Materialismo excessivo" },
    { rank: "10", upright: "Riqueza, legado, família, plenitude", reversed: "Perda financeira, instabilidade" },
    { rank: "Pajem", upright: "Estudo, novo projecto financeiro", reversed: "Falta de foco, desperdício" },
    { rank: "Cavaleiro", upright: "Eficiência, rotina, responsabilidade", reversed: "Estagnação, tédio" },
    { rank: "Rainha", upright: "Nutrição, praticidade, abundância", reversed: "Negligência, dependência" },
    { rank: "Rei", upright: "Sucesso material, disciplina, liderança", reversed: "Ganância, corrupção" },
  ],
};

class TarotEngine {
  constructor() {
    this.deck = this._buildDeck();
  }

  _buildDeck() {
    const deck = [];

    // Major Arcana
    for (const card of MAJOR_ARCANA) {
      deck.push({
        id: `major-${card.id}`,
        name: card.name,
        nameEn: card.nameEn,
        type: "major",
        upright: card.upright,
        reversed: card.reversed,
      });
    }

    // Minor Arcana
    for (const suit of SUITS) {
      const meanings = SUIT_MEANINGS[suit.suit];
      for (const meaning of meanings) {
        deck.push({
          id: `${suit.suitEn.toLowerCase()}-${meaning.rank}`,
          name: `${meaning.rank} de ${suit.suit}`,
          nameEn: `${meaning.rank} of ${suit.suitEn}`,
          type: "minor",
          suit: suit.suit,
          element: suit.element,
          upright: meaning.upright,
          reversed: meaning.reversed,
        });
      }
    }

    return deck;
  }

  // ── Draw Random Cards ─────────────────────────────────────────────────────

  _drawCards(count) {
    const shuffled = [...this.deck].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(card => ({
      ...card,
      isReversed: Math.random() > 0.65, // 35% chance of reversed
    }));
  }

  // ── 3-Card Spread (Past · Present · Future) ──────────────────────────────

  threeCardReading() {
    const cards = this._drawCards(3);
    const positions = ["Passado", "Presente", "Futuro"];
    const positionDescriptions = [
      "O que ficou para trás — energias que moldaram o momento atual",
      "O que está a acontecer agora — a energia dominante do presente",
      "O que se aproxima — a direcção para onde a energia flui",
    ];

    const reading = cards.map((card, i) => ({
      position: positions[i],
      positionDesc: positionDescriptions[i],
      card: card.name,
      cardEn: card.nameEn,
      type: card.type,
      suit: card.suit || null,
      element: card.element || null,
      isReversed: card.isReversed,
      meaning: card.isReversed ? card.reversed : card.upright,
      direction: card.isReversed ? "Invertida" : "Direita",
    }));

    // Generate overall synthesis
    const synthesis = this._synthesize(reading);

    return {
      spread: "Passado · Presente · Futuro",
      cards: reading,
      synthesis,
      timestamp: new Date().toISOString(),
    };
  }

  // ── Single Card Draw ──────────────────────────────────────────────────────

  singleCardReading() {
    const [card] = this._drawCards(1);
    return {
      spread: "Carta do Dia",
      card: {
        name: card.name,
        nameEn: card.nameEn,
        type: card.type,
        suit: card.suit || null,
        isReversed: card.isReversed,
        meaning: card.isReversed ? card.reversed : card.upright,
        direction: card.isReversed ? "Invertida" : "Direita",
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ── Synthesis ─────────────────────────────────────────────────────────────

  _synthesize(reading) {
    const majorCount = reading.filter(r => r.type === "major").length;
    const reversedCount = reading.filter(r => r.isReversed).length;

    const themes = [];

    if (majorCount >= 2) {
      themes.push("Esta tiragem carrega energia intensa — os Arcanos Maiores indicam forças cósmicas em acção na tua vida.");
    }
    if (reversedCount >= 2) {
      themes.push("Várias cartas invertidas sugerem bloqueios ou resistência. Presta atenção ao que estás a evitar confrontar.");
    }
    if (reversedCount === 0) {
      themes.push("Todas as cartas em posição direita indicam um fluxo energético claro e favorável.");
    }

    // Element-based synthesis
    const elements = reading.map(r => r.element).filter(Boolean);
    if (elements.includes("Água")) {
      themes.push("A presença do elemento Água traz foco nas emoções e relações.");
    }
    if (elements.includes("Fogo")) {
      themes.push("O Fogo presente pede acção, coragem e movimento.");
    }

    if (themes.length === 0) {
      themes.push("As cartas revelam um caminho de crescimento pessoal. Confia no processo e mantém a mente aberta às mensagens do universo.");
    }

    return themes.join(" ");
  }
}

module.exports = { TarotEngine };
