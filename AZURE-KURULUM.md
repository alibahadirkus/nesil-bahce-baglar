# 🚀 Azure Ubuntu 22.04 Kurulum Talimatları

## SSH Bağlantısı

Azure VM bilgileriniz:
- **IP:** 20.120.180.80
- **Kullanıcı:** azureuser
- **Şifre:** Deneme123!!!

## Kurulum Adımları

### 1. SSH ile Bağlanın

Windows PowerShell veya Command Prompt'tan:

```powershell
ssh azureuser@20.120.180.80
```

Şifreyi girdikten sonra terminal açılacak.

### 2. Sunucuda Kurulum Scriptini Çalıştırın

SSH bağlantısı kurulduktan sonra, aşağıdaki komutları sırayla çalıştırın:

```bash
# Script'i indir ve çalıştırılabilir yap
cd /tmp
wget https://raw.githubusercontent.com/alibahadirkus/nesil-bahce-baglar/main/deploy-azure.sh
# VEYA GitHub'dan clone yapın:
# git clone https://github.com/alibahadirkus/nesil-bahce-baglar.git
# cd nesil-bahce-baglar

chmod +x deploy-azure.sh
bash deploy-azure.sh
```

**VEYA** GitHub'dan direkt clone yapıp kurulum yapın:

```bash
# Proje dizini oluştur
sudo mkdir -p /var/www/bahcelerbaglar
sudo chown -R $USER:$USER /var/www/bahcelerbaglar

# GitHub'dan clone
cd /var/www/bahcelerbaglar
git clone https://github.com/alibahadirkus/nesil-bahce-baglar.git .
cd nesil-bahce-baglar

# Script'i çalıştırılabilir yap
chmod +x deploy-azure.sh
bash deploy-azure.sh
```

### 3. MySQL Root Şifresi Ayarlama

Script sizden MySQL root şifresi isteyecek. İlk kurulumda şifre yoksa:

```bash
sudo mysql
```

MySQL'e girdikten sonra:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Deneme123!!!';
FLUSH PRIVILEGES;
EXIT;
```

Sonra script'i tekrar çalıştırın.

### 4. Environment Variables (.env) Ayarlama

Script çalıştıktan sonra `.env` dosyasını düzenleyin:

```bash
nano /var/www/bahcelerbaglar/nesil-bahce-baglar/server/.env
```

Aşağıdaki değerleri doldurun:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=bahcelerbaglar
DB_PASSWORD=Deneme123!!!
DB_NAME=bahcelerbaglar
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=production
BASE_URL=http://20.120.180.80

# Frontend URL
FRONTEND_URL=http://20.120.180.80

# JWT Secret (zaten oluşturulmuş olacak, değiştirmeyin)

# SMS Provider (opsiyonel - şimdilik boş bırakabilirsiniz)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# WhatsApp (opsiyonel)
WHATSAPP_ENABLED=false
```

**Kaydetmek için:** `Ctrl+X`, sonra `Y`, sonra `Enter`

### 5. Azure Network Security Group (NSG) Ayarları

Azure Portal'da:
1. VM'inizin **Network Security Group** ayarlarına gidin
2. **Inbound rules** ekleyin:
   - **Port 80** (HTTP) - Source: Any
   - **Port 443** (HTTPS - SSL ekleyecekseniz) - Source: Any
   - **Port 22** (SSH - zaten açık olmalı)

### 6. Servisleri Başlatma

Script otomatik olarak başlatacak, ama kontrol etmek için:

```bash
# PM2 durumu
pm2 status

# Logları görüntüle
pm2 logs

# Servisleri yeniden başlat
pm2 restart all
```

### 7. Veritabanı Şemasını Kontrol

Veritabanının doğru kurulduğunu kontrol edin:

```bash
mysql -u root -pDeneme123!!! -e "SHOW DATABASES;"
mysql -u root -pDeneme123!!! -e "USE bahcelerbaglar; SHOW TABLES;"
```

## ✅ Kurulum Tamamlandı!

Tarayıcınızdan şu adrese gidin:
**http://20.120.180.80**

## 🔄 Güncelleme

Projeyi güncellemek için:

```bash
cd /var/www/bahcelerbaglar/nesil-bahce-baglar
git pull origin main
npm install
npm run build
pm2 restart all
```

## 🆘 Sorun Giderme

### PM2 Servisleri Çalışmıyor

```bash
pm2 delete all
cd /var/www/bahcelerbaglar/nesil-bahce-baglar
pm2 start npm --name "bahcelerbaglar-backend" -- run start:server
cd dist
pm2 serve . 8080 --name "bahcelerbaglar-frontend" --spa
pm2 save
```

### Nginx Hata Veriyor

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx
```

### MySQL Bağlantı Sorunu

```bash
sudo systemctl restart mysql
sudo systemctl status mysql
```

## 📝 Önemli Notlar

1. **Güvenlik:** Production ortamında güçlü şifreler kullanın
2. **SSL:** Let's Encrypt ile SSL sertifikası ekleyin (Certbot kullanabilirsiniz)
3. **Firewall:** Azure NSG kullanıyorsanız, local ufw'yi kapatabilirsiniz
4. **Backup:** Düzenli olarak veritabanı yedekleri alın

---

**Başarılar! 🎉**

