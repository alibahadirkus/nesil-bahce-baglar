import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload klasörünü oluştur
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Tek resim yükle
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Veritabanına kaydet
    const [result]: any = await db.execute(
      `INSERT INTO uploaded_images (filename, original_name, path, url, size, mime_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.file.filename,
        req.file.originalname,
        req.file.path,
        fileUrl,
        req.file.size,
        req.file.mimetype
      ]
    );

    res.json({
      id: result.insertId,
      filename: req.file.filename,
      original_name: req.file.originalname,
      url: fileUrl,
      size: req.file.size
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Çoklu resim yükle
router.post('/images', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const files = req.files as Express.Multer.File[];
    const uploadedFiles = [];

    for (const file of files) {
      const fileUrl = `${baseUrl}/uploads/${file.filename}`;

      const [result]: any = await db.execute(
        `INSERT INTO uploaded_images (filename, original_name, path, url, size, mime_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          file.filename,
          file.originalname,
          file.path,
          fileUrl,
          file.size,
          file.mimetype
        ]
      );

      uploadedFiles.push({
        id: result.insertId,
        filename: file.filename,
        original_name: file.originalname,
        url: fileUrl,
        size: file.size
      });
    }

    res.json({ files: uploadedFiles });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Yüklenen resimleri listele
router.get('/images', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM uploaded_images ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Resim sil
router.delete('/image/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [image]: any = await db.execute(
      'SELECT * FROM uploaded_images WHERE id = ?',
      [id]
    );

    if (image.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Dosyayı sil
    const filePath = image[0].path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Veritabanından sil
    await db.execute('DELETE FROM uploaded_images WHERE id = ?', [id]);

    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;

