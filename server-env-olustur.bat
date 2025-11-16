@echo off
chcp 65001 >nul
echo ========================================
echo .env Dosyası Oluşturuluyor
echo ========================================
echo.

set "ENV_FILE=server\.env"

if exist "%ENV_FILE%" (
    echo [UYARI] .env dosyası zaten mevcut!
    echo Üzerine yazmak istiyor musunuz? (E/H)
    set /p OVERWRITE=
    if /i not "%OVERWRITE%"=="E" (
        echo İptal edildi.
        pause
        exit /b 0
    )
)

echo .env dosyası oluşturuluyor...
(
echo # Database Configuration
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=root
echo DB_NAME=nesil_bahce_baglar
echo.
echo # Server Configuration
echo PORT=3001
echo BASE_URL=http://localhost:3001
echo.
echo # JWT Secret (change this in production!)
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
) > "%ENV_FILE%"

if exist "%ENV_FILE%" (
    echo.
    echo [BASARILI] .env dosyası oluşturuldu: %ENV_FILE%
    echo.
    echo Dosya içeriği:
    type "%ENV_FILE%"
    echo.
    echo ========================================
    echo Backend server'ı başlatabilirsiniz:
    echo   npm run dev:server
    echo ========================================
) else (
    echo.
    echo [HATA] .env dosyası oluşturulamadı!
)

echo.
pause

