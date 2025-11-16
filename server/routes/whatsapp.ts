import express from 'express';
import db from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { 
  sendWhatsAppMessage, 
  sendBulkWhatsApp, 
  getWhatsAppStatus,
  initializeWhatsApp,
  disconnectWhatsApp
} from '../services/whatsappService.js';

const router = express.Router();

// WhatsApp bağlantı durumunu al
router.get('/status', authenticateToken, (req, res) => {
  try {
    const status = getWhatsAppStatus();
    res.json(status);
  } catch (error: any) {
    console.error('Get WhatsApp status error:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp status' });
  }
});

// WhatsApp'ı başlat/bağlan
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    await initializeWhatsApp();
    const status = getWhatsAppStatus();
    res.json({ message: 'WhatsApp bağlantısı başlatıldı', status });
  } catch (error: any) {
    console.error('WhatsApp connect error:', error);
    res.status(500).json({ error: error.message || 'Failed to connect WhatsApp' });
  }
});

// WhatsApp bağlantısını kes
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    await disconnectWhatsApp();
    res.json({ message: 'WhatsApp bağlantısı kesildi' });
  } catch (error: any) {
    console.error('WhatsApp disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
});

// Tek bir gönüllüye WhatsApp mesajı gönder
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { volunteer_id, phone, message, link_url } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    await sendWhatsAppMessage(phone, message, volunteer_id, link_url);

    res.json({ message: 'WhatsApp mesajı başarıyla gönderildi' });
  } catch (error: any) {
    console.error('Send WhatsApp error:', error);
    res.status(500).json({ error: error.message || 'Failed to send WhatsApp message' });
  }
});

// Toplu WhatsApp mesajı gönder (gönüllü ID'leri ile)
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
    const result = await sendBulkWhatsApp(phones, message, link_url);

    res.json({
      message: 'Toplu WhatsApp mesajı gönderildi',
      total: volunteers.length,
      success: result.success,
      failed: result.failed
    });
  } catch (error: any) {
    console.error('Send bulk WhatsApp error:', error);
    res.status(500).json({ error: error.message || 'Failed to send bulk WhatsApp messages' });
  }
});

// WhatsApp mesaj geçmişi (SMS tablosundan, type='whatsapp' olanlar)
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
      WHERE sm.type = 'whatsapp'
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
    console.error('Get WhatsApp history error:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp history' });
  }
});

export default router;

