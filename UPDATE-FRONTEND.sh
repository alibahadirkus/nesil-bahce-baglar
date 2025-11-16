#!/bin/bash

# Frontend'i güncelle ve yeniden build et
# Sunucuda çalıştırın

PROJECT_DIR="/var/www/nesil-bahce-baglar"

echo "🔄 Frontend güncelleniyor..."
echo ""

cd "$PROJECT_DIR"

# 1. Git pull
echo "📥 Git'ten güncellemeler çekiliyor..."
git pull origin main

# 2. Frontend build
echo "🏗️  Frontend build ediliyor..."
npm run build:prod

# 3. Build başarılı mı kontrol et
if [ $? -eq 0 ]; then
    echo "✅ Frontend build başarılı!"
else
    echo "❌ Frontend build başarısız!"
    exit 1
fi

# 4. PM2 frontend servisini restart et
echo "🔄 PM2 frontend servisi yeniden başlatılıyor..."
pm2 restart nesil-bahce-frontend

# 5. Kontrol
echo ""
echo "⏳ 3 saniye bekleniyor..."
sleep 3

echo ""
echo "📊 PM2 Durumu:"
pm2 status

echo ""
echo "✅ Frontend güncellendi!"
echo ""
echo "🧪 Test:"
echo "Tarayıcıdan: http://34.136.39.171"
echo ""

