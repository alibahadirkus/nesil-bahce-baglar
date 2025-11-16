# MySQL Kurulum Adımları

## Adım 1: MySQL Installer'ı Aç

**Yöntem 1: Başlat Menüsü**
1. Windows tuşuna basın
2. "MySQL Installer" yazın
3. "MySQL Installer - Community" uygulamasını açın

**Yöntem 2: Dosya Gezgini**
1. `C:\Program Files\MySQL\MySQL Installer for Windows` klasörüne gidin
2. `MySQLInstallerCommunity.exe` dosyasını çift tıklayın

**Yöntem 3: Script**
- Proje klasöründeki `mysql-installer-ac.bat` dosyasını çalıştırın

## Adım 2: Kurulum Sihirbazını Tamamla

### Seçenek A: Yeni Kurulum (İlk Kurulum)
1. **"Add"** veya **"Add..."** butonuna tıklayın
2. **"MySQL Server"** seçin (en son sürüm, örn. 8.4.6)
3. **"Execute"** veya **"Next"** butonuna tıklayın
4. Kurulum dosyalarını indirmesi için bekleyin
5. **"Next"** → Kurulum türünü seçin:
   - **"Developer Default"** (Önerilen) veya
   - **"Server only"**
6. **"Execute"** butonuna tıklayın
7. Kurulum tamamlanana kadar bekleyin

### Seçenek B: Mevcut Kurulumu Yapılandır (Reconfigure)
1. Listede **"MySQL Server 8.4.x"** görüyorsanız:
2. Seçin ve **"Reconfigure"** butonuna tıklayın

## Adım 3: Server Configuration

1. **"Standalone MySQL Server"** seçin
2. **"Next"**

### Config Type (Yapılandırma Türü):
- **"Development Computer"** seçin (Önerilen)
- **"Next"**

### Authentication Method:
- **"Use Strong Password Encryption"** seçin
- **"Next"**

### Root Account Setup (ÖNEMLİ):
1. **Root Password** alanına şifrenizi yazın
   - **ÖRNEK:** `root123` veya istediğiniz güçlü bir şifre
   - **NOT:** Bu şifreyi bir yere kaydedin!
2. **Confirm Password** alanına aynı şifreyi tekrar yazın
3. **"Next"**

### Windows Service:
1. **"Configure MySQL Server as a Windows Service"** işaretli olmalı
2. **Service Name:** `MySQL80` (varsayılan)
3. **"Start the MySQL Server at System Startup"** işaretli olmalı
4. **"Run Windows Service as"** → **"Standard System Account"** seçin
5. **"Next"**

### Apply Configuration:
1. **"Execute"** butonuna tıklayın
2. Yapılandırmanın tamamlanmasını bekleyin
3. **"Finish"**

## Adım 4: Son Adımlar

1. Installer penceresinde **"Finish"** butonuna tıklayın
2. **"Next"** → **"Finish"** (eğer başka ekranlar varsa)

## Adım 5: MySQL Servisini Kontrol Et

### PowerShell ile:
```powershell
Get-Service MySQL80
```

Durum **"Running"** olmalı. Değilse:
```powershell
Start-Service MySQL80
```

### Hizmetler Uygulaması ile:
1. `Win + R` → `services.msc`
2. "MySQL80" servisini bulun
3. Durum "Çalışıyor" olmalı

## Adım 6: Veritabanını Oluştur

MySQL servisi çalıştıktan sonra:

### Yöntem 1: Batch Script (Kolay)
```batch
veritabani-olustur-kolay.bat
```

### Yöntem 2: PowerShell
```powershell
cd "C:\Users\aliba\Desktop\projects\bahcelerbaglar\nesil-bahce-baglar"
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
Get-Content server\config\db-init.sql | & $mysqlExe -u root -p
```

Şifre istenecek → Kurulum sırasında belirlediğiniz root şifresini girin.

## Adım 7: .env Dosyasını Güncelle

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

**ÖNEMLİ:** `DB_PASSWORD` alanına kurulum sırasında belirlediğiniz root şifresini yazın!

## Adım 8: Backend Server'ı Test Et

```powershell
npm run dev:server
```

Başarılı olursa şu mesajları göreceksiniz:
```
✅ MySQL Database connected successfully
Server is running on port 3001
```

## Sorun Giderme

### "MySQL Installer bulunamadı"
- MySQL kurulu değil veya farklı bir konumda
- `winget install Oracle.MySQL` komutuyla tekrar kurun

### "Servis başlatılamadı"
- PowerShell'i **Yönetici olarak** açın
- `net start MySQL80` komutunu çalıştırın

### "Access denied for user 'root'"
- Şifre yanlış veya .env dosyasında şifre yok
- .env dosyasındaki `DB_PASSWORD` değerini kontrol edin

### "Unknown database"
- Veritabanı oluşturulmamış
- `db-init.sql` dosyasını çalıştırın

