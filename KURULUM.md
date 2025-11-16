# MySQL Veritabanı Kurulum Kılavuzu

## 1. MySQL Yüklü mü Kontrol Edin

Windows PowerShell'de:
```powershell
mysql --version
```

Eğer MySQL yüklü değilse, [MySQL İndirme Sayfası](https://dev.mysql.com/downloads/mysql/) üzerinden indirebilirsiniz.

## 2. MySQL'i Başlatın

Windows'ta MySQL genellikle otomatik başlar. Kontrol etmek için:

**Hizmetler üzerinden:**
1. `Win + R` tuşlarına basın
2. `services.msc` yazın ve Enter'a basın
3. "MySQL" veya "MySQL80" servisini bulun
4. Durumu "Çalışıyor" olmalı. Değilse "Başlat" butonuna tıklayın

**Veya PowerShell ile:**
```powershell
Get-Service -Name "*mysql*"
Start-Service -Name "MySQL80"  # Servis adınız farklı olabilir
```

## 3. MySQL'e Bağlanın

```powershell
mysql -u root -p
```

Şifrenizi girmeniz istenecek. Eğer şifre yoksa, sadece Enter'a basın.

## 4. Veritabanını Oluşturun

### Yöntem 1: SQL Dosyasını Çalıştırma (Önerilen)

**MySQL içinde:**
```sql
source server/config/db-init.sql
```

**Veya PowerShell'den doğrudan:**
```powershell
mysql -u root -p < server/config/db-init.sql
```

### Yöntem 2: Manuel Olarak

MySQL komut satırında:

```sql
-- Veritabanı oluştur
CREATE DATABASE IF NOT EXISTS nesil_bahce_baglar 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Veritabanını kullan
USE nesil_bahce_baglar;

-- Admin tablosu
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gönüllüler tablosu
CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  welcome_sms_sent BOOLEAN DEFAULT FALSE,
  welcome_sms_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS mesajları tablosu
CREATE TABLE IF NOT EXISTS sms_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id INT,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(500),
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Yüklenen resimler tablosu
CREATE TABLE IF NOT EXISTS uploaded_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  url VARCHAR(500) NOT NULL,
  size INT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Link içerikleri tablosu
CREATE TABLE IF NOT EXISTS link_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_ids TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Varsayılan admin kullanıcısı (username: admin, password: admin123)
INSERT INTO admins (username, password_hash, email) 
VALUES ('admin', '$2a$10$H8Yk6z0s77kwJAkNfDD7dehJB0INCQsMZ4zOl5yJe4R.LApEqvXIO', 'admin@example.com')
ON DUPLICATE KEY UPDATE username=username;
```

## 5. Veritabanını Kontrol Edin

```sql
SHOW DATABASES;
USE nesil_bahce_baglar;
SHOW TABLES;
SELECT * FROM admins;
```

## 6. .env Dosyasını Kontrol Edin

`server/.env` dosyasının şu şekilde olduğundan emin olun:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=nesil_bahce_baglar

PORT=3001
BASE_URL=http://localhost:3001

JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Önemli:** `DB_PASSWORD` alanını MySQL root şifrenizle değiştirin. Eğer şifre yoksa boş bırakabilirsiniz (ama önerilmez).

## 7. Backend Server'ı Yeniden Başlatın

Veritabanı oluşturduktan sonra backend server'ı yeniden başlatın:

```powershell
npm run dev:server
```

## Sık Karşılaşılan Sorunlar

### "Access denied for user 'root'@'localhost'"
- MySQL şifreniz yanlış olabilir
- `server/.env` dosyasındaki `DB_PASSWORD` değerini kontrol edin

### "Unknown database 'nesil_bahce_baglar'"
- Veritabanı oluşturulmamış
- Yukarıdaki adımları tekrar uygulayın

### "Table doesn't exist"
- SQL dosyası tam çalıştırılmamış
- `USE nesil_bahce_baglar;` komutunu çalıştırdığınızdan emin olun

## Hızlı Kurulum Script'i

Eğer MySQL şifreniz yoksa (boş şifre):

```powershell
mysql -u root < server/config/db-init.sql
```

Şifre varsa:

```powershell
mysql -u root -p < server/config/db-init.sql
```

