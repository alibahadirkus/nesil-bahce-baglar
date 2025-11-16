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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, UserPlus } from 'lucide-react';
import { studentsAPI, volunteersAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const Students = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPairDialogOpen, setIsPairDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [pairingStudent, setPairingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_number: '',
    class_name: '',
    school_name: '',
    phone: '',
    email: '',
    volunteer_id: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsAPI.getAll(),
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => volunteersAPI.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: studentsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Başarılı',
        description: 'Öğrenci başarıyla eklendi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Öğrenci eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      studentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      toast({
        title: 'Başarılı',
        description: 'Öğrenci bilgileri güncellendi.',
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
    mutationFn: studentsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Başarılı',
        description: 'Öğrenci silindi.',
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

  const pairMutation = useMutation({
    mutationFn: ({ studentId, volunteerId }: { studentId: number; volunteerId: number }) =>
      studentsAPI.pairWithVolunteer(studentId, volunteerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsPairDialogOpen(false);
      setPairingStudent(null);
      toast({
        title: 'Başarılı',
        description: 'Öğrenci-gönüllü eşleştirmesi yapıldı.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Eşleştirme sırasında bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      student_number: '',
      class_name: '',
      school_name: '',
      phone: '',
      email: '',
      volunteer_id: '',
      notes: '',
    });
    setEditingStudent(null);
  };

  const handleOpenDialog = (student?: any) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        student_number: student.student_number || '',
        class_name: student.class_name || '',
        school_name: student.school_name || '',
        phone: student.phone || '',
        email: student.email || '',
        volunteer_id: student.volunteer_id ? student.volunteer_id.toString() : 'none',
        notes: student.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleOpenPairDialog = (student: any) => {
    setPairingStudent(student);
    setIsPairDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      volunteer_id: formData.volunteer_id && formData.volunteer_id !== "none" ? parseInt(formData.volunteer_id) : null,
    };

    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handlePair = (volunteerId: number) => {
    if (pairingStudent) {
      pairMutation.mutate({ studentId: pairingStudent.id, volunteerId });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Öğrenci Yönetimi</h2>
          <p className="text-muted-foreground">
            Lise öğrencilerini ekleyin, düzenleyin ve gönüllülerle eşleştirin
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Öğrenci
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
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Öğrenci No</TableHead>
                <TableHead>Sınıf</TableHead>
                <TableHead>Okul</TableHead>
                <TableHead>Gönüllü</TableHead>
                <TableHead>Ağaç Sayısı</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Henüz öğrenci kaydı yok
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.student_number || '-'}</TableCell>
                    <TableCell>{student.class_name || '-'}</TableCell>
                    <TableCell>{student.school_name || '-'}</TableCell>
                    <TableCell>
                      {student.volunteer_first_name ? (
                        <span>
                          {student.volunteer_first_name} {student.volunteer_last_name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{student.tree_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!student.volunteer_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPairDialog(student)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
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

      {/* Öğrenci Ekle/Düzenle Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? 'Öğrenci bilgilerini güncelleyin'
                : 'Yeni lise öğrencisi ekleyin'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Ad *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Soyad *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_number">Öğrenci Numarası</Label>
                <Input
                  id="student_number"
                  value={formData.student_number}
                  onChange={(e) =>
                    setFormData({ ...formData, student_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_name">Sınıf</Label>
                <Input
                  id="class_name"
                  value={formData.class_name}
                  onChange={(e) =>
                    setFormData({ ...formData, class_name: e.target.value })
                  }
                  placeholder="9-A, 10-B vb."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_name">Okul Adı</Label>
              <Input
                id="school_name"
                value={formData.school_name}
                onChange={(e) =>
                  setFormData({ ...formData, school_name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="volunteer_id">Gönüllü Eşleştir</Label>
              <Select
                value={formData.volunteer_id || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, volunteer_id: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gönüllü seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Gönüllü seçilmedi</SelectItem>
                  {volunteers.map((volunteer: any) => (
                    <SelectItem key={volunteer.id} value={volunteer.id.toString()}>
                      {volunteer.first_name} {volunteer.last_name} - {volunteer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {editingStudent ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Gönüllü Eşleştirme Dialog */}
      <Dialog open={isPairDialogOpen} onOpenChange={setIsPairDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gönüllü Eşleştir</DialogTitle>
            <DialogDescription>
              {pairingStudent && (
                <span>
                  {pairingStudent.first_name} {pairingStudent.last_name} için gönüllü seçin
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gönüllü Seçin</Label>
              <Select
                onValueChange={(value) => handlePair(parseInt(value))}
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPairDialogOpen(false)}
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;



