// Hızlı veritabanı bağlantı testi
import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config({ path: './server/.env' });

console.log('=== Veritabanı Bağlantı Testi ===\n');

console.log('Ortam Değişkenleri:');
console.log('DB_HOST:', process.env.DB_HOST || '(tanımsız)');
console.log('DB_USER:', process.env.DB_USER || '(tanımsız)');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : '(tanımsız)');
console.log('DB_NAME:', process.env.DB_NAME || '(tanımsız)');
console.log('');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nesil_bahce_baglar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Bağlantı Hatası:', err.message);
    console.error('Hata Kodu:', err.code);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 ÇÖZÜM:');
      console.error('   - server/.env dosyasındaki DB_PASSWORD değerini kontrol edin');
      console.error('   - MySQL root şifresinin doğru olduğundan emin olun');
    }
    process.exit(1);
  }
  
  console.log('✅ MySQL bağlantısı başarılı!');
  connection.query('SELECT DATABASE() as db, USER() as user', (err, results) => {
    if (err) {
      console.error('Sorgu hatası:', err.message);
    } else {
      console.log('Veritabanı:', results[0].db);
      console.log('Kullanıcı:', results[0].user);
    }
    connection.release();
    process.exit(0);
  });
});

