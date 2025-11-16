#!/bin/bash

# Sunucu erişim testi
# Sunucuda çalıştırın

echo "🧪 Sunucu erişim testleri..."
echo ""

# 1. Local testler
echo "📊 Local Testler:"
echo "Backend (localhost:3001):"
curl -s http://localhost:3001/api/health || echo "❌ Backend erişilemiyor"
echo ""

echo "Frontend (localhost:8080):"
curl -s -I http://localhost:8080 | head -3 || echo "❌ Frontend erişilemiyor"
echo ""

echo "Nginx üzerinden (/api/health):"
curl -s http://localhost/api/health || echo "❌ Nginx üzerinden erişilemiyor"
echo ""

# 2. Port dinleme kontrolü
echo "🔌 Port Dinleme:"
echo "Port 80:"
sudo netstat -tlnp 2>/dev/null | grep :80 || ss -tlnp 2>/dev/null | grep :80 || echo "⚠️  Kontrol edilemedi"
echo ""

echo "Port 3001:"
sudo netstat -tlnp 2>/dev/null | grep :3001 || ss -tlnp 2>/dev/null | grep :3001 || echo "⚠️  Kontrol edilemedi"
echo ""

echo "Port 8080:"
sudo netstat -tlnp 2>/dev/null | grep :8080 || ss -tlnp 2>/dev/null | grep :8080 || echo "⚠️  Kontrol edilemedi"
echo ""

# 3. PM2 durumu
echo "📊 PM2 Durumu:"
pm2 status
echo ""

# 4. Nginx durumu
echo "🌐 Nginx Durumu:"
sudo systemctl status nginx --no-pager -l | head -10
echo ""

# 5. Sunucu IP'sini al
echo "🌐 Sunucu IP:"
PUBLIC_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null)
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP="34.136.39.171"
fi
echo "Public IP: $PUBLIC_IP"
echo ""

# 6. Harici erişim testi
echo "🧪 Harici Erişim Testi:"
echo "Not: Bu test sunucudan yapılıyor, gerçek harici erişim için tarayıcıdan test edin"
curl -s -m 5 http://$PUBLIC_IP/api/health || echo "⚠️  Harici erişim test edilemedi (normal)"
echo ""

echo "✅ Test tamamlandı!"
echo ""
echo "🌐 Tarayıcıdan Test:"
echo "  http://$PUBLIC_IP"
echo "  http://$PUBLIC_IP/api/health"
echo ""
echo "📋 Nginx Logları (son 10 istek):"
sudo tail -10 /var/log/nginx/access.log 2>/dev/null || echo "⚠️  Access log bulunamadı"
echo ""

