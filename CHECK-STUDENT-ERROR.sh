#!/bin/bash

# Öğrenci ekleme hatası kontrolü
# Sunucuda çalıştırın

echo "🔍 Öğrenci ekleme hatası kontrol ediliyor..."
echo ""

# 1. Backend logları (son 50 satır)
echo "📋 Backend Logları (son 50 satır):"
pm2 logs nesil-bahce-backend --lines 50 --nostream 2>/dev/null | tail -50
echo ""

# 2. Backend error logları
echo "📋 Backend Error Logları (son 30 satır):"
tail -30 /var/www/nesil-bahce-baglar/logs/backend-error*.log 2>/dev/null || echo "⚠️  Error log bulunamadı"
echo ""

# 3. Database bağlantısı test
echo "🧪 Database Bağlantı Testi:"
mysql -u root -proot -e "SELECT 1 as test;" 2>/dev/null || echo "❌ Database bağlantısı başarısız"
echo ""

# 4. Students tablosu kontrolü
echo "📊 Students Tablosu Kontrolü:"
mysql -u root -proot nesil_bahce_baglar -e "DESCRIBE students;" 2>/dev/null || echo "❌ Students tablosu bulunamadı"
echo ""

# 5. Students tablosu var mı?
echo "📋 Students Tablosu:"
mysql -u root -proot nesil_bahce_baglar -e "SHOW TABLES LIKE 'students';" 2>/dev/null || echo "❌ Database erişimi başarısız"
echo ""

# 6. PM2 durumu
echo "📊 PM2 Durumu:"
pm2 status
echo ""

# 7. Backend API test
echo "🧪 Backend API Testi:"
curl -s http://localhost:3001/api/health || echo "❌ Backend erişilemiyor"
echo ""

# 8. Nginx error logları (son 20 satır)
echo "📋 Nginx Error Logları (son 20 satır):"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "⚠️  Nginx error log bulunamadı"
echo ""

echo "✅ Kontrol tamamlandı!"
echo ""
echo "💡 Hata devam ederse:"
echo "1. Tarayıcı Console'unu kontrol edin (F12 > Console)"
echo "2. Network sekmesinde API isteğini kontrol edin"
echo "3. Backend loglarını buradan inceleyin"

