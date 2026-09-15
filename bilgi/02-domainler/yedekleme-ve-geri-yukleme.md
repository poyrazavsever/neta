---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/scripts/backup.mjs
  - apps/neta-app/scripts/restore.mjs
  - docs/self-hosted-redesign/phase-8-import-release.md
ilgili:
  - "[[08-operasyon/yedekleme|Yedekleme operasyonu]]"
  - "[[08-operasyon/felaket-kurtarma|Felaket kurtarma]]"
  - "[[03-mimari/veri-kaliciigi|Veri kalıcılığı]]"
etiketler:
  - neta
  - domain
  - backup
---

# Yedekleme ve geri yükleme domaini

## Amaç

Bir instance'ın DB, auth, ayar, çeviri ve upload verisini birlikte; doğrulanabilir ve geri alınabilir biçimde korumak.

## Mevcut davranış

Backup çalışan SQLite DB'den online snapshot alır, upload ağacını kopyalar ve tüm dosyalar için byte size + SHA-256 manifest üretir. İsteğe bağlı sayı tabanlı retention yalnız geçerli Neta backup dizinlerini temizler.

Restore manifest formatını, path containment'ı, symlink bulunmamasını, size/checksum ve manifest completeness'i doğrular. DB ile uploads staging path'lerinden aynı filesystem rename ile kurulur; ara hata olursa eski hedef rollback path'inden geri taşınır.

## Temel kavramlar

- Backup bundle: `neta.db`, opsiyonel `uploads/`, `manifest.json`.
- Restore target: varsayılan data dir veya rehearsal için ayrı `--target`.
- Rollback: eski image + upgrade öncesi DB/upload backup.

## Veri kalıcılığı

Backup varsayılan olarak aynı `/app/data/backups` kökündedir; bu fiziksel disk arızasına karşı bağımsız koruma değildir. Off-site ve at-rest encryption operatör sorumluluğudur.

## Yetkilendirme / API

Bu bir HTTP kullanıcı capability'si değil, host CLI operasyonudur. Restore sırasında uygulama process'i durmalıdır.

## Güvenlik

Backup auth tablosu, kişisel/finans/journal verisi, upload ve şifreli AI key blob'u içerebilir; çalınmış backup yüksek etkili tehdittir. Checksum authenticity sağlamaz: manifest ve içerik birlikte değiştirilirse imza yoktur.

## Device token restore sınırı

Restore scripti staged DB kurulunca device token epoch'unu rotate eder ve aktif device session'ları revoke eder. Restore sonrası eski tokenın reddi için negatif kabul testi release kapısıdır.

## Kaynaklar

- `apps/neta-app/scripts/backup.mjs`
- `apps/neta-app/scripts/restore.mjs`
- [[docs/self-hosted-redesign/phase-8-import-release]]
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
