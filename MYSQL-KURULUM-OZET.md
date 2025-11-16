# MySQL Kurulum Özeti

## 🎯 Hızlı Başlangıç

### 1. MySQL Installer'ı Aç

**En Kolay Yol:**
- **Windows tuşu** → **"MySQL Installer"** yaz → **Aç**

**Alternatif:**
- Dosya Gezgini → `C:\Program Files\MySQL\` → `MySQLInstallerCommunity.exe` → Çift tıkla

### 2. Kurulum Sihirbazını Tamamla

1. **"Reconfigure"** veya **"Add"** butonuna tıkla
2. **Root şifresi belirle** (ÖNEMLİ! Not al: örn. `root123`)
3. **"Configure MySQL Server as a Windows Service"** işaretli olsun
4. **"Start the MySQL Server at System Startup"** işaretli olsun
5. **Kurulumu tamamla**

### 3. Servis Çalışıyor mu Kontrol Et

PowerShell:
```powershell
Get-Service MySQL80
```

**"Running"** görünmeli. Değilse:
```powershell
Start-Service MySQL80
```

### 4. Veritabanını Oluştur

**Kolay Yol:**
```batch
veritabani-olustur-kolay.bat
```

**Manuel:**
```powershell
cd "C:\Users\aliba\Desktop\projects\bahcelerbaglar\nesil-bahce-baglar"
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
Get-Content server\config\db-init.sql | & $mysqlExe -u root -p
```
(Şifre istenecek → Kurulum sırasında belirlediğiniz şifreyi girin)

### 5. .env Dosyasını Güncelle

`server/.env` dosyası:
```env
DB_PASSWORD=KURULUM_SIRASINDA_BELİRLEDİĞİNİZ_ŞİFRE
```

### 6. Backend'i Test Et

```powershell
npm run dev:server
```

**Başarılı mesaj:**
```
✅ MySQL Database connected successfully
Server is running on port 3001
```

## ✅ Kontrol Listesi

- [ ] MySQL Installer açıldı
- [ ] Kurulum sihirbazı tamamlandı
- [ ] Root şifresi belirlendi (not alındı)
- [ ] MySQL servisi çalışıyor (MySQL80)
- [ ] Veritabanı oluşturuldu (nesil_bahce_baglar)
- [ ] Tablolar oluşturuldu (admins, volunteers, vb.)
- [ ] server/.env dosyası güncellendi (DB_PASSWORD)
- [ ] Backend server bağlanabildi

## 🆘 Sorun mu Var?

**"MySQL Installer bulunamadı"**
→ Windows tuşu → "MySQL Installer" yaz → Aç

**"Servis başlatılamadı"**
→ Hizmetler (services.msc) → MySQL80 → Başlat

**"Access denied"**
→ .env dosyasındaki şifreyi kontrol et

**"Unknown database"**
→ veritabani-olustur-kolay.bat çalıştır

