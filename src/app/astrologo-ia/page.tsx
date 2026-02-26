"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AstrologoIA() {
  const [msgs, setMsgs] = useState([
    { from:"caela", text:"Olá. Sou Caela. Em que aspecto da sua vida posso trazer clareza hoje?" }
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { from:"user", text: input }, { from:"caela", text:"Estou a analisar as posições planetárias actuais em relação à sua pergunta. Este é um momento de grande relevância para o que partilhou..." }]);
    setInput("");
  };

  return (
    <main style={{ paddingTop:"72px", height:"100vh", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"32px 24px 24px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"#08080f" }}>
        <div style={{ maxWidth:"720px", margin:"0 auto" }}>
          <p style={{ fontFamily:"'Inter'", fontSize:"10px", letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:"6px" }}>Assistente IA</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"32px", fontWeight:300, color:"#f0ebe2" }}>Caela</h1>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"32px 24px" }}>
        <div style={{ maxWidth:"720px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"24px" }}>
          {msgs.map((m, i) => (
            <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
              style={{ display:"flex", justifyContent: m.from==="user" ? "flex-end" : "flex-start" }}
            >
              <div style={{
                maxWidth:"520px",
                padding: m.from==="user" ? "14px 20px" : "20px 24px",
                background: m.from==="user" ? "rgba(201,168,76,0.08)" : "#13131f",
                border: m.from==="user" ? "1px solid rgba(201,168,76,0.15)" : "1px solid rgba(255,255,255,0.05)",
                fontFamily:"'Inter'",
                fontSize:"14px",
                fontWeight:300,
                color: m.from==="user" ? "#f0ebe2" : "rgba(240,235,226,0.7)",
                lineHeight:1.8,
              }}>
                {m.from === "caela" && (
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", letterSpacing:"0.15em", color:"#c9a84c", marginBottom:"8px" }}>Caela</p>
                )}
                {m.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 24px 32px", borderTop:"1px solid rgba(255,255,255,0.05)", background:"#08080f" }}>
        <div style={{ maxWidth:"720px", margin:"0 auto", display:"flex", gap:"0" }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && send()}
            placeholder="Escreva a sua pergunta a Caela..."
            style={{ flex:1, background:"#0d0d18", border:"1px solid rgba(255,255,255,0.07)", borderRight:"none", padding:"16px 20px", fontFamily:"'Inter'", fontSize:"13px", fontWeight:300, color:"#f0ebe2", outline:"none" }}
          />
          <button onClick={send} className="btn-primary" style={{ padding:"16px 28px", fontSize:"10px", whiteSpace:"nowrap" }}>
            Enviar
          </button>
        </div>
      </div>
    </main>
  );
}