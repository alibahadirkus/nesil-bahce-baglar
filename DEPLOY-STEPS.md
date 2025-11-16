# 🚀 Deployment Adımları - Sunucuda Çalıştırın

Sunucuda aşağıdaki komutları **sırayla** çalıştırın:

## 1️⃣ Proje Dizinine Git

```bash
cd /var/www/nesil-bahce-baglar
```

## 2️⃣ Deployment Script'ini Çalıştır

```bash
chmod +x deploy-from-github.sh
./deploy-from-github.sh
```

Bu script şunları yapacak:
- Node.js kurulumu (varsa geçer)
- PM2 kurulumu (varsa geçer)
- MySQL kurulumu
- Nginx kurulumu
- Bağımlılıkları yükleme
- Build işlemleri
- Servisleri başlatma

## 3️⃣ MySQL Setup (Deployment Script Sonrası)

```bash
cd /var/www/nesil-bahce-baglar
chmod +x setup-mysql.sh
./setup-mysql.sh
```

MySQL root şifresini girdiğinizde script devam edecek.

## 4️⃣ Environment Variables Oluştur

```bash
cd /var/www/nesil-bahce-baglar/server
cp .env.production.example .env
nano .env
```

Aşağıdaki değerleri doldurun:

```env
DB_HOST=localhost
DB_USER=nesil_bahce_user
DB_PASSWORD=buraya_oluşturduğunuz_şifre
DB_NAME=nesil_bahce_baglar

PORT=3001
NODE_ENV=production
BASE_URL=http://34.136.39.171
FRONTEND_URL=http://34.136.39.171

JWT_SECRET=güvenli-rasgele-32-karakterlik-şifre-buraya-12345678901234567890
```

**Ctrl+X, Y, Enter** ile kaydedin.

## 5️⃣ Nginx Config Aktif Et

```bash
cd /var/www/nesil-bahce-baglar
sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx test
sudo nginx -t

# Nginx restart
sudo systemctl reload nginx
```

## 6️⃣ PM2 Servislerini Başlat

```bash
cd /var/www/nesil-bahce-baglar
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 7️⃣ Kontrol

```bash
# PM2 durumu
pm2 status

# Backend health
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:8080 -I

# Logs
pm2 logs --lines 30
```

## 8️⃣ Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable
```

---

**Hata alırsanız logları kontrol edin:**
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u mysql -n 50
```

