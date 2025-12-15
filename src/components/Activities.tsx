import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreeDeciduous, Apple, Flower2, BookOpen, Sprout, FlaskConical, Leaf, Camera } from "lucide-react";

const Activities = () => {
  const activities = [
    {
      week: 1,
      icon: Flower2,
      title: "Tanışma Toplantısı ve Proje Bilgilendirmesi",
      description: "Bahçecilik temel bilgileri, araç-gereç tanıtımı ve güvenli çalışma prensipleri"
    },
    {
      week: 2,
      icon: FlaskConical,
      title: "Bahçe Terapisi Faaliyetleri",
      description: "Bahçe terapisi faaliyetleri, duyu deneyimleri ve rahatlama çalışmaları"
    },
    {
      week: 3,
      icon: Sprout,
      title: "Doğada Fidan Dikimi",
      description: "Tohum ekimi teknikleri, fide yetiştirme ve bitki çoğaltma yöntemleri"
    },
    {
      week: 4,
      icon: TreeDeciduous,
      title: "Botanik Bahçe ve Kuş Cenneti Gezisi",
      description: "Botanik bahçe keşfi, zengin bitki koleksiyonları ve kuş cenneti gözlemleriyle doğa deneyimi"
    },
    {
      week: 5,
      icon: Apple,
      title: "Ağaç Terapisi",
      description: "Bahçeden hasat yapma, organik ürünlerin faydaları ve sağlıklı beslenme"
    },
    {
      week: 6,
      icon: BookOpen,
      title: "Herbaryum Hazırlama",
      description: "Bitki örnekleri toplama, kurutma ve herbaryum oluşturma teknikleri"
    },
    {
      week: 7,
      icon: Leaf,
      title: "Doğada Bir Gün",
      description: "Meyve ve sebze toplama"
    },
    {
      week: 8,
      icon: Camera,
      title: "Ata Tohum Devir Teslim",
      description: "Deneyimlerin paylaşılması, fotoğraf sergisi ve sertifika töreni"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            8 Haftalık Faaliyetler
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