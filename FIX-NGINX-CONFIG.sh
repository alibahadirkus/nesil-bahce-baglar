#!/bin/bash

# Nginx config dosyasını kontrol et ve düzelt
# Sunucuda çalıştırın

echo "🔧 Nginx config dosyası kontrol ediliyor..."
echo ""

PROJECT_DIR="/var/www/nesil-bahce-baglar"
NGINX_SITES="/etc/nginx/sites-enabled"
NGINX_CONFIG="$NGINX_SITES/nesil-bahce-baglar"

# 1. Mevcut config'i kontrol et
if [ -f "$NGINX_CONFIG" ]; then
    echo "📄 Mevcut Nginx config:"
    echo "---"
    cat "$NGINX_CONFIG" | head -30
    echo "---"
    echo ""
    
    # SSL hatası var mı kontrol et
    if grep -q "listen.*443.*ssl" "$NGINX_CONFIG" && ! grep -q "ssl_certificate" "$NGINX_CONFIG"; then
        echo "⚠️  SSL hatası tespit edildi! Düzeltiliyor..."
        # SSL bloğunu comment'le veya sil
        sudo sed -i '/listen.*443.*ssl/,/^}/s/^/# /' "$NGINX_CONFIG" 2>/dev/null || true
    fi
else
    echo "⚠️  Nginx config bulunamadı, oluşturuluyor..."
fi

# 2. Doğru config'i kopyala
echo "📋 Doğru config dosyası kopyalanıyor..."
sudo cp "$PROJECT_DIR/nginx.conf" /etc/nginx/sites-available/nesil-bahce-baglar
sudo rm -f "$NGINX_CONFIG"
sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar "$NGINX_CONFIG"
sudo rm -f "$NGINX_SITES/default"
echo "✅ Config dosyası güncellendi"
echo ""

# 3. Config test
echo "🔧 Nginx config test:"
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config doğru"
    sudo systemctl reload nginx
    echo "✅ Nginx yeniden yüklendi"
else
    echo "❌ Nginx config hatası!"
    exit 1
fi
echo ""

# 4. Nginx durumu
echo "📊 Nginx Durumu:"
sudo systemctl status nginx --no-pager -l | head -15
echo ""

# 5. Port dinleme kontrolü
echo "🔌 Port Dinleme:"
echo "Port 80:"
sudo netstat -tlnp 2>/dev/null | grep :80 || ss -tlnp 2>/dev/null | grep :80 || echo "⚠️  Kontrol edilemedi"
echo ""

# 6. Local test
echo "🧪 Local Test:"
echo "Nginx üzerinden /api/health:"
curl -s http://localhost/api/health || echo "❌ Erişilemiyor"
echo ""

# 7. Access logları (son istekler)
echo "📋 Son Access Logları:"
sudo tail -10 /var/log/nginx/access.log 2>/dev/null || echo "⚠️  Access log bulunamadı"
echo ""

echo "✅ Tamamlandı!"
echo ""
echo "🌐 Harici Erişim Testi:"
echo "Sunucu IP'nizden şunu deneyin:"
echo "  curl http://34.136.39.171/api/health"
echo ""
echo "⚠️  Eğer hala erişilemiyorsa, Google Cloud Firewall kurallarını kontrol edin:"
echo "  1. Google Cloud Console > VPC Network > Firewall"
echo "  2. HTTP (port 80) için bir kural olduğundan emin olun"
echo "  3. Kaynak IP aralıkları: 0.0.0.0/0"
echo ""

