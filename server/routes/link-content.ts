import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

// Link içeriği oluştur
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, image_ids } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const imageIdsJson = image_ids && Array.isArray(image_ids) 
      ? JSON.stringify(image_ids) 
      : null;

    const [result]: any = await db.execute(
      `INSERT INTO link_contents (title, description, image_ids) 
       VALUES (?, ?, ?)`,
      [title, description || null, imageIdsJson]
    );

    const linkUrl = `${baseUrl}/preview/${result.insertId}`;

    res.json({
      id: result.insertId,
      title,
      description,
      link_url: linkUrl,
      image_ids: image_ids || []
    });
  } catch (error: any) {
    console.error('Create link content error:', error);
    res.status(500).json({ error: 'Failed to create link content' });
  }
});

// Link içeriğini getir (preview için, auth olmadan erişilebilir)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.execute(
      'SELECT * FROM link_contents WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Link content not found' });
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

    res.json({
      ...content,
      images
    });
  } catch (error: any) {
    console.error('Get link content error:', error);
    res.status(500).json({ error: 'Failed to fetch link content' });
  }
});

// Tüm link içeriklerini listele
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM link_contents ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Get link contents error:', error);
    res.status(500).json({ error: 'Failed to fetch link contents' });
  }
});

export default router;

