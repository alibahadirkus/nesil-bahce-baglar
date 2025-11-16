# MySQL Kurulum ve Veritabanı Oluşturma

## Seçenek 1: MySQL Community Server Kurulumu (Önerilen)

### Adım 1: MySQL İndir ve Kur

1. [MySQL İndirme Sayfası](https://dev.mysql.com/downloads/mysql/) adresine gidin
2. "MySQL Installer for Windows" seçeneğini indirin
3. Kurulum sihirbazını çalıştırın
4. "Developer Default" veya "Server only" seçeneğini seçin
5. Kurulum sırasında **root şifresi belirleyin** (unutmayın!)

### Adım 2: MySQL Servisini Başlat

MySQL kurulumundan sonra genellikle otomatik başlar. Kontrol etmek için:

**PowerShell:**
```powershell
Get-Service -Name "*mysql*"
```

Eğer durdurulmuşsa:
```powershell
Start-Service -Name "MySQL80"  # veya servis adınız neyse
```

**Veya Hizmetler uygulamasından:**
- `Win + R` → `services.msc` → MySQL servisini bulup başlatın

### Adım 3: MySQL'e Bağlan

**PowerShell:**
```powershell
mysql -u root -p
```
Şifrenizi girin (kurulum sırasında belirlediğiniz).

### Adım 4: Veritabanını Oluştur

MySQL komut satırında:
```sql
source C:/Users/aliba/Desktop/projects/bahcelerbaglar/nesil-bahce-baglar/server/config/db-init.sql
```

**VEYA PowerShell'den direkt:**
```powershell
cd C:\Users\aliba\Desktop\projects\bahcelerbaglar\nesil-bahce-baglar
mysql -u root -p < server\config\db-init.sql
```

---

## Seçenek 2: XAMPP/WAMP Kullanımı (Daha Kolay)

XAMPP veya WAMP kullanıyorsanız:

### XAMPP ile:

1. **XAMPP Control Panel'i açın**
2. **MySQL'i başlatın** (Start butonuna tıklayın)
3. **phpMyAdmin'e gidin:** `http://localhost/phpMyAdmin`
4. **SQL sekmesine tıklayın**
5. **`server/config/db-init.sql` dosyasının içeriğini kopyalayıp yapıştırın**
6. **Git butonuna tıklayın**

**VEYA Terminal'den:**
```powershell
# XAMPP genellikle bu yolda kurulur
C:\xampp\mysql\bin\mysql.exe -u root < server\config\db-init.sql
```

### WAMP ile:

1. **WAMP'i başlatın**
2. **phpMyAdmin'e gidin:** `http://localhost/phpmyadmin`
3. Yukarıdaki XAMPP adımlarını takip edin

---

## Seçenek 3: Docker ile MySQL (Alternatif)

Docker kuruluysa:

```powershell
# MySQL container'ı başlat
docker run --name mysql-nesil-bahce -e MYSQL_ROOT_PASSWORD=root123 -e MYSQL_DATABASE=nesil_bahce_baglar -p 3306:3306 -d mysql:8.0

# Veritabanını oluştur
docker exec -i mysql-nesil-bahce mysql -uroot -proot123 < server/config/db-init.sql
```

Sonra `server/.env` dosyasında:
```env
DB_PASSWORD=root123
```

---

## Kurulum Sonrası Kontrol

### 1. Veritabanının Oluşturulduğunu Kontrol Et:

```powershell
mysql -u root -p -e "SHOW DATABASES;"
```

`nesil_bahce_baglar` veritabanını görmelisiniz.

### 2. Tabloların Oluşturulduğunu Kontrol Et:

```powershell
mysql -u root -p nesil_bahce_baglar -e "SHOW TABLES;"
```

Şu tabloları görmelisiniz:
- admins
- volunteers
- sms_messages
- uploaded_images
- link_contents

### 3. Admin Kullanıcısını Kontrol Et:

```powershell
mysql -u root -p nesil_bahce_baglar -e "SELECT username, email FROM admins;"
```

`admin` kullanıcısını görmelisiniz.

---

## .env Dosyasını Güncelle

`server/.env` dosyasında şifrenizi güncelleyin:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sizin_mysql_sifreniz  # ← Buraya MySQL root şifrenizi yazın
DB_NAME=nesil_bahce_baglar

PORT=3001
BASE_URL=http://localhost:3001

JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Önemli:** Eğer MySQL root şifresi yoksa (boş), `DB_PASSWORD=` şeklinde boş bırakın (ama güvenlik için şifre önerilir).

---

## Sorun Giderme

### "mysql komutu bulunamadı"
- MySQL kurulu değil veya PATH'e eklenmemiş
- XAMPP/WAMP kullanıyorsanız, tam yol ile çalıştırın:
  - XAMPP: `C:\xampp\mysql\bin\mysql.exe`
  - WAMP: `C:\wamp64\bin\mysql\mysql8.0.x\bin\mysql.exe`

### "Access denied for user 'root'@'localhost'"
- Şifre yanlış
- `server/.env` dosyasındaki şifreyi kontrol edin

### "Unknown database"
- SQL dosyası çalıştırılmamış
- Yukarıdaki adımları tekrar uygulayın

---

## Hızlı Başlangıç (Özet)

1. MySQL kur (veya XAMPP/WAMP)
2. MySQL servisini başlat
3. SQL dosyasını çalıştır: `mysql -u root -p < server\config\db-init.sql`
4. `server/.env` dosyasını güncelle (şifreyi yaz)
5. Backend server'ı yeniden başlat: `npm run dev:server`

