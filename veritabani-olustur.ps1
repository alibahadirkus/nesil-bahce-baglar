# MySQL Veritabanı Oluşturma Script'i

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MySQL Veritabanı Oluşturma" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# MySQL yollarını kontrol et
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        Write-Host "[OK] MySQL bulundu: $path" -ForegroundColor Green
        break
    }
}

if (-not $mysqlExe) {
    Write-Host "[HATA] MySQL bulunamadı!" -ForegroundColor Red
    Write-Host ""
    Write-Host "LUTFEN:" -ForegroundColor Yellow
    Write-Host "1. PowerShell'i YENİDEN BAŞLATIN (PATH güncellenmesi için)"
    Write-Host "2. VEYA MySQL kurulum sihirbazını tamamlayın"
    Write-Host "3. VEYA MySQL servisini başlatın (Hizmetler uygulamasından)"
    Write-Host ""
    Write-Host "MySQL kurulumu genellikle bir kurulum sihirbazı açar."
    Write-Host "Bu sihirbazda root şifresi belirlemeniz gerekir."
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "Veritabanı oluşturuluyor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "MySQL root şifrenizi girin (kurulum sırasında belirlediğiniz şifre):" -ForegroundColor Cyan
Write-Host "(Eğer şifre yoksa, sadece Enter'a basın)" -ForegroundColor Gray
Write-Host ""

$sqlFile = Join-Path $PSScriptRoot "server\config\db-init.sql"
$sqlFile = Resolve-Path $sqlFile

if (-not (Test-Path $sqlFile)) {
    Write-Host "[HATA] SQL dosyası bulunamadı: $sqlFile" -ForegroundColor Red
    pause
    exit 1
}

# MySQL'e bağlan ve SQL dosyasını çalıştır
$result = & $mysqlExe -u root -p < $sqlFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[BAŞARILI] Veritabanı oluşturuldu!" -ForegroundColor Green
    Write-Host ""
    
    # Veritabanını kontrol et
    Write-Host "Veritabanı kontrol ediliyor..." -ForegroundColor Yellow
    & $mysqlExe -u root -p -e "USE nesil_bahce_baglar; SHOW TABLES;" 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Kurulum Tamamlandı!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sonraki adımlar:" -ForegroundColor Cyan
    Write-Host "1. server\.env dosyasını kontrol edin"
    Write-Host "2. DB_PASSWORD değerini MySQL root şifrenizle güncelleyin"
    Write-Host "3. Backend server'ı yeniden başlatın: npm run dev:server"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[HATA] Veritabanı oluşturulamadı!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Olası nedenler:" -ForegroundColor Yellow
    Write-Host "- MySQL şifresi yanlış"
    Write-Host "- MySQL servisi çalışmıyor"
    Write-Host "- Veritabanı zaten mevcut"
    Write-Host ""
    Write-Host "Hata mesajı:" -ForegroundColor Yellow
    Write-Host $result -ForegroundColor Red
    Write-Host ""
}

pause

