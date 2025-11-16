# 🔍 Deployment Durum Kontrolü

Sunucuda aşağıdaki komutları çalıştırarak deployment durumunu kontrol edin:

## 1️⃣ Servis Durumları

```bash
# PM2 durumu
pm2 status

# PM2 logları
pm2 logs --lines 50

# MySQL durumu
sudo systemctl status mysql

# Nginx durumu
sudo systemctl status nginx
```

## 2️⃣ Port Kontrolü

```bash
# Port 3001 (Backend) kontrolü
curl http://localhost:3001/api/health

# Port 8080 (Frontend) kontrolü
curl http://localhost:8080

# Dışarıdan erişim kontrolü
curl http://34.136.39.171/api/health
```

## 3️⃣ Dosya Kontrolü

```bash
# Proje dizini
ls -la /var/www/nesil-bahce-baglar

# Build dosyaları
ls -la /var/www/nesil-bahce-baglar/dist-server
ls -la /var/www/nesil-bahce-baglar/dist

# .env dosyası
cat /var/www/nesil-bahce-baglar/server/.env
```

## 4️⃣ Veritabanı Kontrolü

```bash
# MySQL bağlantı testi
mysql -u root -p -e "SHOW DATABASES;"

# Veritabanı var mı?
mysql -u root -p -e "USE nesil_bahce_baglar; SHOW TABLES;"
```

## 5️⃣ Hata Giderme

### PM2 Servisleri Çalışmıyorsa:

```bash
cd /var/www/nesil-bahce-baglar
pm2 delete all
pm2 start ecosystem.config.cjs
pm2 save
pm2 logs
```

### Nginx Çalışmıyorsa:

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### MySQL Bağlantı Hatası:

```bash
sudo systemctl restart mysql
cd /var/www/nesil-bahce-baglar
./setup-mysql.sh
```

### .env Dosyası Yoksa:

```bash
cd /var/www/nesil-bahce-baglar/server
cp .env.production.example .env
nano .env
# Değerleri doldurun
```

## 6️⃣ Nginx Config Aktif Değilse:

```bash
cd /var/www/nesil-bahce-baglar
sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 7️⃣ Tam Kontrol Script'i

```bash
cd /var/www/nesil-bahce-baglar

echo "=== PM2 Status ==="
pm2 status

echo "=== Backend Health ==="
curl http://localhost:3001/api/health || echo "Backend çalışmıyor!"

echo "=== Frontend Status ==="
curl http://localhost:8080 -I | head -1 || echo "Frontend çalışmıyor!"

echo "=== MySQL Status ==="
sudo systemctl status mysql --no-pager | head -3

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager | head -3

echo "=== .env File ==="
ls -la server/.env || echo ".env dosyası yok!"
```

