# 🔥 Google Cloud Firewall Kurulumu

Sunucuya dışarıdan erişim için Google Cloud Firewall kurallarını kontrol edin.

## 📋 Gerekli Firewall Kuralları

### 1. Google Cloud Console'dan:

1. **Google Cloud Console**'a gidin: https://console.cloud.google.com
2. **VPC Network** > **Firewall** bölümüne gidin
3. Aşağıdaki kuralların olduğundan emin olun:

#### HTTP (Port 80)
- **Ad:** `allow-http` veya `default-allow-http`
- **Yön:** Gelen (Ingress)
- **Kaynak IP aralıkları:** `0.0.0.0/0` (tüm IP'ler)
- **Protokoller ve portlar:** `tcp:80`
- **Hedef:** Tüm örnekler

#### HTTPS (Port 443) - İsteğe bağlı
- **Ad:** `allow-https` veya `default-allow-https`
- **Yön:** Gelen (Ingress)
- **Kaynak IP aralıkları:** `0.0.0.0/0`
- **Protokoller ve portlar:** `tcp:443`
- **Hedef:** Tüm örnekler

### 2. gcloud CLI ile (Sunucuda):

```bash
# HTTP için
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP traffic" \
    --direction INGRESS

# HTTPS için
gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTPS traffic" \
    --direction INGRESS
```

### 3. Mevcut kuralları kontrol etme:

```bash
gcloud compute firewall-rules list --filter="name~allow-http OR name~default-allow-http"
```

## 🔍 Sorun Giderme

### Port 80 kapalıysa:

1. **Google Cloud Console**'da Firewall kurallarını kontrol edin
2. HTTP trafiğine izin veren bir kural oluşturun
3. Veya mevcut bir kuralı düzenleyin

### Nginx çalışmıyorsa:

```bash
sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Backend çalışmıyorsa:

```bash
pm2 status
pm2 restart all
pm2 logs --lines 30
```

## ✅ Test

Sunucudan:
```bash
curl http://localhost/api/health
```

Harici bilgisayardan:
```bash
curl http://34.136.39.171/api/health
```

Tarayıcıdan:
```
http://34.136.39.171
```

## 📝 Notlar

- Google Cloud VM'lerde varsayılan olarak bazı portlar kapalı olabilir
- Firewall kuralları proje seviyesinde uygulanır
- Değişikliklerin etkin olması birkaç saniye sürebilir
- Backend (3001) ve Frontend (8080) portları sadece localhost'tan erişilebilir olmalı (güvenlik)

