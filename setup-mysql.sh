#!/bin/bash

# MySQL Setup Script
# Bu script'i MySQL root şifresini ayarladıktan sonra çalıştırın

set -e

echo "🗄️  MySQL Setup Başlıyor..."

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# MySQL credentials (değiştirin)
DB_ROOT_PASSWORD=""
DB_NAME="nesil_bahce_baglar"
DB_USER="nesil_bahce_user"
DB_PASSWORD=""

# Eğer şifreler belirtilmediyse kullanıcıdan iste
if [ -z "$DB_ROOT_PASSWORD" ]; then
    read -sp "MySQL root şifresini girin: " DB_ROOT_PASSWORD
    echo
fi

if [ -z "$DB_PASSWORD" ]; then
    read -sp "Yeni kullanıcı için şifre oluşturun: " DB_PASSWORD
    echo
fi

PROJECT_DIR="/var/www/nesil-bahce-baglar"

# 1. Veritabanını oluştur
echo -e "${GREEN}📦 Veritabanı oluşturuluyor...${NC}"
mysql -u root -p"$DB_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

# 2. Kullanıcı oluştur ve yetkiler ver
echo -e "${GREEN}👤 Kullanıcı oluşturuluyor...${NC}"
mysql -u root -p"$DB_ROOT_PASSWORD" <<EOF
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

# 3. SQL dosyalarını çalıştır
echo -e "${GREEN}📄 SQL dosyaları çalıştırılıyor...${NC}"

if [ -f "$PROJECT_DIR/server/config/db-init.sql" ]; then
    mysql -u root -p"$DB_ROOT_PASSWORD" $DB_NAME < "$PROJECT_DIR/server/config/db-init.sql"
    echo -e "${GREEN}✅ db-init.sql çalıştırıldı${NC}"
fi

if [ -f "$PROJECT_DIR/server/config/db-update.sql" ]; then
    mysql -u root -p"$DB_ROOT_PASSWORD" $DB_NAME < "$PROJECT_DIR/server/config/db-update.sql"
    echo -e "${GREEN}✅ db-update.sql çalıştırıldı${NC}"
fi

# 4. .env dosyasını güncelle
if [ -f "$PROJECT_DIR/server/.env" ]; then
    echo -e "${YELLOW}⚠️  .env dosyasını güncelleyin:${NC}"
    echo "DB_USER=$DB_USER"
    echo "DB_PASSWORD=$DB_PASSWORD"
    echo "DB_NAME=$DB_NAME"
else
    echo -e "${YELLOW}⚠️  .env dosyası oluşturuluyor...${NC}"
    if [ -f "$PROJECT_DIR/server/.env.example" ]; then
        cp "$PROJECT_DIR/server/.env.example" "$PROJECT_DIR/server/.env"
        # DB bilgilerini güncelle
        sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" "$PROJECT_DIR/server/.env"
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" "$PROJECT_DIR/server/.env"
        sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" "$PROJECT_DIR/server/.env"
        echo -e "${GREEN}✅ .env dosyası oluşturuldu ve DB bilgileri güncellendi${NC}"
    else
        echo -e "${RED}❌ .env.example dosyası bulunamadı!${NC}"
    fi
fi

echo -e "${GREEN}✅ MySQL setup tamamlandı!${NC}"
echo -e "${YELLOW}Sonraki adım: server/.env dosyasını düzenleyin${NC}"

