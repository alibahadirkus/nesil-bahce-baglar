# Admin Paneli Kurulum Kılavuzu

## Veritabanı Kurulumu

1. MySQL'i başlatın ve bir veritabanı oluşturun:

```sql
mysql -u root -p
```

2. `server/config/db-init.sql` dosyasını çalıştırın:

```sql
source server/config/db-init.sql
```

Veya SQL dosyasını doğrudan MySQL'de çalıştırın.

## Ortam Değişkenleri

`server/.env` dosyasını oluşturun ve aşağıdaki değişkenleri ayarlayın:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nesil_bahce_baglar

PORT=3001
BASE_URL=http://localhost:3001

JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Backend Server'ı Başlatma

```bash
npm run dev:server
```

Veya frontend ile birlikte:

```bash
npm run dev:all
```

## Varsayılan Admin Kullanıcı Bilgileri

- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin123`

**ÖNEMLİ:** İlk girişten sonra şifreyi değiştirin!

## Admin Paneli Özellikleri

### 1. Dashboard
- Sistem özeti ve istatistikler
- Son gönüllüler ve SMS geçmişi

### 2. Gönüllü Yönetimi
- Yeni gönüllü ekleme (otomatik hoşgeldin SMS'i)
- Gönüllü bilgilerini düzenleme
- Gönüllü silme

### 3. SMS Gönderimi
- Tek tek SMS gönderme
- Toplu SMS gönderme
- SMS geçmişi görüntüleme
- Link ile birlikte SMS gönderme

### 4. Resim Yönetimi
- Resim yükleme (max 10MB)
- Resim görüntüleme
- Resim linklerini kopyalama
- Resim silme

### 5. Link Oluşturma
- SMS'lerde gönderilecek link içerikleri oluşturma
- Başlık, açıklama ve resimler ekleme
- Link preview sayfası

## SMS Servisi Entegrasyonu

Şu anda SMS gönderimi mock olarak çalışıyor. Gerçek bir SMS servisi entegre etmek için:

1. `server/services/smsService.ts` dosyasını düzenleyin
2. Tercih ettiğiniz SMS servis sağlayıcısının (Twilio, Netgsm, Ileti Merkezi vb.) API'sini entegre edin
3. Ortam değişkenlerine API anahtarlarını ekleyin

## API Endpoints

- `POST /api/auth/login` - Admin girişi
- `GET /api/auth/verify` - Token doğrulama
- `GET /api/volunteers` - Tüm gönüllüler
- `POST /api/volunteers` - Yeni gönüllü ekle
- `PUT /api/volunteers/:id` - Gönüllü güncelle
- `DELETE /api/volunteers/:id` - Gönüllü sil
- `POST /api/sms/send` - Tek SMS gönder
- `POST /api/sms/send-bulk` - Toplu SMS gönder
- `GET /api/sms/history` - SMS geçmişi
- `POST /api/upload/image` - Resim yükle
- `GET /api/upload/images` - Tüm resimler
- `DELETE /api/upload/image/:id` - Resim sil
- `POST /api/link-content` - Link içeriği oluştur
- `GET /api/link-content/:id` - Link içeriği getir
- `GET /preview/:id` - Preview sayfası

## Güvenlik Notları

- Production ortamında `JWT_SECRET` değişkenini güvenli bir değerle değiştirin
- Veritabanı şifresini güvenli tutun
- HTTPS kullanın
- Rate limiting ekleyin (zaten eklenmiş)
- Admin şifrelerini güçlü tutun

