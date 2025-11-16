@echo off
chcp 65001 >nul
echo ========================================
echo MySQL Installer Açılıyor
echo ========================================
echo.

REM MySQL Installer yolları
set "INSTALLER1=C:\Program Files\MySQL\MySQL Installer for Windows\MySQLInstallerCommunity.exe"
set "INSTALLER2=C:\ProgramData\MySQL\MySQL Installer for Windows\MySQLInstallerCommunity.exe"

if exist "%INSTALLER1%" (
    echo MySQL Installer bulundu: %INSTALLER1%
    start "" "%INSTALLER1%"
    goto :found
)

if exist "%INSTALLER2%" (
    echo MySQL Installer bulundu: %INSTALLER2%
    start "" "%INSTALLER2%"
    goto :found
)

echo [HATA] MySQL Installer bulunamadı!
echo.
echo LUTFEN:
echo 1. Başlat menüsünde "MySQL Installer" arayın
echo 2. VEYA C:\Program Files\MySQL\ klasörüne bakın
echo 3. VEYA MySQL'i yeniden kurun
echo.
pause
exit /b 1

:found
echo.
echo MySQL Installer açıldı.
echo.
echo SONRAKI ADIMLAR:
echo 1. "Reconfigure" veya "Add" butonuna tıklayın
echo 2. Root şifresi belirleyin (unutmayın!)
echo 3. Servisi başlat seçeneğini işaretleyin
echo 4. Kurulumu tamamlayın
echo.
echo Detaylı adımlar için MYSQL-KURULUM-ADIMLAR.md dosyasına bakın.
echo.
pause

