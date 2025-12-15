import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { activitiesAPI, uploadAPI } from '@/lib/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useState } from 'react';

const ActivityGallery = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Sadece resim içeren aktiviteleri getir (public endpoint)
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['gallery-activities'],
    queryFn: () => activitiesAPI.getGallery(),
  });

  // Tüm resimleri getir (sadece aktivitelerde kullanılan resimler için)
  const { data: allImages = [] } = useQuery({
    queryKey: ['images'],
    queryFn: () => uploadAPI.getAllImages(),
  });

  // Aktiviteler ve resimlerini birleştir - SADECE aktivitelerdeki resimleri göster
  const activitiesWithImages = activities
    .map((activity: any) => {
      if (!activity.image_ids) return null;
      try {
        const imageIds = JSON.parse(activity.image_ids);
        if (!Array.isArray(imageIds) || imageIds.length === 0) return null;
        
        // SADECE bu aktiviteye ait resim ID'lerine sahip resimleri filtrele
        const images = allImages.filter((img: any) => imageIds.includes(img.id));
        if (images.length === 0) return null;
        
        return { ...activity, images };
      } catch {
        return null;
      }
    })
    .filter((activity: any) => activity !== null && activity.images && activity.images.length > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allImagesList = activitiesWithImages.flatMap((activity: any) =>
    activity.images.map((img: any) => ({
      ...img,
      activityTitle: activity.title,
      activityDate: activity.activity_date,
      volunteerName: activity.volunteer_first_name
        ? `${activity.volunteer_first_name} ${activity.volunteer_last_name}`
        : 'Bilinmiyor',
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <ImageIcon className="h-8 w-8" />
              Aktivite Foto Galerisi
            </CardTitle>
            <CardDescription>
              Tüm aktivite fotoğrafları ({allImagesList.length} fotoğraf)
            </CardDescription>
          </CardHeader>
        </Card>

        {allImagesList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Henüz aktivite fotoğrafı yüklenmemiş
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImagesList.map((item: any, index: number) => (
              <Card
                key={`${item.id}-${index}`}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedImage(item)}
              >
                <div className="aspect-square relative">
                  <img
                    src={item.url}
                    alt={item.original_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{item.activityTitle}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.volunteerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.activityDate), 'dd MMM yyyy', { locale: tr })}
                  </p>
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
                  alt={selectedImage.original_name}
                  className="w-full rounded-lg"
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{selectedImage.activityTitle}</h3>
                  <p className="text-muted-foreground">
                    <strong>Gönüllü:</strong> {selectedImage.volunteerName}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Tarih:</strong>{' '}
                    {format(new Date(selectedImage.activityDate), 'dd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ActivityGallery;

