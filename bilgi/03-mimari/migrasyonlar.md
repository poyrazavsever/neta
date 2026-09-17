---
tur: mimari
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-data-acceptance.md
  - apps/neta-app/scripts/migrate.mjs
  - apps/neta-app/server/db/migrations
  - apps/neta-app/package.json
  - docs/self-hosted-redesign/i18n-phase-0/migration-contract.md
ilgili:
  - "[[03-mimari/sqlite|SQLite]]"
  - "[[08-operasyon/yayin-hazirligi|Yayın hazırlığı]]"
etiketler:
  - neta
  - mimari
  - migration
---

# Migrasyonlar

## Mevcut model

Drizzle SQL migration'ları `apps/neta-app/server/db/migrations/` altında versioned dosyalardır. `scripts/migrate.mjs` SQLite pragmalarını uygular, Drizzle migrator'ı çalıştırır ve `runtime_checks.last_migration` değerini günceller.

## Ne zaman çalışır

- `pnpm dev` öncesi `predev`.
- `pnpm start` öncesi `prestart`.
- Docker CMD içinde server'dan önce.
- Manuel `pnpm db:migrate`.

## Kurallar

- Yeni image başlamadan migration tamamlanmalıdır.
- Migration idempotent migrator/journal mekanizmasına dayanır.
- Production upgrade öncesi backup ve restore provası gerekir.
- Eski image'e dönmek DB şemasını geri almaz; rollback eski image + eski backup'tır.
- Migration dosyaları/Drizzle journal'ı elle silinmez, production schema elle downgrade edilmez.
- Riskli veri dönüşümlerinde expand → migrate/backfill → contract yaklaşımı tercih edilir.

## Health bağlantısı

Readiness release journal sıra/timestamp ve SQL hash’lerini __drizzle_migrations ledger’ıyla karşılaştırır. Eksik/duplicate/değiştirilmiş/daha yeni kayıt ve eksik SQL fail closed’dur. Startup migrate boş DB/doğru prefix’i kabul eder; ledger öncesi/sonrası doğrulanır. LF/CRLF eşdeğerliği Windows/Linux taşınabilirliğini korur. Bu tam schema diff değildir. [[docs/mobile/mobile-data-acceptance]] otomatik ve production kabulünü ayırır.

## Device refresh geçmişi — 0016

`0016_device-refresh-history.sql`, tüketilmiş keyed refresh digest'lerini session foreign key'iyle saklar; önceki `previous_refresh_digest` değerini backfill eder. Önceki kodun sildiği daha eski digest'ler geri üretilemez. Bu nedenle migration mevcut aktif cihaz oturumlarını revoke eder; kullanıcı cihazı yeniden eşleştirir. Web cookie session'ları bu migration'dan etkilenmez. Geçmiş, session silindiğinde cascade ile temizlenir. Empty DB yolu auth smoke'unda, mevcut device kaydı/backfill/revoke/cascade yolu migration testinde doğrulanır.

## Riskler

Startup migration tek replica varsayımına uyar; iki replica aynı anda upgrade edilmemelidir. Büyük backfill süre/disk ihtiyacı ayrı prova gerektirir.

## Kaynaklar

- `apps/neta-app/scripts/migrate.mjs`
- `apps/neta-app/server/db/migrations/`
- [[docs/self-hosted-redesign/i18n-phase-0/migration-contract]]
- [[docs/self-hosted-redesign/release/i18n-self-host-upgrade]]

## 2026-09-17 — Ortak kontrol

Startup migrate, readiness ve restore aynı server/db/migration-state.mjs denetimini kullanır. Production standalone hazırlığı journal/SQL dosyalarını paketler.
