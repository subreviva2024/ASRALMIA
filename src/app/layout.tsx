import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "ASTRALMIA — Astrologia & Arte Esotérica",
  description: "Mapas astrais gerados por IA, leitura de Tarot e artefactos esotéricos seleccionados. Uma experiência premium guiada por Caela.",
  keywords: ["astrologia", "mapa astral", "tarot", "loja esotérica", "inteligência artificial"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body>
        <CartProvider>
          <Navbar />
          {children}
          <footer className="border-t border-white/5 mt-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="font-display text-2xl font-light tracking-[0.2em] text-gold mb-4">ASTRALMIA</p>
              <p className="text-muted text-xs leading-relaxed max-w-xs">
                Onde a sabedoria milenar dos astros encontra a precisão da inteligência artificial.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold mb-5">Explorar</p>
              <ul className="space-y-3">
                {["Blog", "Loja", "Mapa Astral", "Astrólogo IA", "Tarot", "Quem é Caela"].map(item => (
                  <li key={item}>
                    <a href={`/${item.toLowerCase().replace(/ /g, "-").replace("é", "e").replace("ó", "o")}`}
                      className="text-muted text-xs tracking-wide hover:text-cream transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold mb-5">Newsletter</p>
              <p className="text-muted text-xs mb-4">Receba previsões e lançamentos exclusivos.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="O seu email"
                  className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-xs text-cream placeholder:text-muted focus:outline-none focus:border-gold/40 transition-colors"
                />
                <button className="btn-primary px-6 py-3 text-xs whitespace-nowrap">
                  Subscrever
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 py-6 text-center text-muted" style={{fontSize: '11px', letterSpacing: '0.1em'}}>
            © {new Date().getFullYear()} ASTRALMIA. Todos os direitos reservados.
          </div>
        </footer>
        </CartProvider>
      </body>
    </html>
  );
}
