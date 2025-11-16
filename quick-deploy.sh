#!/bin/bash

# Hızlı Deployment Script
# Sunucuda proje klasöründe çalıştırın

set -e

PROJECT_DIR="/var/www/nesil-bahce-baglar"
cd $PROJECT_DIR

echo "🔄 Hızlı güncelleme başlıyor..."

# Git pull
echo "📥 Git güncelleniyor..."
git fetch origin
git reset --hard origin/main || git pull origin main || echo "⚠️  Git pull başarısız, devam ediliyor..."

# Bağımlılıklar
echo "📦 Bağımlılıklar yükleniyor..."
npm ci --production=false

# Build
echo "🔨 Build ediliyor..."
npx tsc --project tsconfig.server.json --outDir dist-server
npm run build:prod

# PM2 restart
echo "🚀 Servisler yeniden başlatılıyor..."
pm2 restart all

echo "✅ Güncelleme tamamlandı!"
pm2 status

