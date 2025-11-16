#!/bin/bash

# Tüm instance'lara uygulanan HTTP firewall kuralı oluştur
# Cloud Shell'de çalıştırın

echo "🔥 Tüm instance'lara uygulanan HTTP firewall kuralı oluşturuluyor..."
echo ""

# HTTP için tüm instance'lara uygulanan kural
echo "📋 HTTP (Port 80) kuralı oluşturuluyor..."
gcloud compute firewall-rules create allow-http-all \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP traffic to all instances" \
    --direction INGRESS \
    --priority 1000 \
    --network default 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ HTTP firewall kuralı oluşturuldu!"
else
    echo "⚠️  Kural zaten var veya hata oluştu. Kontrol ediliyor..."
    gcloud compute firewall-rules describe allow-http-all 2>/dev/null
fi
echo ""

# HTTPS için tüm instance'lara uygulanan kural (isteğe bağlı)
echo "📋 HTTPS (Port 443) kuralı oluşturuluyor..."
gcloud compute firewall-rules create allow-https-all \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTPS traffic to all instances" \
    --direction INGRESS \
    --priority 1000 \
    --network default 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ HTTPS firewall kuralı oluşturuldu!"
else
    echo "⚠️  Kural zaten var veya hata oluştu."
fi
echo ""

# Oluşturulan kuralları listele
echo "📊 Oluşturulan Firewall Kuralları:"
gcloud compute firewall-rules list --filter="name~allow-http-all OR name~allow-https-all"
echo ""

echo "✅ Tamamlandı!"
echo ""
echo "🧪 Test:"
echo "Birkaç saniye bekleyin ve şunu deneyin:"
echo "  curl http://34.136.39.171/api/health"
echo ""
echo "Tarayıcıdan:"
echo "  http://34.136.39.171"

