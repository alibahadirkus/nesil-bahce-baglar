# Veritabanı Oluşturma - Hızlı Rehber

MySQL kurulu! Şimdi servisi başlatıp veritabanını oluşturalım.

## Adım 1: MySQL Servisini Başlat

### Eğer Servis Yapılandırılmışsa:
```powershell
net start MySQL80
```

### Eğer Servis Yapılandırılmamışsa:

**Yöntem 1: MySQL Installer (Önerilen)**
1. MySQL Installer'ı açın
2. "Reconfigure" butonuna tıklayın
3. "Configure MySQL Server as a Windows Service" seçeneğini işaretleyin
4. "Start the MySQL Server at System Startup" seçeneğini işaretleyin
5. Kurulumu tamamlayın

**Yöntem 2: Manuel Servis Kurulumu**
- `mysql-servis-kur.bat` dosyasını **Yönetici olarak** çalıştırın

## Adım 2: Servis Çalışıyor mu Kontrol Et

```powershell
Get-Service MySQL80
```

**"Running"** görünmeli. Değilse servisi başlatın.

## Adım 3: Veritabanını Oluştur

### Kolay Yol (Batch Script):
```batch
veritabani-olustur-kolay.bat
```

Script çalıştığında MySQL root şifrenizi girmeniz istenecek.

### Manuel Yol (PowerShell):
```powershell
cd "C:\Users\aliba\Desktop\projects\bahcelerbaglar\nesil-bahce-baglar"
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"

# Veritabanını ve tabloları oluştur
Get-Content server\config\db-init.sql | & $mysqlExe -u root -p
```

**ÖNEMLİ:** Şifre istenecek! 
- Eğer kurulum sırasında şifre belirlediyseniz, onu girin
- Eğer şifre belirlemediyseniz, sadece Enter'a basın (boş şifre)

## Adım 4: Veritabanını Kontrol Et

```powershell
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
& $mysqlExe -u root -p nesil_bahce_baglar -e "SHOW TABLES;"
```

Şu tabloları görmelisiniz:
- admins
- volunteers
- sms_messages
- uploaded_images
- link_contents

## Adım 5: .env Dosyasını Güncelle

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

**ÖNEMLİ:** 
- Eğer MySQL root şifresi varsa → `DB_PASSWORD` alanına yazın
- Eğer MySQL root şifresi yoksa (boş) → `DB_PASSWORD=` şeklinde boş bırakın

## Adım 6: Backend Server'ı Test Et

```powershell
npm run dev:server
```

**Başarılı mesaj:**
```
✅ MySQL Database connected successfully
Server is running on port 3001
```

## Sorun Giderme

### "MySQL servisi bulunamadı"
→ MySQL Installer ile "Configure MySQL Server as a Windows Service" seçeneğini işaretleyin

### "Can't connect to MySQL server"
→ MySQL servisi çalışmıyor. `net start MySQL80` komutunu çalıştırın

### "Access denied for user 'root'"
→ Şifre yanlış veya .env dosyasında şifre eksik. Kontrol edin.

### "Unknown database 'nesil_bahce_baglar'"
→ Veritabanı oluşturulmamış. `veritabani-olustur-kolay.bat` dosyasını çalıştırın.

