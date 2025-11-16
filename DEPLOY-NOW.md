# 🚀 Sunucuda Deployment - Adım Adım

Sunucuda SSH ile bağlıyken bu komutları sırayla çalıştırın:

## 1️⃣ Proje Dosyalarını Hazırla

Yerel bilgisayarınızda (Windows PowerShell):

```powershell
cd C:\Users\aliba\Desktop\projects\bahcelerbaglar\nesil-bahce-baglar
# Dosyaları zip'le
Compress-Archive -Path * -DestinationPath ../nesil-bahce-baglar.zip -Force
```

Sonra zip'i sunucuya yükleyin. Sunucuda:

```bash
# Sunucuda zip'i indirmek için (curl veya wget ile)
# Veya local'den SCP ile:
# scp nesil-bahce-baglar.zip alibahadirkus@34.136.39.171:~/

# Sunucuda zip'i aç
cd ~
unzip nesil-bahce-baglar.zip -d nesil-bahce-baglar
cd nesil-bahce-baglar
```

## 2️⃣ Deployment Script'i Çalıştır

```bash
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

## 3️⃣ Proje Dizinine Taşı

```bash
sudo mkdir -p /var/www/nesil-bahce-baglar
sudo cp -r ~/nesil-bahce-baglar/* /var/www/nesil-bahce-baglar/
sudo chown -R alibahadirkus:alibahadirkus /var/www/nesil-bahce-baglar
cd /var/www/nesil-bahce-baglar
```

## 4️⃣ MySQL Setup

```bash
chmod +x setup-mysql.sh
./setup-mysql.sh
```

MySQL root şifresini girdiğinizde script devam edecek.

## 5️⃣ Environment Variables

```bash
cd server
cp .env.production.example .env
nano .env
```

Aşağıdaki değerleri doldurun (Ctrl+X, Y, Enter ile kaydedin):

```env
DB_HOST=localhost
DB_USER=nesil_bahce_user
DB_PASSWORD=buraya_oluşturduğunuz_şifre
DB_NAME=nesil_bahce_baglar

PORT=3001
NODE_ENV=production
BASE_URL=http://34.136.39.171
FRONTEND_URL=http://34.136.39.171

JWT_SECRET=güvenli-rasgele-32-karakterlik-şifre-buraya-örnek-12345678901234567890
```

## 6️⃣ Build ve PM2 Başlat

```bash
cd /var/www/nesil-bahce-baglar

# Bağımlılıkları yükle
npm ci

# TypeScript build
npx tsc --project tsconfig.server.json --outDir dist-server

# Frontend build
npm run build:prod

# PM2 başlat
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 7️⃣ Nginx Config

```bash
sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx test
sudo nginx -t

# Nginx restart
sudo systemctl reload nginx
```

## 8️⃣ Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable
```

## 9️⃣ Kontrol

```bash
# PM2 durumu
pm2 status

# Logs
pm2 logs

# Test
curl http://localhost:3001/api/health
```

## ✅ Tamamlandı!

Tarayıcınızdan: `http://34.136.39.171` adresine gidin!

---

**Not:** Eğer komutları çalıştırmakta yardıma ihtiyacınız varsa, her adımı tek tek yapabiliriz.

