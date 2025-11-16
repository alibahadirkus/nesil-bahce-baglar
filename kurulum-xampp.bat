@echo off
echo ========================================
echo XAMPP MySQL ile Veritabanı Kurulumu
echo ========================================
echo.

REM XAMPP MySQL yolu (kendi kurulumunuza göre değiştirin)
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe

REM MySQL yolu var mı kontrol et
if not exist "%MYSQL_PATH%" (
    echo [UYARI] XAMPP MySQL bulunamadı!
    echo.
    echo Bu script'te MySQL yolu: %MYSQL_PATH%
    echo.
    echo Eğer XAMPP farklı bir konumdaysa, bu dosyayı düzenleyip
    echo MYSQL_PATH değişkenini güncelleyin.
    echo.
    echo XAMPP MySQL genellikle şu konumlarda bulunur:
    echo - C:\xampp\mysql\bin\mysql.exe
    echo - D:\xampp\mysql\bin\mysql.exe
    echo.
    pause
    exit /b 1
)

echo [1/3] XAMPP MySQL'e bağlanılıyor...
echo.
echo MySQL root şifrenizi girin (XAMPP'te genellikle boş, sadece Enter):
"%MYSQL_PATH%" -u root < server\config\db-init.sql

if %errorlevel% equ 0 (
    echo.
    echo [2/3] Veritabanı başarıyla oluşturuldu!
    echo.
    echo [3/3] Veritabanını kontrol ediliyor...
    "%MYSQL_PATH%" -u root -e "USE nesil_bahce_baglar; SHOW TABLES;" 2>nul
    echo.
    echo ========================================
    echo Kurulum tamamlandı!
    echo ========================================
    echo.
    echo XAMPP kullanıyorsanız, server\.env dosyasında:
    echo DB_PASSWORD= (boş bırakın)
    echo.
) else (
    echo.
    echo [HATA] Veritabanı oluşturulamadı!
    echo.
    echo Kontrol edin:
    echo - XAMPP Control Panel'de MySQL çalışıyor mu?
    echo - MySQL şifresi doğru mu?
    echo.
)

pause

