#!/bin/bash

# GitHub'dan Deployment Script
# Bu script'i sunucuda çalıştırın - GitHub'dan otomatik çekecek

set -e

echo "🚀 Nesil Bahçe Bağlar - GitHub Deployment Başlıyor..."

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Değişkenler
PROJECT_DIR="/var/www/nesil-bahce-baglar"
LOG_DIR="$PROJECT_DIR/logs"
GIT_REPO="https://github.com/alibahadirkus/nesil-bahce-baglar.git"
GIT_BRANCH="main"

# 1. Gerekli dizinleri oluştur
echo -e "${GREEN}📁 Dizinler oluşturuluyor...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo mkdir -p $LOG_DIR
sudo mkdir -p $PROJECT_DIR/server/uploads
sudo mkdir -p $PROJECT_DIR/whatsapp-session
sudo chown -R $USER:$USER $PROJECT_DIR 2>/dev/null || true
sudo chown -R $USER:$USER $LOG_DIR 2>/dev/null || true

# 2. Git kurulumu
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}📦 Git kuruluyor...${NC}"
    sudo apt-get update
    sudo apt-get install -y git
fi

# 3. Projeyi GitHub'dan çek
echo -e "${GREEN}📥 GitHub'dan proje çekiliyor...${NC}"
if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo -e "${GREEN}📂 Proje ilk kez klonlanıyor...${NC}"
    sudo rm -rf $PROJECT_DIR 2>/dev/null || true
    sudo git clone -b $GIT_BRANCH $GIT_REPO $PROJECT_DIR
    sudo chown -R $USER:$USER $PROJECT_DIR
else
    echo -e "${GREEN}🔄 Proje güncelleniyor...${NC}"
    cd $PROJECT_DIR
    sudo git fetch origin
    sudo git reset --hard origin/$GIT_BRANCH
    sudo chown -R $USER:$USER $PROJECT_DIR
fi

cd $PROJECT_DIR

# 4. Sistem güncellemesi
echo -e "${GREEN}📦 Sistem güncelleniyor...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# 5. Node.js kurulumu (yoksa)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Node.js kuruluyor...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 6. PM2 kurulumu (yoksa)
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 PM2 kuruluyor...${NC}"
    sudo npm install -g pm2
    pm2 startup systemd -u $USER --hp /home/$USER
fi

# 7. MySQL kurulumu (yoksa)
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}📦 MySQL kuruluyor...${NC}"
    sudo apt-get install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    echo -e "${YELLOW}⚠️  MySQL root şifresini ayarlayın:${NC}"
    echo "sudo mysql_secure_installation"
    echo "VEYA"
    echo "sudo mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YOUR_PASSWORD';\""
fi

# 8. Nginx kurulumu (yoksa)
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Nginx kuruluyor...${NC}"
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# 9. Bağımlılıkları yükle
echo -e "${GREEN}📦 Bağımlılıklar yükleniyor...${NC}"
# npm ci yerine npm install kullan (package-lock.json senkronizasyon sorunlarını önlemek için)
npm install

# 10. TypeScript build
echo -e "${GREEN}🔨 Backend build ediliyor...${NC}"
npx tsc --project tsconfig.server.json --outDir dist-server

# 11. Frontend build
echo -e "${GREEN}🔨 Frontend build ediliyor...${NC}"
npm run build:prod

# 12. .env dosyasını kontrol et
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    echo -e "${YELLOW}⚠️  server/.env dosyası bulunamadı!${NC}"
    if [ -f "$PROJECT_DIR/server/.env.example" ]; then
        cp $PROJECT_DIR/server/.env.example $PROJECT_DIR/server/.env
        echo -e "${GREEN}✅ .env dosyası oluşturuldu (.env.example'dan)${NC}"
        echo -e "${YELLOW}⚠️  Lütfen server/.env dosyasını düzenleyin:${NC}"
        echo "nano $PROJECT_DIR/server/.env"
        echo ""
        echo -e "${YELLOW}⚠️  Devam etmeden önce .env dosyasını düzenleyin!${NC}"
        echo -e "${YELLOW}   Script durduruluyor. .env'i düzenledikten sonra tekrar çalıştırın.${NC}"
        exit 0  # Hata vermesin, sadece uyarı ver
    else
        echo -e "${RED}❌ .env.example dosyası bulunamadı!${NC}"
        exit 1
    fi
fi

# 13. İzinleri ayarla
echo -e "${GREEN}🔐 İzinler ayarlanıyor...${NC}"
sudo chown -R $USER:$USER $PROJECT_DIR
sudo chown -R $USER:$USER $LOG_DIR
chmod +x $PROJECT_DIR/deploy.sh 2>/dev/null || true
chmod +x $PROJECT_DIR/deploy-from-github.sh 2>/dev/null || true

# 14. PM2 ile servisleri başlat
echo -e "${GREEN}🚀 Servisler başlatılıyor...${NC}"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

# 15. Firewall kuralları
echo -e "${GREEN}🔥 Firewall kuralları ayarlanıyor...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable

echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Sonraki adımlar:${NC}"
echo "1. server/.env dosyasını düzenleyin: nano $PROJECT_DIR/server/.env"
echo "2. Veritabanını kurun: cd $PROJECT_DIR && ./setup-mysql.sh"
echo "3. Nginx config'i aktif edin:"
echo "   sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar"
echo "   sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/"
echo "   sudo rm -f /etc/nginx/sites-enabled/default"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo "4. SSL sertifikası kurun (Let's Encrypt):"
echo "   sudo apt-get install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo -e "${GREEN}PM2 durumunu kontrol edin:${NC}"
echo "pm2 status"
echo "pm2 logs"

