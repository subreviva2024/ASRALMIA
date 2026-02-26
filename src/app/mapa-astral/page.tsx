"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const Field = ({ label, type="text", placeholder }: { label:string, type?:string, placeholder:string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <label style={{ fontFamily:"'Inter'", fontSize:"9px", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(240,235,226,0.4)" }}>{label}</label>
    <input type={type} placeholder={placeholder} style={{ background:"transparent", border:"none", borderBottom:"1px solid rgba(255,255,255,0.1)", padding:"12px 0", fontFamily:"'Inter'", fontSize:"14px", fontWeight:300, color:"#f0ebe2", outline:"none", transition:"border-color 0.3s ease" }}
      onFocus={e=>(e.target.style.borderBottomColor="rgba(201,168,76,0.5)")}
      onBlur={e=>(e.target.style.borderBottomColor="rgba(255,255,255,0.1)")}
    />
  </div>
);

export default function MapaAstralPage() {
  const [step, setStep] = useState(0);

  return (
    <main style={{ paddingTop: "72px" }}>
      <section style={{ padding: "80px 24px 120px", maxWidth: "720px", margin: "0 auto" }}>
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.8 }}>
          <p style={{ fontFamily:"'Inter'", fontSize:"10px", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"16px" }}>Astrologia IA</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(44px,7vw,72px)", fontWeight:300, color:"#f0ebe2", lineHeight:1.1, marginBottom:"16px" }}>
            O seu Mapa Astral
          </h1>
          <p style={{ fontFamily:"'Inter'", fontSize:"14px", fontWeight:300, color:"rgba(240,235,226,0.45)", lineHeight:1.8, marginBottom:"64px" }}>
            Insira os seus dados de nascimento. Caela irá gerar uma análise profunda e personalizada dos seus planetas, casas e aspectos.
          </p>

          <div style={{ background:"#0d0d18", border:"1px solid rgba(255,255,255,0.06)", padding:"48px" }}>
            {step === 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"36px" }}>
                <Field label="Nome completo" placeholder="O seu nome" />
                <Field label="Data de nascimento" type="date" placeholder="" />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" }}>
                  <Field label="Hora de nascimento" type="time" placeholder="" />
                  <Field label="Local de nascimento" placeholder="Lisboa, Portugal" />
                </div>
                <div style={{ paddingTop:"24px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
                    <p style={{ fontFamily:"'Inter'", fontSize:"13px", fontWeight:300, color:"rgba(240,235,226,0.4)" }}>Mapa Astral Completo</p>
                    <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"24px", fontWeight:300, color:"#c9a84c" }}>€ 29,00</p>
                  </div>
                  <button className="btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={()=>setStep(1)}>
                    Gerar Mapa Astral
                  </button>
                </div>
              </div>
            )}
            {step === 1 && (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ width:"60px", height:"60px", borderRadius:"50%", border:"1px solid rgba(201,168,76,0.3)", margin:"0 auto 24px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"24px", color:"rgba(201,168,76,0.5)" }}>✦</p>
                </div>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"28px", fontWeight:300, color:"#f0ebe2", marginBottom:"12px" }}>Mapa em processamento</p>
                <p style={{ fontFamily:"'Inter'", fontSize:"13px", fontWeight:300, color:"rgba(240,235,226,0.4)", lineHeight:1.8 }}>
                  Caela está a calcular os seus posicionamentos planetários.<br />O seu mapa estará pronto em instantes.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}