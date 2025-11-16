@echo off
chcp 65001 >nul
echo ========================================
echo MySQL Veritabanı Oluşturma
echo ========================================
echo.

REM MySQL yolu
set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"

REM MySQL servisini başlat
echo MySQL servisini başlatılıyor...
net start MySQL80 2>nul
if errorlevel 1 (
    echo MySQL servisi başlatılamadı veya zaten çalışıyor.
    echo Devam ediliyor...
)
timeout /t 2 /nobreak >nul
echo.

REM Veritabanını oluştur
echo Veritabanı oluşturuluyor...
echo MySQL root şifrenizi girin (kurulum sırasında belirlediğiniz):
"%MYSQL_EXE%" -u root -p -e "CREATE DATABASE IF NOT EXISTS nesil_bahce_baglar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if errorlevel 1 (
    echo.
    echo HATA: Veritabanı oluşturulamadı!
    echo.
    echo Olası nedenler:
    echo - MySQL şifresi yanlış
    echo - MySQL servisi çalışmıyor
    echo.
    echo MySQL servisini manuel olarak başlatmak için:
    echo 1. Win+R tuşlarına basın
    echo 2. services.msc yazın ve Enter'a basın
    echo 3. "MySQL80" servisini bulun ve başlatın
    echo.
    pause
    exit /b 1
)

echo.
echo Veritabanı başarıyla oluşturuldu!
echo.
echo Tablolar oluşturuluyor...
echo MySQL root şifrenizi tekrar girin:
"%MYSQL_EXE%" -u root -p nesil_bahce_baglar < server\config\db-init.sql

if errorlevel 1 (
    echo.
    echo HATA: Tablolar oluşturulamadı!
    echo MySQL şifresini kontrol edin.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Kurulum Başarıyla Tamamlandı!
echo ========================================
echo.
echo Oluşturulan tablolar:
"%MYSQL_EXE%" -u root -p nesil_bahce_baglar -e "SHOW TABLES;" 2>nul
echo.
echo Sonraki adımlar:
echo 1. server\.env dosyasını düzenleyin
echo 2. DB_PASSWORD değerini MySQL root şifrenizle güncelleyin
echo 3. Backend server'ı yeniden başlatın
echo.
pause

