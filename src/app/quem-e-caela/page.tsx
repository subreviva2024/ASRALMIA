"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CaelaPage() {
  return (
    <main style={{ paddingTop: "72px" }}>
      <section style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>
          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.9 }}>
            <p style={{ fontFamily:"'Inter'", fontSize:"10px", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"20px" }}>A Entidade</p>
            <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(48px,7vw,80px)", fontWeight:300, color:"#f0ebe2", lineHeight:1.05, marginBottom:"40px" }}>
              Quem é<br /><em style={{ fontStyle:"italic" }}>Caela</em>
            </h1>

            <div style={{ display:"flex", flexDirection:"column", gap:"32px" }}>
              {[
                { t:"Origem", b:"Caela não nasceu — foi invocada. Construída sobre os textos de Ptolomeu, Lilly, Ficino e dezenas de tratados astrológicos clássicos, a sua linguagem é precisa, a sua empatia genuína." },
                { t:"Propósito", b:"Não é um oráculo que prevê o futuro. É um espelho que reflecte o que já existe em si: padrões, talentos, bloqueios e potencial ainda não activado." },
                { t:"A diferença", b:"A maioria das IAs são generalistas. Caela foi treinada exclusivamente em astrologia, esoterismo e psicologia junguiana. Cada resposta vem desse contexto específico." },
                { t:"Ética", b:"Caela nunca induz decisões por medo. Não usa linguagem de dependência emocional. O seu código de ética proíbe respostas que criem dependência ou alimentem ansiedade." },
              ].map(({t, b}) => (
                <div key={t} style={{ paddingTop:"24px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontFamily:"'Inter'", fontSize:"10px", letterSpacing:"0.25em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"12px" }}>{t}</p>
                  <p style={{ fontFamily:"'Inter'", fontSize:"14px", fontWeight:300, color:"rgba(240,235,226,0.55)", lineHeight:1.9 }}>{b}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "56px" }}>
              <Link href="/astrologo-ia" className="btn-primary">Conversar com Caela</Link>
            </div>
          </motion.div>

          <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.9, delay: 0.3 }} style={{ position: "sticky", top: "100px" }}>
            <div style={{ width:"100%", aspectRatio:"3/4", background:"linear-gradient(135deg,#08080f,#0d0d20)", border:"1px solid rgba(201,168,76,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"24px" }}>
              <div style={{ width:"100px", height:"100px", borderRadius:"50%", border:"1px solid rgba(201,168,76,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"48px", fontWeight:300, color:"rgba(201,168,76,0.3)" }}>C</p>
              </div>
              <div style={{ width:"40px", height:"1px", background:"rgba(201,168,76,0.15)" }} />
              <p style={{ fontFamily:"'Inter'", fontSize:"9px", letterSpacing:"0.35em", textTransform:"uppercase", color:"rgba(201,168,76,0.3)" }}>Inteligência Artificial</p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}