@echo off
chcp 65001 >nul
echo ========================================
echo MySQL Servisini Kurma ve Başlatma
echo ========================================
echo.

REM Yönetici yetkisi kontrolü
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [UYARI] Bu script yönetici yetkisi gerektirir!
    echo.
    echo LUTFEN:
    echo 1. Bu dosyaya sağ tıklayın
    echo 2. "Yönetici olarak çalıştır" seçeneğini seçin
    echo.
    pause
    exit /b 1
)

echo [1/4] MySQL binary kontrol ediliyor...
set "MYSQLD=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"

if not exist "%MYSQLD%" (
    echo [HATA] MySQL Server bulunamadı: %MYSQLD%
    echo.
    echo MySQL Installer ile kurulumu tamamlayın.
    pause
    exit /b 1
)

echo [OK] MySQL Server bulundu
echo.

echo [2/4] MySQL servisi kuruluyor...
"%MYSQLD%" --install MySQL80
if errorlevel 1 (
    echo [UYARI] Servis zaten kurulu olabilir veya hata oluştu.
    echo Devam ediliyor...
)
echo.

echo [3/4] MySQL servisi başlatılıyor...
net start MySQL80
if errorlevel 1 (
    echo [HATA] Servis başlatılamadı!
    echo.
    echo Olası nedenler:
    echo - Servis zaten çalışıyor
    echo - MySQL yapılandırılmamış (my.ini dosyası eksik)
    echo - Port 3306 başka bir uygulama tarafından kullanılıyor
    echo.
    echo MySQL Installer ile yapılandırmayı tamamlayın.
    pause
    exit /b 1
)

echo [OK] Servis başlatıldı!
echo.

echo [4/4] Servis durumu kontrol ediliyor...
timeout /t 3 /nobreak >nul
sc query MySQL80 | findstr "STATE"
echo.

echo ========================================
echo Kurulum Tamamlandı!
echo ========================================
echo.
echo Şimdi veritabanını oluşturun:
echo   veritabani-olustur-kolay.bat
echo.
pause

