# 🔥 Tüm Portlara İzin Veren Firewall Kuralı (GUI)

Google Cloud Console'dan tüm instance'lara uygulanan firewall kuralı oluşturun.

## 📋 Adımlar:

### 1. Google Cloud Console'a gidin
- https://console.cloud.google.com

### 2. VPC Network > Firewall'a gidin
- Sol menüden **VPC network** > **Firewall** seçin
- Veya arama çubuğuna "firewall" yazın
- Link: https://console.cloud.google.com/networking/firewalls

### 3. CREATE FIREWALL RULE butonuna tıklayın

### 4. HTTP (Port 80) Kuralı için aşağıdaki bilgileri girin:

**Name:** 
```
allow-http-all
```

**Description:**
```
Allow HTTP traffic to all instances
```

**Network:**
```
default
```

**Priority:**
```
1000
```

**Direction of traffic:**
```
Ingress (gelen trafik)
```

**Action on match:**
```
Allow
```

**Targets:**
```
All instances in the network
```
⚠️ **ÖNEMLİ:** Tag seçmeyin, direkt "All instances in the network" seçin!

**Source IP ranges:**
```
0.0.0.0/0
```
(Bu tüm IP'lerden erişime izin verir)

**Protocols and ports:**
- **tcp** seçin
- **80** yazın
- Veya **Specified protocols and ports** seçip `tcp:80` yazın

### 5. CREATE butonuna tıklayın

### 6. (İsteğe Bağlı) HTTPS (Port 443) Kuralı için tekrar CREATE FIREWALL RULE:

**Name:**
```
allow-https-all
```

**Description:**
```
Allow HTTPS traffic to all instances
```

**Network:**
```
default
```

**Priority:**
```
1000
```

**Direction of traffic:**
```
Ingress
```

**Action on match:**
```
Allow
```

**Targets:**
```
All instances in the network
```

**Source IP ranges:**
```
0.0.0.0/0
```

**Protocols and ports:**
- **tcp** seçin
- **443** yazın

### 7. CREATE butonuna tıklayın

## ✅ Kontrol

Firewall kuralı oluşturulduktan sonra:

1. **Firewall kuralları listesinde** `allow-http-all` kuralını görmelisiniz
2. **Status** kolonu **Enabled** olmalı
3. **Targets** kolonu **All instances in the network** olmalı (tag yok)

## 🧪 Test

Kural oluşturulduktan sonra birkaç saniye bekleyin ve test edin:

### Sunucudan:
```bash
curl http://localhost/api/health
```

### Harici bilgisayardan veya Cloud Shell'den:
```bash
curl http://34.136.39.171/api/health
```

### Tarayıcıdan:
```
http://34.136.39.171
```

## 📝 Notlar

- Firewall kuralları değişiklikleri birkaç saniye içinde etkili olur
- "All instances in the network" seçeneği tüm VM instance'lara uygulanır (tag gerekmez)
- `0.0.0.0/0` tüm IP adreslerinden erişime izin verir (production'da daha kısıtlayıcı olabilirsiniz)
- Priority değeri düşük olan kurallar önce uygulanır (1000 iyi bir değer)

## 🔒 Güvenlik Notu

Production ortamında:
- Sadece ihtiyacınız olan portlara izin verin
- Source IP ranges'i mümkün olduğunca kısıtlayın
- HTTPS (443) kullanarak SSL/TLS etkinleştirin

