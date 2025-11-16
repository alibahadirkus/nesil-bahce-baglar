import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const wa = require('whatsapp-web.js');
const { Client: WAClient, LocalAuth } = wa;
type WA_Client = typeof WAClient extends new (...args: any[]) => infer T ? T : any;
type WA_Message = any; // whatsapp-web.js Message type
import qrcode from 'qrcode-terminal';
import db from '../config/database.js';
import { EventEmitter } from 'events';

// WhatsApp bağlantı durumu için EventEmitter
export const whatsappEvents = new EventEmitter();

// WhatsApp client instance
let whatsappClient: WA_Client | null = null;
let connectionStatus: 'disconnected' | 'connecting' | 'authenticating' | 'authenticated' | 'ready' = 'disconnected';
let qrCode: string | null = null;

// WhatsApp client'ı başlat
export const initializeWhatsApp = async (): Promise<void> => {
  if (whatsappClient) {
    console.log('WhatsApp client zaten başlatılmış');
    return;
  }

  try {
    connectionStatus = 'connecting';
    whatsappEvents.emit('status', connectionStatus);

    // WhatsApp client oluştur (LocalAuth ile session'ı sakla)
    whatsappClient = new WAClient({
      authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    // QR kod oluşturulduğunda
    whatsappClient.on('qr', (qr) => {
      console.log('📱 WhatsApp QR Kodu oluşturuldu:');
      qrcode.generate(qr, { small: true });
      qrCode = qr;
      connectionStatus = 'connecting';
      whatsappEvents.emit('qr', qr);
      whatsappEvents.emit('status', connectionStatus);
    });

    // Bağlantı durumu değişiklikleri
    whatsappClient.on('authenticating', () => {
      console.log('🔐 WhatsApp doğrulanıyor...');
      connectionStatus = 'authenticating';
      whatsappEvents.emit('status', connectionStatus);
    });

    whatsappClient.on('authenticated', () => {
      console.log('✅ WhatsApp doğrulandı');
      connectionStatus = 'authenticated';
      qrCode = null;
      whatsappEvents.emit('status', connectionStatus);
      whatsappEvents.emit('authenticated');
    });

    whatsappClient.on('ready', () => {
      console.log('✅ WhatsApp hazır! Mesaj gönderebilirsiniz.');
      connectionStatus = 'ready';
      qrCode = null;
      whatsappEvents.emit('status', connectionStatus);
      whatsappEvents.emit('ready');
    });

    whatsappClient.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp doğrulama hatası:', msg);
      connectionStatus = 'disconnected';
      whatsappEvents.emit('status', connectionStatus);
      whatsappEvents.emit('error', 'Doğrulama hatası: ' + msg);
    });

    whatsappClient.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp bağlantısı kesildi:', reason);
      connectionStatus = 'disconnected';
      whatsappEvents.emit('status', connectionStatus);
      whatsappEvents.emit('disconnected', reason);
      
      // Bağlantı kesildiyse yeniden bağlanmayı dene
      if (reason === 'LOGOUT') {
        whatsappClient = null;
      }
    });

    whatsappClient.on('message', async (message: WA_Message) => {
      // Gelen mesajları logla (isteğe bağlı)
      console.log('📨 Gelen mesaj:', message.from, message.body);
    });

    // Client'ı başlat
    await whatsappClient.initialize();
  } catch (error: any) {
    console.error('WhatsApp başlatma hatası:', error);
    connectionStatus = 'disconnected';
    whatsappEvents.emit('status', connectionStatus);
    whatsappEvents.emit('error', error.message);
    throw error;
  }
};

// WhatsApp bağlantı durumunu al
export const getWhatsAppStatus = () => {
  return {
    status: connectionStatus,
    qrCode: qrCode,
    isReady: connectionStatus === 'ready'
  };
};

// WhatsApp mesaj gönder
export const sendWhatsAppMessage = async (
  phone: string,
  message: string,
  volunteerId?: number,
  linkUrl?: string
): Promise<void> => {
  if (!whatsappClient || connectionStatus !== 'ready') {
    throw new Error('WhatsApp bağlantısı hazır değil. Lütfen önce WhatsApp\'ı bağlayın.');
  }

  let messageId: number | null = null;

  try {
    // Telefon numarasını formatla (WhatsApp formatı: 905551234567@c.us)
    const formattedPhone = formatPhoneForWhatsApp(phone);

    // Mesaj kaydını veritabanına ekle
    const [insertResult]: any = await db.execute(
      `INSERT INTO sms_messages (volunteer_id, phone, message, link_url, status, type) 
       VALUES (?, ?, ?, ?, 'pending', 'whatsapp')`,
      [volunteerId || null, phone, message + (linkUrl ? `\n\nLink: ${linkUrl}` : ''), linkUrl || null]
    );

    messageId = insertResult.insertId;

    // Mesajı hazırla
    const fullMessage = message + (linkUrl ? `\n\nLink: ${linkUrl}` : '');

    // WhatsApp mesajı gönder
    const result = await whatsappClient.sendMessage(formattedPhone, fullMessage);

    if (result.id) {
      // Başarılı - durumu güncelle
      await db.execute(
        'UPDATE sms_messages SET status = ?, sent_at = NOW(), external_id = ? WHERE id = ?',
        ['sent', result.id._serialized, messageId]
      );
      
      console.log(`✅ WhatsApp mesajı gönderildi: ${phone}`);
    } else {
      throw new Error('Mesaj gönderilemedi');
    }
  } catch (error: any) {
    console.error('WhatsApp mesaj gönderme hatası:', error);
    
    // Hata durumunu veritabanına kaydet
    if (messageId) {
      try {
        await db.execute(
          'UPDATE sms_messages SET status = ? WHERE id = ?',
          ['failed', messageId]
        );
      } catch (dbError) {
        console.error('Mesaj durumu güncellenemedi:', dbError);
      }
    }

    throw error;
  }
};

// Toplu WhatsApp mesaj gönderme
export const sendBulkWhatsApp = async (
  phones: string[],
  message: string,
  linkUrl?: string
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const phone of phones) {
    try {
      await sendWhatsAppMessage(phone, message, undefined, linkUrl);
      success++;
    } catch (error) {
      failed++;
      console.error(`WhatsApp mesajı gönderilemedi: ${phone}`, error);
    }
  }

  return { success, failed };
};

// Telefon numarasını WhatsApp formatına çevir
const formatPhoneForWhatsApp = (phone: string): string => {
  // Telefon numarasını temizle (sadece rakamlar)
  let clean = phone.replace(/\D/g, '');
  
  // Türkiye telefon numaraları için
  if (clean.startsWith('0')) {
    clean = '90' + clean.substring(1);
  } else if (!clean.startsWith('90')) {
    clean = '90' + clean;
  }
  
  // WhatsApp formatı: 905551234567@c.us
  return clean + '@c.us';
};

// WhatsApp bağlantısını kapat
export const disconnectWhatsApp = async (): Promise<void> => {
  if (whatsappClient) {
    await whatsappClient.logout();
    await whatsappClient.destroy();
    whatsappClient = null;
    connectionStatus = 'disconnected';
    qrCode = null;
    whatsappEvents.emit('status', connectionStatus);
  }
};

