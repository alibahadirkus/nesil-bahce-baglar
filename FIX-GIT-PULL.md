# Git Pull Hatası Çözümü

Sunucuda local değişiklikler varsa şu komutları kullanın:

## Seçenek 1: Local Değişiklikleri Kaydet (Stash)

```bash
cd /var/www/nesil-bahce-baglar
git stash
git pull origin main
```

Sonra değişiklikleri geri almak isterseniz:
```bash
git stash pop
```

## Seçenek 2: Local Değişiklikleri Sil (Önerilen - Sunucuda genelde gereksiz)

```bash
cd /var/www/nesil-bahce-baglar
git reset --hard HEAD
git pull origin main
```

**⚠️ UYARI:** `git reset --hard` local değişiklikleri **tamamen siler**. Sunucuda genelde sorun olmaz.

## Seçenek 3: Belirli Dosyayı Discard Et

```bash
cd /var/www/nesil-bahce-baglar
git checkout -- setup-mysql.sh
git pull origin main
```

## Önerilen (Sunucu için):

```bash
cd /var/www/nesil-bahce-baglar
git reset --hard HEAD
git pull origin main
```

