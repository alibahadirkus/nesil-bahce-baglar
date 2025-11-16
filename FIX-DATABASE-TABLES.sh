#!/bin/bash

# Database tablolarını kontrol et ve oluştur
# Sunucuda çalıştırın

PROJECT_DIR="/var/www/nesil-bahce-baglar"
DB_USER="root"
DB_PASSWORD="root"
DB_NAME="nesil_bahce_baglar"

echo "🔧 Database tabloları kontrol ediliyor..."
echo ""

# 1. Database bağlantısı test
echo "🧪 Database Bağlantı Testi:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1 as test;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Database bağlantısı başarısız!"
    echo "💡 Şifreyi kontrol edin veya şifreyi girin:"
    read -sp "MySQL root şifresini girin: " DB_PASSWORD
    echo
fi

# 2. Students tablosu var mı?
echo "📊 Students Tablosu Kontrolü:"
STUDENTS_EXISTS=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES LIKE 'students';" 2>/dev/null | grep -c students)

if [ "$STUDENTS_EXISTS" -eq 0 ]; then
    echo "⚠️  Students tablosu bulunamadı, oluşturuluyor..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$PROJECT_DIR/server/config/db-update.sql" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Students tablosu oluşturuldu!"
    else
        echo "❌ Tablo oluşturulurken hata oluştu!"
        exit 1
    fi
else
    echo "✅ Students tablosu mevcut"
fi
echo ""

# 3. student_volunteer_pairings tablosu var mı?
echo "📊 student_volunteer_pairings Tablosu Kontrolü:"
PAIRINGS_EXISTS=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES LIKE 'student_volunteer_pairings';" 2>/dev/null | grep -c student_volunteer_pairings)

if [ "$PAIRINGS_EXISTS" -eq 0 ]; then
    echo "⚠️  student_volunteer_pairings tablosu bulunamadı, oluşturuluyor..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$PROJECT_DIR/server/config/db-update.sql" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ student_volunteer_pairings tablosu oluşturuldu!"
    else
        echo "❌ Tablo oluşturulurken hata oluştu!"
    fi
else
    echo "✅ student_volunteer_pairings tablosu mevcut"
fi
echo ""

# 4. Tüm tabloları listele
echo "📋 Mevcut Tablolar:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null
echo ""

# 5. Students tablosu yapısı
echo "📋 Students Tablosu Yapısı:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "DESCRIBE students;" 2>/dev/null
echo ""

# 6. student_volunteer_pairings tablosu yapısı
echo "📋 student_volunteer_pairings Tablosu Yapısı:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "DESCRIBE student_volunteer_pairings;" 2>/dev/null
echo ""

echo "✅ Kontrol tamamlandı!"
echo ""
echo "🔄 Backend servisini yeniden başlatmak için:"
echo "  pm2 restart nesil-bahce-backend"

