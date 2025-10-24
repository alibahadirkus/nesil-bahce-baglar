import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreeDeciduous, Apple, Flower2, BookOpen, Sprout, FlaskConical, Leaf, Camera } from "lucide-react";

const Activities = () => {
  const activities = [
    {
      week: 1,
      icon: Flower2,
      title: "Bahçe Faaliyetlerine Giriş",
      description: "Bahçecilik temel bilgileri, araç-gereç tanıtımı ve güvenli çalışma prensipleri"
    },
    {
      week: 2,
      icon: FlaskConical,
      title: "Toprak ve İklim Bilgilendirme",
      description: "Toprak yapısı, iklim özellikleri ve bitki-toprak ilişkisi hakkında interaktif eğitim"
    },
    {
      week: 3,
      icon: Sprout,
      title: "Tohum Ekimi ve Çoğaltma",
      description: "Tohum ekimi teknikleri, fide yetiştirme ve bitki çoğaltma yöntemleri"
    },
    {
      week: 4,
      icon: TreeDeciduous,
      title: "Ağaç Dikimi Etkinliği",
      description: "Pratik ağaç dikimi uygulaması, fidan bakımı ve ağaçların çevresel önemi"
    },
    {
      week: 5,
      icon: Apple,
      title: "Meyve ve Sebze Toplama",
      description: "Bahçeden hasat yapma, organik ürünlerin faydaları ve sağlıklı beslenme"
    },
    {
      week: 6,
      icon: Leaf,
      title: "Botanik Bahçe Gezisi",
      description: "Zengin bitki koleksiyonlarını keşfetme, bitki türleri hakkında bilgi edinme"
    },
    {
      week: 7,
      icon: BookOpen,
      title: "Herbaryum Hazırlama",
      description: "Bitki örnekleri toplama, kurutma ve herbaryum oluşturma teknikleri"
    },
    {
      week: 8,
      icon: Camera,
      title: "Proje Değerlendirme ve Kutlama",
      description: "Deneyimlerin paylaşılması, fotoğraf sergisi ve sertifika töreni"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            8 Haftalık Program
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Detaylı planlanmış hortikürel terapi etkinlikleri ile dolu, zenginleştirilmiş bir öğrenme yolculuğu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <Card key={activity.week} className="group hover:border-primary transition-all shadow-soft hover:shadow-strong">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                      Hafta {activity.week}
                    </Badge>
                    <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{activity.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Activities;
