# Azure VM Otomatik Kurulum Scripti
# Bu scripti calistirdiginizda sifreyi bir kere girmeniz yeterli

$hostname = "20.120.180.80"
$username = "azureuser"

Write-Host "Azure VM Kurulum Basliyor..." -ForegroundColor Green
Write-Host ""

# Kurulum komutlarini hazirla
$installCommands = @"
sudo mkdir -p /var/www/bahcelerbaglar
sudo chown -R `$USER:`$USER /var/www/bahcelerbaglar
cd /var/www/bahcelerbaglar
if [ -d ".git" ]; then
    echo 'Proje guncelleniyor...'
    git pull
else
    echo 'Proje GitHub'dan cekiliyor...'
    git clone https://github.com/alibahadirkus/nesil-bahce-baglar.git .
fi
cd nesil-bahce-baglar
chmod +x azure-kurulum-hizli.sh
echo 'Kurulum scripti calistiriliyor...'
bash azure-kurulum-hizli.sh
"@

# Komutlari gecici dosyaya yaz
$tempScript = "$env:TEMP\kurulum-commands.sh"
$installCommands | Out-File -FilePath $tempScript -Encoding ASCII -NoNewline

Write-Host "Komutlar sunucuya gonderiliyor..." -ForegroundColor Yellow
Write-Host "Sifre istenirse: Deneme123!!!" -ForegroundColor Cyan
Write-Host ""

# Dosya icerigini oku ve SSH'a gonder
$scriptContent = Get-Content $tempScript -Raw
$scriptContent | ssh -o StrictHostKeyChecking=no "$username@$hostname" "bash -s"

# Gecici dosyayi temizle
Remove-Item $tempScript -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Kurulum tamamlandi!" -ForegroundColor Green
Write-Host "Uygulama: http://20.120.180.80" -ForegroundColor Cyan
