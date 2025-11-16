#!/bin/bash

# Deployment script for Google Cloud Server
# Bu script'i sunucuda çalıştırın

set -e

echo "🚀 Nesil Bahçe Bağlar Deployment Başlıyor..."

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Proje dizini
PROJECT_DIR="/var/www/nesil-bahce-baglar"
LOG_DIR="/var/log/nesil-bahce"

# 1. Gerekli dizinleri oluştur
echo -e "${GREEN}📁 Dizinler oluşturuluyor...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo mkdir -p $LOG_DIR
sudo mkdir -p $PROJECT_DIR/server/uploads
sudo mkdir -p $PROJECT_DIR/whatsapp-session

# 2. Sistem güncellemesi
echo -e "${GREEN}📦 Sistem güncelleniyor...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# 3. Node.js kurulumu (yoksa)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Node.js kuruluyor...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 4. PM2 kurulumu (yoksa)
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 PM2 kuruluyor...${NC}"
    sudo npm install -g pm2
    pm2 startup systemd -u $USER --hp /home/$USER
fi

# 5. MySQL kurulumu (yoksa)
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

# 6. Nginx kurulumu (yoksa)
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Nginx kuruluyor...${NC}"
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# 7. Git kurulumu ve projeyi çek
echo -e "${GREEN}📂 Proje GitHub'dan çekiliyor...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}📦 Git kuruluyor...${NC}"
    sudo apt-get install -y git
fi

# Proje dizini yoksa clone yap, varsa pull yap
GIT_REPO="https://github.com/alibahadirkus/nesil-bahce-baglar.git"

if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo -e "${GREEN}📥 Proje klonlanıyor...${NC}"
    sudo rm -rf $PROJECT_DIR 2>/dev/null || true
    sudo git clone $GIT_REPO $PROJECT_DIR
    sudo chown -R $USER:$USER $PROJECT_DIR
else
    echo -e "${GREEN}🔄 Proje güncelleniyor...${NC}"
    cd $PROJECT_DIR
    sudo git fetch origin
    sudo git reset --hard origin/main
    sudo chown -R $USER:$USER $PROJECT_DIR
fi

# 8. Bağımlılıkları yükle
echo -e "${GREEN}📦 Bağımlılıklar yükleniyor...${NC}"
cd $PROJECT_DIR
# npm ci yerine npm install kullan (package-lock.json senkronizasyon sorunlarını önlemek için)
npm install

# 9. TypeScript build
echo -e "${GREEN}🔨 Backend build ediliyor...${NC}"
npx tsc --project tsconfig.server.json --outDir dist-server

# 10. Frontend build
echo -e "${GREEN}🔨 Frontend build ediliyor...${NC}"
npm run build:prod

# 11. .env dosyasını kontrol et
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    echo -e "${RED}⚠️  server/.env dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}Lütfen server/.env.example dosyasını kopyalayıp düzenleyin:${NC}"
    echo "cp server/.env.example server/.env"
    echo "nano server/.env"
    exit 1
fi

# 12. Veritabanını oluştur
echo -e "${GREEN}🗄️  Veritabanı kuruluyor...${NC}"
if [ -f "$PROJECT_DIR/server/config/db-init.sql" ]; then
    echo "Veritabanı SQL dosyalarını çalıştırın:"
    echo "mysql -u root -p < server/config/db-init.sql"
    echo "mysql -u root -p < server/config/db-update.sql"
fi

# 13. İzinleri ayarla
echo -e "${GREEN}🔐 İzinler ayarlanıyor...${NC}"
sudo chown -R $USER:$USER $PROJECT_DIR
sudo chown -R $USER:$USER $LOG_DIR
chmod +x $PROJECT_DIR/deploy.sh

# 14. PM2 ile servisleri başlat
echo -e "${GREEN}🚀 Servisler başlatılıyor...${NC}"
cd $PROJECT_DIR
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

# 15. Nginx config (manuel kontrol gerekli)
echo -e "${YELLOW}⚠️  Nginx config dosyasını kontrol edin:${NC}"
echo "sudo cp nginx.conf /etc/nginx/sites-available/nesil-bahce-baglar"
echo "sudo ln -s /etc/nginx/sites-available/nesil-bahce-baglar /etc/nginx/sites-enabled/"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"

# 16. Firewall kuralları
echo -e "${GREEN}🔥 Firewall kuralları ayarlanıyor...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable

echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo -e "${YELLOW}Sonraki adımlar:${NC}"
echo "1. server/.env dosyasını düzenleyin"
echo "2. Veritabanını kurun"
echo "3. Nginx config'i aktif edin"
echo "4. SSL sertifikası kurun (Let's Encrypt)"
echo ""
echo -e "${GREEN}PM2 durumunu kontrol edin:${NC}"
echo "pm2 status"
echo "pm2 logs"

