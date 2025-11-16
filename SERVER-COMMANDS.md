# 🚀 Sunucuda Çalıştırılacak Komutlar

Sunucuda aşağıdaki komutları **sırayla** çalıştırın:

## 1️⃣ Güncellemeleri Çek

```bash
cd /var/www/nesil-bahce-baglar
git pull origin main
```

## 2️⃣ Log Dizini Oluştur

```bash
mkdir -p logs
chmod 755 logs
```

## 3️⃣ .env Dosyası Oluştur (MySQL Setup'tan sonra otomatik oluşur ama manuel de yapabilirsiniz)

```bash
cd server
cp .env.example .env
nano .env
```

**ÖNEMLİ:** Şu değerleri doldurun:
- `DB_PASSWORD` - MySQL setup sırasında oluşturduğunuz şifre
- `JWT_SECRET` - Güvenli 32+ karakterlik rastgele şifre

## 4️⃣ Nginx Config Güncelle

```bash
cd /var/www/nesil-bahce-baglar
sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar
sudo rm -f /etc/nginx/sites-enabled/nesil-bahce-baglar
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 5️⃣ PM2 Servislerini Başlat

```bash
cd /var/www/nesil-bahce-baglar
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
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
pm2 logs --lines 20
```

## ✅ Tamamlandı!

Tarayıcınızdan: **http://34.136.39.171** adresine gidin!

---

**Hata alırsanız:**
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
sudo journalctl -xeu nginx
```

