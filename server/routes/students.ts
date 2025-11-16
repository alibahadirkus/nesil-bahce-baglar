import express from 'express';
import db from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Tüm öğrencileri getir
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, 
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name,
              v.phone as volunteer_phone,
              COUNT(t.id) as tree_count
       FROM students s
       LEFT JOIN volunteers v ON s.volunteer_id = v.id
       LEFT JOIN trees t ON s.id = t.student_id
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Tek bir öğrenciyi getir
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.execute(
      `SELECT s.*, 
              v.first_name as volunteer_first_name, 
              v.last_name as volunteer_last_name,
              v.phone as volunteer_phone,
              v.email as volunteer_email
       FROM students s
       LEFT JOIN volunteers v ON s.volunteer_id = v.id
       WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Öğrencinin ağaçlarını getir
    const [trees] = await db.execute(
      'SELECT * FROM trees WHERE student_id = ? ORDER BY planting_date DESC',
      [id]
    );

    res.json({ ...rows[0], trees });
  } catch (error: any) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Yeni öğrenci ekle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, student_number, class_name, school_name, phone, email, volunteer_id, notes } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Öğrenci numarası kontrolü
    if (student_number) {
      const [existing]: any = await db.execute(
        'SELECT id FROM students WHERE student_number = ?',
        [student_number]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Student number already exists' });
      }
    }

    const [result]: any = await db.execute(
      `INSERT INTO students (first_name, last_name, student_number, class_name, school_name, phone, email, volunteer_id, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, student_number || null, class_name || null, school_name || null, phone || null, email || null, volunteer_id || null, notes || null]
    );

    // Gönüllü eşleştirildiyse eşleştirme kaydı oluştur
    if (volunteer_id) {
      await db.execute(
        `INSERT INTO student_volunteer_pairings (student_id, volunteer_id, status) 
         VALUES (?, ?, 'active')
         ON DUPLICATE KEY UPDATE status = 'active'`,
        [result.insertId, volunteer_id]
      );
    }

    const [newStudent]: any = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newStudent[0]);
  } catch (error: any) {
    console.error('Create student error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Student number already exists' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Öğrenci güncelle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, student_number, class_name, school_name, phone, email, volunteer_id, notes } = req.body;

    const [existing]: any = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Öğrenci numarası kontrolü
    if (student_number && student_number !== existing[0].student_number) {
      const [check]: any = await db.execute(
        'SELECT id FROM students WHERE student_number = ? AND id != ?',
        [student_number, id]
      );

      if (check.length > 0) {
        return res.status(400).json({ error: 'Student number already exists' });
      }
    }

    await db.execute(
      `UPDATE students 
       SET first_name = ?, last_name = ?, student_number = ?, class_name = ?, 
           school_name = ?, phone = ?, email = ?, volunteer_id = ?, notes = ?
       WHERE id = ?`,
      [
        first_name || existing[0].first_name,
        last_name || existing[0].last_name,
        student_number !== undefined ? student_number : existing[0].student_number,
        class_name !== undefined ? class_name : existing[0].class_name,
        school_name !== undefined ? school_name : existing[0].school_name,
        phone !== undefined ? phone : existing[0].phone,
        email !== undefined ? email : existing[0].email,
        volunteer_id !== undefined ? volunteer_id : existing[0].volunteer_id,
        notes !== undefined ? notes : existing[0].notes,
        id
      ]
    );

    // Gönüllü değiştiyse eşleştirme kaydını güncelle
    if (volunteer_id !== undefined && volunteer_id !== existing[0].volunteer_id) {
      if (volunteer_id) {
        await db.execute(
          `INSERT INTO student_volunteer_pairings (student_id, volunteer_id, status) 
           VALUES (?, ?, 'active')
           ON DUPLICATE KEY UPDATE status = 'active', paired_at = NOW()`,
          [id, volunteer_id]
        );
      }
    }

    const [updated]: any = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Öğrenci sil
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing]: any = await db.execute(
      'SELECT id FROM students WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await db.execute('DELETE FROM students WHERE id = ?', [id]);

    res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Öğrenci-Gönüllü eşleştirme
router.post('/:id/pair', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteer_id } = req.body;

    if (!volunteer_id) {
      return res.status(400).json({ error: 'Volunteer ID is required' });
    }

    // Öğrenciyi kontrol et
    const [student]: any = await db.execute(
      'SELECT id FROM students WHERE id = ?',
      [id]
    );

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Gönüllüyü kontrol et
    const [volunteer]: any = await db.execute(
      'SELECT id FROM volunteers WHERE id = ?',
      [volunteer_id]
    );

    if (volunteer.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Öğrencinin volunteer_id'sini güncelle
    await db.execute(
      'UPDATE students SET volunteer_id = ? WHERE id = ?',
      [volunteer_id, id]
    );

    // Eşleştirme kaydı oluştur
    await db.execute(
      `INSERT INTO student_volunteer_pairings (student_id, volunteer_id, status) 
       VALUES (?, ?, 'active')
       ON DUPLICATE KEY UPDATE status = 'active', paired_at = NOW()`,
      [id, volunteer_id]
    );

    res.json({ message: 'Student paired with volunteer successfully' });
  } catch (error: any) {
    console.error('Pair student error:', error);
    res.status(500).json({ error: 'Failed to pair student' });
  }
});

export default router;



