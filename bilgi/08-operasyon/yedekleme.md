---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/scripts/backup.mjs
  - README.md
  - docs/self-hosted-redesign/phase-8-import-release.md
ilgili:
  - "[[05-is-akislari/yedekleme-ve-geri-yukleme|Backup/restore akışı]]"
  - "[[08-operasyon/felaket-kurtarma|Felaket kurtarma]]"
etiketler:
  - neta
  - operasyon
  - backup
---

# Yedekleme

## Komutlar

```bash
pnpm db:backup
pnpm db:backup -- --retention-count 14
```

Cron ortamında `BACKUP_RETENTION_COUNT=14` aynı politikayı verir.

## Üretilen bundle

`DATA_DIR/backups/neta-<ISO timestamp>/` altında `neta.db`, varsa `uploads/` ve `manifest.json`. Manifest format/version, creation time, source path metadata ve her dosya için relative path, byte size, SHA-256 taşır.

## Güvenlik ve dayanıklılık

- SQLite çalışan uygulamada online backup API ile snapshot alınır.
- Upload ağacındaki symlink/unsupported entry backup'ı durdurur.
- Retention yalnız isim/manifest kriterlerini sağlayan backup dizinlerine uygulanır.
- Local retention off-site retention değildir.
- Bundle app-level encrypted veya signed değildir; host tarafında şifreli, erişim kontrollü ve bağımsız lokasyona kopyalanmalıdır.

## Önerilen asgari kontrol

Backup job exit status, son başarılı backup yaşı, boyut anomalisi, off-site copy sonucu ve periyodik restore rehearsal izlenmelidir. RPO/RTO repository'de tek bir production standardı olarak dondurulmamıştır.

## Kaynaklar

- `apps/neta-app/scripts/backup.mjs`
- [[README]]
- [[docs/self-hosted-redesign/phase-8-import-release]]
