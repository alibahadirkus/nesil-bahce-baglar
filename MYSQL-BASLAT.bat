@echo off
chcp 65001 >nul
echo ========================================
echo MySQL Servisini Başlatma
echo ========================================
echo.

REM Yönetici yetkisi kontrolü
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [UYARI] Bu script yönetici yetkisi gerektirir.
    echo.
    echo LUTFEN:
    echo 1. Bu dosyaya sağ tıklayın
    echo 2. "Yönetici olarak çalıştır" seçeneğini seçin
    echo.
    pause
    exit /b 1
)

echo MySQL servisleri kontrol ediliyor...
echo.

REM MySQL servis adlarını kontrol et
set SERVICE_FOUND=0

for %%S in (MySQL80 MySQL MySQLService) do (
    sc query "%%S" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [BULUNDU] Servis: %%S
        set SERVICE_NAME=%%S
        set SERVICE_FOUND=1
        
        sc query "%%S" | findstr "STATE" | findstr "RUNNING" >nul
        if !errorlevel! equ 0 (
            echo [ZATEN CALISIYOR] MySQL servisi çalışıyor.
        ) else (
            echo [BASLATILIYOR] MySQL servisi başlatılıyor...
            net start "%%S"
            if !errorlevel! equ 0 (
                echo [BASARILI] MySQL servisi başlatıldı!
            ) else (
                echo [HATA] MySQL servisi başlatılamadı!
            )
        )
        goto :found
    )
)

if %SERVICE_FOUND% equ 0 (
    echo [HATA] MySQL servisi bulunamadı!
    echo.
    echo MySQL Installer ile kurulumu tamamlayın:
    echo 1. Başlat menüsünde "MySQL Installer" arayın
    echo 2. Installer'ı açın ve kurulumu tamamlayın
    echo 3. Root şifresi belirleyin
    echo.
)

:found
echo.
echo ========================================
echo Servis Durumu
echo ========================================
sc query "%SERVICE_NAME%" 2>nul | findstr "STATE"
echo.
echo MySQL servisi çalışıyorsa, veritabani-olustur-kolay.bat dosyasını çalıştırın.
echo.
pause

