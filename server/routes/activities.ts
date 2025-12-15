import express from 'express';
import db from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Tüm aktiviteleri getir (admin için)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { volunteer_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT va.*, 
             v.first_name as volunteer_first_name, 
             v.last_name as volunteer_last_name,
             v.phone as volunteer_phone
      FROM volunteer_activities va
      LEFT JOIN volunteers v ON va.volunteer_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (volunteer_id) {
      query += ' AND va.volunteer_id = ?';
      params.push(volunteer_id);
    }

    if (start_date) {
      query += ' AND va.activity_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND va.activity_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY va.activity_date DESC, va.activity_time DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error: any) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Belirli bir gönüllünün aktivitelerini getir (public endpoint - auth gerekmez)
router.get('/volunteer/:volunteer_id', async (req, res) => {
  try {
    const { volunteer_id } = req.params;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT va.*
      FROM volunteer_activities va
      WHERE va.volunteer_id = ?
    `;
    const params: any[] = [volunteer_id];

    if (start_date) {
      query += ' AND va.activity_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND va.activity_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY va.activity_date DESC, va.activity_time DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error: any) {
    console.error('Get volunteer activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Public gallery endpoint - sadece resim içeren aktiviteleri getir (auth gerekmez)
router.get('/public/gallery', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT va.*, 
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name
       FROM volunteer_activities va
       LEFT JOIN volunteers v ON va.volunteer_id = v.id
       WHERE va.image_ids IS NOT NULL 
         AND va.image_ids != ''
         AND va.image_ids != '[]'
       ORDER BY va.activity_date DESC, va.activity_time DESC`
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Get gallery activities error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery activities' });
  }
});

// Tek bir aktiviteyi getir
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.execute(
      `SELECT va.*, 
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name
       FROM volunteer_activities va
       LEFT JOIN volunteers v ON va.volunteer_id = v.id
       WHERE va.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(rows[0]);
  } catch (error: any) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Yeni aktivite ekle (tek veya çoklu gönüllü için)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { volunteer_id, volunteer_ids, title, description, activity_date, activity_time, location, image_ids } = req.body;

    // volunteer_id veya volunteer_ids olmalı
    const volunteerIds = volunteer_ids || (volunteer_id ? [volunteer_id] : []);

    if (!volunteerIds || volunteerIds.length === 0 || !title || !activity_date) {
      return res.status(400).json({ error: 'Volunteer ID(s), title, and activity date are required' });
    }

    // Gönüllülerin var olduğunu kontrol et
    const placeholders = volunteerIds.map(() => '?').join(',');
    const [volunteersCheck]: any = await db.execute(
      `SELECT id FROM volunteers WHERE id IN (${placeholders})`,
      volunteerIds
    );

    if (volunteersCheck.length !== volunteerIds.length) {
      return res.status(400).json({ error: 'One or more volunteers not found' });
    }

    // Image IDs'i JSON string'e çevir
    const imageIdsJson = image_ids && Array.isArray(image_ids) && image_ids.length > 0
      ? JSON.stringify(image_ids)
      : null;

    // Her gönüllü için aktivite oluştur
    const insertPromises = volunteerIds.map((vid: number) =>
      db.execute(
        `INSERT INTO volunteer_activities (volunteer_id, title, description, activity_date, activity_time, location, image_ids, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vid,
          title,
          description || null,
          activity_date,
          activity_time || null,
          location || null,
          imageIdsJson,
          (req as any).userId || null
        ]
      )
    );

    const results = await Promise.all(insertPromises);
    const activityIds: number[] = [];
    results.forEach(([result]: any) => {
      activityIds.push(result.insertId);
    });

    // Oluşturulan aktiviteleri getir
    if (activityIds.length === 0) {
      return res.status(500).json({ error: 'Failed to create activities' });
    }

    const placeholders2 = activityIds.map(() => '?').join(',');
    const [newActivities]: any = await db.execute(
      `SELECT va.*, 
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name
       FROM volunteer_activities va
       LEFT JOIN volunteers v ON va.volunteer_id = v.id
       WHERE va.id IN (${placeholders2})
       ORDER BY va.id`,
      activityIds
    );

    // Tek aktivite varsa tek obje döndür, çoklu varsa array
    res.status(201).json(volunteerIds.length === 1 ? newActivities[0] : newActivities);
  } catch (error: any) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Toplu aktivite ekle (birden fazla gönüllü için) - Deprecated: artık / endpoint'i kullanılabilir
router.post('/bulk', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { volunteer_ids, title, description, activity_date, activity_time, location, image_ids } = req.body;

    if (!volunteer_ids || !Array.isArray(volunteer_ids) || volunteer_ids.length === 0) {
      return res.status(400).json({ error: 'Volunteer IDs array is required' });
    }

    if (!title || !activity_date) {
      return res.status(400).json({ error: 'Title and activity date are required' });
    }

    // Gönüllülerin var olduğunu kontrol et
    const placeholders = volunteer_ids.map(() => '?').join(',');
    const [volunteersCheck]: any = await db.execute(
      `SELECT id FROM volunteers WHERE id IN (${placeholders})`,
      volunteer_ids
    );

    if (volunteersCheck.length !== volunteer_ids.length) {
      return res.status(400).json({ error: 'One or more volunteers not found' });
    }

    // Image IDs'i JSON string'e çevir
    const imageIdsJson = image_ids && Array.isArray(image_ids) && image_ids.length > 0
      ? JSON.stringify(image_ids)
      : null;

    // Toplu insert - her gönüllü için ayrı insert
    const insertPromises = volunteer_ids.map((volunteer_id: number) =>
      db.execute(
        `INSERT INTO volunteer_activities (volunteer_id, title, description, activity_date, activity_time, location, image_ids, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          volunteer_id,
          title,
          description || null,
          activity_date,
          activity_time || null,
          location || null,
          imageIdsJson,
          (req as any).userId || null
        ]
      )
    );

    const results = await Promise.all(insertPromises);
    const activityIds: number[] = [];
    results.forEach(([result]: any) => {
      activityIds.push(result.insertId);
    });

    // Oluşturulan aktiviteleri getir
    if (activityIds.length === 0) {
      return res.status(500).json({ error: 'Failed to create activities' });
    }

    const placeholders2 = activityIds.map(() => '?').join(',');
    const [newActivities]: any = await db.execute(
      `SELECT va.*, 
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name
       FROM volunteer_activities va
       LEFT JOIN volunteers v ON va.volunteer_id = v.id
       WHERE va.id IN (${placeholders2})
       ORDER BY va.id`,
      activityIds
    );

    res.status(201).json(newActivities);
  } catch (error: any) {
    console.error('Create bulk activities error:', error);
    res.status(500).json({ error: 'Failed to create activities' });
  }
});

// Aktivite güncelle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, activity_date, activity_time, location, image_ids } = req.body;

    const [existing]: any = await db.execute(
      'SELECT * FROM volunteer_activities WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Image IDs'i JSON string'e çevir
    const imageIdsJson = image_ids !== undefined
      ? (image_ids && Array.isArray(image_ids) && image_ids.length > 0 ? JSON.stringify(image_ids) : null)
      : existing[0].image_ids;

    await db.execute(
      `UPDATE volunteer_activities 
       SET title = ?, description = ?, activity_date = ?, activity_time = ?, location = ?, image_ids = ?
       WHERE id = ?`,
      [
        title || existing[0].title,
        description !== undefined ? description : existing[0].description,
        activity_date || existing[0].activity_date,
        activity_time !== undefined ? activity_time : existing[0].activity_time,
        location !== undefined ? location : existing[0].location,
        imageIdsJson,
        id
      ]
    );

    const [updated]: any = await db.execute(
      `SELECT va.*, 
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name
       FROM volunteer_activities va
       LEFT JOIN volunteers v ON va.volunteer_id = v.id
       WHERE va.id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Aktivite sil
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing]: any = await db.execute(
      'SELECT id FROM volunteer_activities WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await db.execute('DELETE FROM volunteer_activities WHERE id = ?', [id]);

    res.json({ message: 'Activity deleted successfully' });
  } catch (error: any) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

export default router;

