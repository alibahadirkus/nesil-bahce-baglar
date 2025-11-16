#!/bin/bash

# .env dosyasının doğru yerde olduğunu ve içeriğini kontrol et
# Sunucuda çalıştırın

PROJECT_DIR="/var/www/nesil-bahce-baglar"
ENV_FILE="$PROJECT_DIR/server/.env"
DIST_ENV_FILE="$PROJECT_DIR/dist-server/.env"

echo "🔍 .env dosyası kontrol ediliyor..."
echo ""

# 1. server/.env var mı?
if [ -f "$ENV_FILE" ]; then
    echo "✅ $ENV_FILE bulundu"
    echo "📋 İçerik (şifre hariç):"
    grep -v "^DB_PASSWORD=" "$ENV_FILE" | grep "^DB_" || echo "⚠️  DB_ ile başlayan satır bulunamadı"
    echo "DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2 | cut -c1-3)*** (gizli)"
    echo ""
else
    echo "❌ $ENV_FILE bulunamadı!"
    exit 1
fi

# 2. dist-server/.env var mı?
if [ -f "$DIST_ENV_FILE" ]; then
    echo "✅ $DIST_ENV_FILE bulundu"
    echo "📋 İçerik (şifre hariç):"
    grep -v "^DB_PASSWORD=" "$DIST_ENV_FILE" | grep "^DB_" || echo "⚠️  DB_ ile başlayan satır bulunamadı"
    echo "DB_PASSWORD=$(grep "^DB_PASSWORD=" "$DIST_ENV_FILE" | cut -d'=' -f2 | cut -c1-3)*** (gizli)"
    echo ""
else
    echo "❌ $DIST_ENV_FILE bulunamadı!"
    echo "💡 Kopyalanıyor..."
    if [ ! -d "$PROJECT_DIR/dist-server" ]; then
        mkdir -p "$PROJECT_DIR/dist-server"
    fi
    cp "$ENV_FILE" "$DIST_ENV_FILE"
    chmod 600 "$DIST_ENV_FILE"
    echo "✅ Kopyalandı!"
    echo ""
fi

# 3. .env dosyalarının içeriği aynı mı?
if [ -f "$ENV_FILE" ] && [ -f "$DIST_ENV_FILE" ]; then
    if cmp -s "$ENV_FILE" "$DIST_ENV_FILE"; then
        echo "✅ İki .env dosyası aynı"
    else
        echo "⚠️  .env dosyaları farklı! Güncelleniyor..."
        cp "$ENV_FILE" "$DIST_ENV_FILE"
        chmod 600 "$DIST_ENV_FILE"
        echo "✅ Güncellendi!"
    fi
fi

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
echo "📊 PM2 Durumu:"
pm2 status

echo ""
echo "📋 Backend logları (son 30 satır):"
pm2 logs nesil-bahce-backend --lines 30 --nostream

echo ""
echo "✅ Kontrol tamamlandı!"

