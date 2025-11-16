# MySQL Kurulumunu Tamamlama

MySQL başarıyla kuruldu, ancak kurulum sihirbazını tamamlamanız ve servisi başlatmanız gerekiyor.

## Adım 1: MySQL Kurulum Sihirbazını Tamamla

1. **Başlat menüsünde "MySQL Installer" veya "MySQL" arayın**
2. **MySQL Installer'ı açın**
3. **"Reconfigure" veya kurulum sihirbazını çalıştırın**
4. **Root şifresi belirleyin** (unutmayın!)
5. **Servisi başlat seçeneğini işaretleyin**
6. **Kurulumu tamamlayın**

## Adım 2: MySQL Servisini Başlat

### Yöntem 1: Hizmetler Üzerinden

1. `Win + R` tuşlarına basın
2. `services.msc` yazın ve Enter'a basın
3. **"MySQL80"** veya **"MySQL"** servisini bulun
4. **Sağ tıklayın** → **"Başlat"** veya **"Start"**

### Yöntem 2: PowerShell ile

```powershell
Start-Service MySQL80
```

Eğer servis adı farklıysa:
```powershell
Get-Service | Where-Object { $_.DisplayName -like "*MySQL*" }
```

## Adım 3: Veritabanını Oluştur

MySQL servisi başladıktan sonra:

### Kolay Yol (Batch Script):
Proje klasöründe `veritabani-olustur-kolay.bat` dosyasını çift tıklayın ve çalıştırın.

### Manuel Yol:

1. **PowerShell'i yönetici olarak açın**
2. **Aşağıdaki komutu çalıştırın:**

```powershell
cd "C:\Users\aliba\Desktop\projects\bahcelerbaglar\nesil-bahce-baglar"
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"

# Veritabanını oluştur
& $mysqlExe -u root -p -e "CREATE DATABASE IF NOT EXISTS nesil_bahce_baglar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Tabloları oluştur
Get-Content server\config\db-init.sql | & $mysqlExe -u root -p nesil_bahce_baglar
```

Şifre istenecek, kurulum sırasında belirlediğiniz şifreyi girin.

## Adım 4: .env Dosyasını Güncelle

`server/.env` dosyasını açın ve şifrenizi ekleyin:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=KURULUM_SIRASINDA_BELİRLEDİĞİNİZ_ŞİFRE
DB_NAME=nesil_bahce_baglar

PORT=3001
BASE_URL=http://localhost:3001

JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Adım 5: Kontrol Et

Veritabanının oluşturulduğunu kontrol edin:

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

## Sorun Giderme

### "Can't connect to MySQL server"
- MySQL servisi çalışmıyor
- Hizmetler uygulamasından servisi başlatın

### "Access denied for user 'root'"
- Şifre yanlış
- MySQL Installer'dan şifreyi sıfırlayın veya kurulumu yeniden yapın

### "mysql komutu bulunamadı"
- PowerShell'i yeniden başlatın (PATH güncellenmesi için)
- Veya tam yolu kullanın: `"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"`

## Hızlı Test

Veritabanı oluşturulduktan sonra backend server'ı başlatın:

```powershell
npm run dev:server
```

Başarılı olursa şu mesajı göreceksiniz:
```
MySQL Database connected successfully
Server is running on port 3001
```

