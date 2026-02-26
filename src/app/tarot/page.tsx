"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cards = [
  { name:"O Mago", num:"I", desc:"Manifestação. Habilidade. Vontade.", color:"#2d1a00" },
  { name:"A Sacerdotisa", num:"II", desc:"Intuição. Silêncio. Conhecimento interior.", color:"#0a0a1f" },
  { name:"A Imperatriz", num:"III", desc:"Abundância. Natureza. Fertilidade.", color:"#0a1a0a" },
  { name:"O Imperador", num:"IV", desc:"Estrutura. Autoridade. Fundação.", color:"#1a0a00" },
  { name:"O Hierofante", num:"V", desc:"Tradição. Guia. Sabedoria espiritual.", color:"#150a1a" },
  { name:"Os Enamorados", num:"VI", desc:"União. Escolha. Alinhamento.", color:"#1a0a0a" },
  { name:"O Carro", num:"VII", desc:"Determinação. Controlo. Vitória.", color:"#050a1a" },
  { name:"A Força", num:"VIII", desc:"Coragem. Paciência. Compaixão.", color:"#1a0d05" },
  { name:"O Eremita", num:"IX", desc:"Introspecção. Procura. Guia interior.", color:"#0f0f0f" },
  { name:"A Roda da Fortuna", num:"X", desc:"Ciclos. Destino. Turning point.", color:"#0a0f0a" },
];

export default function TarotPage() {
  const [drawn, setDrawn] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  const drawCards = () => {
    const shuffled = [...Array(10).keys()].sort(() => Math.random() - 0.5);
    setDrawn(shuffled.slice(0, 3));
    setRevealed(false);
    setTimeout(() => setRevealed(true), 400);
  };

  return (
    <main style={{ paddingTop:"72px" }}>
      <section style={{ padding:"80px 24px 60px", maxWidth:"1280px", margin:"0 auto", textAlign:"center" }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8 }}>
          <p style={{ fontFamily:"'Inter'", fontSize:"10px", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"16px" }}>Adivinhação</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(44px,7vw,72px)", fontWeight:300, color:"#f0ebe2", lineHeight:1.1, marginBottom:"20px" }}>Leitura de Tarot</h1>
          <p style={{ fontFamily:"'Inter'", fontSize:"14px", fontWeight:300, color:"rgba(240,235,226,0.45)", lineHeight:1.8, marginBottom:"48px", maxWidth:"480px", margin:"0 auto 48px" }}>
            Concentre-se numa questão. Quando estiver preparado, puxe as suas três cartas.
          </p>
          <button className="btn-primary" onClick={drawCards} style={{ margin:"0 auto" }}>
            {drawn.length === 0 ? "Puxar Cartas" : "Nova Tiragem"}
          </button>
        </motion.div>
      </section>

      <section style={{ padding:"40px 24px 120px", maxWidth:"1280px", margin:"0 auto" }}>
        <div style={{ display:"flex", gap:"24px", justifyContent:"center", flexWrap:"wrap" }}>
          <AnimatePresence>
            {drawn.map((ci, pos) => {
              const card = cards[ci];
              const positions = ["Passado", "Presente", "Futuro"];
              return (
                <motion.div key={`${ci}-${pos}`}
                  initial={{ opacity:0, y:40, rotateY:90 }}
                  animate={revealed ? { opacity:1, y:0, rotateY:0 } : { opacity:0 }}
                  transition={{ duration:0.7, delay: pos * 0.2 }}
                  style={{ width:"240px" }}
                >
                  <div className="product-card" style={{ cursor:"default" }}>
                    <div style={{ width:"100%", paddingBottom:"160%", background:card.color, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ position:"absolute", inset:"20px", border:"1px solid rgba(201,168,76,0.1)" }} />
                      <div style={{ position:"absolute", inset:"0", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px" }}>
                        <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", letterSpacing:"0.3em", color:"rgba(201,168,76,0.4)" }}>{card.num}</p>
                        <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"22px", fontWeight:400, color:"rgba(240,235,226,0.7)", textAlign:"center", padding:"0 16px", lineHeight:1.2 }}>{card.name}</p>
                      </div>
                      <div style={{ position:"absolute", top:"10px", left:"50%", transform:"translateX(-50%)", fontFamily:"'Inter'", fontSize:"8px", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(201,168,76,0.4)" }}>
                        {positions[pos]}
                      </div>
                    </div>
                    <div style={{ padding:"20px", background:"#13131f" }}>
                      <p style={{ fontFamily:"'Inter'", fontSize:"11px", fontWeight:300, color:"rgba(240,235,226,0.4)", lineHeight:1.6, textAlign:"center" }}>{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}