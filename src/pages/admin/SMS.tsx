import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { volunteersAPI, smsAPI, linkContentAPI, uploadAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SMS = () => {
  const [message, setMessage] = useState('');
  const [selectedVolunteers, setSelectedVolunteers] = useState<number[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkContent, setLinkContent] = useState({
    title: '',
    description: '',
    selectedImages: [] as any[],
  });

  const queryClient = useQueryClient();

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => volunteersAPI.getAll(),
  });

  const { data: images = [] } = useQuery({
    queryKey: ['images'],
    queryFn: () => uploadAPI.getAllImages(),
  });

  const { data: linkContents = [] } = useQuery({
    queryKey: ['link-contents'],
    queryFn: () => linkContentAPI.getAll(),
  });

  const { data: smsHistory = [] } = useQuery({
    queryKey: ['sms-history'],
    queryFn: () => smsAPI.getHistory(),
  });

  const sendMutation = useMutation({
    mutationFn: smsAPI.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-history'] });
      setMessage('');
      setLinkUrl('');
      toast({
        title: 'Başarılı',
        description: 'SMS başarıyla gönderildi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'SMS gönderilirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const sendBulkMutation = useMutation({
    mutationFn: smsAPI.sendBulk,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sms-history'] });
      setMessage('');
      setSelectedVolunteers([]);
      setLinkUrl('');
      toast({
        title: 'Başarılı',
        description: `${data.success} SMS başarıyla gönderildi. ${data.failed > 0 ? `${data.failed} başarısız.` : ''}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Toplu SMS gönderilirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: linkContentAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['link-contents'] });
      setLinkUrl(data.link_url);
      setIsLinkDialogOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Link içeriği oluşturuldu.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Link içeriği oluşturulurken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const handleSingleSend = (volunteerId: number, phone: string) => {
    if (!message.trim()) {
      toast({
        title: 'Uyarı',
        description: 'Mesaj içeriği boş olamaz',
        variant: 'destructive',
      });
      return;
    }

    sendMutation.mutate({
      volunteer_id: volunteerId,
      phone,
      message,
      link_url: linkUrl || undefined,
    });
  };

  const handleBulkSend = () => {
    if (!message.trim()) {
      toast({
        title: 'Uyarı',
        description: 'Mesaj içeriği boş olamaz',
        variant: 'destructive',
      });
      return;
    }

    if (selectedVolunteers.length === 0) {
      toast({
        title: 'Uyarı',
        description: 'En az bir gönüllü seçmelisiniz',
        variant: 'destructive',
      });
      return;
    }

    sendBulkMutation.mutate({
      volunteer_ids: selectedVolunteers,
      message,
      link_url: linkUrl || undefined,
    });
  };

  const handleToggleVolunteer = (id: number) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedVolunteers.length === volunteers.length) {
      setSelectedVolunteers([]);
    } else {
      setSelectedVolunteers(volunteers.map((v: any) => v.id));
    }
  };

  const handleCreateLink = () => {
    if (!linkContent.title.trim()) {
      toast({
        title: 'Uyarı',
        description: 'Başlık gereklidir',
        variant: 'destructive',
      });
      return;
    }

    const imageIds = linkContent.selectedImages.map((img: any) => img.id);
    createLinkMutation.mutate({
      title: linkContent.title,
      description: linkContent.description,
      image_ids: imageIds.length > 0 ? imageIds : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">SMS Gönderimi</h2>
        <p className="text-muted-foreground">
          Gönüllülere tek tek veya toplu SMS gönderin
        </p>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">SMS Gönder</TabsTrigger>
          <TabsTrigger value="history">SMS Geçmişi</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mesaj Oluştur</CardTitle>
              <CardDescription>
                Mesajınızı yazın ve göndermek istediğiniz gönüllüleri seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Mesaj İçeriği *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Göndermek istediğiniz mesajı buraya yazın..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  {message.length} karakter
                </p>
              </div>

              <div className="space-y-2">
                <Label>Link Ekle (Opsiyonel)</Label>
                <div className="flex gap-2">
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Link URL'si veya oluştur..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLinkDialogOpen(true)}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Link Oluştur
                  </Button>
                </div>
              </div>

              {linkUrl && (
                <div className="p-3 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm">
                    <strong>Link:</strong> {linkUrl}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLinkUrl('')}
                    className="mt-2"
                  >
                    Linki Kaldır
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toplu SMS Gönderimi</CardTitle>
              <CardDescription>
                Birden fazla gönüllüye aynı mesajı gönderin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedVolunteers.length === volunteers.length && volunteers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>Tümünü Seç</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedVolunteers.length} gönüllü seçildi
                </p>
              </div>

              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>Telefon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteers.map((volunteer: any) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedVolunteers.includes(volunteer.id)}
                            onCheckedChange={() => handleToggleVolunteer(volunteer.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {volunteer.first_name} {volunteer.last_name}
                        </TableCell>
                        <TableCell>{volunteer.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button
                onClick={handleBulkSend}
                disabled={sendBulkMutation.isPending || selectedVolunteers.length === 0}
                className="w-full"
              >
                {sendBulkMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Toplu SMS Gönder ({selectedVolunteers.length})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tek Tek SMS Gönderimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {volunteers.map((volunteer: any) => (
                  <div
                    key={volunteer.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {volunteer.first_name} {volunteer.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{volunteer.phone}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSingleSend(volunteer.id, volunteer.phone)}
                      disabled={sendMutation.isPending}
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>SMS Geçmişi</CardTitle>
              <CardDescription>Gönderilen tüm SMS mesajları</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Mesaj</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smsHistory.map((sms: any) => (
                    <TableRow key={sms.id}>
                      <TableCell>{sms.phone}</TableCell>
                      <TableCell className="max-w-xs truncate">{sms.message}</TableCell>
                      <TableCell>
                        {sms.link_url ? (
                          <a
                            href={sms.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Link
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            sms.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : sms.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {sms.status === 'sent'
                            ? 'Gönderildi'
                            : sms.status === 'failed'
                            ? 'Başarısız'
                            : 'Bekliyor'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {sms.sent_at
                          ? new Date(sms.sent_at).toLocaleString('tr-TR')
                          : new Date(sms.created_at).toLocaleString('tr-TR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Link Oluşturma Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link İçeriği Oluştur</DialogTitle>
            <DialogDescription>
              SMS'te gönderilecek link için başlık, açıklama ve resimler ekleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-title">Başlık *</Label>
              <Input
                id="link-title"
                value={linkContent.title}
                onChange={(e) =>
                  setLinkContent({ ...linkContent, title: e.target.value })
                }
                placeholder="Link başlığı"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-description">Açıklama</Label>
              <Textarea
                id="link-description"
                value={linkContent.description}
                onChange={(e) =>
                  setLinkContent({ ...linkContent, description: e.target.value })
                }
                rows={3}
                placeholder="Link açıklaması"
              />
            </div>
            <div className="space-y-2">
              <Label>Resimler</Label>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded">
                {images.map((image: any) => (
                  <div
                    key={image.id}
                    className={`relative border rounded cursor-pointer ${
                      linkContent.selectedImages.some((img: any) => img.id === image.id)
                        ? 'border-primary ring-2 ring-primary'
                        : ''
                    }`}
                    onClick={() => {
                      const isSelected = linkContent.selectedImages.some(
                        (img: any) => img.id === image.id
                      );
                      setLinkContent({
                        ...linkContent,
                        selectedImages: isSelected
                          ? linkContent.selectedImages.filter(
                              (img: any) => img.id !== image.id
                            )
                          : [...linkContent.selectedImages, image],
                      });
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.original_name}
                      className="w-full h-24 object-cover rounded"
                    />
                    {linkContent.selectedImages.some((img: any) => img.id === image.id) && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <ImageIcon className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleCreateLink}
              disabled={createLinkMutation.isPending}
            >
              {createLinkMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Link Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SMS;

