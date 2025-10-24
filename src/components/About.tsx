import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Sprout, Brain } from "lucide-react";

const About = () => {
  const benefits = [
    {
      icon: Heart,
      title: "Psikolojik İyi Oluş",
      description: "Bahçe terapisi ile stres azaltma, ruh sağlığını güçlendirme ve yaşam kalitesini artırma"
    },
    {
      icon: Users,
      title: "Nesiller Arası Bağlantı",
      description: "Yaşlı bireyler ve genç gönüllüler arasında anlamlı ilişkiler kurma"
    },
    {
      icon: Sprout,
      title: "Çevre Bilinci",
      description: "Ağaç ve doğaya yönelik olumlu tutumlar geliştirme, sürdürülebilir yaşam"
    },
    {
      icon: Brain,
      title: "Dijital Beceriler",
      description: "Yaşlı bireylerin dijital okuryazarlık seviyelerini artırma"
    }
  ];

  return (
    <section className="py-20 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Proje Hakkında
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hortikürel terapi etkinlikleri ile yaşlı bireylerin yaşam kalitesini artıran, 
            nesiller arası köprüler kuran yenilikçi bir sosyal sorumluluk projesi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="border-2 border-border hover:border-primary transition-all shadow-soft hover:shadow-strong">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex p-3 bg-gradient-primary rounded-lg">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-2 border-primary/20 bg-card shadow-strong">
          <CardContent className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-card-foreground">
                Projemiz, 8 haftalık kapsamlı bir hortikürel terapi programı ile yaşlı bireylerin 
                doğa ile bağ kurmalarını, psikolojik iyi oluşlarını artırmalarını ve çevreye karşı 
                duyarlılıklarını geliştirmelerini hedeflemektedir.
              </p>
              <p className="text-lg leading-relaxed text-card-foreground mt-4">
                Program süresince lise öğrencisi gönüllüler, dijital bir uygulama aracılığıyla 
                yaşlı katılımcılarla iletişim kurarak, onların dijital becerilerinin gelişmesine 
                de katkı sağlayacaktır. Bu benzersiz kuşaklararası etkileşim, hem yaşlı bireylere 
                hem de genç gönüllülere değerli deneyimler sunmaktadır.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default About;
