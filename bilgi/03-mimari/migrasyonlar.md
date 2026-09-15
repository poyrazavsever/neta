---
tur: mimari
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
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

Readiness bugün yalnız `runtime_checks` tablosunun varlığını “migrations applied” sayar. Bu, bütün migration journal'ının beklenen son sürümde olduğunu ayrıntılı olarak doğrulamaz; release smoke ve integrity scriptleri ayrı kanıttır.

## Riskler

Startup migration tek replica varsayımına uyar; iki replica aynı anda upgrade edilmemelidir. Büyük backfill süre/disk ihtiyacı ayrı prova gerektirir.

## Kaynaklar

- `apps/neta-app/scripts/migrate.mjs`
- `apps/neta-app/server/db/migrations/`
- [[docs/self-hosted-redesign/i18n-phase-0/migration-contract]]
- [[docs/self-hosted-redesign/release/i18n-self-host-upgrade]]
