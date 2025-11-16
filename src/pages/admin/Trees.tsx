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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Droplets, Sprout, Camera, Calendar } from 'lucide-react';
import { treesAPI, studentsAPI, volunteersAPI, uploadAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const Trees = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCareDialogOpen, setIsCareDialogOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [editingTree, setEditingTree] = useState<any>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    volunteer_id: '',
    tree_name: '',
    tree_type: '',
    location: '',
    planting_date: '',
    notes: '',
  });
  const [careData, setCareData] = useState({
    activity_type: '',
    activity_date: '',
    description: '',
    photo_url: '',
    completed_by: 'student',
  });

  const queryClient = useQueryClient();

  const { data: trees = [], isLoading } = useQuery({
    queryKey: ['trees'],
    queryFn: () => treesAPI.getAll(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsAPI.getAll(),
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => volunteersAPI.getAll(),
  });

  const { data: images = [] } = useQuery({
    queryKey: ['images'],
    queryFn: () => uploadAPI.getAllImages(),
    enabled: isCareDialogOpen,
  });

  const createMutation = useMutation({
    mutationFn: treesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Başarılı',
        description: 'Ağaç başarıyla eklendi ve gönüllüye bilgilendirme SMS\'i gönderildi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Ağaç eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      treesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      setIsDialogOpen(false);
      setEditingTree(null);
      resetForm();
      toast({
        title: 'Başarılı',
        description: 'Ağaç bilgileri güncellendi.',
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
    mutationFn: treesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      toast({
        title: 'Başarılı',
        description: 'Ağaç silindi.',
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

  const careActivityMutation = useMutation({
    mutationFn: ({ treeId, data }: { treeId: number; data: any }) =>
      treesAPI.addCareActivity(treeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      setIsCareDialogOpen(false);
      setSelectedTree(null);
      resetCareForm();
      toast({
        title: 'Başarılı',
        description: 'Bakım aktivitesi kaydedildi ve gönüllüye bilgilendirme SMS\'i gönderildi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Bakım aktivitesi eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      student_id: '',
      volunteer_id: '',
      tree_name: '',
      tree_type: '',
      location: '',
      planting_date: '',
      notes: '',
    });
    setEditingTree(null);
  };

  const resetCareForm = () => {
    setCareData({
      activity_type: '',
      activity_date: new Date().toISOString().split('T')[0],
      description: '',
      photo_url: '',
      completed_by: 'student',
    });
  };

  const handleOpenDialog = (tree?: any) => {
    if (tree) {
      setEditingTree(tree);
      setFormData({
        student_id: tree.student_id?.toString() || '',
        volunteer_id: tree.volunteer_id?.toString() || '',
        tree_name: tree.tree_name || '',
        tree_type: tree.tree_type || '',
        location: tree.location || '',
        planting_date: tree.planting_date || '',
        notes: tree.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleOpenCareDialog = (tree: any) => {
    setSelectedTree(tree);
    resetCareForm();
    setIsCareDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      student_id: parseInt(formData.student_id),
      volunteer_id: parseInt(formData.volunteer_id),
    };

    if (editingTree) {
      updateMutation.mutate({ id: editingTree.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleCareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTree) {
      const submitData = {
        ...careData,
        photo_url: careData.photo_url === "none" ? "" : careData.photo_url,
      };
      careActivityMutation.mutate({ treeId: selectedTree.id, data: submitData });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bu ağacı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      planted: 'default',
      growing: 'secondary',
      mature: 'outline',
      maintenance: 'destructive',
    };
    const labels: any = {
      planted: 'Dikildi',
      growing: 'Büyüyor',
      mature: 'Olgun',
      maintenance: 'Bakımda',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Ağaç Yönetimi</h2>
          <p className="text-muted-foreground">
            Ağaçları ekleyin, bakım aktivitelerini kaydedin ve gönüllülere bilgi gönderin
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ağaç
        </Button>
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
                <TableHead>Ağaç Adı</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Öğrenci</TableHead>
                <TableHead>Gönüllü</TableHead>
                <TableHead>Dikim Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Bakım</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Henüz ağaç kaydı yok
                  </TableCell>
                </TableRow>
              ) : (
                trees.map((tree: any) => (
                  <TableRow key={tree.id}>
                    <TableCell className="font-medium">{tree.tree_name}</TableCell>
                    <TableCell>{tree.tree_type || '-'}</TableCell>
                    <TableCell>
                      {tree.student_first_name} {tree.student_last_name}
                    </TableCell>
                    <TableCell>
                      {tree.volunteer_first_name} {tree.volunteer_last_name}
                    </TableCell>
                    <TableCell>
                      {tree.planting_date
                        ? new Date(tree.planting_date).toLocaleDateString('tr-TR')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(tree.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {tree.activity_count || 0} aktivite
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCareDialog(tree)}
                        >
                          <Droplets className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(tree)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tree.id)}
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

      {/* Ağaç Ekle/Düzenle Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTree ? 'Ağaç Düzenle' : 'Yeni Ağaç Ekle'}
            </DialogTitle>
            <DialogDescription>
              {editingTree
                ? 'Ağaç bilgilerini güncelleyin'
                : 'Öğrenci ve gönüllü ile birlikte dikilen ağacı kaydedin'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Öğrenci *</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, student_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Öğrenci seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.first_name} {student.last_name}
                        {student.student_number && ` (${student.student_number})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteer_id">Gönüllü *</Label>
                <Select
                  value={formData.volunteer_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, volunteer_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gönüllü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {volunteers.map((volunteer: any) => (
                      <SelectItem key={volunteer.id} value={volunteer.id.toString()}>
                        {volunteer.first_name} {volunteer.last_name} - {volunteer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tree_name">Ağaç Adı *</Label>
                <Input
                  id="tree_name"
                  value={formData.tree_name}
                  onChange={(e) =>
                    setFormData({ ...formData, tree_name: e.target.value })
                  }
                  required
                  placeholder="Örn: Kiraz Ağacı 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tree_type">Ağaç Türü</Label>
                <Input
                  id="tree_type"
                  value={formData.tree_type}
                  onChange={(e) =>
                    setFormData({ ...formData, tree_type: e.target.value })
                  }
                  placeholder="Örn: Kiraz, Elma, Armut"
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
                placeholder="Okul bahçesi, koordinatlar vb."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planting_date">Dikim Tarihi</Label>
              <Input
                id="planting_date"
                type="date"
                value={formData.planting_date}
                onChange={(e) =>
                  setFormData({ ...formData, planting_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingTree ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bakım Aktivitesi Dialog */}
      <Dialog open={isCareDialogOpen} onOpenChange={setIsCareDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bakım Aktivitesi Ekle</DialogTitle>
            <DialogDescription>
              {selectedTree && (
                <span>
                  {selectedTree.tree_name} ağacı için bakım aktivitesi kaydedin. Gönüllüye otomatik SMS gönderilecektir.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCareSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_type">Aktivite Türü *</Label>
                <Select
                  value={careData.activity_type}
                  onValueChange={(value) =>
                    setCareData({ ...careData, activity_type: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aktivite seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watering">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Sulama
                      </div>
                    </SelectItem>
                    <SelectItem value="fertilizing">
                      <div className="flex items-center gap-2">
                        <Sprout className="h-4 w-4" />
                        Gübreleme
                      </div>
                    </SelectItem>
                    <SelectItem value="growth_update">
                      <div className="flex items-center gap-2">
                        <Sprout className="h-4 w-4" />
                        Büyüme Güncellemesi
                      </div>
                    </SelectItem>
                    <SelectItem value="photo">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Fotoğraf Çekimi
                      </div>
                    </SelectItem>
                    <SelectItem value="checkup">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Genel Kontrol
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity_date">Tarih *</Label>
                <Input
                  id="activity_date"
                  type="date"
                  value={careData.activity_date}
                  onChange={(e) =>
                    setCareData({ ...careData, activity_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={careData.description}
                onChange={(e) =>
                  setCareData({ ...careData, description: e.target.value })
                }
                rows={3}
                placeholder="Aktivite detayları (örn: Ağaç güzelce sulandı, 5 litre su verildi)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo_url">Fotoğraf URL (Opsiyonel)</Label>
              <div className="flex gap-2">
                <Select
                  value={careData.photo_url || undefined}
                  onValueChange={(value) =>
                    setCareData({ ...careData, photo_url: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Yüklenmiş resimlerden seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Fotoğraf seçilmedi</SelectItem>
                    {images.map((image: any) => (
                      <SelectItem key={image.id} value={image.url}>
                        {image.original_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {careData.photo_url && careData.photo_url !== "none" && (
                <div className="mt-2">
                  <img
                    src={careData.photo_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded border"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="completed_by">Kim Yaptı</Label>
              <Select
                value={careData.completed_by}
                onValueChange={(value) =>
                  setCareData({ ...careData, completed_by: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Öğrenci</SelectItem>
                  <SelectItem value="volunteer">Gönüllü</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCareDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={careActivityMutation.isPending}
              >
                {careActivityMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Kaydet ve SMS Gönder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trees;



