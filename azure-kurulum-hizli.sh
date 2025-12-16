#!/bin/bash

# Azure Ubuntu 22.04 Hızlı Kurulum Scripti
# GitHub'dan projeyi çekip kurar

set -e

echo "🚀 Azure Ubuntu 22.04 Kurulum Başlıyor..."

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Proje dizini
PROJECT_DIR="/var/www/bahcelerbaglar"

# 1. Sistem güncellemesi
echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# 2. Temel paketler
echo -e "${YELLOW}📦 Temel paketler kuruluyor...${NC}"
sudo apt-get install -y curl wget git build-essential

# 3. Node.js 20.x
echo -e "${YELLOW}📦 Node.js kuruluyor...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# 4. MySQL
echo -e "${YELLOW}📦 MySQL kuruluyor...${NC}"
if ! command -v mysql &> /dev/null; then
    sudo apt-get install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    # MySQL root şifresini ayarla (ilk kurulumda)
    echo -e "${YELLOW}🔐 MySQL root şifresi ayarlanıyor...${NC}"
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Deneme123!!!';" 2>/dev/null || true
    sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true
fi
echo -e "${GREEN}✅ MySQL kuruldu${NC}"

# 5. PM2
echo -e "${YELLOW}📦 PM2 kuruluyor...${NC}"
sudo npm install -g pm2

# 6. Nginx
echo -e "${YELLOW}📦 Nginx kuruluyor...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# 7. Proje dizini
echo -e "${YELLOW}📁 Proje dizini oluşturuluyor...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# 8. GitHub'dan projeyi çek
cd $PROJECT_DIR
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔄 Proje güncelleniyor...${NC}"
    git pull
else
    echo -e "${YELLOW}📥 Proje GitHub'dan çekiliyor...${NC}"
    git clone https://github.com/alibahadirkus/nesil-bahce-baglar.git .
fi

# Proje zaten doğru dizinde, cd nesil-bahce-baglar gerekmiyor

# 9. Dependencies
echo -e "${YELLOW}📦 Dependencies kuruluyor...${NC}"
npm install

# 10. .env dosyası oluştur
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚙️  .env dosyası oluşturuluyor...${NC}"
    cat > server/.env << EOF
DB_HOST=localhost
DB_USER=bahcelerbaglar
DB_PASSWORD=Deneme123!!!
DB_NAME=bahcelerbaglar
DB_PORT=3306

PORT=3001
NODE_ENV=production
BASE_URL=http://20.120.180.80
FRONTEND_URL=http://20.120.180.80

JWT_SECRET=$(openssl rand -base64 32)

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
WHATSAPP_ENABLED=false
EOF
fi

# 11. Veritabanı oluştur
echo -e "${YELLOW}🗄️  Veritabanı oluşturuluyor...${NC}"
mysql -u root -pDeneme123!!! << EOF 2>/dev/null || true
CREATE DATABASE IF NOT EXISTS bahcelerbaglar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bahcelerbaglar'@'localhost' IDENTIFIED BY 'Deneme123!!!';
GRANT ALL PRIVILEGES ON bahcelerbaglar.* TO 'bahcelerbaglar'@'localhost';
FLUSH PRIVILEGES;
EOF

# 12. Veritabanı şeması
echo -e "${YELLOW}🗄️  Veritabanı şeması oluşturuluyor...${NC}"
mysql -u root -pDeneme123!!! bahcelerbaglar < server/config/db-init.sql 2>/dev/null || echo "db-init.sql zaten uygulanmış"
mysql -u root -pDeneme123!!! bahcelerbaglar < server/config/db-update.sql 2>/dev/null || echo "db-update.sql zaten uygulanmış"

# 13. Frontend build
echo -e "${YELLOW}🏗️  Frontend build alınıyor...${NC}"
npm run build

# 14. Uploads dizini
mkdir -p server/uploads
chmod 755 server/uploads

# 15. PM2 - Backend
echo -e "${YELLOW}🚀 Backend başlatılıyor...${NC}"
pm2 delete bahcelerbaglar-backend 2>/dev/null || true
pm2 start npm --name "bahcelerbaglar-backend" -- run start:server

# 16. PM2 - Frontend
echo -e "${YELLOW}🚀 Frontend başlatılıyor...${NC}"
pm2 delete bahcelerbaglar-frontend 2>/dev/null || true
cd dist
pm2 serve . 8080 --name "bahcelerbaglar-frontend" --spa
cd ..

# 17. PM2 startup
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

# 18. Nginx config
echo -e "${YELLOW}⚙️  Nginx yapılandırılıyor...${NC}"
sudo tee /etc/nginx/sites-available/bahcelerbaglar > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/bahcelerbaglar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}"
echo "✅ Kurulum tamamlandı!"
echo ""
echo "🌐 Uygulama: http://20.120.180.80"
echo "📊 PM2 Durum: pm2 status"
echo "📋 Loglar: pm2 logs"
echo "${NC}"

