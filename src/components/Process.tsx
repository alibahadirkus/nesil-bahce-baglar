import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, UserPlus, TreePine, Droplets, Sprout, Camera } from 'lucide-react';

const Process = () => {
  const steps = [
    {
      step: 1,
      icon: GraduationCap,
      title: 'Öğrenci Kaydı',
      description: 'Lise öğrencileri projeye kaydolur ve kendilerine bir gönüllü eşleştirilir'
    },
    {
      step: 2,
      icon: UserPlus,
      title: 'Gönüllü Eşleştirme',
      description: 'Her öğrenci bir gönüllü ile eşleştirilir ve birlikte çalışmaya başlarlar'
    },
    {
      step: 3,
      icon: TreePine,
      title: 'Gönüllü Katılımcı',
      description: 'Öğrenci ve gönüllü birlikte okul bahçesinde ağacı dikerler'
    },
    {
      step: 4,
      icon: Droplets,
      title: 'Bakım ve Sulama',
      description: 'Ağacın düzenli bakımı ve sulaması yapılır, her adımda gönüllüye bilgi SMS\'i gönderilir'
    },
    {
      step: 5,
      icon: Sprout,
      title: 'Büyüme Takibi',
      description: 'Ağacın büyüme süreci takip edilir ve gelişim güncellemeleri gönüllüye iletilir'
    },
    {
      step: 6,
      icon: Camera,
      title: 'Fotoğraf ve Dokümantasyon',
      description: 'Ağacın gelişimini gösteren fotoğraflar çekilir ve gönüllüyle paylaşılır'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Proje Süreci
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Öğrenciler ve gönüllüler birlikte ağaç dikiyor, büyütüyor ve geleceği şekillendiriyor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.step} className="border-2 border-border hover:border-primary transition-all shadow-soft hover:shadow-strong">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 inline-flex p-2 bg-gradient-primary rounded-lg">
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-12 border-2 border-primary/20 bg-card shadow-strong">
          <CardContent className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold mb-4">SMS Bildirim Sistemi</h3>
              <p className="text-lg leading-relaxed text-card-foreground">
                Proje boyunca gönüllüler otomatik olarak bilgilendirilir. Ağaç dikildiğinde, 
                sulandığında, gübrelendiğinde ve büyüme güncellemeleri olduğunda gönüllülere 
                anında SMS mesajı gönderilir. Bu sayede gönüllüler ağaçlarının gelişimini 
                yakından takip edebilirler.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Process;