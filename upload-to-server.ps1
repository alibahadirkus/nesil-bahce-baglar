# PowerShell Script - Projeyi Sunucuya Yükle
# Yerel bilgisayarınızda çalıştırın

$ServerIP = "34.136.39.171"
$ServerUser = "alibahadirkus"
$PrivateKeyPath = "$env:USERPROFILE\.ssh\gcloud_key"
$LocalPath = ".\nesil-bahce-baglar"
$RemotePath = "/home/alibahadirkus/nesil-bahce-baglar"

Write-Host "📤 Proje dosyaları sunucuya yükleniyor..." -ForegroundColor Green

# SCP ile dosya gönderme (private key ile)
# Not: Private key'i önce yerel bilgisayarınıza kopyalamalısınız

# Seçenek 1: PowerShell'in built-in SCP'si
scp -i $PrivateKeyPath -r "$LocalPath\*" "${ServerUser}@${ServerIP}:${RemotePath}/"

# Alternatif: rsync kullan (eğer kuruluysa)
# rsync -avz -e "ssh -i $PrivateKeyPath" "$LocalPath/" "${ServerUser}@${ServerIP}:${RemotePath}/"

Write-Host "✅ Dosyalar yüklendi!" -ForegroundColor Green
Write-Host "🚀 Şimdi sunucuya bağlanın: ssh -i $PrivateKeyPath ${ServerUser}@${ServerIP}" -ForegroundColor Yellow

