import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [rows]: any = await db.execute(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Daha açıklayıcı hata mesajları
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'MySQL bağlantı hatası. MySQL servisinin çalıştığından emin olun.',
        details: 'Database connection failed. Please ensure MySQL service is running.'
      });
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({ 
        error: 'MySQL yetkilendirme hatası. server/.env dosyasındaki şifreyi kontrol edin.',
        details: 'Database authentication failed. Check DB_PASSWORD in server/.env'
      });
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      return res.status(503).json({ 
        error: 'Veritabanı bulunamadı. Veritabanını oluşturun (server/config/db-init.sql).',
        details: 'Database not found. Please create the database first.'
      });
    }
    
    res.status(500).json({ 
      error: 'Server error during login',
      details: error.message 
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      res.json({ valid: true, user: decoded });
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

