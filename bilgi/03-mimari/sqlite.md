---
tur: mimari
durum: mevcut
guncellendi: 2026-09-03
guven: yuksek
kaynaklar:
  - apps/neta-app/server/db/client.ts
  - apps/neta-app/scripts/migrate.mjs
  - apps/neta-app/scripts/backup.mjs
  - docs/self-hosted-redesign/phase-0-adrs.md
ilgili:
  - "[[03-mimari/veri-kaliciigi|Veri kalıcılığı]]"
  - "[[06-kararlar/adr-001-sqlite-kalici-veri|ADR-001: SQLite kalıcı veri]]"
etiketler:
  - neta
  - mimari
  - sqlite
---

# SQLite

## Neden seçildi

Tek owner ve tek process self-hosting modelinde ayrı database servisini kaldırır; app verisi ile auth verisini aynı backup/cutover sınırında tutar; kurulum ve geri yükleme yüzeyini küçültür.

## Mevcut ayarlar

- `foreign_keys = ON`
- `journal_mode = WAL`
- `synchronous = NORMAL`
- `busy_timeout = 5000`
- Drizzle schema/migrations
- Process başına cache'lenen tek `better-sqlite3` connection

## Transaction kullanımı

İlk owner reservation/completion, client invitation acceptance ve file metadata koordinasyonu gibi kritik akışlar transaction kullanır. Bazı yarışa hassas file işlemlerinde immediate transaction davranışı istenir.

## Desteklenen çalışma modeli

Tek uygulama process'i DB'ye yazar. Paralel HTTP istekleri aynı process/connection politikası içinde olabilir; aynı DB'yi ayrı replika/process'lerle paylaşımlı writer olarak açmak desteklenmez.

## Backup

Online snapshot `better-sqlite3` backup API'siyle alınır. DB dosyasını çalışan process sırasında sıradan `cp` ile kopyalamak canonical yöntem değildir.

## Limitler ve tetikleyiciler

Bu seçim şu durumlarda yeniden değerlendirilir:

- Gerçek multi-owner/multi-tenant cloud ihtiyacı.
- Birden fazla writer replica zorunluluğu.
- Tek host kapasitesini aşan write/concurrency ölçümleri.
- Local filesystem olmadan çalışması gereken platform hedefi.

Bu tetikleyiciler bugün gerçekleşmiş sayılmaz. Önce ölçüm ve ürün kararı gerekir.

## Kaynaklar

- `apps/neta-app/server/db/client.ts`
- [[docs/self-hosted-redesign/phase-0-adrs]]
- [[docs/self-hosted-redesign/phase-1-runtime]]
