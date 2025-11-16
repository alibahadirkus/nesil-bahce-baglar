# 🚀 Google Cloud Deployment - Hızlı Başlangıç

## ⚡ Hızlı Deployment (5 Dakika)

### 1. Sunucuya Bağlanın
```bash
ssh username@your-server-ip
```

### 2. Projeyi Sunucuya Gönderin

**Seçenek A: Git ile (Önerilen)**
```bash
cd /var/www
sudo git clone YOUR_REPO_URL nesil-bahce-baglar
sudo chown -R $USER:$USER nesil-bahce-baglar
cd nesil-bahce-baglar
```

**Seçenek B: SCP ile (Yerel bilgisayarınızdan)**
```bash
scp -r nesil-bahce-baglar username@your-server-ip:/var/www/
```

### 3. Deployment Script'i Çalıştırın
```bash
cd /var/www/nesil-bahce-baglar
chmod +x deploy.sh
./deploy.sh
```

### 4. MySQL Setup
```bash
chmod +x setup-mysql.sh
./setup-mysql.sh
```

### 5. Environment Variables
```bash
cd server
cp .env.production.example .env
nano .env
# Gerekli değerleri doldurun
```

### 6. Nginx Config
```bash
sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-available/nesil-bahce-baglar
# server_name _; satırını domain'inizle değiştirin
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL (Opsiyonel)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📋 Checklist

- [ ] Node.js kuruldu (v20+)
- [ ] MySQL kuruldu ve çalışıyor
- [ ] Nginx kuruldu ve çalışıyor
- [ ] PM2 kuruldu
- [ ] .env dosyası oluşturuldu ve dolduruldu
- [ ] Veritabanı oluşturuldu
- [ ] Proje build edildi
- [ ] PM2 servisleri başlatıldı
- [ ] Nginx config aktif
- [ ] Firewall ayarları yapıldı
- [ ] SSL sertifikası kuruldu (opsiyonel)

## 🔄 Güncelleme

Hızlı güncelleme için:
```bash
cd /var/www/nesil-bahce-baglar
chmod +x quick-deploy.sh
./quick-deploy.sh
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
```

## 🆘 Sorun Giderme

Detaylı bilgi için `DEPLOYMENT.md` dosyasına bakın.

## 📝 Önemli Notlar

- WhatsApp session dosyaları `whatsapp-session/` klasöründe saklanır
- Upload dosyaları `server/uploads/` klasöründe saklanır
- Log dosyaları `/var/log/nesil-bahce/` klasöründe
- Düzenli backup yapmayı unutmayın!

---

**Başarılar! 🎉**

