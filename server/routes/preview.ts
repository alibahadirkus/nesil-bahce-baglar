import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Preview sayfası için HTML render
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      'SELECT * FROM link_contents WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).send('İçerik bulunamadı');
    }

    const content = rows[0];
    let images = [];

    if (content.image_ids) {
      const imageIds = JSON.parse(content.image_ids);
      if (imageIds.length > 0) {
        const placeholders = imageIds.map(() => '?').join(',');
        const [imageRows] = await db.execute(
          `SELECT id, url, original_name FROM uploaded_images WHERE id IN (${placeholders})`,
          imageIds
        );
        images = imageRows as any[];
      }
    }

    // Basit HTML sayfası döndür (React app için redirect yapılabilir)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/preview/${id}`);
  } catch (error: any) {
    console.error('Preview error:', error);
    res.status(500).send('Sunucu hatası');
  }
});

export default router;

