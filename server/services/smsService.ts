import db from '../config/database.js';
import { createSMSProvider } from './smsProviders.js';

// SMS gönderme servisi
export const sendSMS = async (
  phone: string,
  message: string,
  volunteerId?: number,
  linkUrl?: string
): Promise<void> => {
  let smsId: number | null = null;

  try {
    // SMS kaydını veritabanına ekle
    const [insertResult]: any = await db.execute(
      `INSERT INTO sms_messages (volunteer_id, phone, message, link_url, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [volunteerId || null, phone, message + (linkUrl ? `\n\nLink: ${linkUrl}` : ''), linkUrl || null]
    );

    smsId = insertResult.insertId;

    // SMS Provider'ı oluştur
    const provider = createSMSProvider();
    
    // Mesajı hazırla (link varsa ekle)
    const fullMessage = message + (linkUrl ? `\n\nLink: ${linkUrl}` : '');

    // SMS gönder
    const result = await provider.send(phone, fullMessage);

    if (result.success) {
      // Başarılı - durumu güncelle
      await db.execute(
        'UPDATE sms_messages SET status = ?, sent_at = NOW() WHERE id = ?',
        ['sent', smsId]
      );
      
      console.log(`✅ SMS sent to ${phone}: ${fullMessage.substring(0, 50)}...`);
      
      if ('sid' in result && result.sid) {
        console.log(`   Twilio SID: ${result.sid}`);
      }
      if ('quotaRemaining' in result && result.quotaRemaining !== undefined) {
        console.log(`   Quota remaining: ${result.quotaRemaining}`);
      }
    } else {
      // Başarısız - durumu güncelle
      await db.execute(
        'UPDATE sms_messages SET status = ? WHERE id = ?',
        ['failed', smsId]
      );
      
      const errorMsg = result.error || 'Unknown error';
      console.error(`❌ SMS failed to ${phone}: ${errorMsg}`);
      
      throw new Error(`SMS sending failed: ${errorMsg}`);
    }
  } catch (error: any) {
    console.error('SMS sending error:', error);
    
    // Hata durumunu veritabanına kaydet
    if (smsId) {
      try {
        await db.execute(
          'UPDATE sms_messages SET status = ? WHERE id = ?',
          ['failed', smsId]
        );
      } catch (dbError) {
        console.error('Failed to update SMS status:', dbError);
      }
    }

    throw error;
  }
};

// Toplu SMS gönderme
export const sendBulkSMS = async (
  phones: string[],
  message: string,
  linkUrl?: string
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const phone of phones) {
    try {
      await sendSMS(phone, message, undefined, linkUrl);
      success++;
    } catch (error) {
      failed++;
      console.error(`Failed to send SMS to ${phone}:`, error);
    }
  }

  return { success, failed };
};

