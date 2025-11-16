#!/bin/bash

# Sunucu durumu kontrol scripti
# Sunucuda çalıştırın

echo "🔍 Sunucu durumu kontrol ediliyor..."
echo ""

# 1. PM2 durumu
echo "📊 PM2 Durumu:"
pm2 status
echo ""

# 2. Backend ve Frontend process kontrolü
echo "🔍 Process Kontrolü:"
ps aux | grep -E "(node|serve)" | grep -v grep
echo ""

# 3. Port dinleme kontrolü
echo "🔌 Port Dinleme Kontrolü:"
echo "Port 3001 (Backend):"
sudo netstat -tlnp | grep :3001 || ss -tlnp | grep :3001 || echo "⚠️  Port 3001 dinlenmiyor"
echo ""
echo "Port 8080 (Frontend):"
sudo netstat -tlnp | grep :8080 || ss -tlnp | grep :8080 || echo "⚠️  Port 8080 dinlenmiyor"
echo ""
echo "Port 80 (Nginx):"
sudo netstat -tlnp | grep :80 || ss -tlnp | grep :80 || echo "⚠️  Port 80 dinlenmiyor"
echo ""

# 4. Nginx durumu
echo "🌐 Nginx Durumu:"
sudo systemctl status nginx --no-pager -l | head -20
echo ""

# 5. Nginx config test
echo "🔧 Nginx Config Test:"
sudo nginx -t
echo ""

# 6. Backend local test
echo "🧪 Backend Local Test:"
curl -s http://localhost:3001/api/health || echo "❌ Backend localhost:3001'e erişilemiyor"
echo ""

# 7. Frontend local test
echo "🧪 Frontend Local Test:"
curl -s -I http://localhost:8080 | head -5 || echo "❌ Frontend localhost:8080'e erişilemiyor"
echo ""

# 8. Nginx üzerinden test
echo "🧪 Nginx üzerinden Test:"
curl -s -I http://localhost/api/health | head -5 || echo "❌ Nginx üzerinden /api/health'e erişilemiyor"
echo ""

# 9. Firewall kontrolü
echo "🔥 Firewall Kontrolü:"
if command -v ufw &> /dev/null; then
    sudo ufw status
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --list-all
else
    echo "⚠️  Firewall komutu bulunamadı (iptables kontrol ediliyor)"
    sudo iptables -L -n | grep -E "(3001|8080|80)" || echo "⚠️  iptables kuralları kontrol edilemedi"
fi
echo ""

# 10. Son backend logları
echo "📋 Son Backend Logları (20 satır):"
pm2 logs nesil-bahce-backend --lines 20 --nostream 2>/dev/null || echo "⚠️  Backend logları alınamadı"
echo ""

# 11. Nginx error logları (son 10 satır)
echo "📋 Son Nginx Error Logları:"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "⚠️  Nginx error logları alınamadı"
echo ""

# 12. .env dosyası kontrolü
echo "📄 .env Dosyası Kontrolü:"
if [ -f "/var/www/nesil-bahce-baglar/dist-server/.env" ]; then
    echo "✅ dist-server/.env bulundu"
    echo "DB_HOST=$(grep DB_HOST /var/www/nesil-bahce-baglar/dist-server/.env | cut -d'=' -f2)"
    echo "DB_USER=$(grep DB_USER /var/www/nesil-bahce-baglar/dist-server/.env | cut -d'=' -f2)"
    echo "DB_NAME=$(grep DB_NAME /var/www/nesil-bahce-baglar/dist-server/.env | cut -d'=' -f2)"
else
    echo "❌ dist-server/.env bulunamadı!"
fi
echo ""

echo "✅ Kontrol tamamlandı!"

