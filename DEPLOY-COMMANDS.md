# 🚀 Deployment Komutları (Sunucuda Çalıştırılacak)

Sunucuya SSH ile bağlandıktan sonra bu komutları sırayla çalıştırın:

## 1️⃣ Proje Dosyalarını Sunucuya Aktarın

Yerel bilgisayarınızdan (Windows PowerShell veya Git Bash):

```bash
cd nesil-bahce-baglar
scp -r . alibahadirkus@34.136.39.171:/home/alibahadirkus/nesil-bahce-baglar
```

VEYA Git ile (önerilen):

```bash
# Sunucuda:
cd /home/alibahadirkus
git clone YOUR_REPO_URL nesil-bahce-baglar
```

## 2️⃣ Sunucuya Bağlanın

```bash
ssh alibahadirkus@34.136.39.171
```

## 3️⃣ Proje Dizinine Gidin

```bash
cd /home/alibahadirkus/nesil-bahce-baglar
```

## 4️⃣ Deployment Script'i Çalıştırın

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

## 5️⃣ Proje Dizini İzinlerini Ayarlayın

```bash
sudo mkdir -p /var/www/nesil-bahce-baglar
sudo cp -r /home/alibahadirkus/nesil-bahce-baglar/* /var/www/nesil-bahce-baglar/
sudo chown -R alibahadirkus:alibahadirkus /var/www/nesil-bahce-baglar
cd /var/www/nesil-bahce-baglar
```

## 6️⃣ MySQL Setup

```bash
chmod +x setup-mysql.sh
./setup-mysql.sh
```

MySQL root şifresini girdiğinizde script devam edecek.

## 7️⃣ Environment Variables

```bash
cd server
cp .env.production.example .env
nano .env
```

Aşağıdaki değerleri doldurun ve kaydedin (Ctrl+X, Y, Enter):

```env
DB_HOST=localhost
DB_USER=nesil_bahce_user
DB_PASSWORD=buraya_oluşturduğunuz_şifre
DB_NAME=nesil_bahce_baglar

PORT=3001
NODE_ENV=production
BASE_URL=http://34.136.39.171
FRONTEND_URL=http://34.136.39.171

JWT_SECRET=güvenli-rasgele-32-karakterlik-şifre-buraya
```

## 8️⃣ Build ve PM2 Başlat

```bash
cd /var/www/nesil-bahce-baglar

# Bağımlılıkları yükle
npm ci

# Build
npx tsc --project tsconfig.server.json --outDir dist-server
npm run build:prod

# PM2 başlat
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 9️⃣ Nginx Config

```bash
sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Varsayılan config'i kaldır

# Nginx test
sudo nginx -t

# Nginx restart
sudo systemctl reload nginx
```

## 🔟 Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable
```

## 1️⃣1️⃣ Kontrol

```bash
# PM2 durumu
pm2 status

# Logs
pm2 logs

# Nginx durumu
sudo systemctl status nginx

# MySQL durumu
sudo systemctl status mysql

# Test
curl http://localhost:3001/api/health
```

---

**Tüm adımları tamamladıktan sonra:**

Tarayıcınızdan: `http://34.136.39.171` adresine gidin!

Sorun olursa logları kontrol edin:
- `pm2 logs`
- `sudo tail -f /var/log/nginx/error.log`

