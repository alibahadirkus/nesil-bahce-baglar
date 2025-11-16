# Sorun Giderme Kılavuzu

## "Failed to fetch" Hatası

Bu hata genellikle frontend'in backend API'ye bağlanamadığını gösterir.

### Kontrol Listesi:

1. **Backend Server Çalışıyor mu?**
   ```bash
   npm run dev:server
   ```
   Backend server port 3001'de çalışmalı. Tarayıcıda `http://localhost:3001/api/health` adresini açarak test edebilirsiniz.

2. **Veritabanı Bağlantısı**
   - MySQL çalışıyor mu?
   - `server/.env` dosyasındaki veritabanı bilgileri doğru mu?
   - Veritabanı oluşturuldu mu? (`server/config/db-init.sql` çalıştırıldı mı?)

3. **Port Çakışması**
   - Port 3001 başka bir uygulama tarafından kullanılıyor mu?
   - `server/.env` dosyasında PORT değiştirilebilir.

4. **CORS Sorunu**
   - Backend'de CORS açık olmalı (zaten var).
   - Frontend URL: `http://localhost:8080`
   - Backend URL: `http://localhost:3001`

### Hızlı Test:

1. Terminal'de backend server'ı başlatın:
   ```bash
   npm run dev:server
   ```

2. Yeni bir terminal'de frontend'i başlatın:
   ```bash
   npm run dev
   ```

3. Veya ikisini birlikte:
   ```bash
   npm run dev:all
   ```

### Veritabanı Kurulumu:

```bash
# MySQL'e giriş yapın
mysql -u root -p

# SQL dosyasını çalıştırın
source server/config/db-init.sql

# Veya doğrudan
mysql -u root -p < server/config/db-init.sql
```

### Ortam Değişkenleri:

`server/.env` dosyası oluşturulmalı ve şu değerler olmalı:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nesil_bahce_baglar

PORT=3001
BASE_URL=http://localhost:3001

JWT_SECRET=your-secret-key
```

### Sık Karşılaşılan Hatalar:

1. **"ECONNREFUSED"**: Backend server çalışmıyor
2. **"Access denied for user"**: Veritabanı kullanıcı bilgileri yanlış
3. **"Unknown database"**: Veritabanı oluşturulmamış
4. **"Table doesn't exist"**: SQL dosyası çalıştırılmamış

### Test Endpoints:

Backend çalışıyorsa bu URL'ler çalışmalı:

- `http://localhost:3001/api/health` - Health check
- `http://localhost:3001/api/auth/login` - Login endpoint (POST)

