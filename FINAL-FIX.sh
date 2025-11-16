#!/bin/bash

# Son düzeltmeler: .env güncelle + Puppeteer kur + PM2 restart
# Sunucuda çalıştırın

PROJECT_DIR="/var/www/nesil-bahce-baglar"
ENV_FILE="$PROJECT_DIR/server/.env"

echo "🔧 Son düzeltmeler yapılıyor..."

# 1. .env dosyasını güncelle (DB_USER=root, DB_PASSWORD=root)
if [ -f "$ENV_FILE" ]; then
    echo "📝 .env dosyası güncelleniyor..."
    sed -i 's/^DB_USER=.*/DB_USER=root/' "$ENV_FILE"
    sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=root/' "$ENV_FILE"
    sed -i 's/^DB_NAME=.*/DB_NAME=nesil_bahce_baglar/' "$ENV_FILE"
    echo "✅ .env dosyası güncellendi"
else
    echo "❌ .env dosyası bulunamadı! Lütfen manuel oluşturun."
    exit 1
fi

# 2. Puppeteer bağımlılıklarını kur
echo ""
echo "📦 Puppeteer/Chromium bağımlılıkları kuruluyor..."
sudo apt-get update -qq
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils > /dev/null 2>&1

echo "✅ Puppeteer bağımlılıkları kuruldu"

# 3. PM2 servislerini restart et
echo ""
echo "🔄 PM2 servisleri yeniden başlatılıyor..."
cd "$PROJECT_DIR"
pm2 restart all

echo ""
echo "✅ Tamamlandı!"
echo ""
echo "📊 Durum kontrolü:"
pm2 status
echo ""
echo "📋 Son loglar (30 satır):"
pm2 logs --lines 30 --nostream

echo ""
echo "🌐 Test:"
echo "curl http://localhost:3001/api/health"
curl -s http://localhost:3001/api/health || echo "❌ Backend yanıt vermiyor"

