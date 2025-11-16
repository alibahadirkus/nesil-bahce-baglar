import express from 'express';
import db from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { sendSMS } from '../services/smsService.js';

const router = express.Router();

// Tüm gönüllüleri getir
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM volunteers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Get volunteers error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// Tek bir gönüllüyü getir
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows]: any = await db.execute(
      'SELECT * FROM volunteers WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.json(rows[0]);
  } catch (error: any) {
    console.error('Get volunteer error:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer' });
  }
});

// Yeni gönüllü ekle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone, email, address, notes } = req.body;

    if (!first_name || !last_name || !phone) {
      return res.status(400).json({ error: 'First name, last name, and phone are required' });
    }

    // Telefon numarası kontrolü
    const [existing]: any = await db.execute(
      'SELECT id FROM volunteers WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    const [result]: any = await db.execute(
      `INSERT INTO volunteers (first_name, last_name, phone, email, address, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, phone, email || null, address || null, notes || null]
    );

    const volunteerId = result.insertId;

    // Hoşgeldin SMS'i gönder
    try {
      const welcomeMessage = `Merhaba ${first_name} ${last_name}! Nesilden Nesile Yeşil Geleceğe projesine hoş geldiniz. Sizinle çalışmak için sabırsızlanıyoruz.`;
      
      await sendSMS(phone, welcomeMessage, volunteerId);
      
      await db.execute(
        'UPDATE volunteers SET welcome_sms_sent = TRUE, welcome_sms_sent_at = NOW() WHERE id = ?',
        [volunteerId]
      );
    } catch (smsError) {
      console.error('Welcome SMS error:', smsError);
      // SMS hatası olsa bile gönüllü kaydı başarılı
    }

    const [newVolunteer]: any = await db.execute(
      'SELECT * FROM volunteers WHERE id = ?',
      [volunteerId]
    );

    res.status(201).json(newVolunteer[0]);
  } catch (error: any) {
    console.error('Create volunteer error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: 'Failed to create volunteer' });
  }
});

// Gönüllü güncelle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, email, address, notes } = req.body;

    const [existing]: any = await db.execute(
      'SELECT id FROM volunteers WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Telefon numarası değiştirilmişse kontrol et
    if (phone) {
      const [phoneCheck]: any = await db.execute(
        'SELECT id FROM volunteers WHERE phone = ? AND id != ?',
        [phone, id]
      );

      if (phoneCheck.length > 0) {
        return res.status(400).json({ error: 'Phone number already exists' });
      }
    }

    await db.execute(
      `UPDATE volunteers 
       SET first_name = ?, last_name = ?, phone = ?, email = ?, address = ?, notes = ?
       WHERE id = ?`,
      [
        first_name || existing[0].first_name,
        last_name || existing[0].last_name,
        phone || existing[0].phone,
        email !== undefined ? email : existing[0].email,
        address !== undefined ? address : existing[0].address,
        notes !== undefined ? notes : existing[0].notes,
        id
      ]
    );

    const [updated]: any = await db.execute(
      'SELECT * FROM volunteers WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update volunteer error:', error);
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
});

// Gönüllü sil
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing]: any = await db.execute(
      'SELECT id FROM volunteers WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    await db.execute('DELETE FROM volunteers WHERE id = ?', [id]);

    res.json({ message: 'Volunteer deleted successfully' });
  } catch (error: any) {
    console.error('Delete volunteer error:', error);
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
});

export default router;

