# MySQL Kurulumu - Manuel Adımlar

MySQL Installer bulunamadıysa, şu adımları izleyin:

## Yöntem 1: Başlat Menüsünden Aç

1. **Windows tuşuna basın**
2. **"MySQL"** veya **"MySQL Installer"** yazın
3. **"MySQL Installer - Community"** veya benzer bir uygulama görünecek
4. **Tıklayarak açın**

## Yöntem 2: Dosya Gezgini ile Bul

1. **Dosya Gezgini'ni açın**
2. Şu konumlara bakın:
   - `C:\Program Files\MySQL\`
   - `C:\Program Files (x86)\MySQL\`
   - `C:\ProgramData\MySQL\`
3. **"MySQL Installer for Windows"** klasörünü bulun
4. **"MySQLInstallerCommunity.exe"** dosyasını çift tıklayın

## Yöntem 3: MySQL Kurulumu Yeniden Yap

Eğer installer hiç yoksa:

```powershell
winget install Oracle.MySQL
```

Kurulumdan sonra installer otomatik açılacaktır.

## Yöntem 4: Command Line ile Kurulum (Gelişmiş)

Eğer installer bulamazsanız, komut satırından MySQL'i yapılandırabilirsiniz:

### 1. MySQL Binary'yi Bul

```powershell
Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysqld.exe" | Select-Object -First 1
```

### 2. MySQL Servisini Yapılandır

```powershell
# MySQL binary yolunu bul (yukarıdaki komuttan)
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin"

# Servis olarak yükle
& "$mysqlPath\mysqld.exe" --install MySQL80

# Servisi başlat
net start MySQL80

# Root şifresini ayarla (ilk kurulum için)
& "$mysqlPath\mysql.exe" -u root --skip-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'YeniSifre123';"
```

**UYARI:** Bu yöntem teknik bilgi gerektirir. Installer kullanmak daha kolaydır.

## Kurulum Sihirbazı Adımları (Installer Açıldıktan Sonra)

1. **"Reconfigure"** veya **"Add"** butonuna tıklayın
2. **Root şifresi belirleyin** (ÖNEMLİ: Not alın!)
   - Örnek: `root123` veya daha güçlü bir şifre
3. **"Configure MySQL Server as a Windows Service"** işaretli olmalı
4. **"Start the MySQL Server at System Startup"** işaretli olmalı
5. Kurulumu tamamlayın

## Hızlı Test

Kurulum tamamlandıktan sonra:

```powershell
# Servis çalışıyor mu?
Get-Service MySQL80

# MySQL'e bağlan (şifre istenecek)
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p
```

## Sorun Giderme

### "MySQL Installer bulunamadı"
- Winget ile yeniden kur: `winget install Oracle.MySQL`
- Veya MySQL resmi sitesinden indir: https://dev.mysql.com/downloads/installer/

### "Servis kurulmadı"
- Installer'da "Configure MySQL Server as a Windows Service" seçeneğini işaretlediğinizden emin olun
- Veya manuel olarak servis ekleyin (yukarıdaki Yöntem 4)

### "Başlat menüsünde yok"
- Kurulum tamamlanmamış olabilir
- Winget ile yeniden kurun veya installer'ı manuel olarak bulun

