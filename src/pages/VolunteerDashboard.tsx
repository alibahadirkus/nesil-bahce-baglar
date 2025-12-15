import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, Clock, MapPin, Activity, Image as ImageIcon } from 'lucide-react';
import { activitiesAPI, volunteersAPI, uploadAPI } from '@/lib/api';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const VolunteerDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const volunteerId = id ? parseInt(id, 10) : 0;
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Gönüllü bilgilerini getir
  const { data: volunteer, isLoading: isLoadingVolunteer } = useQuery({
    queryKey: ['volunteer', volunteerId],
    queryFn: () => volunteersAPI.getById(volunteerId),
    enabled: !!volunteerId,
  });

  // Aktiviteleri getir
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ['volunteer-activities', volunteerId],
    queryFn: () => activitiesAPI.getByVolunteerId(volunteerId),
    enabled: !!volunteerId,
  });

  // Tüm resimleri getir
  const { data: allImages = [] } = useQuery({
    queryKey: ['images'],
    queryFn: () => uploadAPI.getAllImages(),
  });

  if (isLoadingVolunteer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Gönüllü Bulunamadı</CardTitle>
            <CardDescription>
              Belirtilen ID ile gönüllü kaydı bulunamadı.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Aktiviteleri tarihe göre grupla ve resimlerini ekle
  const activitiesByDate: Record<string, any[]> = {};
  activities.forEach((activity: any) => {
    const dateKey = activity.activity_date;
    if (!activitiesByDate[dateKey]) {
      activitiesByDate[dateKey] = [];
    }
    
    // Resimleri ekle
    let activityImages: any[] = [];
    if (activity.image_ids) {
      try {
        const imageIds = JSON.parse(activity.image_ids);
        if (Array.isArray(imageIds) && imageIds.length > 0) {
          activityImages = allImages.filter((img: any) => imageIds.includes(img.id));
        }
      } catch (e) {
        console.error('Error parsing image_ids:', e);
      }
    }
    
    activitiesByDate[dateKey].push({ ...activity, images: activityImages });
  });

  // Takvim için tarihleri işaretle (aktivitesi olan günler)
  const datesWithActivities = Object.keys(activitiesByDate).map(
    (dateStr) => new Date(dateStr)
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              {volunteer.first_name} {volunteer.last_name}
            </CardTitle>
            <CardDescription className="text-lg">
              Gönüllü Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {volunteer.phone && (
                <div>
                  <strong>Telefon:</strong> {volunteer.phone}
                </div>
              )}
              {volunteer.email && (
                <div>
                  <strong>E-posta:</strong> {volunteer.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Takvim */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Aktivite Takvimi
                </CardTitle>
                <CardDescription>
                  Aktivitelerinizin olduğu günler işaretlidir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="multiple"
                  selected={datesWithActivities}
                  className="rounded-md border"
                  modifiers={{
                    hasActivity: datesWithActivities,
                  }}
                  modifiersStyles={{
                    hasActivity: {
                      backgroundColor: 'rgb(34, 197, 94)',
                      color: 'white',
                      fontWeight: 'bold',
                    },
                  }}
                />
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Aktivite var</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aktiviteler Listesi */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Aktivitelerim
                </CardTitle>
                <CardDescription>
                  Size atanan tüm aktiviteler
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivities ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Henüz size atanmış aktivite bulunmamaktadır.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(activitiesByDate)
                      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                      .map(([dateStr, dateActivities]) => (
                        <div key={dateStr} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-lg">
                              {format(new Date(dateStr), 'dd MMMM yyyy', { locale: tr })}
                            </h3>
                          </div>
                          <div className="space-y-3 ml-6">
                            {(dateActivities as any[]).map((activity: any) => (
                              <Card key={activity.id} className="bg-green-50">
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <CardTitle className="text-base">{activity.title}</CardTitle>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {activity.description}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                    {activity.activity_time && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {activity.activity_time}
                                      </div>
                                    )}
                                    {activity.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {activity.location}
                                      </div>
                                    )}
                                  </div>
                                  {activity.images && activity.images.length > 0 && (
                                    <div className="mt-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-medium">Fotoğraflar ({activity.images.length})</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2">
                                        {activity.images.map((img: any) => (
                                          <div
                                            key={img.id}
                                            className="aspect-square relative rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setSelectedImage(img)}
                                          >
                                            <img
                                              src={img.url}
                                              alt={img.original_name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Toplam Aktivite</CardDescription>
              <CardTitle className="text-3xl">{activities.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bu Ay</CardDescription>
              <CardTitle className="text-3xl">
                {
                  activities.filter((a: any) => {
                    const activityDate = new Date(a.activity_date);
                    return (
                      activityDate.getMonth() === currentMonth &&
                      activityDate.getFullYear() === currentYear
                    );
                  }).length
                }
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Yaklaşan Aktiviteler</CardDescription>
              <CardTitle className="text-3xl">
                {
                  activities.filter((a: any) => {
                    const activityDate = new Date(a.activity_date);
                    return activityDate >= today;
                  }).length
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VolunteerDashboard;

