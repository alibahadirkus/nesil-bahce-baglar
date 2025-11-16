@echo off
echo ========================================
echo MySQL Veritabanı Kurulum Script'i
echo ========================================
echo.

REM MySQL'in kurulu olup olmadığını kontrol et
where mysql >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] MySQL komut satırı bulunamadı!
    echo.
    echo LUTFEN:
    echo 1. MySQL'i kurun: https://dev.mysql.com/downloads/mysql/
    echo 2. VEYA XAMPP/WAMP kullanıyorsanız, bu script'i düzenleyin
    echo    ve MySQL.exe'nin tam yolunu yazın
    echo.
    pause
    exit /b 1
)

echo [1/3] MySQL'e bağlanılıyor...
echo.
echo MySQL root şifrenizi girin (şifre yoksa Enter'a basın):
mysql -u root -p < server\config\db-init.sql

if %errorlevel% equ 0 (
    echo.
    echo [2/3] Veritabanı başarıyla oluşturuldu!
    echo.
    echo [3/3] Veritabanını kontrol ediliyor...
    mysql -u root -p -e "USE nesil_bahce_baglar; SHOW TABLES;" 2>nul
    echo.
    echo ========================================
    echo Kurulum tamamlandı!
    echo ========================================
    echo.
    echo LUTFEN server\.env dosyasını kontrol edin ve
    echo DB_PASSWORD değerini MySQL root şifrenizle güncelleyin.
    echo.
) else (
    echo.
    echo [HATA] Veritabanı oluşturulamadı!
    echo.
    echo Olası nedenler:
    echo - MySQL şifresi yanlış
    echo - MySQL servisi çalışmıyor
    echo - Veritabanı zaten mevcut
    echo.
)

pause

