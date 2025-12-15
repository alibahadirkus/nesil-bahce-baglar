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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2, Upload, X } from 'lucide-react';
import { processStepsAPI, uploadAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const stepTitles: Record<number, string> = {
  1: 'Öğrenci Kaydı',
  2: 'Gönüllü Eşleştirme',
  3: 'Ağaç Dikimi',
  4: 'Bakım ve Sulama',
  5: 'Büyüme Takibi',
  6: 'Fotoğraf ve Dokümantasyon',
};

const ProcessSteps = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    display_order: 0,
  });

  const queryClient = useQueryClient();

  // Seçili step'in resimlerini getir
  const { data: stepImages = [], isLoading } = useQuery({
    queryKey: ['process-step-admin', selectedStep],
    queryFn: () => processStepsAPI.getByStepNumberAdmin(selectedStep),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      step_number: number;
      image_id: number;
      title?: string;
      description?: string;
      display_order?: number;
    }) => processStepsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-step-admin'] });
      queryClient.invalidateQueries({ queryKey: ['process-steps'] });
      // Dialog'u burada kapatmayalım, tüm resimler eklendikten sonra kapatılacak
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Resim eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      processStepsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-step-admin'] });
      queryClient.invalidateQueries({ queryKey: ['process-steps'] });
      setIsDialogOpen(false);
      setEditingImage(null);
      resetForm();
      toast({
        title: 'Başarılı',
        description: 'Resim güncellendi.',
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
    mutationFn: processStepsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-step-admin'] });
      queryClient.invalidateQueries({ queryKey: ['process-steps'] });
      toast({
        title: 'Başarılı',
        description: 'Resim silindi.',
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
      title: '',
      description: '',
      display_order: 0,
    });
    setEditingImage(null);
    setSelectedImages([]);
  };

  const handleOpenDialog = (image?: any) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        title: image.title || '',
        description: image.description || '',
        display_order: image.display_order || 0,
      });
      setSelectedImages([{ id: image.image_id, url: image.url }]);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedImages.length === 0) {
      toast({
        title: 'Hata',
        description: 'Lütfen en az bir resim seçin',
        variant: 'destructive',
      });
      return;
    }

    if (editingImage) {
      // Güncelleme - sadece tek bir resim
      updateMutation.mutate({
        id: editingImage.id,
        data: {
          title: formData.title || undefined,
          description: formData.description || undefined,
          display_order: formData.display_order || 0,
        },
      });
    } else {
      // Yeni ekleme - her resim için ayrı kayıt (sıralı olarak)
      try {
        const promises = selectedImages.map((img, index) =>
          processStepsAPI.create({
            step_number: selectedStep,
            image_id: img.id,
            title: formData.title || undefined,
            description: formData.description || undefined,
            display_order: formData.display_order + index || 0,
          })
        );

        await Promise.all(promises);
        
        queryClient.invalidateQueries({ queryKey: ['process-step-admin'] });
        queryClient.invalidateQueries({ queryKey: ['process-steps'] });
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: 'Başarılı',
          description: `${selectedImages.length} resim başarıyla eklendi.`,
        });
      } catch (error: any) {
        toast({
          title: 'Hata',
          description: error.message || 'Resimler eklenirken bir hata oluştu',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bu resmi silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Proje Süreci Resim Yönetimi</h2>
          <p className="text-muted-foreground">
            Proje sürecindeki her adıma resim ekleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Resim Ekle
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Adım Seçin</Label>
          <Select value={selectedStep.toString()} onValueChange={(value) => setSelectedStep(parseInt(value, 10))}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(stepTitles).map(([stepNum, title]) => (
                <SelectItem key={stepNum} value={stepNum}>
                  {stepNum}. {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStep}. {stepTitles[selectedStep]} - Resimler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : stepImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Bu adım için henüz resim eklenmemiş
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stepImages
                  .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                  .map((image: any) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={image.url}
                          alt={image.title || image.original_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        {image.title && (
                          <p className="font-medium mb-1">{image.title}</p>
                        )}
                        {image.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenDialog(image)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Düzenle
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resim Ekleme/Düzenleme Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingImage ? 'Resim Düzenle' : 'Yeni Resim Ekle'}
            </DialogTitle>
            <DialogDescription>
              {stepTitles[selectedStep]} adımına resim ekleyin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Resimler *</Label>
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
                    disabled={uploadingImages || !!editingImage}
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
                        {!editingImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
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
            <div className="space-y-2">
              <Label htmlFor="display_order">Görüntülenme Sırası</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
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
                disabled={createMutation.isPending || updateMutation.isPending || selectedImages.length === 0}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingImage ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcessSteps;

