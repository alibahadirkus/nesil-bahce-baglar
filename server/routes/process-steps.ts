import express from 'express';
import db from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Tüm process steps'i getir (public - auth gerekmez)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT step_number, 
              GROUP_CONCAT(image_id ORDER BY display_order, id) as image_ids
       FROM process_steps_images
       GROUP BY step_number
       ORDER BY step_number`
    );

    // image_ids'i JSON array'e çevir
    const steps = (rows as any[]).map((row: any) => ({
      step_number: row.step_number,
      image_ids: row.image_ids ? JSON.stringify(row.image_ids.split(',').map((id: string) => parseInt(id))) : '[]'
    }));

    res.json(steps);
  } catch (error: any) {
    console.error('Get process steps error:', error);
    res.status(500).json({ error: 'Failed to fetch process steps' });
  }
});

// Belirli bir step'in resimlerini getir (public - auth gerekmez)
router.get('/:step_number', async (req, res) => {
  try {
    const { step_number } = req.params;

    const [rows] = await db.execute(
      `SELECT psi.*, 
              ui.url, 
              ui.original_name,
              ui.filename
       FROM process_steps_images psi
       LEFT JOIN uploaded_images ui ON psi.image_id = ui.id
       WHERE psi.step_number = ?
       ORDER BY psi.display_order, psi.created_at`,
      [step_number]
    );

    res.json(rows);
  } catch (error: any) {
    console.error('Get process step images error:', error);
    res.status(500).json({ error: 'Failed to fetch process step images' });
  }
});

// Admin - Tüm process steps ve resimlerini getir
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT psi.*, 
              ui.url, 
              ui.original_name,
              ui.filename
       FROM process_steps_images psi
       LEFT JOIN uploaded_images ui ON psi.image_id = ui.id
       ORDER BY psi.step_number, psi.display_order, psi.created_at`
    );

    res.json(rows);
  } catch (error: any) {
    console.error('Get all process steps error:', error);
    res.status(500).json({ error: 'Failed to fetch process steps' });
  }
});

// Admin - Belirli bir step'in resimlerini getir
router.get('/admin/step/:step_number', authenticateToken, async (req, res) => {
  try {
    const { step_number } = req.params;

    const [rows] = await db.execute(
      `SELECT psi.*, 
              ui.url, 
              ui.original_name,
              ui.filename
       FROM process_steps_images psi
       LEFT JOIN uploaded_images ui ON psi.image_id = ui.id
       WHERE psi.step_number = ?
       ORDER BY psi.display_order, psi.created_at`,
      [step_number]
    );

    res.json(rows);
  } catch (error: any) {
    console.error('Get process step images error:', error);
    res.status(500).json({ error: 'Failed to fetch process step images' });
  }
});

// Admin - Process step'e resim ekle
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { step_number, image_id, title, description, display_order } = req.body;

    if (!step_number || !image_id) {
      return res.status(400).json({ error: 'Step number and image ID are required' });
    }

    if (step_number < 1 || step_number > 6) {
      return res.status(400).json({ error: 'Step number must be between 1 and 6' });
    }

    // Image'in var olduğunu kontrol et
    const [imageCheck]: any = await db.execute(
      'SELECT id FROM uploaded_images WHERE id = ?',
      [image_id]
    );

    if (imageCheck.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const [result]: any = await db.execute(
      `INSERT INTO process_steps_images (step_number, image_id, title, description, display_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        step_number,
        image_id,
        title || null,
        description || null,
        display_order || 0
      ]
    );

    const insertId = result.insertId;

    const [newRecord]: any = await db.execute(
      `SELECT psi.*, 
              ui.url, 
              ui.original_name,
              ui.filename
       FROM process_steps_images psi
       LEFT JOIN uploaded_images ui ON psi.image_id = ui.id
       WHERE psi.id = ?`,
      [insertId]
    );

    res.status(201).json(newRecord[0]);
  } catch (error: any) {
    console.error('Create process step image error:', error);
    res.status(500).json({ error: 'Failed to create process step image' });
  }
});

// Admin - Process step resmini güncelle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, display_order } = req.body;

    const [existing]: any = await db.execute(
      'SELECT id FROM process_steps_images WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Process step image not found' });
    }

    await db.execute(
      `UPDATE process_steps_images 
       SET title = ?, description = ?, display_order = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : existing[0].title,
        description !== undefined ? description : existing[0].description,
        display_order !== undefined ? display_order : existing[0].display_order,
        id
      ]
    );

    const [updated]: any = await db.execute(
      `SELECT psi.*, 
              ui.url, 
              ui.original_name,
              ui.filename
       FROM process_steps_images psi
       LEFT JOIN uploaded_images ui ON psi.image_id = ui.id
       WHERE psi.id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update process step image error:', error);
    res.status(500).json({ error: 'Failed to update process step image' });
  }
});

// Admin - Process step resmini sil
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing]: any = await db.execute(
      'SELECT id FROM process_steps_images WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Process step image not found' });
    }

    await db.execute('DELETE FROM process_steps_images WHERE id = ?', [id]);

    res.json({ message: 'Process step image deleted successfully' });
  } catch (error: any) {
    console.error('Delete process step image error:', error);
    res.status(500).json({ error: 'Failed to delete process step image' });
  }
});

export default router;
