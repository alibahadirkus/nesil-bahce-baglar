import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, UserPlus, TreePine, Droplets, Sprout, Camera, Loader2, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { processStepsAPI, studentsAPI, volunteersAPI } from '@/lib/api';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const Process = () => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [isVolunteerFormOpen, setIsVolunteerFormOpen] = useState(false);
  
  // Öğrenci form state
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    student_number: '',
    class_name: '',
    school_name: '',
    phone: '',
    email: '',
    notes: '',
  });
  
  // Gönüllü form state
  const [volunteerForm, setVolunteerForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  
  // Statik step tanımları
  const staticSteps = [
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

  // Veritabanından process steps'i getir
  const { data: dbSteps = [], isLoading } = useQuery({
    queryKey: ['process-steps'],
    queryFn: () => processStepsAPI.getAll(),
  });

  // Seçili step'in resimlerini getir
  const { data: stepImages = [], isLoading: isLoadingImages } = useQuery({
    queryKey: ['process-step-images', selectedStep],
    queryFn: () => processStepsAPI.getByStepNumber(selectedStep!),
    enabled: !!selectedStep && selectedStep >= 1 && selectedStep <= 6,
  });

  // Step'leri birleştir - veritabanındaki bilgilerle statik bilgileri birleştir
  const steps = staticSteps.map((staticStep) => {
    const dbStep = dbSteps.find((s: any) => s.step_number === staticStep.step);
    
    // Resim var mı kontrol et
    let hasImages = false;
    if (dbStep?.image_ids) {
      try {
        const imageIds = JSON.parse(dbStep.image_ids);
        hasImages = Array.isArray(imageIds) && imageIds.length > 0;
      } catch (e) {
        hasImages = false;
      }
    }

    return {
      ...staticStep,
      title: dbStep?.title || staticStep.title,
      description: dbStep?.description || staticStep.description,
      hasImages,
    };
  });

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              // Step 1 (Öğrenci Kaydı) ve Step 3 (Gönüllü Katılımcı) için form aç
              // Diğer step'ler için resim varsa galeri aç
              const isFormStep = step.step === 1 || step.step === 3;
              const isClickable = isFormStep || step.hasImages;
              
              const handleClick = () => {
                if (step.step === 1) {
                  setIsStudentFormOpen(true);
                } else if (step.step === 3) {
                  setIsVolunteerFormOpen(true);
                } else if (step.hasImages) {
                  setSelectedStep(step.step);
                  setIsGalleryOpen(true);
                }
              };
              
              return (
                <Card 
                  key={step.step} 
                  className={`border-2 border-border hover:border-primary transition-all shadow-soft hover:shadow-strong ${
                    isClickable ? 'cursor-pointer' : ''
                  }`}
                  onClick={isClickable ? handleClick : undefined}
                >
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
        )}

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

      {/* Process Step Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedStep && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {steps.find(s => s.step === selectedStep)?.title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGalleryOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {isLoadingImages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stepImages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Bu adım için henüz fotoğraf eklenmemiş
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stepImages.map((item: any, index: number) => (
                    <div
                      key={item.id || index}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(item)}
                    >
                      <div className="aspect-square relative overflow-hidden rounded-lg border">
                        <img
                          src={item.url}
                          alt={item.title || item.original_name || `Fotoğraf ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      {(item.title || item.description) && (
                        <div className="mt-2">
                          {item.title && (
                            <p className="text-sm font-medium truncate">{item.title}</p>
                          )}
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Image View Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.title || selectedImage.original_name || 'Fotoğraf'}
                className="w-full h-auto rounded-lg"
              />
              {(selectedImage.title || selectedImage.description) && (
                <div className="space-y-2">
                  {selectedImage.title && (
                    <h3 className="text-xl font-semibold">{selectedImage.title}</h3>
                  )}
                  {selectedImage.description && (
                    <p className="text-muted-foreground">{selectedImage.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Öğrenci Kayıt Formu */}
      <Dialog open={isStudentFormOpen} onOpenChange={setIsStudentFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Öğrenci Kayıt Formu</DialogTitle>
            <DialogDescription>
              Projeye katılmak için formu doldurun. Size yakında bir gönüllü eşleştirilecektir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await studentsAPI.registerPublic(studentForm);
              toast({
                title: 'Başarılı',
                description: 'Kaydınız başarıyla oluşturuldu. Size yakında dönüş yapacağız.',
              });
              setIsStudentFormOpen(false);
              setStudentForm({
                first_name: '',
                last_name: '',
                student_number: '',
                class_name: '',
                school_name: '',
                phone: '',
                email: '',
                notes: '',
              });
            } catch (error: any) {
              toast({
                title: 'Hata',
                description: error.message || 'Kayıt sırasında bir hata oluştu',
                variant: 'destructive',
              });
            }
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_first_name">Ad *</Label>
                <Input
                  id="student_first_name"
                  value={studentForm.first_name}
                  onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_last_name">Soyad *</Label>
                <Input
                  id="student_last_name"
                  value={studentForm.last_name}
                  onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_number">Öğrenci Numarası</Label>
                <Input
                  id="student_number"
                  value={studentForm.student_number}
                  onChange={(e) => setStudentForm({ ...studentForm, student_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_name">Sınıf</Label>
                <Input
                  id="class_name"
                  value={studentForm.class_name}
                  onChange={(e) => setStudentForm({ ...studentForm, class_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_name">Okul Adı</Label>
              <Input
                id="school_name"
                value={studentForm.school_name}
                onChange={(e) => setStudentForm({ ...studentForm, school_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_phone">Telefon</Label>
                <Input
                  id="student_phone"
                  type="tel"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_email">E-posta</Label>
                <Input
                  id="student_email"
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_notes">Notlar</Label>
              <Textarea
                id="student_notes"
                value={studentForm.notes}
                onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStudentFormOpen(false)}>
                İptal
              </Button>
              <Button type="submit">Kayıt Ol</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Gönüllü Kayıt Formu */}
      <Dialog open={isVolunteerFormOpen} onOpenChange={setIsVolunteerFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gönüllü Kayıt Formu</DialogTitle>
            <DialogDescription>
              Projeye gönüllü olarak katılmak için formu doldurun. Size yakında bir öğrenci eşleştirilecektir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await volunteersAPI.registerPublic(volunteerForm);
              toast({
                title: 'Başarılı',
                description: 'Kaydınız başarıyla oluşturuldu. Size yakında dönüş yapacağız.',
              });
              setIsVolunteerFormOpen(false);
              setVolunteerForm({
                first_name: '',
                last_name: '',
                phone: '',
                email: '',
                address: '',
                notes: '',
              });
            } catch (error: any) {
              toast({
                title: 'Hata',
                description: error.message || 'Kayıt sırasında bir hata oluştu',
                variant: 'destructive',
              });
            }
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volunteer_first_name">Ad *</Label>
                <Input
                  id="volunteer_first_name"
                  value={volunteerForm.first_name}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteer_last_name">Soyad *</Label>
                <Input
                  id="volunteer_last_name"
                  value={volunteerForm.last_name}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="volunteer_phone">Telefon *</Label>
              <Input
                id="volunteer_phone"
                type="tel"
                value={volunteerForm.phone}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volunteer_email">E-posta</Label>
              <Input
                id="volunteer_email"
                type="email"
                value={volunteerForm.email}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volunteer_address">Adres</Label>
              <Textarea
                id="volunteer_address"
                value={volunteerForm.address}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volunteer_notes">Notlar</Label>
              <Textarea
                id="volunteer_notes"
                value={volunteerForm.notes}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, notes: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsVolunteerFormOpen(false)}>
                İptal
              </Button>
              <Button type="submit">Kayıt Ol</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Process;