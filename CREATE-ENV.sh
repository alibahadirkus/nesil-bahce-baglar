#!/bin/bash

# .env dosyası oluşturma script'i
# Sunucuda çalıştırın

cd /var/www/nesil-bahce-baglar/server

if [ -f ".env" ]; then
    echo "⚠️  .env dosyası zaten var!"
    read -p "Üzerine yazmak istiyor musunuz? (y/N): " answer
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
        echo "İptal edildi."
        exit 0
    fi
fi

echo "📝 .env dosyası oluşturuluyor..."

cat > .env << 'EOF'
# Production Environment Variables
# Bu dosyayı düzenleyin ve değerleri doldurun

# Database Configuration
DB_HOST=localhost
DB_USER=nesil_bahce_user
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_NAME=nesil_bahce_baglar

# Server Configuration
PORT=3001
NODE_ENV=production
BASE_URL=http://34.136.39.171
FRONTEND_URL=http://34.136.39.171

# JWT Configuration
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_32_CHARACTERS_MINIMUM_12345678901234567890

# SMS Provider (optional - WhatsApp kullanıyorsanız gerekmez)
SMS_PROVIDER=mock
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
EOF

echo "✅ .env dosyası oluşturuldu!"
echo ""
echo "⚠️  ŞİMDİ AŞAĞIDAKI DEĞERLERI DÜZENLEMELİSİNİZ:"
echo "1. DB_PASSWORD - MySQL şifresi"
echo "2. JWT_SECRET - Güvenli rastgele şifre"
echo ""
echo "Düzenlemek için:"
echo "nano /var/www/nesil-bahce-baglar/server/.env"

