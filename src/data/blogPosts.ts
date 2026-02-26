export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  date: string;
  readTime: number; // minutes
  tags: string[];
  image: string; // emoji or symbol used as visual
  accentColor: string;
  content: BlogSection[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface BlogSection {
  type: "paragraph" | "heading" | "list" | "quote" | "tip";
  text?: string;
  items?: string[];
}

export const blogCategories = [
  { label: "Todos", slug: "todos" },
  { label: "Astrologia", slug: "astrologia" },
  { label: "Cristais", slug: "cristais" },
  { label: "Tarot", slug: "tarot" },
  { label: "Rituais", slug: "rituais" },
  { label: "Chakras", slug: "chakras" },
  { label: "Numerologia", slug: "numerologia" },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "o-que-significa-mercurio-retrogrado",
    title: "O que significa Mercúrio Retrógrado",
    excerpt: "Descubra por que Mercúrio retrógrado afeta comunicações, viagens e tecnologia — e como navegar este período com consciência e intencionalidade.",
    category: "Astrologia",
    categorySlug: "astrologia",
    date: "2026-02-20",
    readTime: 7,
    tags: ["Mercúrio", "Retrógrado", "Astrologia", "Planetas"],
    image: "☿",
    accentColor: "#8b9dc3",
    metaTitle: "O que significa Mercúrio Retrógrado | ASTRALMIA",
    metaDescription: "Descubra o que é Mercúrio Retrógrado, como afecta a sua vida e como transformar este período em crescimento pessoal. Guia completo com dicas práticas.",
    keywords: ["mercúrio retrógrado", "o que é mercúrio retrógrado", "mercúrio retrógrado significado", "planetas retrógrados", "astrologia"],
    content: [
      {
        type: "paragraph",
        text: "Três ou quatro vezes por ano, o planeta Mercúrio parece mover-se para trás no céu — um fenômeno que os astrólogos chamam de Mercúrio Retrógrado. Embora seja apenas uma ilusão óptica causada pelas diferentes velocidades orbitais da Terra e de Mercúrio, os seus efeitos simbólicos são profundos e amplamente sentidos.",
      },
      {
        type: "heading",
        text: "Por que acontece Mercúrio Retrógrado?",
      },
      {
        type: "paragraph",
        text: "Mercúrio é o planeta mais próximo do Sol e orbita ao seu redor muito mais rapidamente do que a Terra. Quando ele passa pela Terra na sua órbita interior, cria a ilusão de que se move para trás. Este fenômeno dura aproximadamente três semanas e ocorre três a quatro vezes por ano.",
      },
      {
        type: "heading",
        text: "O que governa Mercúrio na Astrologia?",
      },
      {
        type: "paragraph",
        text: "Na astrologia tradicional e moderna, Mercúrio governa a comunicação, o pensamento, os contratos, as viagens de curta distância, a tecnologia e os irmãos. Quando retrógrado, todas estas áreas entram numa espécie de revisão e introspecção.",
      },
      {
        type: "list",
        items: [
          "Comunicações — mal-entendidos, mensagens perdidas, conversas difíceis",
          "Tecnologia — falhas de computador, problemas com telemóvel, apps que não funcionam",
          "Contratos — não é ideal assinar acordos ou fazer compras importantes",
          "Viagens — atrasos, reservas com erros, extravios de bagagem",
          "Relacionamentos do passado — ex-parceiros e velhos amigos reaparecem",
        ],
      },
      {
        type: "heading",
        text: "Como aproveitar Mercúrio Retrógrado",
      },
      {
        type: "paragraph",
        text: "Ao contrário do que muitos pensam, Mercúrio Retrógrado não é apenas um período de caos — é uma oportunidade de revisão. Os três 're': revisar, refletir e reorganizar tornam-se os seus aliados mais poderosos.",
      },
      {
        type: "tip",
        text: "Dica de Caela: Use Mercúrio Retrógrado para rever projetos antigos, reconectar-se com pessoas do passado e corrigir situações inacabadas. É o momento ideal para editar, não para iniciar.",
      },
      {
        type: "list",
        items: [
          "Faça backup dos seus ficheiros digitais antes e durante o período",
          "Confirme todos os detalhes de viagens e reuniões",
          "Evite assinar contratos importantes se possível",
          "Releia e-mails antes de enviar",
          "Use o tempo para meditação e introspecção",
          "Pratique mais comunicação consciente e compassiva",
        ],
      },
      {
        type: "heading",
        text: "Mercúrio Retrógrado em cada elemento",
      },
      {
        type: "paragraph",
        text: "O signo em que Mercúrio fica retrógrado importa muito. Em signos de Fogo (Áries, Leão, Sagitário), os desafios são na expressão pessoal e na impulsividade. Em signos de Terra (Touro, Virgem, Capricórnio), afetam trabalho e finanças. Em signos de Ar (Gémeos, Libra, Aquário), a comunicação e as ideias ficam nebulosas. Em signos de Água (Caranguejo, Escorpião, Peixes), as emoções e intuições tornam-se o terreno de revisão.",
      },
      {
        type: "quote",
        text: "Mercúrio Retrógrado é o Universo a pedir-nos para abrandar, respirar e olhar para dentro antes de avançar para fora.",
      },
    ],
  },
  {
    slug: "cristais-para-protecao-guia-completo",
    title: "Cristais para Proteção: Guia Completo",
    excerpt: "Conheça os cristais mais poderosos para proteção energética, como ativá-los e onde posicioná-los em sua casa e no corpo.",
    category: "Cristais",
    categorySlug: "cristais",
    date: "2026-02-15",
    readTime: 9,
    tags: ["Cristais", "Proteção", "Energia", "Cura"],
    image: "🔮",
    accentColor: "#7c5cbf",
    metaTitle: "Cristais para Proteção: Guia Completo | ASTRALMIA",
    metaDescription: "Descubra quais são os melhores cristais para proteção energética, como limpá-los, ativá-los e usá-los no dia-a-dia. Guia escrito por especialistas em cristaloterapia.",
    keywords: ["cristais para proteção", "cristais de proteção", "obsidiana negra", "turmalina negra", "cristais energéticos", "cristaloterapia"],
    content: [
      {
        type: "paragraph",
        text: "Os cristais são ferramentas ancestrais de cura e proteção utilizadas por civilizações como os Egípcios, Gregos, Romanos e muitas outras culturas milenares. Cada cristal vibra numa frequência específica capaz de influenciar o campo energético humano.",
      },
      {
        type: "heading",
        text: "Os 7 Cristais de Proteção Mais Poderosos",
      },
      {
        type: "list",
        items: [
          "Obsidiana Negra — a guardiã definitiva, absorve energias densas e negativas",
          "Turmalina Negra — cria um escudo protetor ao redor do campo áurico",
          "Ametista — proteção espiritual e purificação do ambiente",
          "Labradorita — protege contra energias alheias e psíquicas",
          "Olho de Tigre — confiança, proteção e ancoragem",
          "Hematita — proteção e aterramento energético poderoso",
          "Pirita — escudo contra manipulação e energias negativas",
        ],
      },
      {
        type: "heading",
        text: "Como Ativar os Seus Cristais de Proteção",
      },
      {
        type: "paragraph",
        text: "Antes de usar qualquer cristal para proteção, é fundamental limpá-lo e programá-lo com a sua intenção. Os cristais absorvem energias de todos os ambientes pelos quais passam — incluindo as minas, os transportes e as lojas onde foram adquiridos.",
      },
      {
        type: "list",
        items: [
          "Limpeza com luz do sol ou da lua (4 a 8 horas)",
          "Limpeza com água corrente e sal marinho (20 minutos)",
          "Defumação com sálvia branca ou Palo Santo",
          "Enterrar na terra durante 24 horas para recarga profunda",
          "Som — sino tibetano ou bol de cristal de quartzo",
        ],
      },
      {
        type: "tip",
        text: "Dica de Caela: Programe o seu cristal segurando-o nas mãos, fechando os olhos e declarando claramente a sua intenção em voz alta. Ex: 'Programo este cristal para me proteger de todas as energias que não me servem.'",
      },
      {
        type: "heading",
        text: "Onde Posicionar Cristais de Proteção na Casa",
      },
      {
        type: "paragraph",
        text: "A posição estratégica dos cristais em casa potencializa enormemente os seus efeitos protetores. Cada divisão tem necessidades energéticas diferentes.",
      },
      {
        type: "list",
        items: [
          "Entrada principal — Turmalina Negra ou Obsidiana para bloquear energias externas",
          "Quarto — Ametista para proteção durante o sono e afastar pesadelos",
          "Escritório — Pirita ou Olho de Tigre para proteção no trabalho",
          "Sala — Labradorita para equilibrar as energias dos visitantes",
          "Casa de banho — Hematita para purificação e escoamento de energias densas",
        ],
      },
      {
        type: "quote",
        text: "Os cristais são os guardiões silenciosos da sua casa. Eles não julgam, não dormem e não se cansam — guardam enquanto você descansa.",
      },
      {
        type: "heading",
        text: "Cristais de Proteção para Usar no Corpo",
      },
      {
        type: "paragraph",
        text: "Usar cristais como joia ou no bolso mantém a sua energia protetora constantemente no seu campo energético. A Turmalina Negra em pulseira é uma das formas mais eficazes de proteção energética contínua.",
      },
    ],
  },
  {
    slug: "como-interpretar-seu-mapa-astral",
    title: "Como Interpretar o Seu Mapa Astral",
    excerpt: "Um guia passo a passo para entender os elementos fundamentais do seu mapa astral: Ascendente, Sol, Lua, planetas e casas.",
    category: "Astrologia",
    categorySlug: "astrologia",
    date: "2026-02-10",
    readTime: 12,
    tags: ["Mapa Astral", "Astrologia", "Ascendente", "Signos"],
    image: "⭐",
    accentColor: "#c9a84c",
    metaTitle: "Como Interpretar o Seu Mapa Astral: Guia Completo | ASTRALMIA",
    metaDescription: "Aprenda a interpretar o seu mapa astral do zero. Entenda o Ascendente, Sol, Lua, as 12 casas e os aspectos planetários. Guia completo para iniciantes e avançados.",
    keywords: ["mapa astral", "como interpretar mapa astral", "ascendente", "mapa natal", "astrologia", "signos"],
    content: [
      {
        type: "paragraph",
        text: "O mapa astral — também chamado de mapa natal ou carta natal — é uma fotografia do céu no momento exato do seu nascimento. É literalmente o idioma do Universo registado no instante em que você chegou ao mundo.",
      },
      {
        type: "heading",
        text: "Os Três Pilares do Mapa Astral",
      },
      {
        type: "list",
        items: [
          "Sol — a sua essência, o que veio ser, a missão de vida",
          "Lua — as suas emoções, instintos e necessidades mais profundas",
          "Ascendente — a máscara que apresenta ao mundo, a primeira impressão",
        ],
      },
      {
        type: "paragraph",
        text: "Muitas pessoas conhecem apenas o seu signo solar — mas é a combinação dos três pilares que revela a verdadeira complexidade da sua personalidade. Uma pessoa pode ser Escorpião com Lua em Gémeos e Ascendente em Leão, criando uma mistura única de profundidade, versatilidade e carisma.",
      },
      {
        type: "heading",
        text: "As 12 Casas Astrológicas",
      },
      {
        type: "paragraph",
        text: "O mapa astral é dividido em 12 casas, cada uma governando uma área específica da vida. Os planetas que se posicionam nestas casas influenciam profundamente essas áreas.",
      },
      {
        type: "list",
        items: [
          "Casa 1 (Ascendente) — identidade, aparência, início de tudo",
          "Casa 2 — finanças, valores pessoais, autoestima",
          "Casa 3 — comunicação, irmãos, viagens curtas",
          "Casa 4 (Fundo do Céu) — lar, família, raízes",
          "Casa 5 — criatividade, romances, filhos, diversão",
          "Casa 6 — saúde, trabalho diário, rotina, serviço",
          "Casa 7 (Descendente) — parcerias, casamento, contratos",
          "Casa 8 — transformação, morte, heranças, sexualidade profunda",
          "Casa 9 — filosofia, viagens longas, espiritualidade, ensino superior",
          "Casa 10 (Meio do Céu) — carreira, reputação, legado",
          "Casa 11 — amizades, grupos, sonhos coletivos",
          "Casa 12 — inconsciente, karma, isolamento, mistérios",
        ],
      },
      {
        type: "tip",
        text: "Dica de Caela: Para gerar o seu mapa astral gratuitamente, precisa da data, hora e local do seu nascimento. Quanto mais precisa for a hora, mais exato será o seu Ascendente e as posições das casas.",
      },
      {
        type: "heading",
        text: "Os Aspectos Planetários",
      },
      {
        type: "paragraph",
        text: "Os aspectos são ângulos formados entre planetas e revelam como as energias interagem. Os principais são: Conjunção (fusão de energias), Sextil (harmonia e oportunidades), Quadratura (tensão e crescimento), Trígono (fluidez natural) e Oposição (polaridade e integração).",
      },
      {
        type: "quote",
        text: "O mapa astral não determina o seu destino — ele revela o terreno. Você é sempre o arquiteto da viagem.",
      },
    ],
  },
  {
    slug: "tarot-para-iniciantes-arcanos-maiores",
    title: "Tarot para Iniciantes: Os 22 Arcanos Maiores",
    excerpt: "Descubra o significado dos 22 Arcanos Maiores do Tarot, a linguagem simbólica universal da alma e do destino.",
    category: "Tarot",
    categorySlug: "tarot",
    date: "2026-02-05",
    readTime: 11,
    tags: ["Tarot", "Arcanos Maiores", "Leitura de Cartas", "Simbolismo"],
    image: "🃏",
    accentColor: "#9b7cba",
    metaTitle: "Tarot para Iniciantes: Os 22 Arcanos Maiores Explicados | ASTRALMIA",
    metaDescription: "Guia completo dos 22 Arcanos Maiores do Tarot para iniciantes. Aprenda o significado de cada carta, os seus símbolos e como interpretá-las nas leituras.",
    keywords: ["tarot para iniciantes", "arcanos maiores", "significado cartas de tarot", "aprender tarot", "leitura de tarot"],
    content: [
      {
        type: "paragraph",
        text: "O Tarot é um sistema de 78 cartas que serve como espelho para a psyche humana. Os 22 Arcanos Maiores representam as grandes forças e arquétipos universais da jornada da alma — o chamado Caminho do Louco.",
      },
      {
        type: "heading",
        text: "O que são os Arcanos Maiores?",
      },
      {
        type: "paragraph",
        text: "A palavra 'arcano' vem do latim 'arcanum', que significa segredo ou mistério. Os Arcanos Maiores representam as grandes experiências transformadoras da vida — iniciação, amor, morte simbólica, renascimento e iluminação.",
      },
      {
        type: "heading",
        text: "Os 22 Arcanos Maiores e seus Significados",
      },
      {
        type: "list",
        items: [
          "0 — O Louco: novos começos, liberdade, salto de fé",
          "I — O Mago: vontade, manifestação, habilidade",
          "II — A Sacerdotisa: intuição, mistério, conhecimento oculto",
          "III — A Imperatriz: fertilidade, abundância, natureza, criação",
          "IV — O Imperador: estrutura, autoridade, estabilidade",
          "V — O Hierofante: tradição, espiritualidade, ensino",
          "VI — Os Amantes: relações, escolhas, valores",
          "VII — O Carro: vitória, determinação, controlo",
          "VIII — A Força: coragem interior, paciência, domínio",
          "IX — O Eremita: introspecção, sabedoria, solidão",
          "X — A Roda da Fortuna: ciclos, destino, mudança",
          "XI — A Justiça: equilíbrio, verdade, causa e efeito",
          "XII — O Enforcado: pausa, perspectiva diferente, sacrifício",
          "XIII — A Morte: transformação, fim de ciclo, renascimento",
          "XIV — A Temperança: equilíbrio, moderação, purificação",
          "XV — O Diabo: limitações, ilusões, materialismo",
          "XVI — A Torre: ruptura súbita, revelação, liberdade abrupta",
          "XVII — A Estrela: esperança, inspiração, cura",
          "XVIII — A Lua: ilusões, subconsciente, medos",
          "XIX — O Sol: alegria, vitalidade, sucesso, clareza",
          "XX — O Julgamento: renascimento, chamado, absolvição",
          "XXI — O Mundo: conclusão, totalidade, integração",
        ],
      },
      {
        type: "tip",
        text: "Dica de Caela: Comece a sua prática com apenas os Arcanos Maiores. Escolha uma carta de manhã e medite sobre como a sua energia pode manifestar-se ao longo do dia.",
      },
      {
        type: "quote",
        text: "O Tarot não prevê o futuro. Ele revela o que está presente no campo energético — e o que pode tornar-se se continuarmos na mesma direção.",
      },
    ],
  },
  {
    slug: "rituais-lua-cheia-2026",
    title: "Rituais de Lua Cheia: Como Libertar o que Já Não Serve",
    excerpt: "A Lua Cheia é o pico do ciclo lunar — o momento perfeito para libertar, agradecer e colher. Aprenda rituais poderosos para cada fase.",
    category: "Rituais",
    categorySlug: "rituais",
    date: "2026-01-28",
    readTime: 8,
    tags: ["Lua Cheia", "Rituais", "Ciclo Lunar", "Manifestação"],
    image: "🌕",
    accentColor: "#e0d5c5",
    metaTitle: "Rituais de Lua Cheia: Como Libertar o que Já Não Serve | ASTRALMIA",
    metaDescription: "Descubra rituais poderosos para a Lua Cheia. Como libertar padrões, agradecer conquistas e usar a energia máxima lunar para transformação. Ritual passo a passo.",
    keywords: ["rituais lua cheia", "lua cheia ritual", "ciclo lunar", "magia lunar", "ritual de liberação"],
    content: [
      {
        type: "paragraph",
        text: "A Lua Cheia representa o pico, a culminação, a plenitude. É o momento em que as intenções plantadas na Lua Nova se iluminam completamente. A energia expansiva desta fase é ideal para libertar, agradecer, purificar e colher.",
      },
      {
        type: "heading",
        text: "O Que Fazer na Lua Cheia",
      },
      {
        type: "list",
        items: [
          "Libertar padrões, crenças ou situações que já não servem ao seu crescimento",
          "Agradecer as conquistas e manifestações do ciclo",
          "Carregar cristais à luz da lua para limpá-los e recarregá-los",
          "Fazer limpeza energética da casa com sálvia ou incenso",
          "Banho ritual de purificação com sal grosso e ervas",
        ],
      },
      {
        type: "heading",
        text: "Ritual de Libertação da Lua Cheia",
      },
      {
        type: "paragraph",
        text: "Este ritual simples mas poderoso pode ser realizado em qualquer Lua Cheia, independentemente do signo em que ela se encontra.",
      },
      {
        type: "list",
        items: [
          "1. Prepare um espaço sagrado — vela branca ou prateada, cristais, incenso",
          "2. Sente-se em meditação por 5 minutos, respirando profundamente",
          "3. Escreva num papel tudo o que deseja libertar: emoções, padrões, situações",
          "4. Leia em voz alta cada item com gratidão pelo que ensinou",
          "5. Queime o papel com segurança (numa tigela ignífuga)",
          "6. Declare: 'Liberto isto com amor e gratidão. Abro espaço para o novo.'",
          "7. Beba água com intenção de purificação e renovação",
        ],
      },
      {
        type: "tip",
        text: "Dica de Caela: A janela energética da Lua Cheia estende-se 3 dias antes e 3 dias depois do pico. Não precisa de ser exatamente na noite da lua cheia.",
      },
      {
        type: "quote",
        text: "A Lua não pede permissão para brilhar. Ela simplesmente completa o seu ciclo, lembrando-nos que tudo passa, tudo transforma, tudo regressa.",
      },
    ],
  },
  {
    slug: "chakras-e-cristais-cura-energetica",
    title: "Chakras e Cristais: Guia de Cura Energética",
    excerpt: "Descubra como usar cristais específicos para equilibrar cada um dos 7 chakras principais e restaurar o fluxo de energia vital.",
    category: "Chakras",
    categorySlug: "chakras",
    date: "2026-01-20",
    readTime: 10,
    tags: ["Chakras", "Cristais", "Cura Energética", "Equilíbrio"],
    image: "✨",
    accentColor: "#e87c7c",
    metaTitle: "Chakras e Cristais: Guia de Cura Energética | ASTRALMIA",
    metaDescription: "Aprenda a usar cristais para equilibrar os 7 chakras. Descubra qual cristal corresponde a cada centro energético e como praticar a cura através da cristaloterapia.",
    keywords: ["chakras e cristais", "cristais para chakras", "cura energética", "chakra coração", "cristaloterapia chakras"],
    content: [
      {
        type: "paragraph",
        text: "Os chakras são centros de energia localizados ao longo da coluna vertebral. Quando estão equilibrados, a energia vital (prana) flui livremente, promovendo saúde física, emocional e espiritual. Os cristais, pela sua estrutura vibracional, são aliados naturais neste processo.",
      },
      {
        type: "heading",
        text: "Os 7 Chakras e seus Cristais",
      },
      {
        type: "list",
        items: [
          "Chakra Raiz (Muladhara) — Vermelho — Hematita, Jaspe Vermelho, Turmalina Negra",
          "Chakra Sacral (Svadhisthana) — Laranja — Carneliana, Pedra do Sol, Ágata Laranja",
          "Chakra Plexo Solar (Manipura) — Amarelo — Citrino, Topázio Amarelo, Âmbar",
          "Chakra Coração (Anahata) — Verde/Rosa — Quartzo Rosa, Aventurina, Malaquita",
          "Chakra Garganta (Vishuddha) — Azul — Aquamarina, Turquesa, Lápis-Lazúli",
          "Chakra Terceiro Olho (Ajna) — Índigo — Ametista, Fluorite, Labradorita",
          "Chakra Coroa (Sahasrara) — Violeta/Branco — Quartzo Transparente, Selenita, Ametista",
        ],
      },
      {
        type: "heading",
        text: "Como Realizar uma Sessão de Cura com Cristais",
      },
      {
        type: "paragraph",
        text: "Uma sessão de cura com cristais pode ser tão simples ou elaborada quanto desejar. O mais importante é a intenção e a abertura para receber.",
      },
      {
        type: "list",
        items: [
          "1. Deite-se numa superfície confortável e feche os olhos",
          "2. Respire profundamente 7 vezes para centrar-se",
          "3. Coloque o cristal correspondente sobre cada chakra",
          "4. Permaneça em meditação por 10 a 20 minutos",
          "5. Visualize a cor do chakra a brilhar e expandir",
          "6. Termine agradecendo e bebendo água",
        ],
      },
      {
        type: "tip",
        text: "Dica de Caela: O Quartzo Transparente amplifica a energia de qualquer cristal. Combine-o com outros cristais para potencializar os efeitos.",
      },
      {
        type: "quote",
        text: "Os chakras são janelas da alma. Quando limpos e equilibrados, a luz interior brilha sem obstáculos.",
      },
    ],
  },
  {
    slug: "saturno-em-retorno-despertar-29-anos",
    title: "Saturno em Retorno: O Grande Despertar dos 29 Anos",
    excerpt: "Por volta dos 29-30 anos, Saturno retorna ao ponto em que estava no seu nascimento. Esta fase intensa é um rito de passagem para a maturidade real.",
    category: "Astrologia",
    categorySlug: "astrologia",
    date: "2026-01-12",
    readTime: 9,
    tags: ["Saturno", "Saturno em Retorno", "Astrologia", "Crescimento Pessoal"],
    image: "♄",
    accentColor: "#8fa3b8",
    metaTitle: "Saturno em Retorno: O Despertar dos 29 Anos | ASTRALMIA",
    metaDescription: "O que é Saturno em Retorno e como navegar este período transformador aos 29-30 anos. Entenda os desafios, oportunidades e como usar esta fase para crescimento real.",
    keywords: ["saturno em retorno", "retorno de saturno", "saturno retorno 29 anos", "saturno astrologia", "crise dos 30 anos"],
    content: [
      {
        type: "paragraph",
        text: "Entre os 29 e os 30 anos (e novamente aos 58-60), Saturno completa a sua órbita e retorna exatamente ao ponto em que estava quando você nasceu. Este rito de passagem cósmico é um dos períodos mais intensos e transformadores da vida humana.",
      },
      {
        type: "heading",
        text: "O que é Saturno em Retorno?",
      },
      {
        type: "paragraph",
        text: "Saturno leva aproximadamente 29,5 anos para dar uma volta completa ao redor do Sol. Quando retorna à sua posição natal, é como se o 'professor máximo' do zodíaco se sentasse à sua frente para uma avaliação honesta: O que construiu? O que é genuinamente seu? O que precisa de ser abandonado?",
      },
      {
        type: "heading",
        text: "Sinais de que está no Saturno em Retorno",
      },
      {
        type: "list",
        items: [
          "Sentir que a vida 'já não encaixa' como antes",
          "Questionar a carreira, relacionamentos ou local onde vive",
          "Fim de relacionamentos ou empregos que não estavam alinhados",
          "Confronto com responsabilidades adiadas",
          "Sensação de pressão intensa para 'decidir quem é'",
          "Maior clareza sobre o que realmente valoriza",
        ],
      },
      {
        type: "heading",
        text: "Como Navegar o Saturno em Retorno",
      },
      {
        type: "paragraph",
        text: "A chave para navegar com sabedoria este período é a responsabilidade consciente. Saturno não pune — ele revela. Tudo o que cai durante este período não pertencia verdadeiramente a você.",
      },
      {
        type: "list",
        items: [
          "Faça um inventário honesto da sua vida: carreira, saúde, relações, propósito",
          "Tome decisões a partir dos seus valores reais, não das expectativas externas",
          "Invista em estruturas sólidas: planeamento, hábitos, comprometimento",
          "Aceite a responsabilidade sem autoflagelação",
          "Consulte o seu mapa astral para entender o signo e casa de Saturno natal",
        ],
      },
      {
        type: "tip",
        text: "Dica de Caela: Saturno em Retorno é incómodo porque está a resgatar quem você realmente é. Quanto mais autêntica a sua vida, mais suave será a passagem.",
      },
      {
        type: "quote",
        text: "Saturno não é cruel. É o pai que exige que cresças. E quando o fizeres, ele torna-se o maior aliado que já tiveste.",
      },
    ],
  },
  {
    slug: "magia-da-lua-nova-intencoes-manifestacao",
    title: "Lua Nova: O Poder das Intenções e a Magia da Manifestação",
    excerpt: "A Lua Nova representa o início de um novo ciclo — o momento perfeito para plantar sementes, definir intenções e iniciar o processo de criação consciente.",
    category: "Rituais",
    categorySlug: "rituais",
    date: "2025-12-30",
    readTime: 7,
    tags: ["Lua Nova", "Manifestação", "Intenções", "Magia"],
    image: "🌑",
    accentColor: "#4a6fa5",
    metaTitle: "Lua Nova: Intenções e Manifestação | ASTRALMIA",
    metaDescription: "Como usar a Lua Nova para definir intenções poderosas e manifestar. Ritual de Lua Nova passo a passo, dicas e os melhores cristais para potencializar a manifestação.",
    keywords: ["lua nova", "rituais de lua nova", "manifestação lua nova", "intenções lua nova", "criar intenções"],
    content: [
      {
        type: "paragraph",
        text: "A Lua Nova — quando a lua não é visível no céu — representa o ponto de origem do ciclo lunar. É o momento de máxima interioridade, silêncio e potencial. Como um campo recém-lavrado, a Lua Nova está pronta para receber as sementes das suas intenções.",
      },
      {
        type: "heading",
        text: "A Diferença entre a Lua Nova e a Lua Cheia",
      },
      {
        type: "paragraph",
        text: "Enquanto a Lua Cheia é o momento de liberar, a Lua Nova é o momento de iniciar. Na Lua Nova, a energia é receptiva e feminina — ideal para introspecção, visão e definição de intenções. A Lua Cheia, dois ciclos depois, iluminará o que você plantou.",
      },
      {
        type: "heading",
        text: "Ritual de Intenções da Lua Nova",
      },
      {
        type: "list",
        items: [
          "1. Prepare-se em silêncio — apague as luzes, acenda uma vela dourada ou branca",
          "2. Medite por 10 minutos conectando-se com o silêncio interior",
          "3. Escreva no máximo 3 intenções específicas para o ciclo que começa",
          "4. Formule as intenções no presente: 'Eu sou', 'Eu tenho', 'Eu experimento'",
          "5. Leia cada intenção em voz alta com convicção e emoção",
          "6. Dobre o papel e mantenha-o num local sagrado até à Lua Cheia",
          "7. Tome ações concretas em direção às suas intenções ao longo do ciclo",
        ],
      },
      {
        type: "tip",
        text: "Dica de Caela: O signo em que a Lua Nova ocorre influencia o tema das intenções. Lua Nova em Áries favorece novos começos e coragem; em Touro, abundância e estabilidade; em Gémeos, comunicação e aprendizagem.",
      },
      {
        type: "quote",
        text: "Na escuridão da Lua Nova, existe apenas potencial puro. É a tela em branco do Universo esperando pela sua intenção.",
      },
    ],
  },
  {
    slug: "numerologia-numero-de-destino",
    title: "Numerologia: Descubra o Seu Número de Destino",
    excerpt: "O número de destino, calculado a partir da data de nascimento, revela a missão de vida, os talentos inatos e os desafios que viemos superar.",
    category: "Numerologia",
    categorySlug: "numerologia",
    date: "2025-12-20",
    readTime: 8,
    tags: ["Numerologia", "Número de Destino", "Missão de Vida", "Autoconhecimento"],
    image: "∞",
    accentColor: "#6ba5a5",
    metaTitle: "Numerologia: Como Calcular o Seu Número de Destino | ASTRALMIA",
    metaDescription: "Aprenda a calcular o seu número de destino na numerologia e descubra o que ele revela sobre a sua missão de vida, talentos e desafios. Guia completo com exemplos.",
    keywords: ["numerologia", "número de destino", "calcular número de destino", "numerologia data de nascimento", "missão de vida numerologia"],
    content: [
      {
        type: "paragraph",
        text: "A numerologia é uma das ciências esotéricas mais antigas do mundo, com raízes no pensamento pitagórico e em tradições hebraicas e caldaicas. Através dos números presentes na sua data de nascimento, é possível desvendar padrões de destino, talentos ocultos e o propósito maior da sua existência.",
      },
      {
        type: "heading",
        text: "Como Calcular o Seu Número de Destino",
      },
      {
        type: "paragraph",
        text: "O número de destino — também chamado de número de caminho de vida — calcula-se somando todos os dígitos da data de nascimento completa até obter um único algarismo (exceto 11, 22 e 33, chamados números mestres).",
      },
      {
        type: "list",
        items: [
          "Exemplo: 15 de março de 1992 → 1+5+0+3+1+9+9+2 = 30 → 3+0 = 3",
          "Exemplo: 28 de novembro de 1987 → 2+8+1+1+1+9+8+7 = 37 → 3+7 = 10 → 1+0 = 1",
          "Atenção: Se o resultado for 11, 22 ou 33, não reduza — são Números Mestres",
        ],
      },
      {
        type: "heading",
        text: "O Significado dos Números de Destino",
      },
      {
        type: "list",
        items: [
          "1 — Liderança, pioneirismo, independência",
          "2 — Diplomacia, cooperação, sensibilidade",
          "3 — Criatividade, expressão, comunicação",
          "4 — Estrutura, trabalho, estabilidade, construção",
          "5 — Liberdade, mudança, aventura, versatilidade",
          "6 — Responsabilidade, amor, cura, família",
          "7 — Busca espiritual, análise, introspecção",
          "8 — Poder, abundância, autoridade, realização",
          "9 — Humanitarismo, conclusão, sabedoria universal",
          "11 (Mestre) — Iluminação espiritual, intuição elevada",
          "22 (Mestre) — Construtor de grandes obras, potencial máximo",
          "33 (Mestre) — Mestre professor, amor incondicional",
        ],
      },
      {
        type: "tip",
        text: "Dica de Caela: Não existe número melhor ou pior. Cada número traz dons únicos e desafios específicos. O objetivo não é ser o número — é expressá-lo na sua versão mais elevada.",
      },
      {
        type: "quote",
        text: "Os números são a linguagem com que o Universo escreve o destino. Aprenda a lê-los e nunca mais se sentirá perdido.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  if (categorySlug === "todos") return blogPosts;
  return blogPosts.filter((p) => p.categorySlug === categorySlug);
}

export function getRelatedPosts(post: BlogPost, count = 3): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== post.slug && (p.categorySlug === post.categorySlug || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, count);
}
