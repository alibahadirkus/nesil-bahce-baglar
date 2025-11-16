# 🚀 GitHub'dan Deployment - Hızlı Kılavuz

Bu kılavuz, projeyi GitHub'dan çekerek Google Cloud sunucusuna deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

- Google Cloud'da Ubuntu 20.04+ sunucu
- SSH erişimi
- Sudo yetkileri

## ⚡ Hızlı Deployment (3 Adım)

### 1️⃣ Google Cloud Console'dan SSH Açın

1. [Google Cloud Console](https://console.cloud.google.com/compute/instances) → Compute Engine → VM instances
2. Sunucunuzu seçin (34.136.39.171)
3. **"SSH"** butonuna tıklayın (tarayıcıda terminal açılır)

### 2️⃣ Deployment Script'ini Çalıştırın

Sunucuda terminal açıldıktan sonra:

```bash
# Proje dizinini oluştur
sudo mkdir -p /var/www/nesil-bahce-baglar

# Script'i GitHub'dan indir (veya clone yap)
cd /tmp
sudo git clone https://github.com/alibahadirkus/nesil-bahce-baglar.git
cd nesil-bahce-baglar

# Script'i çalıştırılabilir yap
chmod +x deploy-from-github.sh

# Deployment'ı başlat
sudo ./deploy-from-github.sh
```

**VEYA** direkt clone yapıp script'i çalıştırın:

```bash
# Direkt clone ve deploy
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/alibahadirkus/nesil-bahce-baglar.git nesil-bahce-baglar
cd nesil-bahce-baglar
sudo chown -R $USER:$USER .
chmod +x deploy-from-github.sh
./deploy-from-github.sh
```

### 3️⃣ Son Yapılandırmalar

#### MySQL Setup

```bash
cd /var/www/nesil-bahce-baglar
chmod +x setup-mysql.sh
./setup-mysql.sh
```

MySQL root şifresini girdiğinizde script devam edecek.

#### Environment Variables

```bash
cd /var/www/nesil-bahce-baglar/server
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

JWT_SECRET=güvenli-rasgele-32-karakterlik-şifre-buraya-12345678901234567890
```

#### Nginx Config

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

#### Servisleri Yeniden Başlat

```bash
cd /var/www/nesil-bahce-baglar
pm2 restart all
pm2 save
```

## ✅ Tamamlandı!

Tarayıcınızdan: **http://34.136.39.171** adresine gidin!

## 🔄 Güncelleme

Projeyi güncellemek için:

```bash
cd /var/www/nesil-bahce-baglar
chmod +x quick-deploy.sh
./quick-deploy.sh
```

VEYA manuel:

```bash
cd /var/www/nesil-bahce-baglar
git pull origin main
npm ci
npx tsc --project tsconfig.server.json --outDir dist-server
npm run build:prod
pm2 restart all
```

## 📊 Durum Kontrolü

```bash
# PM2 durumu
pm2 status

# Logs
pm2 logs

# MySQL durumu
sudo systemctl status mysql

# Nginx durumu
sudo systemctl status nginx

# API health check
curl http://localhost:3001/api/health
```

## 🆘 Sorun Giderme

### Port Kullanımda

```bash
sudo lsof -i :3001
sudo kill -9 PID
```

### MySQL Bağlantı Hatası

```bash
sudo systemctl restart mysql
mysql -u root -p -e "SHOW DATABASES;"
```

### PM2 Restart

```bash
pm2 restart all
pm2 delete all
cd /var/www/nesil-bahce-baglar
pm2 start ecosystem.config.cjs
pm2 save
```

---

**Başarılar! 🎉**

