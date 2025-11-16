#!/bin/bash

# Nginx ve Firewall düzeltme scripti
# Sunucuda çalıştırın

echo "🔧 Nginx ve Firewall düzeltiliyor..."
echo ""

# 1. Nginx servisini kontrol et ve başlat
echo "🌐 Nginx Durumu:"
if ! systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx çalışmıyor, başlatılıyor..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

sudo systemctl status nginx --no-pager -l | head -10
echo ""

# 2. Nginx config test
echo "🔧 Nginx Config Test:"
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config doğru"
    sudo systemctl reload nginx
else
    echo "❌ Nginx config hatası!"
    exit 1
fi
echo ""

# 3. Nginx config dosyasını kontrol et
echo "📄 Nginx Config Kontrolü:"
NGINX_CONFIG="/etc/nginx/sites-enabled/nesil-bahce-baglar"
if [ -f "$NGINX_CONFIG" ]; then
    echo "✅ Nginx config bulundu: $NGINX_CONFIG"
else
    echo "⚠️  Nginx config bulunamadı, oluşturuluyor..."
    PROJECT_DIR="/var/www/nesil-bahce-baglar"
    sudo cp "$PROJECT_DIR/nginx.conf" /etc/nginx/sites-available/nesil-bahce-baglar
    sudo rm -f /etc/nginx/sites-enabled/nesil-bahce-baglar
    sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl reload nginx
fi
echo ""

# 4. Port dinleme kontrolü
echo "🔌 Port Dinleme Kontrolü:"
echo "Port 80 (Nginx HTTP):"
sudo netstat -tlnp | grep :80 || ss -tlnp | grep :80 || echo "⚠️  Port 80 dinlenmiyor"
echo ""
echo "Port 3001 (Backend):"
sudo netstat -tlnp | grep :3001 || ss -tlnp | grep :3001 || echo "⚠️  Port 3001 dinlenmiyor"
echo ""
echo "Port 8080 (Frontend):"
sudo netstat -tlnp | grep :8080 || ss -tlnp | grep :8080 || echo "⚠️  Port 8080 dinlenmiyor"
echo ""

# 5. Local test
echo "🧪 Local Test:"
echo "Backend (localhost:3001):"
curl -s http://localhost:3001/api/health || echo "❌ Backend erişilemiyor"
echo ""
echo "Frontend (localhost:8080):"
curl -s -I http://localhost:8080 | head -3 || echo "❌ Frontend erişilemiyor"
echo ""
echo "Nginx üzerinden (/api/health):"
curl -s http://localhost/api/health || echo "❌ Nginx üzerinden erişilemiyor"
echo ""

# 6. Firewall kontrolü (Google Cloud için)
echo "🔥 Firewall Kontrolü:"
echo "⚠️  Google Cloud'da Firewall kurallarını kontrol edin:"
echo ""
echo "Google Cloud Console'da:"
echo "1. VPC Network > Firewall'a gidin"
echo "2. Aşağıdaki kuralların olduğundan emin olun:"
echo "   - HTTP (port 80) -> Source: 0.0.0.0/0"
echo "   - HTTPS (port 443) -> Source: 0.0.0.0/0"
echo "   - Backend (port 3001) -> Source: localhost only"
echo ""
echo "VEYA gcloud CLI ile:"
echo "  gcloud compute firewall-rules create allow-http --allow tcp:80 --source-ranges 0.0.0.0/0 --description 'Allow HTTP'"
echo "  gcloud compute firewall-rules create allow-https --allow tcp:443 --source-ranges 0.0.0.0/0 --description 'Allow HTTPS'"
echo ""

# 7. Nginx error logları
echo "📋 Son Nginx Error Logları:"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "⚠️  Nginx error logları alınamadı"
echo ""

# 8. Nginx access logları (son istekler)
echo "📋 Son Nginx Access Logları:"
sudo tail -10 /var/log/nginx/access.log 2>/dev/null || echo "⚠️  Nginx access logları alınamadı"
echo ""

echo "✅ Kontrol tamamlandı!"
echo ""
echo "🌐 Harici Erişim Testi:"
echo "Sunucu IP'nizden şunu deneyin:"
echo "  curl http://34.136.39.171/api/health"
echo ""

