#!/bin/bash

# Azure Ubuntu 22.04 için otomatik kurulum scripti
# Kullanım: bash deploy-azure.sh

set -e  # Hata durumunda dur

echo "🚀 Azure Ubuntu 22.04 Kurulum Başlıyor..."

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Güncellemeler
echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Temel paketler
echo -e "${YELLOW}📦 Temel paketler kuruluyor...${NC}"
sudo apt-get install -y curl wget git build-essential

# Node.js 20.x kurulumu
echo -e "${YELLOW}📦 Node.js kuruluyor...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo -e "${GREEN}✅ Node.js $(node --version) kuruldu${NC}"

# MySQL kurulumu
echo -e "${YELLOW}📦 MySQL kuruluyor...${NC}"
if ! command -v mysql &> /dev/null; then
    sudo apt-get install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi
echo -e "${GREEN}✅ MySQL kuruldu${NC}"

# PM2 kurulumu (production process manager)
echo -e "${YELLOW}📦 PM2 kuruluyor...${NC}"
sudo npm install -g pm2
echo -e "${GREEN}✅ PM2 kuruldu${NC}"

# Nginx kurulumu
echo -e "${YELLOW}📦 Nginx kuruluyor...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi
echo -e "${GREEN}✅ Nginx kuruldu${NC}"

# Proje dizini oluştur
PROJECT_DIR="/var/www/bahcelerbaglar"
echo -e "${YELLOW}📁 Proje dizini oluşturuluyor: $PROJECT_DIR${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# Git'ten projeyi çek (veya zaten varsa güncelle)
cd $PROJECT_DIR
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔄 Proje güncelleniyor...${NC}"
    git pull
else
    echo -e "${YELLOW}📥 Proje GitHub'dan çekiliyor...${NC}"
    # Kullanıcıdan repo URL'ini al
    read -p "GitHub repository URL'inizi girin (örn: https://github.com/kullaniciadi/repo.git): " REPO_URL
    git clone $REPO_URL .
fi

# Proje klasörüne git
cd $PROJECT_DIR/nesil-bahce-baglar

# Dependencies kurulumu
echo -e "${YELLOW}📦 Dependencies kuruluyor...${NC}"
npm install

# .env dosyası kontrolü
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚙️  .env dosyası oluşturuluyor...${NC}"
    cat > server/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bahcelerbaglar
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=production
BASE_URL=http://localhost:3001

# Frontend URL
FRONTEND_URL=http://localhost

# JWT Secret (Rastgele bir değer oluşturun)
JWT_SECRET=$(openssl rand -base64 32)

# SMS Provider (Twilio veya başka bir servis)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# WhatsApp (opsiyonel)
WHATSAPP_ENABLED=false
EOF
    echo -e "${RED}⚠️  server/.env dosyasını düzenleyin ve MySQL şifrenizi girin!${NC}"
    echo -e "${YELLOW}Komut: nano server/.env${NC}"
    read -p "Devam etmek için Enter'a basın (önce .env dosyasını düzenlemek isterseniz Ctrl+C ile çıkın)..."
fi

# MySQL veritabanı ve kullanıcı oluştur
echo -e "${YELLOW}🗄️  MySQL veritabanı oluşturuluyor...${NC}"
read -sp "MySQL root şifrenizi girin: " MYSQL_ROOT_PASSWORD
echo ""

# .env dosyasından DB bilgilerini oku
DB_PASSWORD=$(grep DB_PASSWORD server/.env | cut -d '=' -f2 | tr -d ' ')

mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
CREATE DATABASE IF NOT EXISTS bahcelerbaglar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bahcelerbaglar'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON bahcelerbaglar.* TO 'bahcelerbaglar'@'localhost';
FLUSH PRIVILEGES;
EOF

# Veritabanı şemasını oluştur
echo -e "${YELLOW}🗄️  Veritabanı şeması oluşturuluyor...${NC}"
mysql -u root -p$MYSQL_ROOT_PASSWORD bahcelerbaglar < server/config/db-init.sql 2>/dev/null || echo "db-init.sql zaten çalıştırılmış"
mysql -u root -p$MYSQL_ROOT_PASSWORD bahcelerbaglar < server/config/db-update.sql 2>/dev/null || echo "db-update.sql zaten çalıştırılmış"

# Frontend build
echo -e "${YELLOW}🏗️  Frontend build alınıyor...${NC}"
npm run build

# Uploads dizini oluştur
echo -e "${YELLOW}📁 Uploads dizini oluşturuluyor...${NC}"
mkdir -p server/uploads
chmod 755 server/uploads

# PM2 ile backend'i başlat
echo -e "${YELLOW}🚀 Backend PM2 ile başlatılıyor...${NC}"
pm2 delete bahcelerbaglar-backend 2>/dev/null || true

# Backend'i TypeScript olarak çalıştır (production için build gerekli olabilir)
pm2 start npm --name "bahcelerbaglar-backend" -- run start:server

# Frontend'i serve et (static files)
echo -e "${YELLOW}🚀 Frontend PM2 ile başlatılıyor...${NC}"
pm2 delete bahcelerbaglar-frontend 2>/dev/null || true
cd dist
pm2 serve . 8080 --name "bahcelerbaglar-frontend" --spa
cd ..

# PM2 startup script
pm2 save
pm2 startup | tail -1 | bash || true

# Nginx yapılandırması
echo -e "${YELLOW}⚙️  Nginx yapılandırılıyor...${NC}"
sudo tee /etc/nginx/sites-available/bahcelerbaglar > /dev/null << EOF
server {
    listen 80;
    server_name _;  # Domain adınızı buraya yazın veya _ ile tüm domainleri kabul edin

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads (resimler)
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Nginx site'ı aktifleştir
sudo ln -sf /etc/nginx/sites-available/bahcelerbaglar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx test ve yeniden yükle
sudo nginx -t
sudo systemctl reload nginx

# Firewall (Azure'da NSG kullanıyorsanız burayı atlayın)
echo -e "${YELLOW}🔥 Firewall yapılandırılıyor...${NC}"
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS (SSL eklerseniz)
sudo ufw --force enable

echo -e "${GREEN}"
echo "✅ Kurulum tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. server/.env dosyasını düzenleyin: nano server/.env"
echo "2. PM2 durumunu kontrol edin: pm2 status"
echo "3. Logları kontrol edin: pm2 logs"
echo "4. Azure NSG'de port 80 ve 443'ü açın"
echo "5. Domain DNS kaydınızı Azure IP'nize yönlendirin"
echo ""
echo "🌐 Uygulama: http://$(curl -s ifconfig.me)"
echo "🔧 PM2 Dashboard: pm2 monit"
echo "${NC}"

