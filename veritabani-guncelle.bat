@echo off
chcp 65001 >nul
echo ========================================
echo Veritabanı Güncelleme
echo ========================================
echo.

set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe

if not exist "%MYSQL_PATH%" (
    echo MySQL bulunamadı. Lütfen MySQL path'ini güncelleyin.
    pause
    exit /b 1
)

echo MySQL'e bağlanılıyor...
echo Root şifrenizi girin:
echo.

"%MYSQL_PATH%" -u root -p < server\config\db-update.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Veritabanı başarıyla güncellendi!
) else (
    echo.
    echo ❌ Veritabanı güncelleme hatası oluştu.
)

echo.
pause



