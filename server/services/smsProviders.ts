// SMS Provider'ları

// Twilio SMS Provider
export class TwilioSMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async send(phone: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      // Twilio'yu dinamik olarak import et (opsiyonel bağımlılık)
      const twilio = await import('twilio');
      const client = twilio.default(this.accountSid, this.authToken);

      // Telefon numarasını temizle (+90 ekle Türkiye için)
      const cleanPhone = this.formatPhoneNumber(phone);

      const result = await client.messages.create({
        body: message,
        from: this.fromNumber,
        to: cleanPhone
      });

      return {
        success: true,
        sid: result.sid
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Telefon numarasını temizle ve formatla
    let clean = phone.replace(/\D/g, ''); // Sadece rakamlar
    
    // Türkiye telefon numaraları için
    if (clean.startsWith('0')) {
      clean = '90' + clean.substring(1);
    } else if (!clean.startsWith('90')) {
      clean = '90' + clean;
    }
    
    return '+' + clean;
  }
}

// TextBelt SMS Provider (Ücretsiz alternatif)
export class TextBeltSMSProvider {
  private apiKey: string;
  private baseUrl: string = 'https://textbelt.com';

  constructor(apiKey?: string) {
    // TextBelt'in ücretsiz API'si API key gerektirmez (günlük limit var)
    this.apiKey = apiKey || '';
    this.baseUrl = apiKey ? 'https://textbelt.com/text' : 'https://textbelt.com/text';
  }

  async send(phone: string, message: string): Promise<{ success: boolean; error?: string; quotaRemaining?: number }> {
    try {
      const axios = await import('axios');
      
      // Telefon numarasını temizle (ABD formatı gerekir, Türkiye için sınırlı)
      const cleanPhone = this.formatPhoneNumber(phone);

      const response = await axios.default.post(this.baseUrl, {
        phone: cleanPhone,
        message: message,
        key: this.apiKey || 'textbelt'
      });

      if (response.data.success) {
        return {
          success: true,
          quotaRemaining: response.data.quotaRemaining
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to send SMS'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error'
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    // TextBelt sadece ABD numaralarını destekler (ücretsiz versiyon)
    // Türkiye için Twilio veya başka bir servis kullanılmalı
    let clean = phone.replace(/\D/g, '');
    
    // ABD formatına çevirmek için (1 ile başlamalı)
    if (!clean.startsWith('1') && clean.length === 10) {
      clean = '1' + clean;
    }
    
    return clean;
  }
}

// Mock SMS Provider (Test amaçlı, gerçek SMS göndermez)
export class MockSMSProvider {
  async send(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    // Mock - sadece log
    console.log(`[MOCK SMS] To: ${phone}`);
    console.log(`[MOCK SMS] Message: ${message.substring(0, 50)}...`);
    console.log(`[MOCK SMS] Status: Sent (Mock)`);
    
    // Rastgele başarı/başarısızlık simülasyonu (%90 başarı)
    const success = Math.random() > 0.1;
    
    if (success) {
      return { success: true };
    } else {
      return { success: false, error: 'Mock failure (10% chance)' };
    }
  }
}

// SMS Provider Factory
export const createSMSProvider = () => {
  const provider = process.env.SMS_PROVIDER || 'mock';
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const textBeltKey = process.env.TEXTBELT_API_KEY;

  switch (provider.toLowerCase()) {
    case 'twilio':
      if (accountSid && authToken && fromNumber) {
        return new TwilioSMSProvider(accountSid, authToken, fromNumber);
      } else {
        console.warn('Twilio credentials missing, falling back to mock');
        return new MockSMSProvider();
      }
    
    case 'textbelt':
      return new TextBeltSMSProvider(textBeltKey);
    
    case 'mock':
    default:
      return new MockSMSProvider();
  }
};



