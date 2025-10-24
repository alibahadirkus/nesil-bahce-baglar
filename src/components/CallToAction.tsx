import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-glow/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Projeye katılmak veya daha fazla bilgi almak için bize ulaşın. 
              Yeşil geleceği birlikte inşa edelim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 bg-primary-foreground rounded-full mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-2">E-posta</h3>
                <p className="text-primary-foreground/80 text-sm">info@yesilgelecek.org</p>
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 bg-primary-foreground rounded-full mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-2">Telefon</h3>
                <p className="text-primary-foreground/80 text-sm">+90 (555) 123 4567</p>
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm hover:bg-primary-foreground/20 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 bg-primary-foreground rounded-full mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-2">Adres</h3>
                <p className="text-primary-foreground/80 text-sm">İstanbul, Türkiye</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="hero" size="lg" className="text-lg">
              Gönüllü Ol
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
