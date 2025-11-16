import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { uploadAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Images = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['images'],
    queryFn: () => uploadAPI.getAllImages(),
  });

  const deleteMutation = useMutation({
    mutationFn: uploadAPI.deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      setDeleteDialogOpen(false);
      setImageToDelete(null);
      toast({
        title: 'Başarılı',
        description: 'Resim silindi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Resim silinirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Hata',
          description: 'Dosya boyutu 10MB\'dan küçük olmalıdır',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Uyarı',
        description: 'Lütfen bir dosya seçin',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      await uploadAPI.uploadImage(selectedFile);
      toast({
        title: 'Başarılı',
        description: 'Resim başarıyla yüklendi.',
      });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['images'] });
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Resim yüklenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (image: any) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (imageToDelete) {
      deleteMutation.mutate(imageToDelete.id);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Başarılı',
      description: 'Link kopyalandı',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Resim Yönetimi</h2>
        <p className="text-muted-foreground">
          Resimleri yükleyin, görüntüleyin ve yönetin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Resim Yükle</CardTitle>
          <CardDescription>
            Maksimum 10MB boyutunda resim dosyası yükleyebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Yükle
                </>
              )}
            </Button>
          </div>
          {selectedFile && (
            <div className="p-3 bg-muted rounded">
              <p className="text-sm">
                <strong>Seçilen dosya:</strong> {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yüklenen Resimler ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz resim yüklenmemiş
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image: any) => (
                <div
                  key={image.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={image.url}
                      alt={image.original_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-sm font-medium truncate">
                      {image.original_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(image.size / 1024).toFixed(2)} KB
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyToClipboard(image.url)}
                      >
                        Link Kopyala
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(image)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={image.url}
                      readOnly
                      className="text-xs mt-2"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resmi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu resmi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Images;

