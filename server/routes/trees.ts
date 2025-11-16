import express from 'express';
import db from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { sendSMS } from '../services/smsService.js';

const router = express.Router();

// Tüm ağaçları getir
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.*, 
              s.first_name as student_first_name, 
              s.last_name as student_last_name,
              s.student_number,
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name,
              v.phone as volunteer_phone,
              (SELECT COUNT(*) FROM tree_care_activities WHERE tree_id = t.id) as activity_count
       FROM trees t
       LEFT JOIN students s ON t.student_id = s.id
       LEFT JOIN volunteers v ON t.volunteer_id = v.id
       ORDER BY t.created_at DESC`
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Get trees error:', error);
    res.status(500).json({ error: 'Failed to fetch trees' });
  }
});

// Tek bir ağacı getir
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.execute(
      `SELECT t.*, 
              s.first_name as student_first_name, 
              s.last_name as student_last_name,
              s.student_number,
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name,
              v.phone as volunteer_phone,
              v.email as volunteer_email
       FROM trees t
       LEFT JOIN students s ON t.student_id = s.id
       LEFT JOIN volunteers v ON t.volunteer_id = v.id
       WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    // Ağacın bakım aktivitelerini getir
    const [activities] = await db.execute(
      'SELECT * FROM tree_care_activities WHERE tree_id = ? ORDER BY activity_date DESC, created_at DESC',
      [id]
    );

    res.json({ ...rows[0], activities });
  } catch (error: any) {
    console.error('Get tree error:', error);
    res.status(500).json({ error: 'Failed to fetch tree' });
  }
});

// Yeni ağaç ekle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, volunteer_id, tree_name, tree_type, location, planting_date, notes } = req.body;

    if (!student_id || !volunteer_id || !tree_name) {
      return res.status(400).json({ error: 'Student ID, volunteer ID, and tree name are required' });
    }

    // Öğrenci ve gönüllü kontrolü
    const [student]: any = await db.execute('SELECT id FROM students WHERE id = ?', [student_id]);
    const [volunteer]: any = await db.execute('SELECT id FROM volunteers WHERE id = ?', [volunteer_id]);

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (volunteer.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const [result]: any = await db.execute(
      `INSERT INTO trees (student_id, volunteer_id, tree_name, tree_type, location, planting_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, volunteer_id, tree_name, tree_type || null, location || null, planting_date || null, notes || null]
    );

    const treeId = result.insertId;

    // Eşleştirme kaydı oluştur veya güncelle
    await db.execute(
      `INSERT INTO student_volunteer_pairings (student_id, volunteer_id, tree_id, status) 
       VALUES (?, ?, ?, 'active')
       ON DUPLICATE KEY UPDATE tree_id = ?, status = 'active'`,
      [student_id, volunteer_id, treeId, treeId]
    );

    // Öğrenci-Volunteer eşleştirmesini güncelle
    await db.execute(
      'UPDATE students SET volunteer_id = ? WHERE id = ?',
      [volunteer_id, student_id]
    );

    // Dikim aktivitesi kaydı oluştur
    await db.execute(
      `INSERT INTO tree_care_activities (tree_id, activity_type, activity_date, description, completed_by) 
       VALUES (?, 'checkup', ?, 'Ağaç dikildi', 'student')`,
      [treeId, planting_date || new Date().toISOString().split('T')[0]]
    );

    // Gönüllüye bilgilendirme SMS'i gönder
    try {
      const [volunteerInfo]: any = await db.execute(
        'SELECT first_name, last_name, phone FROM volunteers WHERE id = ?',
        [volunteer_id]
      );

      if (volunteerInfo.length > 0 && volunteerInfo[0].phone) {
        const [studentInfo]: any = await db.execute(
          'SELECT first_name, last_name FROM students WHERE id = ?',
          [student_id]
        );

        const message = `Merhaba ${volunteerInfo[0].first_name} ${volunteerInfo[0].last_name}! ${studentInfo[0]?.first_name || 'Öğrenci'} ile birlikte "${tree_name}" ağacını diktik. Ağacın büyüme sürecini takip edeceğiz ve size bilgilendirme mesajları göndereceğiz.`;
        
        await sendSMS(volunteerInfo[0].phone, message, volunteer_id);
      }
    } catch (smsError) {
      console.error('Welcome SMS error after tree planting:', smsError);
      // SMS hatası olsa bile ağaç kaydı başarılı
    }

    const [newTree]: any = await db.execute(
      'SELECT * FROM trees WHERE id = ?',
      [treeId]
    );

    res.status(201).json(newTree[0]);
  } catch (error: any) {
    console.error('Create tree error:', error);
    res.status(500).json({ error: 'Failed to create tree' });
  }
});

// Ağaç güncelle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tree_name, tree_type, location, planting_date, status, notes } = req.body;

    const [existing]: any = await db.execute(
      'SELECT * FROM trees WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    await db.execute(
      `UPDATE trees 
       SET tree_name = ?, tree_type = ?, location = ?, planting_date = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        tree_name || existing[0].tree_name,
        tree_type !== undefined ? tree_type : existing[0].tree_type,
        location !== undefined ? location : existing[0].location,
        planting_date || existing[0].planting_date,
        status || existing[0].status,
        notes !== undefined ? notes : existing[0].notes,
        id
      ]
    );

    const [updated]: any = await db.execute(
      'SELECT * FROM trees WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update tree error:', error);
    res.status(500).json({ error: 'Failed to update tree' });
  }
});

// Ağaç sil
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing]: any = await db.execute(
      'SELECT id FROM trees WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    await db.execute('DELETE FROM trees WHERE id = ?', [id]);

    res.json({ message: 'Tree deleted successfully' });
  } catch (error: any) {
    console.error('Delete tree error:', error);
    res.status(500).json({ error: 'Failed to delete tree' });
  }
});

// Bakım aktivitesi ekle
router.post('/:id/care', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { activity_type, activity_date, description, photo_url, completed_by } = req.body;

    if (!activity_type || !activity_date) {
      return res.status(400).json({ error: 'Activity type and date are required' });
    }

    // Ağacı kontrol et
    const [tree]: any = await db.execute(
      'SELECT t.*, v.phone, v.first_name, v.last_name FROM trees t LEFT JOIN volunteers v ON t.volunteer_id = v.id WHERE t.id = ?',
      [id]
    );

    if (tree.length === 0) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    // Bakım aktivitesi kaydı oluştur
    const [result]: any = await db.execute(
      `INSERT INTO tree_care_activities (tree_id, activity_type, activity_date, description, photo_url, completed_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, activity_type, activity_date, description || null, photo_url || null, completed_by || 'student']
    );

    const activityId = result.insertId;

    // Aktivite tipine göre otomatik SMS gönder
    try {
      const volunteerPhone = tree[0].phone;
      const volunteerName = `${tree[0].first_name} ${tree[0].last_name}`;

      if (volunteerPhone) {
        let smsMessage = '';

        switch (activity_type) {
          case 'watering':
            smsMessage = `Merhaba ${volunteerName}! "${tree[0].tree_name}" ağacı sulandı. Ağacımız büyümeye devam ediyor! 🌱`;
            break;
          case 'fertilizing':
            smsMessage = `Merhaba ${volunteerName}! "${tree[0].tree_name}" ağacına gübre uygulandı. Ağacımız sağlıklı büyüyor! 🌳`;
            break;
          case 'growth_update':
            smsMessage = `Merhaba ${volunteerName}! "${tree[0].tree_name}" ağacının büyüme güncellemesi: ${description || 'Ağaç güzelce büyüyor!'} 🌲`;
            break;
          case 'photo':
            smsMessage = `Merhaba ${volunteerName}! "${tree[0].tree_name}" ağacının yeni fotoğrafı çekildi. Ağacın gelişimini görmek için linke tıklayın.`;
            break;
          default:
            smsMessage = `Merhaba ${volunteerName}! "${tree[0].tree_name}" ağacı için yeni bir bakım aktivitesi kaydedildi: ${description || activity_type}`;
        }

        if (smsMessage) {
          await sendSMS(volunteerPhone, smsMessage, tree[0].volunteer_id);
          
          // SMS gönderildi olarak işaretle
          await db.execute(
            'UPDATE tree_care_activities SET sms_sent = TRUE, sms_sent_at = NOW() WHERE id = ?',
            [activityId]
          );
        }
      }
    } catch (smsError) {
      console.error('SMS error after care activity:', smsError);
      // SMS hatası olsa bile aktivite kaydı başarılı
    }

    const [newActivity]: any = await db.execute(
      'SELECT * FROM tree_care_activities WHERE id = ?',
      [activityId]
    );

    res.status(201).json(newActivity[0]);
  } catch (error: any) {
    console.error('Create care activity error:', error);
    res.status(500).json({ error: 'Failed to create care activity' });
  }
});

export default router;



