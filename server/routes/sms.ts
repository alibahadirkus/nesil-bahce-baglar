import express from 'express';
import db from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { sendSMS, sendBulkSMS } from '../services/smsService.js';

const router = express.Router();

// Tek bir gönüllüye SMS gönder
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { volunteer_id, phone, message, link_url } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    await sendSMS(phone, message, volunteer_id, link_url);

    res.json({ message: 'SMS sent successfully' });
  } catch (error: any) {
    console.error('Send SMS error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Toplu SMS gönder (gönüllü ID'leri ile)
router.post('/send-bulk', authenticateToken, async (req, res) => {
  try {
    const { volunteer_ids, message, link_url } = req.body;

    if (!volunteer_ids || !Array.isArray(volunteer_ids) || volunteer_ids.length === 0) {
      return res.status(400).json({ error: 'Volunteer IDs array is required' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Gönüllü telefon numaralarını al
    const placeholders = volunteer_ids.map(() => '?').join(',');
    const [volunteers]: any = await db.execute(
      `SELECT id, phone FROM volunteers WHERE id IN (${placeholders})`,
      volunteer_ids
    );

    if (volunteers.length === 0) {
      return res.status(404).json({ error: 'No volunteers found' });
    }

    const phones = volunteers.map((v: any) => v.phone);
    const result = await sendBulkSMS(phones, message, link_url);

    res.json({
      message: 'Bulk SMS sent',
      total: volunteers.length,
      success: result.success,
      failed: result.failed
    });
  } catch (error: any) {
    console.error('Send bulk SMS error:', error);
    res.status(500).json({ error: 'Failed to send bulk SMS' });
  }
});

// SMS geçmişi
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { volunteer_id, limit = 50 } = req.query;

    let query = `
      SELECT 
        sm.*,
        v.first_name,
        v.last_name
      FROM sms_messages sm
      LEFT JOIN volunteers v ON sm.volunteer_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (volunteer_id) {
      query += ' AND sm.volunteer_id = ?';
      params.push(volunteer_id);
    }

    query += ' ORDER BY sm.created_at DESC LIMIT ?';
    params.push(parseInt(limit as string));

    const [rows] = await db.execute(query, params);

    res.json(rows);
  } catch (error: any) {
    console.error('Get SMS history error:', error);
    res.status(500).json({ error: 'Failed to fetch SMS history' });
  }
});

export default router;

