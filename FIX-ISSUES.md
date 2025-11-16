# 🔧 Sunucuda Hızlı Düzeltme Komutları

Sunucuda aşağıdaki komutları **sırayla** çalıştırın:

## 1️⃣ GitHub'dan Güncellemeleri Çek

```bash
cd /var/www/nesil-bahce-baglar
git pull origin main
```

## 2️⃣ Log Dizini Oluştur ve İzinleri Ayarla

```bash
cd /var/www/nesil-bahce-baglar
mkdir -p logs
chmod 755 logs
```

## 3️⃣ .env Dosyası Oluştur

```bash
cd /var/www/nesil-bahce-baglar/server

cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=nesil_bahce_user
DB_PASSWORD=buraya_mysql_şifreniz
DB_NAME=nesil_bahce_baglar

PORT=3001
NODE_ENV=production
BASE_URL=http://34.136.39.171
FRONTEND_URL=http://34.136.39.171

JWT_SECRET=buraya-güvenli-32-karakterlik-şifre-12345678901234567890

SMS_PROVIDER=mock
EOF

# Şimdi düzenleyin:
nano .env
```

**DB_PASSWORD** ve **JWT_SECRET** değerlerini değiştirin, kaydedin (Ctrl+X, Y, Enter).

## 4️⃣ Nginx Config'i Güncelle

```bash
cd /var/www/nesil-bahce-baglar
sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar
sudo rm -f /etc/nginx/sites-enabled/nesil-bahce-baglar
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test
sudo nginx -t

# Restart
sudo systemctl reload nginx
```

## 5️⃣ PM2 Servislerini Başlat

```bash
cd /var/www/nesil-bahce-baglar

# Önce log dizinini oluştur
mkdir -p logs

# PM2 başlat
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 6️⃣ Kontrol

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

## ✅ Tamamlandı!

Tarayıcınızdan: **http://34.136.39.171** adresine gidin!

---

**Sorun olursa:**
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

