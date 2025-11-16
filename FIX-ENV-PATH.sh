#!/bin/bash

# .env dosyasını doğru yere kopyala
# Sunucuda çalıştırın

PROJECT_DIR="/var/www/nesil-bahce-baglar"
ENV_FILE="$PROJECT_DIR/server/.env"
DIST_ENV_FILE="$PROJECT_DIR/dist-server/.env"

echo "🔧 .env dosyası path'i düzeltiliyor..."

# .env dosyası var mı?
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env dosyası bulunamadı: $ENV_FILE"
    echo "💡 Lütfen önce .env dosyasını oluşturun:"
    echo "   cd $PROJECT_DIR/server"
    echo "   cp .env.example .env"
    echo "   nano .env"
    exit 1
fi

# dist-server dizini var mı?
if [ ! -d "$PROJECT_DIR/dist-server" ]; then
    echo "⚠️  dist-server dizini bulunamadı, oluşturuluyor..."
    mkdir -p "$PROJECT_DIR/dist-server"
fi

# .env dosyasını dist-server'a kopyala
echo "📋 .env dosyası kopyalanıyor: $ENV_FILE -> $DIST_ENV_FILE"
cp "$ENV_FILE" "$DIST_ENV_FILE"

# İzinleri kontrol et
chmod 600 "$DIST_ENV_FILE"

echo "✅ .env dosyası kopyalandı!"
echo ""

# .env dosyasının içeriğini kontrol et (şifre hariç)
echo "📋 .env dosyası içeriği (şifre gizli):"
grep -v "^DB_PASSWORD=" "$DIST_ENV_FILE" | grep "^DB_"
echo "DB_PASSWORD=*** (ayarlandı)"

echo ""
echo "🔄 PM2 servisleri yeniden başlatılıyor..."
cd "$PROJECT_DIR"

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

