# ❌ "Server error during login" Hatası Çözümü

## Sorun
MySQL servisi çalışmıyor veya veritabanı bağlantısı kurulamıyor.

## ✅ Hızlı Çözüm Adımları

### 1. MySQL Servisini Başlat

**Yöntem A: Hizmetler Uygulaması (Kolay)**
1. `Win + R` tuşlarına basın
2. `services.msc` yazın ve Enter'a basın
3. **"MySQL80"** veya **"MySQL"** servisini bulun
4. Durumu "Durduruldu" ise → **Sağ tıklayın** → **"Başlat"**

**Yöntem B: PowerShell (Yönetici olarak)**
```powershell
net start MySQL80
```

**Yöntem C: Batch Script**
Proje klasöründeki `MYSQL-BASLAT.bat` dosyasını **Yönetici olarak çalıştırın**.

### 2. MySQL Kurulum Sihirbazını Tamamla (Eğer servis yoksa)

1. Başlat menüsünde **"MySQL Installer"** arayın
2. Installer'ı açın
3. **"Reconfigure"** veya yeni kurulum seçeneğini seçin
4. **Root şifresi belirleyin** (ÖNEMLİ: Not alın!)
5. **Servisi başlat** seçeneğini işaretleyin
6. Kurulumu tamamlayın

### 3. Veritabanını Oluştur

MySQL servisi başladıktan sonra:

```powershell
cd "C:\Users\aliba\Desktop\projects\bahcelerbaglar\nesil-bahce-baglar"
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"

# Veritabanını ve tabloları oluştur
Get-Content server\config\db-init.sql | & $mysqlExe -u root -p
```

**Veya:** `veritabani-olustur-kolay.bat` dosyasını çalıştırın.

### 4. .env Dosyasını Güncelle

`server/.env` dosyasını oluşturun/düzenleyin:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=KURULUM_SIRASINDA_BELİRLEDİĞİNİZ_ŞİFRE
DB_NAME=nesil_bahce_baglar

PORT=3001
BASE_URL=http://localhost:3001

JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**ÖNEMLİ:** `DB_PASSWORD` alanına MySQL root şifrenizi yazın!

### 5. Backend Server'ı Yeniden Başlat

```powershell
npm run dev:server
```

Başarılı olursa şu mesajları göreceksiniz:
```
✅ MySQL Database connected successfully
Server is running on port 3001
```

### 6. Test Et

Tarayıcıda: `http://localhost:3001/api/health`

Sonra admin paneline giriş yapın: `http://localhost:8080/admin/login`
- Kullanıcı: `admin`
- Şifre: `admin123`

## 🔍 Sorun Giderme

### "MySQL servisi bulunamadı"
→ MySQL Installer ile kurulumu tamamlayın

### "Can't connect to MySQL server"
→ MySQL servisi çalışmıyor. Hizmetler uygulamasından başlatın.

### "Access denied for user 'root'"
→ Şifre yanlış. `server/.env` dosyasındaki `DB_PASSWORD` değerini kontrol edin.

### "Unknown database 'nesil_bahce_baglar'"
→ Veritabanı oluşturulmamış. `db-init.sql` dosyasını çalıştırın.

### "Table 'admins' doesn't exist"
→ Tablolar oluşturulmamış. `db-init.sql` dosyasını çalıştırın.

## 📝 Kontrol Komutları

MySQL servisi çalışıyor mu?
```powershell
Get-Service | Where-Object { $_.DisplayName -like "*MySQL*" }
```

MySQL portu açık mı?
```powershell
Test-NetConnection -ComputerName localhost -Port 3306
```

Veritabanı var mı?
```powershell
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
& $mysqlExe -u root -p -e "SHOW DATABASES;"
```

## 🆘 Hala Çalışmıyor mu?

1. PowerShell'i **Yönetici olarak** açın
2. MySQL servisini başlatın: `net start MySQL80`
3. Backend server loglarını kontrol edin (terminal çıktısına bakın)
4. Tarayıcı konsolunda (F12) tam hata mesajını kontrol edin

