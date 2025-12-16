# 🚀 Azure VM'ye SSH ile Kurulum

## Windows PowerShell'den SSH Bağlantısı

### 1. SSH ile Bağlanın

PowerShell'i açın ve şu komutu çalıştırın:

```powershell
ssh azureuser@20.120.180.80
```

Şifre sorduğunda: `Deneme123!!!`

### 2. Sunucuda Kurulum Scriptini Çalıştırın

SSH bağlantısı kurulduktan sonra (sunucuda), şu komutları çalıştırın:

```bash
# Hızlı kurulum scriptini indir
cd /tmp
wget -O azure-kurulum.sh https://raw.githubusercontent.com/alibahadirkus/nesil-bahce-baglar/main/azure-kurulum-hizli.sh

# Çalıştırılabilir yap
chmod +x azure-kurulum.sh

# Kurulumu başlat
bash azure-kurulum.sh
```

**VEYA** GitHub'dan direkt clone yapın:

```bash
# Proje dizini oluştur
sudo mkdir -p /var/www/bahcelerbaglar
sudo chown -R $USER:$USER /var/www/bahcelerbaglar

# GitHub'dan clone
cd /var/www/bahcelerbaglar
git clone https://github.com/alibahadirkus/nesil-bahce-baglar.git .
cd nesil-bahce-baglar

# Hızlı kurulum scriptini çalıştır
chmod +x azure-kurulum-hizli.sh
bash azure-kurulum-hizli.sh
```

## ✅ Kurulum Tamamlandıktan Sonra

Tarayıcınızdan şu adrese gidin:
**http://20.120.180.80**

## 📊 Durum Kontrolü

Sunucuda şu komutları çalıştırabilirsiniz:

```bash
# PM2 durumu
pm2 status

# Logları görüntüle
pm2 logs

# Servisleri yeniden başlat
pm2 restart all
```

## 🔄 Projeyi Güncelleme

```bash
cd /var/www/bahcelerbaglar/nesil-bahce-baglar
git pull origin main
npm install
npm run build
pm2 restart all
```

