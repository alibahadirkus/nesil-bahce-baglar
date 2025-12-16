# SSH Kurulum Scripti - Windows PowerShell
$ErrorActionPreference = "Stop"

$hostname = "20.120.180.80"
$username = "azureuser"
$password = "Deneme123!!!"

Write-Host "🔐 SSH bağlantısı kuruluyor..." -ForegroundColor Yellow

# SSH komutlarını bir dosyaya yaz
$commands = @"
sudo mkdir -p /var/www/bahcelerbaglar
sudo chown -R `$USER:`$USER /var/www/bahcelerbaglar
cd /var/www/bahcelerbaglar
if [ -d ".git" ]; then
    git pull
else
    git clone https://github.com/alibahadirkus/nesil-bahce-baglar.git .
fi
cd nesil-bahce-baglar
chmod +x azure-kurulum-hizli.sh
bash azure-kurulum-hizli.sh
"@

# Komutları geçici dosyaya yaz
$tempFile = [System.IO.Path]::GetTempFileName()
$commands | Out-File -FilePath $tempFile -Encoding ASCII

Write-Host "📤 Komutlar sunucuya gönderiliyor..." -ForegroundColor Yellow

# plink kullan (eğer yoksa ssh kullan)
if (Get-Command plink -ErrorAction SilentlyContinue) {
    $plinkCmd = "plink -ssh -pw `"$password`" $username@$hostname -m `"$tempFile`""
    Invoke-Expression $plinkCmd
} else {
    # SSH kullan (interaktif olmayacak şekilde)
    Write-Host "⚠️  plink bulunamadı, manuel SSH bağlantısı gerekebilir" -ForegroundColor Red
    Write-Host "Lütfen şu komutu çalıştırın:" -ForegroundColor Yellow
    Write-Host "ssh $username@$hostname" -ForegroundColor Cyan
    Write-Host "Sonra şu komutları çalıştırın:" -ForegroundColor Yellow
    Write-Host $commands -ForegroundColor Cyan
}

Remove-Item $tempFile -ErrorAction SilentlyContinue

