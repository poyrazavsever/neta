---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
onceki_kimlik: K-001
guncellendi: 2026-09-03
guven: yuksek
ozet: "Self-hosted Neta'nın ana runtime veritabanı SQLite, erişim katmanı better-sqlite3 ve Drizzle'dır."
kaynaklar:
  - docs/self-hosted-redesign/phase-0-adrs.md
  - apps/neta-app/server/db/client.ts
ilgili:
  - "[[03-mimari/sqlite|SQLite]]"
  - "[[03-mimari/veri-kaliciigi|Veri kalıcılığı]]"
  - "[[06-kararlar/adr-002-tek-process-tek-veri-dizini|ADR-002]]"
  - "[[06-kararlar/adr-009-backup-restore-ve-downgrade-politikasi|ADR-009]]"
etiketler:
  - neta
  - karar
  - sqlite
---

# ADR-001 — Self-hosted persistence için SQLite

> Son güncelleme: **2026-09-03** — Toplu karar kaydındaki K-001 bağımsız ADR notuna ayrıldı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Neta'nın self-hosted dağıtımı tek owner ve tek uzun ömürlü uygulama process'i için harici bir veritabanı servisi gerektirmeden çalışmalıdır. Auth ile ürün verisinin aynı operasyonel yedekleme ve geri yükleme sınırında kalması gerekir.

## Karar

Runtime veritabanı SQLite'tır. Node erişimi `better-sqlite3`, schema ve migration yönetimi Drizzle üzerinden yürür.

## Gerekçe

- Tek process ürün modelinde ayrı PostgreSQL/Supabase servisini kaldırır.
- Kurulum, veri taşıma ve yedekleme yüzeyini küçültür.
- Auth ile domain verisini aynı veri bütünlüğü sınırında tutar.

## Değerlendirilen alternatifler

- PostgreSQL veya Supabase gibi harici/managed veritabanı.
- Runtime içinde iki ayrı auth ve domain veritabanı.

Bu seçenekler mevcut self-hosted ürün ölçeğinde ek operasyon ve dağıtık tutarlılık maliyeti getirir.

## Varsayımlar

- Instance tek writer replica ile çalışır.
- Freelancer ölçeğindeki gerçek workload tek host kapasitesini aşmaz.
- Kalıcı, yazılabilir bir filesystem vardır.

## Etkilenen sistemler ve sonuçlar

- Better Auth ve domain tabloları aynı SQLite dosyasındadır.
- WAL, foreign key ve busy-timeout politikaları runtime davranışının parçasıdır.
- Yatay multi-writer replica desteklenmez.
- Backup çalışan process sırasında SQLite-aware snapshot ile alınmalıdır.

## Uygulama kanıtı

`apps/neta-app/server/db/client.ts` SQLite bağlantısını ve runtime pragma'larını kurar. Ayrıntılı mevcut davranış [[03-mimari/sqlite|SQLite]] sayfasındadır.

## Yeniden değerlendirme koşulları

- Multi-owner veya multi-tenant cloud ürününe geçilmesi.
- Birden fazla eşzamanlı writer replica zorunluluğu.
- Ölçülmüş write/concurrency veya veri boyutu sınırlarının aşılması.
- Local persistent filesystem sunmayan bir runtime hedefi.

## Canonical kaynaklar

- [[docs/self-hosted-redesign/phase-0-adrs]]
- `apps/neta-app/server/db/client.ts`
