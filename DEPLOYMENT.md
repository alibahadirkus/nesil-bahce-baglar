# 🚀 Google Cloud Server Deployment Kılavuzu

Bu kılavuz, Nesil Bahçe Bağlar projesini Google Cloud üzerindeki bir Ubuntu sunucusuna deploy etmek için adım adım talimatlar içerir.

## 📋 Gereksinimler

- Google Cloud'da Ubuntu 20.04+ sunucu
- Root/sudo yetkileri
- Domain adı (opsiyonel, ancak SSL için önerilir)
- SSH erişimi

## 🔧 Adım 1: Sunucuya Bağlanma

```bash
ssh username@your-server-ip
```

## 📦 Adım 2: Proje Dosyalarını Sunucuya Gönderme

### Seçenek 1: Git ile (Önerilen)

```bash
# Git kurulumu (yoksa)
sudo apt-get update
sudo apt-get install -y git

# Projeyi klonla
cd /var/www
sudo git clone YOUR_REPO_URL nesil-bahce-baglar
sudo chown -R $USER:$USER nesil-bahce-baglar
cd nesil-bahce-baglar
```

### Seçenek 2: SCP ile

Yerel bilgisayarınızdan:

```bash
scp -r nesil-bahce-baglar username@your-server-ip:/var/www/
```

## 🔨 Adım 3: Deployment Script'i Çalıştırma

```bash
cd /var/www/nesil-bahce-baglar
chmod +x deploy.sh
./deploy.sh
```

Bu script otomatik olarak:
- Node.js ve npm kurulumu yapar
- PM2 kurulumu yapar
- MySQL kurulumu yapar (varsa geçer)
- Nginx kurulumu yapar (varsa geçer)
- Proje bağımlılıklarını yükler
- Projeyi build eder
- Servisleri başlatır

## 🗄️ Adım 4: MySQL Kurulumu ve Yapılandırması

### MySQL Kurulumu (deploy.sh ile yapıldıysa atlayın)

```bash
sudo apt-get install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### MySQL Güvenlik Ayarları

```bash
sudo mysql_secure_installation
```

VEYA direkt root şifresi ayarlama:

```bash
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```

### Veritabanı Setup

```bash
cd /var/www/nesil-bahce-baglar
chmod +x setup-mysql.sh
./setup-mysql.sh
```

Veya manuel:

```bash
mysql -u root -p < server/config/db-init.sql
mysql -u root -p < server/config/db-update.sql
```

## ⚙️ Adım 5: Environment Variables Ayarlama

```bash
cd /var/www/nesil-bahce-baglar/server
cp .env.production.example .env
nano .env
```

Gerekli değerleri doldurun:

```env
DB_HOST=localhost
DB_USER=nesil_bahce_user
DB_PASSWORD=your_password
DB_NAME=nesil_bahce_baglar

PORT=3001
NODE_ENV=production
BASE_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

JWT_SECRET=your-very-secure-random-secret-key-min-32-chars
```

## 🌐 Adım 6: Nginx Yapılandırması

### Nginx Config'i Aktif Et

```bash
sudo cp /var/www/nesil-bahce-baglar/nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
```

### Domain adını güncelle

```bash
sudo nano /etc/nginx/sites-available/nesil-bahce-baglar
# server_name _; satırını domain'inizle değiştirin
```

### Nginx Test ve Restart

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Adım 7: SSL Sertifikası (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Otomatik yenileme:

```bash
sudo certbot renew --dry-run
```

## 🚀 Adım 8: Servisleri Başlatma

### PM2 ile Başlat

```bash
cd /var/www/nesil-bahce-baglar
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Systemd ile otomatik başlatma için
```

### Servis Durumunu Kontrol Et

```bash
pm2 status
pm2 logs
```

## 🔥 Adım 9: Firewall Ayarları

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 📊 Adım 10: Monitoring ve Logs

### PM2 Monitoring

```bash
pm2 monit
```

### Logs

```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/nesil-bahce-access.log
sudo tail -f /var/log/nginx/nesil-bahce-error.log

# Application logs
tail -f /var/log/nesil-bahce/backend.log
tail -f /var/log/nesil-bahce/frontend.log
```

## 🔄 Güncelleme (Update) İşlemi

```bash
cd /var/www/nesil-bahce-baglar

# Git ile güncelle
git pull origin main

# Bağımlılıkları yükle
npm ci

# Build
npx tsc --project tsconfig.server.json --outDir dist-server
npm run build:prod

# PM2 restart
pm2 restart all
```

## 🛠️ Troubleshooting

### Port Kullanımda Hatası

```bash
sudo lsof -i :3001
sudo kill -9 PID
```

### MySQL Bağlantı Hatası

```bash
sudo systemctl status mysql
sudo systemctl restart mysql
mysql -u root -p -e "SHOW DATABASES;"
```

### Nginx Hatası

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### PM2 Restart

```bash
pm2 restart all
pm2 delete all
pm2 start ecosystem.config.cjs
```

## 📝 Önemli Notlar

1. **WhatsApp Session**: `whatsapp-session` klasörü için yeterli disk alanı olduğundan emin olun
2. **Uploads**: `/server/uploads` klasörüne yazma yetkisi verildiğinden emin olun
3. **Logs**: Log dosyalarının disk alanını doldurmaması için log rotation kurulumu yapın
4. **Backup**: Düzenli veritabanı yedeklemesi yapın:

```bash
# Backup script
mysqldump -u root -p nesil_bahce_baglar > backup_$(date +%Y%m%d).sql
```

## 🔐 Güvenlik Önerileri

1. Firewall'u aktif tutun
2. SSH için key-based authentication kullanın
3. .env dosyasının izinlerini kısıtlayın: `chmod 600 server/.env`
4. Düzenli güncellemeler yapın: `sudo apt-get update && sudo apt-get upgrade`
5. Fail2ban kurulumu yapın: `sudo apt-get install fail2ban`

## 📞 Destek

Sorun yaşarsanız log dosyalarını kontrol edin ve hata mesajlarını kaydedin.

---

**Başarılı deployment'lar! 🎉**

