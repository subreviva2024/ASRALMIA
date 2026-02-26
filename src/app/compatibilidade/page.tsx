"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─── Dados do Zodíaco ─────────────────────────── */
const SIGNOS = [
  { id: 0,  nome: "Áries",       sym: "♈", el: "Fogo",  mod: "Cardinal", cor: "#e85c3b" },
  { id: 1,  nome: "Touro",       sym: "♉", el: "Terra", mod: "Fixo",     cor: "#7cb87a" },
  { id: 2,  nome: "Gémeos",      sym: "♊", el: "Ar",    mod: "Mutável",  cor: "#c9c4a8" },
  { id: 3,  nome: "Caranguejo",  sym: "♋", el: "Água",  mod: "Cardinal", cor: "#4e8ce8" },
  { id: 4,  nome: "Leão",        sym: "♌", el: "Fogo",  mod: "Fixo",     cor: "#e8a23b" },
  { id: 5,  nome: "Virgem",      sym: "♍", el: "Terra", mod: "Mutável",  cor: "#a8c278" },
  { id: 6,  nome: "Balança",     sym: "♎", el: "Ar",    mod: "Cardinal", cor: "#dcc9e8" },
  { id: 7,  nome: "Escorpião",   sym: "♏", el: "Água",  mod: "Fixo",     cor: "#8b3be8" },
  { id: 8,  nome: "Sagitário",   sym: "♐", el: "Fogo",  mod: "Mutável",  cor: "#e87c3e" },
  { id: 9,  nome: "Capricórnio", sym: "♑", el: "Terra", mod: "Cardinal", cor: "#8c9e7a" },
  { id: 10, nome: "Aquário",     sym: "♒", el: "Ar",    mod: "Fixo",     cor: "#82c8e8" },
  { id: 11, nome: "Peixes",      sym: "♓", el: "Água",  mod: "Mutável",  cor: "#5e82c8" },
];

/* ─── Motor de compatibilidade ─────────────────── */
function calcCompat(a: number, b: number) {
  const dist = Math.min(Math.abs(a - b), 12 - Math.abs(a - b));
  const scoreBase: Record<number, number> = { 0: 97, 1: 67, 2: 85, 3: 58, 4: 93, 5: 54, 6: 80 };
  const base = scoreBase[dist] ?? 70;
  const elA = SIGNOS[a].el, elB = SIGNOS[b].el;
  const pairs = [elA, elB].sort().join("+");
  const elBonus: Record<string, number> = {
    "Fogo+Fogo": 4, "Terra+Terra": 3, "Ar+Ar": 4, "Água+Água": 3,
    "Ar+Fogo": 5, "Terra+Água": 5,
    "Fogo+Terra": -3, "Ar+Água": -2, "Fogo+Água": -8, "Ar+Terra": -1,
  };
  const score = Math.min(99, Math.max(40, base + (elBonus[pairs] ?? 0)));
  const textos: Record<string, string[]> = {
    "Fogo+Fogo": ["Uma chama que se alimenta a si própria — paixão intensa, impulso partilhado e aventura constante.", "O perigo? Consumir-se na própria intensidade. O cuidado mútuo torna-os inextinguíveis."],
    "Terra+Terra": ["Fundação sólida como rocha. Ambos valorizam a segurança, a lealdade e a beleza das coisas simples.", "Juntos constroem impérios de calma. Podem estagnar — desafiem-se mutuamente a crescer."],
    "Ar+Ar": ["Dois espíritos livres em conversação eterna. A mente é o vosso templo, as ideias o vosso amor.", "Precaução: a profundidade emocional pode ficar por tocar. Mergulhem além das palavras."],
    "Água+Água": ["Uma ligação que fala em silêncio. Sentindo-se vistos sem precisar de explicar — raridade cósmica.", "A sensibilidade partilhada pode tornar-se ondas gigantes. Aprendam a ser porto um do outro."],
    "Ar+Fogo": ["O ar aviva o fogo e o fogo aquece o ar — uma das combinações mais vivas do zodíaco.", "Intelecto e paixão a dançar. Alimentam-se mutuamente com curiosidade e entusiasmo sem fim."],
    "Terra+Água": ["A terra contém a água e a água nutre a terra — complementaridade profunda e íntima.", "Uma parceria de cura. Estabilidade encontra emoção; firmeza encontra fluxo."],
    "Fogo+Terra": ["O fogo quer transformar, a terra quer preservar — uma tensão criativa que exige paciência.", "Com maturidade, tornam-se incrivelmente complementares: acção e estrutura em harmonia."],
    "Ar+Água": ["A mente e o coração em diálogo permanente. Aprendem muito um com o outro.", "O ar precisa de entender o que a água sente; a água precisa de confiar na leveza do ar."],
    "Fogo+Água": ["Opostos que se atraem com força magnética — e que podem também se anular.", "Quando aprendem a respeitar as diferenças profundas, criam uma ligação transformadora."],
    "Ar+Terra": ["A imaginação do ar encontra o pragmatismo da terra — visão e execução numa só força.", "Precisam encontrar um idioma comum. Quando o fazem, são imbatíveis."],
  };
  const txt = textos[pairs] ?? textos[[elA, elB].reverse().join("+")] ?? ["Uma combinação única, cheia de nuances e surpresas cósmicas.", "Cada aspecto desta ligação revela novos signos do destino partilhado."];
  const sameEl = elA === elB;
  const trineOpp = dist === 4 || dist === 6;
  return {
    score,
    amor:        Math.min(99, score + (trineOpp ? 4 : 0) + (sameEl ? 3 : 0)),
    paixao:      Math.min(99, score - 2 + (dist === 6 ? 8 : 0) + (elA === "Fogo" || elB === "Fogo" ? 5 : 0)),
    comunicacao: Math.min(99, score + (elA === "Ar" || elB === "Ar" ? 6 : 0)),
    espiritual:  Math.min(99, score + (elA === "Água" || elB === "Água" ? 5 : 0) + (dist === 4 ? 4 : 0)),
    texto: txt,
  };
}

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: (((i * 9301 + 49297) % 233280) / 233280) * 100,
  y: (((i * 7331 + 23171) % 233280) / 233280) * 100,
  s: 0.5 + (((i * 4517) % 233280) / 233280) * 1.5,
  d: `${(((i * 3271) % 233280) / 233280) * 5}s`,
  dur: `${3 + (((i * 5003) % 233280) / 233280) * 4}s`,
}));

function Gauge({ score }: { score: number }) {
  const r = 90, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ * 0.75;
  return (
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9a6e20" /><stop offset="50%" stopColor="#e8cc80" /><stop offset="100%" stopColor="#c9a84c" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"
        strokeDasharray={`${circ * 0.75} ${circ}`} strokeLinecap="round" transform="rotate(135 110 110)" />
      <motion.circle cx="110" cy="110" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${circ} ${circ}`}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - fill }}
        transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        transform="rotate(135 110 110)" />
      <text x="110" y="108" textAnchor="middle" fill="#f0ebe2" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "42px", fontWeight: "300" }}>{score}</text>
      <text x="110" y="128" textAnchor="middle" fill="rgba(201,168,76,0.6)" style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.2em" }}>%</text>
    </svg>
  );
}

function CatBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,226,0.4)" }}>{label}</span>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: "#c9a84c" }}>{value}%</span>
      </div>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", position: "relative" }}>
        <motion.div initial={{ width: "0%" }} animate={{ width: `${value}%` }}
          transition={{ duration: 1.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ height: "1px", background: "linear-gradient(90deg,#9a6e20,#e8cc80)", position: "absolute", top: 0, left: 0 }} />
        <motion.div initial={{ left: "0%", opacity: 0 }} animate={{ left: `${value}%`, opacity: 1 }}
          transition={{ duration: 1.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: "absolute", top: "-3px", width: "7px", height: "7px", borderRadius: "50%", background: "#e8cc80", transform: "translateX(-50%)", boxShadow: "0 0 12px rgba(232,204,128,0.8)" }} />
      </div>
    </div>
  );
}

function SignCard({ s, selected, onSelect }: { s: typeof SIGNOS[0]; selected: boolean; onSelect: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button onClick={onSelect} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, perspective: "600px" }}>
      <motion.div
        animate={{ rotateX: hov ? -8 : 0, rotateY: hov ? 6 : 0, scale: selected ? 1.07 : hov ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          transformStyle: "preserve-3d",
          background: selected ? `linear-gradient(135deg,${s.cor}22,${s.cor}0a)` : hov ? "rgba(255,255,255,0.04)" : "rgba(13,13,24,0.8)",
          border: selected ? `1px solid ${s.cor}77` : "1px solid rgba(255,255,255,0.06)",
          padding: "16px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          boxShadow: selected ? `0 8px 40px ${s.cor}33,0 0 0 1px ${s.cor}44` : hov ? "0 16px 48px rgba(0,0,0,0.7)" : "none",
          transition: "background 0.3s,border-color 0.3s,box-shadow 0.3s", position: "relative", overflow: "hidden",
        }}>
        {(hov || selected) && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to bottom,rgba(255,255,255,0.07),transparent)", pointerEvents: "none" }} />}
        <span style={{ fontSize: "22px", filter: selected ? `drop-shadow(0 0 8px ${s.cor}88)` : "none", transition: "filter 0.3s" }}>{s.sym}</span>
        <span style={{ fontFamily: "'Inter'", fontSize: "8px", letterSpacing: "0.15em", textTransform: "uppercase", color: selected ? s.cor : "rgba(240,235,226,0.35)", transition: "color 0.3s" }}>{s.nome}</span>
      </motion.div>
    </motion.button>
  );
}

export default function CompatibilidadePage() {
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const [compat, setCompat] = useState<ReturnType<typeof calcCompat> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (a !== null && b !== null && a !== b) {
      setCompat(calcCompat(a, b));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    } else { setCompat(null); }
  }, [a, b]);

  const sA = a !== null ? SIGNOS[a] : null;
  const sB = b !== null ? SIGNOS[b] : null;

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {STARS.map(s => (
          <div key={s.id} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, borderRadius: "50%", background: "#f0ebe2", animation: `twinkle ${s.dur} ease-in-out infinite ${s.d}` }} />
        ))}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse,rgba(201,168,76,0.05) 0%,rgba(90,40,160,0.04) 50%,transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginBottom: "20px" }}>☽ &ensp; Astrologia Relacional &ensp; ✦</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(44px,7vw,80px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.05, marginBottom: "20px" }}>
            Compatibilidade<br /><em className="text-shimmer" style={{ fontStyle: "italic" }}>dos Signos</em>
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 300, color: "rgba(240,235,226,0.45)", lineHeight: 1.8, maxWidth: "460px", margin: "0 auto" }}>
            Seleccione dois signos e descubra o que os astros revelam sobre a vossa ligação cósmica.
          </p>
        </motion.div>
      </section>

      {/* Selectors */}
      <section style={{ padding: "0 24px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: "24px", alignItems: "start" }}>
          {/* Lado A */}
          <div>
            <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,226,0.25)", marginBottom: "16px", textAlign: "center" }}>☽ &ensp; Primeiro signo</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "3px" }}>
              {SIGNOS.map(s => <SignCard key={s.id} s={s} selected={a === s.id} onSelect={() => setA(p => p === s.id ? null : s.id)} />)}
            </div>
            <AnimatePresence>
              {sA && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: "16px", padding: "16px", background: `linear-gradient(135deg,${sA.cor}12,transparent)`, border: `1px solid ${sA.cor}33`, textAlign: "center" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "28px" }}>{sA.sym}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: "#f0ebe2", marginTop: "4px" }}>{sA.nome}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: sA.cor, marginTop: "4px" }}>{sA.el} · {sA.mod}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Centro */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "28px", gap: "8px" }}>
            <div style={{ width: "1px", flex: 1, background: "linear-gradient(to bottom,transparent,rgba(201,168,76,0.25),transparent)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", color: "rgba(201,168,76,0.35)" }}>✦</span>
            <div style={{ width: "1px", flex: 1, background: "linear-gradient(to bottom,transparent,rgba(201,168,76,0.25),transparent)" }} />
          </div>

          {/* Lado B */}
          <div>
            <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,235,226,0.25)", marginBottom: "16px", textAlign: "center" }}>✦ &ensp; Segundo signo</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "3px" }}>
              {SIGNOS.map(s => <SignCard key={s.id} s={s} selected={b === s.id} onSelect={() => setB(p => p === s.id ? null : s.id)} />)}
            </div>
            <AnimatePresence>
              {sB && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: "16px", padding: "16px", background: `linear-gradient(135deg,${sB.cor}12,transparent)`, border: `1px solid ${sB.cor}33`, textAlign: "center" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "28px" }}>{sB.sym}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: "#f0ebe2", marginTop: "4px" }}>{sB.nome}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: sB.cor, marginTop: "4px" }}>{sB.el} · {sB.mod}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {(!compat) && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontStyle: "italic", color: "rgba(240,235,226,0.18)", marginTop: "40px" }}>
            {a !== null && b !== null && a === b ? "Escolha dois signos diferentes" : "Seleccione os dois signos para revelar a compatibilidade"}
          </motion.p>
        )}
      </section>

      {/* Resultado */}
      <AnimatePresence>
        {compat && sA && sB && (
          <motion.section ref={resultRef as any} key={`${a}-${b}`}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ padding: "80px 24px 120px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg,rgba(13,13,24,0.95),#08080f)", position: "relative", overflow: "hidden" }}>

            <div style={{ position: "absolute", left: "8%", top: "15%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle,${sA.cor}0d 0%,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "8%", bottom: "15%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle,${sB.cor}0d 0%,transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ maxWidth: "860px", margin: "0 auto" }}>
              {/* Título par */}
              <div style={{ textAlign: "center", marginBottom: "64px" }}>
                <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.4)", marginBottom: "20px" }}>✦ &ensp; Análise Cósmica &ensp; ✦</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(28px,5vw,52px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.1 }}>
                  <span style={{ color: sA.cor }}>{sA.nome}</span>
                  <span style={{ color: "rgba(201,168,76,0.35)", margin: "0 20px", fontSize: "0.65em" }}>✦</span>
                  <span style={{ color: sB.cor }}>{sB.nome}</span>
                </h2>
              </div>

              {/* Gauge + barras */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "72px", alignItems: "center", marginBottom: "64px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <Gauge score={compat.score} />
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "13px", fontStyle: "italic", color: "rgba(240,235,226,0.35)", letterSpacing: "0.1em" }}>Compatibilidade Geral</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  <CatBar label="Amor & Cumplicidade"    value={compat.amor}        delay={0.3} />
                  <CatBar label="Paixão & Atracção"      value={compat.paixao}      delay={0.45} />
                  <CatBar label="Comunicação"            value={compat.comunicacao} delay={0.6} />
                  <CatBar label="Crescimento Espiritual" value={compat.espiritual}  delay={0.75} />
                </div>
              </div>

              {/* Análise */}
              <div style={{ padding: "48px", background: "rgba(13,13,24,0.85)", border: "1px solid rgba(255,255,255,0.06)", position: "relative", marginBottom: "48px" }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60px", height: "1px", background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }} />
                <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,168,76,0.4)", marginBottom: "24px", textAlign: "center" }}>Leitura dos Astros</p>
                {compat.texto.map((t, i) => (
                  <p key={i} style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(17px,2vw,21px)", fontWeight: 300, fontStyle: i === 0 ? "italic" : "normal", color: i === 0 ? "#f0ebe2" : "rgba(240,235,226,0.5)", lineHeight: 1.75, marginBottom: i === 0 ? "20px" : 0 }}>{t}</p>
                ))}
              </div>

              {/* CTA */}
              <div style={{ padding: "48px 40px", background: "linear-gradient(135deg,rgba(201,168,76,0.04),rgba(90,40,160,0.04))", border: "1px solid rgba(201,168,76,0.12)", textAlign: "center" }}>
                <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(201,168,76,0.45)", marginBottom: "16px" }}>✦ &ensp; Vá mais fundo &ensp; ✦</p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 300, color: "#f0ebe2", marginBottom: "12px", lineHeight: 1.3 }}>A compatibilidade é apenas o começo.</p>
                <p style={{ fontFamily: "'Inter'", fontSize: "13px", fontWeight: 300, color: "rgba(240,235,226,0.4)", marginBottom: "32px", lineHeight: 1.8, maxWidth: "420px", margin: "0 auto 32px" }}>O seu Mapa Astral completo revela as casas, aspectos e padrões que tornam a sua alma única no cosmos.</p>
                <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/mapa-astral" className="btn-primary">✦ &ensp; Gerar Mapa Astral</Link>
                  <Link href="/quiz-lunar" className="btn-ghost">Descobrir o Signo Lunar</Link>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
