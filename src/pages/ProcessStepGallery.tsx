import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { processStepsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const stepTitles: Record<number, string> = {
  1: 'Öğrenci Kaydı',
  2: 'Gönüllü Eşleştirme',
  3: 'Ağaç Dikimi',
  4: 'Bakım ve Sulama',
  5: 'Büyüme Takibi',
  6: 'Fotoğraf ve Dokümantasyon',
};

const ProcessStepGallery = () => {
  const { stepNumber } = useParams<{ stepNumber: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const stepNum = stepNumber ? parseInt(stepNumber, 10) : 0;

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['process-step-images', stepNum],
    queryFn: () => processStepsAPI.getByStepNumber(stepNum),
    enabled: !!stepNum && stepNum >= 1 && stepNum <= 6,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stepTitle = stepTitles[stepNum] || 'Bilinmeyen Adım';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <ImageIcon className="h-8 w-8" />
                  {stepTitle}
                </CardTitle>
                <CardDescription>
                  {images.length} fotoğraf
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {images.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Bu adım için henüz fotoğraf eklenmemiş
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((item: any, index: number) => (
              <Card
                key={item.id || index}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedImage(item)}
              >
                <div className="aspect-square relative">
                  <img
                    src={item.url}
                    alt={item.title || item.original_name || `Fotoğraf ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  {item.title && (
                    <p className="text-sm font-medium truncate">{item.title}</p>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Resim Detay Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title || selectedImage.original_name}
                  className="w-full rounded-lg"
                />
                {(selectedImage.title || selectedImage.description) && (
                  <div className="space-y-2">
                    {selectedImage.title && (
                      <h3 className="text-xl font-bold">{selectedImage.title}</h3>
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
      </div>
    </div>
  );
};

export default ProcessStepGallery;
