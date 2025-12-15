import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Loader2, Calendar, Users, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { activitiesAPI, volunteersAPI, uploadAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

const Activities = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<number[]>([]);
  const [selectedVolunteerIdsSingle, setSelectedVolunteerIdsSingle] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    volunteer_id: '',
    title: '',
    description: '',
    activity_date: format(new Date(), 'yyyy-MM-dd'),
    activity_time: '',
    location: '',
  });

  const queryClient = useQueryClient();

  // Gönüllüleri getir
  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => volunteersAPI.getAll(),
  });

  // Aktiviteleri getir
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesAPI.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: activitiesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer-activities'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Başarılı',
        description: 'Aktivite başarıyla eklendi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Aktivite eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const createBulkMutation = useMutation({
    mutationFn: activitiesAPI.createBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer-activities'] });
      setIsBulkDialogOpen(false);
      setSelectedVolunteerIds([]);
      resetForm();
      toast({
        title: 'Başarılı',
        description: `${selectedVolunteerIds.length} gönüllüye aktivite eklendi.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Toplu aktivite eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      activitiesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer-activities'] });
      setIsDialogOpen(false);
      setEditingActivity(null);
      resetForm();
      toast({
        title: 'Başarılı',
        description: 'Aktivite güncellendi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Güncelleme sırasında bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: activitiesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer-activities'] });
      toast({
        title: 'Başarılı',
        description: 'Aktivite silindi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Silme sırasında bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      volunteer_id: '',
      title: '',
      description: '',
      activity_date: format(new Date(), 'yyyy-MM-dd'),
      activity_time: '',
      location: '',
    });
    setEditingActivity(null);
    setSelectedDate(new Date());
    setSelectedVolunteerIdsSingle([]);
    setSelectedImages([]);
  };

  const handleOpenDialog = (activity?: any) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        volunteer_id: activity.volunteer_id.toString(),
        title: activity.title,
        description: activity.description || '',
        activity_date: activity.activity_date,
        activity_time: activity.activity_time || '',
        location: activity.location || '',
      });
      setSelectedDate(new Date(activity.activity_date));
      setSelectedVolunteerIdsSingle([activity.volunteer_id]);
      
      // Resimleri yükle
      if (activity.image_ids) {
        try {
          const imageIds = JSON.parse(activity.image_ids);
          if (Array.isArray(imageIds) && imageIds.length > 0) {
            // Resim bilgilerini getir
            uploadAPI.getAllImages().then((allImages: any[]) => {
              const activityImages = allImages.filter((img: any) => imageIds.includes(img.id));
              setSelectedImages(activityImages);
            });
          }
        } catch (e) {
          console.error('Error parsing image_ids:', e);
        }
      }
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleOpenBulkDialog = () => {
    resetForm();
    setSelectedVolunteerIds([]);
    setSelectedImages([]);
    setIsBulkDialogOpen(true);
  };

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const fileArray = Array.from(files);
      const uploadedImages = await uploadAPI.uploadImages(fileArray);
      setSelectedImages((prev) => [...prev, ...uploadedImages.files]);
      toast({
        title: 'Başarılı',
        description: `${uploadedImages.files.length} resim yüklendi.`,
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Resim yüklenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (imageId: number) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imageIds = selectedImages.map((img) => img.id);
    const volunteerIds = selectedVolunteerIdsSingle.length > 0 
      ? selectedVolunteerIdsSingle 
      : (formData.volunteer_id ? [parseInt(formData.volunteer_id)] : []);
    
    if (volunteerIds.length === 0) {
      toast({
        title: 'Hata',
        description: 'Lütfen en az bir gönüllü seçin',
        variant: 'destructive',
      });
      return;
    }

    const submitData = {
      volunteer_ids: volunteerIds,
      title: formData.title,
      description: formData.description,
      activity_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : formData.activity_date,
      activity_time: formData.activity_time || undefined,
      location: formData.location || undefined,
      image_ids: imageIds.length > 0 ? imageIds : undefined,
    };

    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data: submitData });
    } else {
      createMutation.mutate(submitData as any);
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVolunteerIds.length === 0) {
      toast({
        title: 'Hata',
        description: 'Lütfen en az bir gönüllü seçin',
        variant: 'destructive',
      });
      return;
    }

    const imageIds = selectedImages.map((img) => img.id);

    const submitData = {
      volunteer_ids: selectedVolunteerIds,
      title: formData.title,
      description: formData.description,
      activity_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : formData.activity_date,
      activity_time: formData.activity_time || undefined,
      location: formData.location || undefined,
      image_ids: imageIds.length > 0 ? imageIds : undefined,
    };

    createBulkMutation.mutate(submitData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bu aktiviteyi silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleVolunteerSelection = (volunteerId: number) => {
    setSelectedVolunteerIds((prev) =>
      prev.includes(volunteerId)
        ? prev.filter((id) => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const selectAllVolunteers = () => {
    if (selectedVolunteerIds.length === volunteers.length) {
      setSelectedVolunteerIds([]);
    } else {
      setSelectedVolunteerIds(volunteers.map((v: any) => v.id));
    }
  };

  const getVolunteerName = (volunteerId: number) => {
    const volunteer = volunteers.find((v: any) => v.id === volunteerId);
    return volunteer ? `${volunteer.first_name} ${volunteer.last_name}` : 'Bilinmiyor';
  };

  const getVolunteerDashboardLink = (volunteerId: number) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/volunteer/${volunteerId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Aktivite Yönetimi</h2>
          <p className="text-muted-foreground">
            Gönüllülere aktivite ekleyin, düzenleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/gallery')} variant="outline">
            <ImageIcon className="mr-2 h-4 w-4" />
            Foto Galeri
          </Button>
          <Button onClick={handleOpenBulkDialog} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Toplu Ekle
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Aktivite
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Gönüllü</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Saat</TableHead>
                <TableHead>Konum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Henüz aktivite kaydı yok
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity: any) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.title}</TableCell>
                    <TableCell>
                      {activity.volunteer_first_name
                        ? `${activity.volunteer_first_name} ${activity.volunteer_last_name}`
                        : getVolunteerName(activity.volunteer_id)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(activity.activity_date), 'dd MMM yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>{activity.activity_time || '-'}</TableCell>
                    <TableCell>{activity.location || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = getVolunteerDashboardLink(activity.volunteer_id);
                            navigator.clipboard.writeText(link);
                            toast({
                              title: 'Link kopyalandı',
                              description: 'Gönüllü dashboard linki panoya kopyalandı',
                            });
                          }}
                          title="Dashboard linkini kopyala"
                        >
                          Link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Tek Aktivite Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Aktivite Düzenle' : 'Yeni Aktivite Ekle'}
            </DialogTitle>
            <DialogDescription>
              {editingActivity
                ? 'Aktivite bilgilerini güncelleyin'
                : 'Gönüllü için yeni aktivite ekleyin'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Gönüllüler *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedVolunteerIdsSingle.length === volunteers.length) {
                      setSelectedVolunteerIdsSingle([]);
                    } else {
                      setSelectedVolunteerIdsSingle(volunteers.map((v: any) => v.id));
                    }
                  }}
                  disabled={!!editingActivity}
                >
                  {selectedVolunteerIdsSingle.length === volunteers.length
                    ? 'Tümünü Kaldır'
                    : 'Tümünü Seç'}
                </Button>
              </div>
              <div className="border rounded-md p-4 max-h-40 overflow-y-auto space-y-2">
                {volunteers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Gönüllü bulunamadı</p>
                ) : (
                  volunteers.map((volunteer: any) => (
                    <div
                      key={volunteer.id}
                      className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                    >
                      <Checkbox
                        checked={selectedVolunteerIdsSingle.includes(volunteer.id)}
                        onCheckedChange={() => {
                          if (!editingActivity) {
                            setSelectedVolunteerIdsSingle((prev) =>
                              prev.includes(volunteer.id)
                                ? prev.filter((id) => id !== volunteer.id)
                                : [...prev, volunteer.id]
                            );
                          }
                        }}
                        disabled={!!editingActivity}
                      />
                      <Label className="flex-1 cursor-pointer">
                        {volunteer.first_name} {volunteer.last_name} ({volunteer.phone})
                      </Label>
                    </div>
                  ))
                )}
              </div>
              {selectedVolunteerIdsSingle.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedVolunteerIdsSingle.length} gönüllü seçildi
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tarih *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'dd MMMM yyyy', { locale: tr })
                      ) : (
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity_time">Saat</Label>
                <Input
                  id="activity_time"
                  type="time"
                  value={formData.activity_time}
                  onChange={(e) =>
                    setFormData({ ...formData, activity_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Konum</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Resimler</Label>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleImageUpload(e.target.files);
                      }
                    }}
                    disabled={uploadingImages}
                    className="flex-1"
                  />
                  {uploadingImages && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
                  )}
                </div>
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedImages.map((image: any) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.original_name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingActivity ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toplu Aktivite Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Toplu Aktivite Ekle</DialogTitle>
            <DialogDescription>
              Birden fazla gönüllüye aynı aktiviteyi ekleyin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Gönüllüler *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllVolunteers}
                >
                  {selectedVolunteerIds.length === volunteers.length
                    ? 'Tümünü Kaldır'
                    : 'Tümünü Seç'}
                </Button>
              </div>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                {volunteers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Gönüllü bulunamadı</p>
                ) : (
                  volunteers.map((volunteer: any) => (
                    <div
                      key={volunteer.id}
                      className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                    >
                      <Checkbox
                        checked={selectedVolunteerIds.includes(volunteer.id)}
                        onCheckedChange={() => toggleVolunteerSelection(volunteer.id)}
                      />
                      <Label className="flex-1 cursor-pointer">
                        {volunteer.first_name} {volunteer.last_name} ({volunteer.phone})
                      </Label>
                    </div>
                  ))
                )}
              </div>
              {selectedVolunteerIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedVolunteerIds.length} gönüllü seçildi
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk_title">Başlık *</Label>
              <Input
                id="bulk_title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk_description">Açıklama</Label>
              <Textarea
                id="bulk_description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tarih *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'dd MMMM yyyy', { locale: tr })
                      ) : (
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk_activity_time">Saat</Label>
                <Input
                  id="bulk_activity_time"
                  type="time"
                  value={formData.activity_time}
                  onChange={(e) =>
                    setFormData({ ...formData, activity_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk_location">Konum</Label>
              <Input
                id="bulk_location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Resimler</Label>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleImageUpload(e.target.files);
                      }
                    }}
                    disabled={uploadingImages}
                    className="flex-1"
                  />
                  {uploadingImages && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
                  )}
                </div>
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedImages.map((image: any) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.original_name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBulkDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createBulkMutation.isPending || selectedVolunteerIds.length === 0}
              >
                {createBulkMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Toplu Ekle ({selectedVolunteerIds.length})
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Activities;

