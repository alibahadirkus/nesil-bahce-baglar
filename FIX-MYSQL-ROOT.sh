#!/bin/bash

# MySQL Root Bağlantı Sorunu Çözümü
# Sunucuda çalıştırın

echo "🔧 MySQL Root bağlantı sorunu çözülüyor..."

# MySQL root şifresini al
read -sp "MySQL root şifresini girin: " ROOT_PASSWORD
echo

# Root kullanıcısının authentication method'unu kontrol et ve düzelt
mysql -u root -p"$ROOT_PASSWORD" <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$ROOT_PASSWORD';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo "✅ MySQL root kullanıcısı düzeltildi!"
    echo ""
    echo "⚠️  Şimdi .env dosyasında DB_USER=root ve DB_PASSWORD=şifreniz olduğundan emin olun"
else
    echo "❌ Hata oluştu! Lütfen şifreyi kontrol edin."
fi

