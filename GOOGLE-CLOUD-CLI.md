# 🌐 Google Cloud CLI Kullanımı

## Yöntem 1: Google Cloud Console - Cloud Shell (Önerilen)

### Adımlar:

1. **Google Cloud Console**'a gidin:
   - https://console.cloud.google.com

2. **Cloud Shell**'i açın:
   - Sayfanın üst kısmında sağda **>_** (Terminal) ikonuna tıklayın
   - Veya **Ctrl + Shift + `** tuş kombinasyonunu kullanın

3. **Cloud Shell** otomatik olarak açılacak:
   - Gcloud CLI zaten kurulu ve yapılandırılmış olacak
   - Projeniz otomatik olarak seçili olacak

4. **Firewall kuralını oluşturun:**
   ```bash
   gcloud compute firewall-rules create allow-http \
       --allow tcp:80 \
       --source-ranges 0.0.0.0/0 \
       --description "Allow HTTP traffic" \
       --direction INGRESS
   ```

## Yöntem 2: Sunucuda gcloud CLI Kurulumu

### Sunucuda gcloud CLI kurulu mu kontrol et:
```bash
gcloud --version
```

### Eğer kurulu değilse:

#### Ubuntu/Debian için:
```bash
# Google Cloud CLI repository'sini ekle
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Gerekli paketleri yükle
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Güncelle ve yükle
sudo apt-get update && sudo apt-get install google-cloud-cli

# Giriş yap (browser'da açılacak)
gcloud auth login

# Projeyi seç
gcloud config set project YOUR_PROJECT_ID
```

## Yöntem 3: Google Cloud Console - Firewall Arayüzü (CLI Olmadan)

### GUI ile Firewall Kuralı Oluşturma:

1. **Google Cloud Console**'a gidin:
   - https://console.cloud.google.com

2. **VPC Network** > **Firewall** bölümüne gidin:
   - Sol menüden **VPC network** > **Firewall** seçin
   - Veya arama çubuğuna "firewall" yazın

3. **CREATE FIREWALL RULE** butonuna tıklayın

4. **Aşağıdaki bilgileri girin:**
   - **Name:** `allow-http`
   - **Description:** `Allow HTTP traffic`
   - **Network:** `default` (veya kullanmak istediğiniz network)
   - **Priority:** `1000` (varsayılan)
   - **Direction of traffic:** **Ingress**
   - **Action on match:** **Allow**
   - **Targets:** **All instances in the network**
   - **Source IP ranges:** `0.0.0.0/0`
   - **Protocols and ports:** **tcp** ve **80** portunu seçin

5. **CREATE** butonuna tıklayın

6. **Kural oluşturulduğunda**, birkaç saniye bekleyin ve tekrar deneyin

## ✅ Firewall Kuralını Kontrol Etme

### Cloud Shell veya gcloud CLI ile:
```bash
# Tüm firewall kurallarını listele
gcloud compute firewall-rules list

# Özel kural kontrolü
gcloud compute firewall-rules describe allow-http
```

### Google Cloud Console'dan:
- **VPC Network** > **Firewall** sayfasında kuralların listesini görebilirsiniz
- `allow-http` kuralının **Status** kolonunda **Enabled** olduğundan emin olun

## 🧪 Test

Firewall kuralını oluşturduktan sonra:

```bash
# Sunucudan (bu zaten çalışmalı)
curl http://localhost/api/health

# Harici bilgisayardan veya Cloud Shell'den
curl http://34.136.39.171/api/health

# Tarayıcıdan
http://34.136.39.171
```

## 📝 Notlar

- Firewall kuralları değişiklikleri birkaç saniye içinde etkili olur
- Google Cloud varsayılan olarak bazı portları kapalı tutar
- HTTP (80) ve HTTPS (443) trafiğine izin vermek için firewall kuralları gereklidir
- Backend (3001) ve Frontend (8080) portları sadece localhost'tan erişilebilir olmalı (güvenlik)

## 🔗 Hızlı Linkler

- **Google Cloud Console:** https://console.cloud.google.com
- **VPC Network > Firewall:** https://console.cloud.google.com/networking/firewalls
- **Cloud Shell:** https://console.cloud.google.com/?cloudshell=true

