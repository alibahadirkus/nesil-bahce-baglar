# 🔧 Sunucuda Hızlı Düzeltme Komutları

Sunucuda aşağıdaki komutları **sırayla** çalıştırın:

## 1️⃣ Puppeteer Bağımlılıklarını Kur (WhatsApp için)

```bash
cd /var/www/nesil-bahce-baglar
chmod +x INSTALL-PUPPETEER-DEPS.sh
./INSTALL-PUPPETEER-DEPS.sh
```

VEYA manuel:

```bash
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
```

## 2️⃣ MySQL Root Bağlantısını Düzelt

```bash
cd /var/www/nesil-bahce-baglar
chmod +x FIX-MYSQL-ROOT.sh
./FIX-MYSQL-ROOT.sh
```

MySQL root şifresini girdiğinizde script düzeltecek.

VEYA manuel:

```bash
# MySQL'e bağlan
sudo mysql

# MySQL içinde şu komutları çalıştırın:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```

## 3️⃣ .env Dosyasını Kontrol Et

```bash
cd /var/www/nesil-bahce-baglar/server
nano .env
```

Şu değerlerin doğru olduğundan emin olun:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mysql_root_şifreniz
DB_NAME=nesil_bahce_baglar
```

**Ctrl+X, Y, Enter** ile kaydedin.

## 4️⃣ PM2 Servislerini Yeniden Başlat

```bash
cd /var/www/nesil-bahce-baglar
pm2 restart all
pm2 logs --lines 30
```

## 5️⃣ Kontrol

```bash
pm2 status
curl http://localhost:3001/api/health
curl http://localhost:8080 -I

# Logs kontrol
pm2 logs --lines 30
```

## ✅ Tamamlandı!

Tarayıcıdan: **http://34.136.39.171** adresine gidin!

---

**Hata devam ederse:**

```bash
# Database test
mysql -u root -p -e "SELECT 1;"

# WhatsApp hatası için
pm2 logs nesil-bahce-backend --lines 50
```

