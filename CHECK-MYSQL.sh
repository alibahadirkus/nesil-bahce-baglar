#!/bin/bash

# MySQL bağlantı testi
# Sunucuda çalıştırın

echo "🔍 MySQL bağlantı testi..."

read -sp "MySQL root şifresini girin: " ROOT_PASSWORD
echo

echo "📊 Veritabanı bağlantısı test ediliyor..."
mysql -u root -p"$ROOT_PASSWORD" -e "SELECT 1 as test;" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MySQL bağlantısı başarılı!"
    echo ""
    echo "📊 Veritabanları:"
    mysql -u root -p"$ROOT_PASSWORD" -e "SHOW DATABASES;"
    echo ""
    echo "📊 Kullanıcılar:"
    mysql -u root -p"$ROOT_PASSWORD" -e "SELECT user, host FROM mysql.user WHERE user='root';"
    echo ""
    echo "⚠️  Şimdi .env dosyasında şu değerleri kullanın:"
    echo "DB_USER=root"
    echo "DB_PASSWORD=$ROOT_PASSWORD"
else
    echo ""
    echo "❌ MySQL bağlantısı başarısız!"
    echo ""
    echo "💡 Çözüm:"
    echo "1. MySQL root şifresini kontrol edin"
    echo "2. Veya yeni bir kullanıcı oluşturun:"
    echo "   mysql -u root -p'$ROOT_PASSWORD' -e \"CREATE USER 'nesil_user'@'localhost' IDENTIFIED BY 'şifre'; GRANT ALL ON nesil_bahce_baglar.* TO 'nesil_user'@'localhost';\""
fi

