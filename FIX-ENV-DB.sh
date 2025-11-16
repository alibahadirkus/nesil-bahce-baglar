#!/bin/bash

# .env dosyasını kontrol et ve düzelt
# Sunucuda çalıştırın

PROJECT_DIR="/var/www/nesil-bahce-baglar"
ENV_FILE="$PROJECT_DIR/server/.env"

echo "🔧 .env dosyası kontrol ediliyor ve düzeltiliyor..."

# .env dosyası var mı?
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env dosyası bulunamadı! Oluşturuluyor..."
    if [ -f "$PROJECT_DIR/server/.env.example" ]; then
        cp "$PROJECT_DIR/server/.env.example" "$ENV_FILE"
        echo "✅ .env dosyası .env.example'dan oluşturuldu"
    else
        echo "❌ .env.example dosyası da bulunamadı!"
        exit 1
    fi
fi

# Şifreyi al
read -sp "MySQL root şifresini girin: " DB_PASSWORD
echo

# .env dosyasını güncelle
echo "📝 .env dosyası güncelleniyor..."
sed -i "s/^DB_HOST=.*/DB_HOST=localhost/" "$ENV_FILE"
sed -i "s/^DB_USER=.*/DB_USER=root/" "$ENV_FILE"
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" "$ENV_FILE"
sed -i "s/^DB_NAME=.*/DB_NAME=nesil_bahce_baglar/" "$ENV_FILE"

echo "✅ .env dosyası güncellendi"
echo ""

# .env dosyasının son halini göster (şifre hariç)
echo "📋 .env dosyası içeriği (şifre gizli):"
grep -v "^DB_PASSWORD=" "$ENV_FILE" | grep "DB_"
echo "DB_PASSWORD=*** (ayarlandı)"

echo ""
echo "🔄 PM2 servisleri yeniden başlatılıyor..."
cd "$PROJECT_DIR"

# PM2'yi tamamen durdur ve yeniden başlat
pm2 delete all 2>/dev/null || true
sleep 2
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "⏳ 5 saniye bekleniyor..."
sleep 5

echo ""
echo "📊 Durum kontrolü:"
pm2 status

echo ""
echo "📋 Backend logları (son 20 satır):"
pm2 logs nesil-bahce-backend --lines 20 --nostream

echo ""
echo "✅ Tamamlandı!"
echo ""
echo "🌐 Test:"
echo "curl http://localhost:3001/api/health"
curl -s http://localhost:3001/api/health || echo "❌ Backend yanıt vermiyor"

