# 🏷️ VM Instance Tags Düzeltme

`default-allow-http` firewall kuralı `http-server` tag'ine sahip instance'lara uygulanıyor. VM instance'ınıza bu tag'i eklemeniz gerekiyor.

## Yöntem 1: Google Cloud Console (GUI)

### Adımlar:

1. **Google Cloud Console**'a gidin:
   - https://console.cloud.google.com

2. **Compute Engine** > **VM instances** bölümüne gidin:
   - Sol menüden **Compute Engine** > **VM instances** seçin
   - Veya arama çubuğuna "vm instances" yazın

3. **VM instance'ınızı bulun:**
   - `instance-template-20251116-20251116-213918` adlı instance'ı bulun

4. **Instance'a tıklayın** (adına tıklayın)

5. **EDIT** butonuna tıklayın (sayfanın üst kısmında)

6. **Network tags** bölümünü bulun:
   - Sayfayı aşağı kaydırın
   - **Networking** bölümünde **Network tags** kısmını bulun

7. **Network tags** alanına şunu ekleyin:
   ```
   http-server
   ```
   - Varsa mevcut tag'lerin yanına ekleyin
   - Her tag'i ayrı satıra yazın

8. **SAVE** butonuna tıklayın

9. **VM instance yeniden başlatılacak** (birkaç saniye sürebilir)

10. Yeniden başladıktan sonra tekrar deneyin:
    ```bash
    curl http://34.136.39.171/api/health
    ```

## Yöntem 2: Cloud Shell / gcloud CLI

### VM instance'ı bulun:
```bash
# VM instance listesini göster
gcloud compute instances list

# VM instance adını not edin (örnek: instance-template-20251116-20251116-213918)
```

### Tag'leri ekleyin:
```bash
# VM instance'a http-server tag'ini ekle
gcloud compute instances add-tags INSTANCE_NAME \
    --tags http-server \
    --zone ZONE_NAME

# Örnek:
gcloud compute instances add-tags instance-template-20251116-20251116-213918 \
    --tags http-server \
    --zone us-central1-a
```

### Zone bilgisini bulma:
```bash
# VM instance'ın zone'unu bul
gcloud compute instances describe INSTANCE_NAME \
    --format="get(zone)"

# Örnek:
gcloud compute instances describe instance-template-20251116-20251116-213918 \
    --format="get(zone)"
```

## Yöntem 3: Alternatif - Yeni Firewall Kuralı Oluşturma

Eğer tag eklemek istemiyorsanız, tüm instance'lara uygulanan yeni bir kural oluşturabilirsiniz:

### Cloud Shell'den:
```bash
gcloud compute firewall-rules create allow-http-all \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP traffic to all instances" \
    --direction INGRESS \
    --target-tags "" \
    --priority 1000
```

### GUI'den:
1. **VPC Network** > **Firewall** > **CREATE FIREWALL RULE**
2. **Name:** `allow-http-all`
3. **Direction:** **Ingress**
4. **Action:** **Allow**
5. **Targets:** **All instances in the network** (tag seçmeyin)
6. **Source IP ranges:** `0.0.0.0/0`
7. **Protocols and ports:** **tcp:80**
8. **CREATE**

## ✅ Tag Kontrolü

Tag eklendikten sonra kontrol edin:

```bash
# VM instance'ın tag'lerini göster
gcloud compute instances describe INSTANCE_NAME \
    --format="get(tags.items)" \
    --zone ZONE_NAME
```

## 🧪 Test

Tag eklendikten sonra birkaç saniye bekleyin ve test edin:

```bash
# Sunucudan
curl http://localhost/api/health

# Harici erişim
curl http://34.136.39.171/api/health

# Tarayıcıdan
http://34.136.39.171
```

## 📝 Notlar

- VM instance tag'leri eklediğinizde instance kısa bir süre yeniden başlatılabilir
- Firewall kuralları tag'lere göre çalışır - VM'iniz ilgili tag'e sahip olmalı
- `default-allow-http` kuralı varsayılan olarak `http-server` tag'ine uygulanır
- Alternatif olarak tüm instance'lara uygulanan yeni bir kural oluşturabilirsiniz

