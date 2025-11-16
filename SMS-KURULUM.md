# SMS Servisi Kurulum Rehberi

## Ücretsiz SMS Servisleri

Sistem şu anda 3 SMS provider'ı destekliyor:

### 1. Mock (Test Modu) - Varsayılan
- **Ücretsiz:** ✅ Evet
- **Gerçek SMS gönderir:** ❌ Hayır (sadece test için)
- **Kullanım:** Geliştirme ve test amaçlı
- **Kurulum:** Hiçbir ayar gerekmez

### 2. Twilio - Ücretsiz Deneme
- **Ücretsiz:** ✅ Evet (deneme hesabı)
- **Gerçek SMS gönderir:** ✅ Evet
- **Ücretsiz limit:** ~$15.50 kredi (yaklaşık 1000 SMS)
- **Ülke desteği:** Türkiye dahil tüm ülkeler
- **Kurulum:** Twilio hesabı gerekir

### 3. TextBelt - Ücretsiz
- **Ücretsiz:** ✅ Evet
- **Gerçek SMS gönderir:** ✅ Evet
- **Limit:** Günlük 1 SMS (ücretsiz)
- **Ülke desteği:** ❌ Sadece ABD numaraları
- **Kurulum:** API key gerekmez

## Twilio Kurulumu (Önerilen - Türkiye için)

### Adım 1: Twilio Hesabı Oluştur

1. https://www.twilio.com/try-twilio adresine gidin
2. Ücretsiz hesap oluşturun
3. Telefon numaranızı doğrulayın
4. Dashboard'dan bilgilerinizi alın:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (gönderen numara)

### Adım 2: .env Dosyasını Güncelle

`server/.env` dosyasını açın ve şu değerleri ekleyin:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+15551234567
```

**ÖNEMLİ:** 
- `TWILIO_FROM_NUMBER` formatı: `+` ile başlamalı ve ülke kodu içermeli
- Örnek Türkiye: `+905551234567`
- Twilio deneme hesabında sadece doğruladığınız numaralara SMS gönderebilirsiniz

### Adım 3: Backend Server'ı Yeniden Başlat

```powershell
npm run dev:server
```

### Adım 4: Test Et

Admin panelinden bir SMS gönderin ve Twilio dashboard'da gönderim geçmişini kontrol edin.

## TextBelt Kurulumu (Sadece ABD)

### Adım 1: .env Dosyasını Güncelle

```env
SMS_PROVIDER=textbelt
```

**Not:** TextBelt ücretsiz versiyon sadece ABD telefon numaralarını destekler.

### Adım 2: Backend Server'ı Yeniden Başlat

```powershell
npm run dev:server
```

## Mock Modu (Test için)

Varsayılan olarak sistem **mock** modunda çalışır. Bu modda:
- Gerçek SMS gönderilmez
- Tüm SMS'ler "sent" olarak işaretlenir
- Konsola log mesajları yazılır
- Geliştirme ve test için idealdir

Mock modunu kullanmak için `.env` dosyasında:
```env
SMS_PROVIDER=mock
```

## SMS Gönderimi

1. Admin panelinde **SMS Gönderimi** sayfasına gidin
2. Mesajınızı yazın
3. Gönüllüleri seçin
4. **Gönder** butonuna tıklayın

SMS'ler otomatik olarak seçilen provider üzerinden gönderilir.

## Sorun Giderme

### "Twilio credentials missing"
→ `.env` dosyasında Twilio bilgilerini kontrol edin

### "Invalid phone number"
→ Telefon numarası formatını kontrol edin (+90 ile başlamalı Türkiye için)

### "SMS quota exceeded"
→ Twilio deneme hesabı limiti dolmuş. Ücretli plana geçin veya yeni hesap açın

### TextBelt "Only US numbers supported"
→ TextBelt ücretsiz versiyonu sadece ABD numaralarını destekler. Twilio kullanın.

## Ücretsiz Alternatifler

### Twilio (En İyi Seçenek)
- ✅ Türkiye desteği
- ✅ Ücretsiz deneme ($15.50 kredi)
- ✅ Güvenilir ve yaygın
- ❌ Deneme sonrası ücretli

### TextBelt
- ✅ Tamamen ücretsiz
- ❌ Sadece ABD numaraları
- ❌ Günlük 1 SMS limiti

### Diğer Seçenekler
- **Plivo:** Ücretsiz deneme kredisi
- **Vonage (Nexmo):** Ücretsiz deneme kredisi
- **Netgsm, Ileti Merkezi:** Türkiye'de popüler ama ücretli

## Öneri

**Türkiye için en iyi seçenek:** Twilio (ücretsiz deneme hesabı)
- Türkiye numaralarını destekler
- Ücretsiz deneme kredisi yeterlidir
- Production'da da kullanılabilir

**Test için:** Mock modu
- Gerçek SMS göndermez
- Geliştirme için idealdir



