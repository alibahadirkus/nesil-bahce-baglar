import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-garden.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <Leaf className="h-5 w-5 text-primary-foreground" />
            <span className="text-primary-foreground text-sm font-medium">8 Haftalık Hortikürel Terapi Programı</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          Nesilden Nesile
          <br />
          <span className="text-primary-glow">Yeşil Geleceğe</span>
        </h1>

        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Yaşlı bireyler ve genç gönüllülerin bir araya geldiği, doğa ile bağ kuran, 
          psikolojik iyi oluşu artıran yenilikçi bir proje
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="hero" size="lg" className="group">
            Projeye Katıl
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            Daha Fazla Bilgi
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
