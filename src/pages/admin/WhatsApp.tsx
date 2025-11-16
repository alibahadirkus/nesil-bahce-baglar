import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
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
import { Loader2, Send, Link as LinkIcon, Image as ImageIcon, Wifi, WifiOff, QrCode, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { volunteersAPI, whatsappAPI, linkContentAPI, uploadAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';

// Production'da relative path kullan (Nginx üzerinden backend'e yönlendirilir)
// Development'da localhost kullan
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:3001');

const WhatsApp = () => {
  const [message, setMessage] = useState('');
  const [selectedVolunteers, setSelectedVolunteers] = useState<number[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkContent, setLinkContent] = useState({
    title: '',
    description: '',
    selectedImages: [] as any[],
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<{
    status: string;
    qrCode: string | null;
    isReady: boolean;
  }>({
    status: 'disconnected',
    qrCode: null,
    isReady: false,
  });

  const queryClient = useQueryClient();

  // Socket.IO bağlantısı
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('whatsapp-status', (status) => {
      setWhatsappStatus(status);
    });

    newSocket.on('whatsapp-qr', (qr) => {
      setWhatsappStatus((prev) => ({ ...prev, qrCode: qr }));
    });

    newSocket.on('whatsapp-ready', () => {
      setWhatsappStatus((prev) => ({ ...prev, status: 'ready', isReady: true, qrCode: null }));
      toast({
        title: 'Başarılı',
        description: 'WhatsApp bağlantısı kuruldu!',
      });
    });

    newSocket.on('whatsapp-error', (error) => {
      toast({
        title: 'Hata',
        description: error,
        variant: 'destructive',
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // WhatsApp durumunu sorgula
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: () => whatsappAPI.getStatus(),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (statusData) {
      setWhatsappStatus(statusData);
    }
  }, [statusData]);

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

  const { data: whatsappHistory = [] } = useQuery({
    queryKey: ['whatsapp-history'],
    queryFn: () => whatsappAPI.getHistory(),
  });

  const connectMutation = useMutation({
    mutationFn: whatsappAPI.connect,
    onSuccess: () => {
      refetchStatus();
      toast({
        title: 'Başarılı',
        description: 'WhatsApp bağlantısı başlatıldı. QR kodu görünecek.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'WhatsApp bağlantısı başlatılamadı',
        variant: 'destructive',
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: whatsappAPI.disconnect,
    onSuccess: () => {
      refetchStatus();
      toast({
        title: 'Başarılı',
        description: 'WhatsApp bağlantısı kesildi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'WhatsApp bağlantısı kesilemedi',
        variant: 'destructive',
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: whatsappAPI.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-history'] });
      setMessage('');
      setLinkUrl('');
      toast({
        title: 'Başarılı',
        description: 'WhatsApp mesajı başarıyla gönderildi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'WhatsApp mesajı gönderilirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const sendBulkMutation = useMutation({
    mutationFn: whatsappAPI.sendBulk,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-history'] });
      setMessage('');
      setSelectedVolunteers([]);
      setLinkUrl('');
      toast({
        title: 'Başarılı',
        description: `${data.success} WhatsApp mesajı başarıyla gönderildi. ${data.failed > 0 ? `${data.failed} başarısız.` : ''}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Toplu WhatsApp mesajı gönderilirken bir hata oluştu',
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

    if (!whatsappStatus.isReady) {
      toast({
        title: 'Uyarı',
        description: 'WhatsApp bağlantısı hazır değil. Lütfen önce WhatsApp\'ı bağlayın.',
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

    if (!whatsappStatus.isReady) {
      toast({
        title: 'Uyarı',
        description: 'WhatsApp bağlantısı hazır değil. Lütfen önce WhatsApp\'ı bağlayın.',
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

  const getStatusIcon = () => {
    switch (whatsappStatus.status) {
      case 'ready':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'connecting':
      case 'authenticating':
      case 'authenticated':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (whatsappStatus.status) {
      case 'ready':
        return 'Bağlı';
      case 'connecting':
        return 'Bağlanıyor...';
      case 'authenticating':
        return 'Doğrulanıyor...';
      case 'authenticated':
        return 'Doğrulandı';
      default:
        return 'Bağlantı Yok';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">WhatsApp Mesaj Gönderimi</h2>
        <p className="text-muted-foreground">
          Gönüllülere tek tek veya toplu WhatsApp mesajı gönderin
        </p>
      </div>

      {/* WhatsApp Bağlantı Durumu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            WhatsApp Bağlantı Durumu
            {getStatusIcon()}
          </CardTitle>
          <CardDescription>
            Durum: {getStatusText()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {whatsappStatus.isReady ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {whatsappStatus.isReady ? 'Bağlı' : 'Bağlı Değil'}
              </span>
            </div>
            <div className="flex gap-2">
              {!whatsappStatus.isReady && (
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                  variant="default"
                >
                  {connectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bağlanıyor...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      WhatsApp'ı Bağla
                    </>
                  )}
                </Button>
              )}
              {whatsappStatus.isReady && (
                <Button
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  variant="destructive"
                >
                  {disconnectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kesiliyor...
                    </>
                  ) : (
                    <>
                      <WifiOff className="mr-2 h-4 w-4" />
                      Bağlantıyı Kes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* QR Kod Gösterimi */}
          {whatsappStatus.qrCode && (
            <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-background">
              <p className="text-sm font-medium">WhatsApp'ı bağlamak için QR kodu tarayın:</p>
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG value={whatsappStatus.qrCode} size={256} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                WhatsApp uygulamanızı açın → Ayarlar → Bağlı Cihazlar → Cihaz Bağla
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Mesaj Gönder</TabsTrigger>
          <TabsTrigger value="history">Mesaj Geçmişi</TabsTrigger>
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
                  disabled={!whatsappStatus.isReady}
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
                    disabled={!whatsappStatus.isReady}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLinkDialogOpen(true)}
                    disabled={!whatsappStatus.isReady}
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
              <CardTitle>Toplu Mesaj Gönderimi</CardTitle>
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
                    disabled={!whatsappStatus.isReady}
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
                            disabled={!whatsappStatus.isReady}
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
                disabled={sendBulkMutation.isPending || selectedVolunteers.length === 0 || !whatsappStatus.isReady}
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
                    Toplu Mesaj Gönder ({selectedVolunteers.length})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tek Tek Mesaj Gönderimi</CardTitle>
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
                      disabled={sendMutation.isPending || !whatsappStatus.isReady}
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
              <CardTitle>WhatsApp Mesaj Geçmişi</CardTitle>
              <CardDescription>Gönderilen tüm WhatsApp mesajları</CardDescription>
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
                  {whatsappHistory.map((msg: any) => (
                    <TableRow key={msg.id}>
                      <TableCell>{msg.phone}</TableCell>
                      <TableCell className="max-w-xs truncate">{msg.message}</TableCell>
                      <TableCell>
                        {msg.link_url ? (
                          <a
                            href={msg.link_url}
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
                            msg.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : msg.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {msg.status === 'sent'
                            ? 'Gönderildi'
                            : msg.status === 'failed'
                            ? 'Başarısız'
                            : 'Bekliyor'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {msg.sent_at
                          ? new Date(msg.sent_at).toLocaleString('tr-TR')
                          : new Date(msg.created_at).toLocaleString('tr-TR')}
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
              WhatsApp mesajında gönderilecek link için başlık, açıklama ve resimler ekleyin
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

export default WhatsApp;

