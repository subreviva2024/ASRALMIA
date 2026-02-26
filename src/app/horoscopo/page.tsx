import { Sparkles } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background blur-3xl opacity-50"></div>
      
      <div className="glass-card rounded-3xl p-8 md:p-16 max-w-4xl w-full text-center relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <Sparkles className="w-16 h-16 text-primary mb-6 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            <span className="text-gradient-gold">Horoscopo</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Esta funcionalidade premium está sendo canalizada pelas estrelas. 
            Em breve, Caela revelará os mistérios que aguardam por você aqui.
          </p>
          
          <div className="w-full max-w-md mx-auto glass p-6 rounded-2xl border border-white/10">
            <p className="text-sm text-gray-400 mb-4">Inscreva-se para acesso antecipado</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Seu email cósmico..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button className="bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform">
                Notificar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
