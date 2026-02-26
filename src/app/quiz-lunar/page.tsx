"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─── Dados ────────────────────────────────────────── */
type El  = "fogo" | "terra" | "ar" | "agua";
type Mod = "cardinal" | "fixo" | "mutavel";

const RESULTADO: Record<El, Record<Mod, { nome: string; sym: string; cor: string; desc: string; dons: string[]; desafio: string }>> = {
  fogo: {
    cardinal: { nome: "Áries",      sym: "♈", cor: "#e85c3b", desc: "A sua alma emocional é uma centelha que precisa de acender mundos. Age antes de pensar e sente com uma intensidade que impressiona quem o rodeia.", dons: ["Coragem instintiva", "Entusiasmo contagiante", "Liderança emocional"], desafio: "Aprender a ficar com a emoção depois do impulso inicial." },
    fixo:     { nome: "Leão",       sym: "♌", cor: "#e8a23b", desc: "O coração é o seu trono. Ama com grandiosidade, necessita de reconhecimento e transforma cada relação num palco de criação e calor.", dons: ["Generosidade do coração", "Lealdade inabalável", "Força criativa"], desafio: "Abrir espaço para as necessidades emocionais dos outros." },
    mutavel:  { nome: "Sagitário",  sym: "♐", cor: "#e87c3e", desc: "A sua alma busca o horizonte invisível. Emociona-se com ideias, filosof ias e aventuras. O que o prende não é o amor, mas a liberdade dentro dele.", dons: ["Optimismo natural", "Visão do todo", "Alegria contagiante"], desafio: "Comprometer-se emocionalmente sem sentir aprisionamento." },
  },
  terra: {
    cardinal: { nome: "Capricórnio",sym: "♑", cor: "#8c9e7a", desc: "Processa as emoções com estrutura e reserva. Cuida em silêncio, constrói em segurança e precisa de sentir que as suas emoções têm propósito e dignidade.", dons: ["Resiliência emocional", "Paciência profunda", "Cuidado silencioso"], desafio: "Permitir vulnerabilidade sem a tratar como fraqueza." },
    fixo:     { nome: "Touro",      sym: "♉", cor: "#7cb87a", desc: "A sua alma anseia por segurança, beleza sensorial e amor que dure. Leal até ao extremo, sente-se profundamente quando os seus valores e conforto são respeitados.", dons: ["Sensorialidade rica", "Fidelidade rara", "Presença tranquilizante"], desafio: "Soltar o que já não serve, mesmo que seja confortável." },
    mutavel:  { nome: "Virgem",     sym: "♍", cor: "#a8c278", desc: "A mente é o seu santuário emocional. Cuida com precisão, serve com amor e analisa os sentimentos à procura de padrões. A perfeição é a sua forma de dizer que se importa.", dons: ["Atenção ao detalhe emocional", "Serviço amoroso", "Discernimento profundo"], desafio: "Aceitar que as emoções não precisam de ser perfeitas para serem válidas." },
  },
  ar: {
    cardinal: { nome: "Balança",    sym: "♎", cor: "#dcc9e8", desc: "Precisa de harmonia como precisa de ar para respirar. Processa as emoções em relação — o que sente depende sempre do que o outro sente. A beleza e a justiça alimentam a sua alma.", dons: ["Empatia refinada", "Diplomacia natural", "Sentido estético intenso"], desafio: "Aprender a sentir sem precisar de equilíbrio perfeito primeiro." },
    fixo:     { nome: "Aquário",    sym: "♒", cor: "#82c8e8", desc: "A sua alma emocional é simultaneamente universal e distante. Sente pela humanidade toda mas tem dificuldade em deixar-se sentir plenamente por uma só pessoa.", dons: ["Visão colectiva", "Originalidade emocional", "Amizade profunda e leal"], desafio: "Descer das ideias para as emoções corporais e íntimas." },
    mutavel:  { nome: "Gémeos",     sym: "♊", cor: "#c9c4a8", desc: "As suas emoções são mensageiras — transformam-se em palavras, histórias e conexões. Processa sentindo e falando ao mesmo tempo, com uma curiosidade que nada sacia completamente.", dons: ["Adaptabilidade emocional", "Comunicação dos sentimentos", "Leveza contagiante"], desafio: "Ficar com uma emoção o tempo suficiente para a compreender completamente." },
  },
  agua: {
    cardinal: { nome: "Caranguejo", sym: "♋", cor: "#4e8ce8", desc: "Você é o guardião emocional dos que ama. Sente tudo com uma profundidade que parece não ter fundo e o lar — físico ou espiritual — é onde a sua alma respira.", dons: ["Intuição exacta", "Cuidado incondicional", "Memória emocional viva"], desafio: "Proteger-se sem fechar o coração ao que não pertence ao passado." },
    fixo:     { nome: "Escorpião",  sym: "♏", cor: "#8b3be8", desc: "A sua alma mergulha onde outros não ousam. Transforma a dor em poder, a perda em renascimento. Ama com uma intensidade que poucos compreendem e que jamais é esquecida.", dons: ["Poder de transformação", "Intensidade magnética", "Lealdade absoluta"], desafio: "Confiar sem precisar de controlar o que pode acontecer." },
    mutavel:  { nome: "Peixes",     sym: "♓", cor: "#5e82c8", desc: "A sua alma dissolve fronteiras. Sente o que os outros sentem antes de eles próprios o saberem. É um ser de compaixão cósmica — o universo flui através de si.", dons: ["Compaixão ilimitada", "Imaginação espiritual", "Ligação ao invisível"], desafio: "Manter-se enraizado no mundo físico sem se perder no oceano do outro." },
  },
};

/* ─── Perguntas ─────────────────────────────────── */
const PERGUNTAS = [
  {
    num: 1,
    texto: "Quando uma emoção forte surge dentro de si, o que acontece?",
    subtexto: "Feche os olhos um momento. Sinta. O que é verdadeiro?",
    opcoes: [
      { label: "Incendeia — age imediatamente", el: "fogo" as El },
      { label: "Solidifica — processa em silêncio", el: "terra" as El },
      { label: "Dispersa — precisa de partilhar", el: "ar" as El },
      { label: "Transborda — mergulha completamente", el: "agua" as El },
    ],
  },
  {
    num: 2,
    texto: "O que mais nutre e revitaliza a sua alma?",
    subtexto: "Não o que deveria ser. O que realmente é.",
    opcoes: [
      { label: "Novos começos e o calor da aventura", el: "fogo" as El },
      { label: "Estabilidade, beleza e silêncio sagrado", el: "terra" as El },
      { label: "Conversas que expandem a mente", el: "ar" as El },
      { label: "Conexão íntima e profundidade emocional", el: "agua" as El },
    ],
  },
  {
    num: 3,
    texto: "No seu inconsciente, que paisagem aparece?",
    subtexto: "A que ressoa como um eco antigo dentro de si.",
    opcoes: [
      { label: "Vulcão em erupção ao pôr do sol", el: "fogo" as El },
      { label: "Floresta densa e densa ao amanhecer", el: "terra" as El },
      { label: "Vento nas cimas de uma montanha infinita", el: "ar" as El },
      { label: "Oceano profundo à meia-noite estrelada", el: "agua" as El },
    ],
  },
  {
    num: 4,
    texto: "Como começam os ciclos da sua vida?",
    subtexto: "Olhe para o padrão que se repete.",
    opcoes: [
      { label: "Com arranques súbitos — decido e mergulho", mod: "cardinal" as Mod },
      { label: "Com resistência — prefiro o que já funciona", mod: "fixo" as Mod },
      { label: "Fluo com o que aparece — adapto-me", mod: "mutavel" as Mod },
    ],
  },
  {
    num: 5,
    texto: "Qual é a sua relação com a mudança?",
    subtexto: "A resposta honesta, não a admirável.",
    opcoes: [
      { label: "Provoco-a — sou eu que inicio", mod: "cardinal" as Mod },
      { label: "Resisto até ao último momento possível", mod: "fixo" as Mod },
      { label: "Aceito-a — a mudança e eu somos velhos amigos", mod: "mutavel" as Mod },
    ],
  },
];

/* ─── Estrelas ───────────────────────────────────── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: (((i * 9301 + 49297) % 233280) / 233280) * 100,
  y: (((i * 7331 + 23171) % 233280) / 233280) * 100,
  s: 0.4 + (((i * 4517) % 233280) / 233280) * 1.8,
  d: `${(((i * 3271) % 233280) / 233280) * 6}s`,
  dur: `${2.5 + (((i * 5003) % 233280) / 233280) * 4}s`,
}));

/* ─── Quiz ───────────────────────────────────────── */
export default function QuizLunarPage() {
  const [step, setStep]       = useState<"intro" | number | "result">("intro");
  const [elScores, setElScores] = useState<Record<El, number>>({ fogo: 0, terra: 0, ar: 0, agua: 0 });
  const [modScores, setModScores] = useState<Record<Mod, number>>({ cardinal: 0, fixo: 0, mutavel: 0 });
  const [chosen, setChosen]   = useState<number | null>(null);

  function pickEl(el: El) {
    setElScores(prev => ({ ...prev, [el]: prev[el] + 1 }));
  }
  function pickMod(mod: Mod) {
    setModScores(prev => ({ ...prev, [mod]: prev[mod] + 1 }));
  }

  function handleAnswer(idx: number, opt: typeof PERGUNTAS[0]["opcoes"][0]) {
    setChosen(idx);
    const isEl = "el" in opt;
    if (isEl) pickEl((opt as any).el);
    else      pickMod((opt as any).mod);

    setTimeout(() => {
      setChosen(null);
      const cur = step as number;
      if (cur < PERGUNTAS.length - 1) setStep(cur + 1);
      else setStep("result");
    }, 600);
  }

  function topEl(): El {
    return (Object.entries(elScores).sort((a, b) => b[1] - a[1])[0][0]) as El;
  }
  function topMod(): Mod {
    return (Object.entries(modScores).sort((a, b) => b[1] - a[1])[0][0]) as Mod;
  }

  const result = step === "result" ? RESULTADO[topEl()][topMod()] : null;
  const pNum   = typeof step === "number" ? step : 0;
  const pergunta = typeof step === "number" ? PERGUNTAS[step] : null;
  const progress = typeof step === "number" ? ((step) / PERGUNTAS.length) * 100 : step === "result" ? 100 : 0;

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Campo de estrelas */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {STARS.map(s => (
          <div key={s.id} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, borderRadius: "50%", background: "#f0ebe2", animation: `twinkle ${s.dur} ease-in-out infinite ${s.d}` }} />
        ))}
      </div>

      {/* Barra de progresso */}
      {step !== "intro" && (
        <div style={{ position: "fixed", top: "72px", left: 0, right: 0, height: "2px", background: "rgba(255,255,255,0.05)", zIndex: 50 }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: [0.25,0.46,0.45,0.94] }}
            style={{ height: "100%", background: "linear-gradient(90deg,#9a6e20,#e8cc80)" }} />
        </div>
      )}

      {/* Conteúdo */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: "640px" }}>
          <AnimatePresence mode="wait">

            {/* ── INTRO ── */}
            {step === "intro" && (
              <motion.div key="intro"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.9, ease: [0.25,0.46,0.45,0.94] }}
                style={{ textAlign: "center" }}
              >
                {/* Luna 3D SVG */}
                <div style={{ marginBottom: "40px", perspective: "600px" }}>
                  <motion.svg
                    viewBox="0 0 160 160" width="160" height="160"
                    animate={{ rotateY: [0, 12, 0, -12, 0], rotateX: [0, 6, 0, -6, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ margin: "0 auto", display: "block", filter: "drop-shadow(0 0 30px rgba(201,168,76,0.3))" }}
                  >
                    <defs>
                      <radialGradient id="moonGrad" cx="35%" cy="35%">
                        <stop offset="0%" stopColor="#e8cc80" />
                        <stop offset="40%" stopColor="#c9a84c" />
                        <stop offset="100%" stopColor="#4a3510" />
                      </radialGradient>
                      <radialGradient id="glowGrad" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(201,168,76,0.15)" />
                        <stop offset="100%" stopColor="transparent" />
                      </radialGradient>
                    </defs>
                    <circle cx="80" cy="80" r="78" fill="url(#glowGrad)" />
                    <circle cx="80" cy="80" r="54" fill="url(#moonGrad)" />
                    {/* Crateras */}
                    <circle cx="65" cy="68" r="8" fill="rgba(0,0,0,0.15)" />
                    <circle cx="94" cy="88" r="5" fill="rgba(0,0,0,0.1)" />
                    <circle cx="72" cy="96" r="4" fill="rgba(0,0,0,0.08)" />
                    {/* Anel sagrado */}
                    <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.8" strokeDasharray="3 6" />
                    <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="0.5" />
                    {/* Símbolos */}
                    {[0,45,90,135,180,225,270,315].map(deg => {
                      const rad = (deg * Math.PI) / 180;
                      return <circle key={deg} cx={80 + 70 * Math.cos(rad)} cy={80 + 70 * Math.sin(rad)} r="1.5" fill="rgba(201,168,76,0.5)" />;
                    })}
                  </motion.svg>
                </div>

                <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginBottom: "20px" }}>☽ &ensp; Descoberta Interior &ensp; ✦</p>
                <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(38px,6vw,64px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.1, marginBottom: "24px" }}>
                  Qual é o seu<br /><em className="text-shimmer" style={{ fontStyle: "italic" }}>Signo Lunar?</em>
                </h1>
                <p style={{ fontFamily: "'Inter'", fontSize: "14px", fontWeight: 300, color: "rgba(240,235,226,0.45)", lineHeight: 1.85, marginBottom: "40px", maxWidth: "440px", margin: "0 auto 40px" }}>
                  O seu Sol mostra quem você é. A sua Lua revela quem você <em style={{ fontStyle: "italic", color: "rgba(240,235,226,0.7)" }}>sente</em> ser — no silêncio, nas sombras, nos sonhos.
                </p>
                <p style={{ fontFamily: "'Inter'", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,235,226,0.25)", marginBottom: "40px" }}>5 questões · 3 minutos · Resultado imediato</p>
                <button className="btn-primary" onClick={() => setStep(0)}>
                  ☽ &ensp; Revelar a minha Lua
                </button>
              </motion.div>
            )}

            {/* ── PERGUNTA ── */}
            {typeof step === "number" && pergunta && (
              <motion.div key={`q${step}`}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.7, ease: [0.25,0.46,0.45,0.94] }}
              >
                {/* Número */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "13px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.2em" }}>{step + 1} / {PERGUNTAS.length}</span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                  <button onClick={() => { setStep("intro"); setElScores({ fogo:0, terra:0, ar:0, agua:0 }); setModScores({ cardinal:0, fixo:0, mutavel:0 }); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,226,0.2)", padding: 0 }}>
                    Recomeçar
                  </button>
                </div>

                {/* Pergunta */}
                <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(26px,4vw,40px)", fontWeight: 300, color: "#f0ebe2", lineHeight: 1.25, marginBottom: "12px" }}>
                  {pergunta.texto}
                </h2>
                <p style={{ fontFamily: "'Inter'", fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: "rgba(240,235,226,0.3)", marginBottom: "40px" }}>
                  {pergunta.subtexto}
                </p>

                {/* Opções */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {pergunta.opcoes.map((opt, i) => (
                    <motion.button key={i} onClick={() => handleAnswer(i, opt as any)}
                      whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }}
                      style={{
                        background: chosen === i ? "rgba(201,168,76,0.12)" : "rgba(13,13,24,0.85)",
                        border: chosen === i ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.06)",
                        padding: "20px 24px",
                        display: "flex", alignItems: "center", gap: "16px",
                        cursor: "pointer", textAlign: "left",
                        boxShadow: chosen === i ? "0 0 24px rgba(201,168,76,0.1)" : "none",
                        transition: "background 0.3s,border-color 0.3s,box-shadow 0.3s",
                        position: "relative", overflow: "hidden",
                      }}>
                      {/* Luz 3D no hover */}
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to bottom,rgba(255,255,255,0.03),transparent)", pointerEvents: "none" }} />
                      <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(16px,2.2vw,20px)", fontWeight: 300, color: chosen === i ? "#f0ebe2" : "rgba(240,235,226,0.75)", lineHeight: 1.3 }}>
                        {opt.label}
                      </span>
                      {chosen === i && (
                        <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                          style={{ marginLeft: "auto", color: "#c9a84c", fontSize: "16px", flexShrink: 0 }}>✦</motion.span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── RESULTADO ── */}
            {step === "result" && result && (
              <motion.div key="result"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.25,0.46,0.45,0.94] }}
                style={{ textAlign: "center" }}
              >
                {/* Orbe 3D do resultado */}
                <div style={{ marginBottom: "44px", perspective: "800px" }}>
                  <motion.div
                    animate={{ rotateY: [0, 8, 0, -8, 0], rotateX: [0, 4, 0, -4, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      width: "160px", height: "160px", margin: "0 auto",
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 35% 35%, ${result.cor}ee, ${result.cor}66 50%, #08080f 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 60px ${result.cor}44, 0 0 120px ${result.cor}22, inset 0 8px 20px rgba(255,255,255,0.12)`,
                      position: "relative",
                    }}
                  >
                    {/* Anel orbital */}
                    <div style={{
                      position: "absolute", inset: "-20px", borderRadius: "50%",
                      border: `1px solid ${result.cor}45`,
                      animation: "rotate-ring 12s linear infinite",
                    }} />
                    <div style={{
                      position: "absolute", inset: "-35px", borderRadius: "50%",
                      border: `1px dashed ${result.cor}22`,
                      animation: "rotate-ring-reverse 20s linear infinite",
                    }} />
                    {/* Ponto orbital */}
                    <div style={{
                      position: "absolute", top: "-24px", left: "50%", transform: "translateX(-50%)",
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: result.cor,
                      boxShadow: `0 0 10px ${result.cor}`,
                    }} />
                    <span style={{ fontSize: "52px", filter: `drop-shadow(0 0 12px ${result.cor}99)` }}>{result.sym}</span>
                  </motion.div>
                </div>

                <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,168,76,0.45)", marginBottom: "12px" }}>A sua Lua está em</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(44px,8vw,72px)", fontWeight: 300, lineHeight: 1.05, marginBottom: "32px" }}>
                  <span className="text-shimmer">{result.nome}</span>
                </h2>

                {/* Descrição */}
                <div style={{ padding: "40px", background: "rgba(13,13,24,0.85)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "32px", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "50px", height: "1px", background: `linear-gradient(90deg,transparent,${result.cor},transparent)` }} />
                  <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(17px,2.2vw,21px)", fontWeight: 300, fontStyle: "italic", color: "#f0ebe2", lineHeight: 1.75, marginBottom: "28px" }}>
                    {result.desc}
                  </p>
                  <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,235,226,0.3)", marginBottom: "16px" }}>Os seus dons lunares</p>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
                    {result.dons.map(d => (
                      <span key={d} style={{ fontFamily: "'Inter'", fontSize: "11px", fontWeight: 300, color: result.cor, border: `1px solid ${result.cor}44`, padding: "6px 14px", letterSpacing: "0.05em" }}>{d}</span>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,235,226,0.25)", marginBottom: "8px" }}>Desafio para esta lua</p>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", fontStyle: "italic", color: "rgba(240,235,226,0.5)", lineHeight: 1.6 }}>{result.desafio}</p>
                  </div>
                </div>

                {/* CTA Mapa Astral */}
                <div style={{ padding: "40px 36px", background: "linear-gradient(135deg,rgba(201,168,76,0.05),rgba(90,40,160,0.05))", border: "1px solid rgba(201,168,76,0.15)", marginBottom: "24px" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,3vw,28px)", fontWeight: 300, color: "#f0ebe2", marginBottom: "12px", lineHeight: 1.3 }}>
                    Este é apenas o seu arquétipo lunar.
                  </p>
                  <p style={{ fontFamily: "'Inter'", fontSize: "13px", fontWeight: 300, color: "rgba(240,235,226,0.4)", lineHeight: 1.8, marginBottom: "28px" }}>
                    O seu Mapa Astral completo revela a posição exacta da sua Lua, os aspectos que a moldam e como ela interage com o seu Sol, Ascendente e todos os planetas.
                  </p>
                  <Link href="/mapa-astral" className="btn-primary" style={{ display: "inline-flex" }}>
                    ☽ &ensp; Obter o Mapa Astral Completo — €29
                  </Link>
                </div>

                <button onClick={() => { setStep("intro"); setElScores({ fogo:0, terra:0, ar:0, agua:0 }); setModScores({ cardinal:0, fixo:0, mutavel:0 }); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter'", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,235,226,0.2)", textDecoration: "underline" }}>
                  Repetir o quiz
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
