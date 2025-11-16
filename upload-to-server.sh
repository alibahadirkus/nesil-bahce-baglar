#!/bin/bash

# Bash Script - Projeyi Sunucuya Yükle
# Yerel bilgisayarınızda (Git Bash veya WSL) çalıştırın

SERVER_IP="34.136.39.171"
SERVER_USER="alibahadirkus"
PRIVATE_KEY="$HOME/.ssh/gcloud_key"
LOCAL_PATH="./nesil-bahce-baglar"
REMOTE_PATH="/home/alibahadirkus/nesil-bahce-baglar"

echo "📤 Proje dosyaları sunucuya yükleniyor..."

# Private key izinlerini ayarla
chmod 600 "$PRIVATE_KEY"

# SCP ile dosya gönderme
scp -i "$PRIVATE_KEY" -r "$LOCAL_PATH"/* "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"

echo "✅ Dosyalar yüklendi!"
echo "🚀 Şimdi sunucuya bağlanın: ssh -i $PRIVATE_KEY ${SERVER_USER}@${SERVER_IP}"

