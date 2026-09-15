---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-04
guven: yuksek
ozet: "Retry edilebilir v1 mutation sonuçları actor, method, route ve Idempotency-Key kapsamında SQLite'ta atomik olarak saklanır."
kaynaklar:
  - apps/neta-app/server/api/v1/mutations.ts
  - apps/neta-app/server/db/schema/runtime.ts
  - apps/neta-app/server/db/migrations/0013_glorious_ben_grimm.sql
ilgili:
  - "[[03-mimari/api|API]]"
  - "[[06-kararlar/adr-016-optimistic-concurrency-surumu|ADR-016]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]"
etiketler:
  - neta
  - karar
  - api
  - idempotency
---

# ADR-021 — API mutation idempotency kaydı

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Mobil ağlarda cevap kaybolabilir veya istemci aynı create/complete isteğini yeniden gönderebilir. Yalnız istemci tarafında butonu kilitlemek, sunucuda duplicate side effect'i önlemez.

## Karar

Retry edilebilir `POST` ve `PUT` v1 mutation'ları geçerli bir `Idempotency-Key` ister. Sunucu payload'ın kararlı JSON hash'ini ve JSON yanıtını `actor + method + route + key` kapsamında aynı SQLite transaction'ında saklar. Aynı payload replay edilir; aynı key farklı payload ile gelirse `409 CONFLICT` döner. Kayıtlar yedi gün tutulur.

Davet token'ı bu response store'a yazılmaz. Portal davetinde raw token server secret, actor, client ve idempotency key'den HMAC ile türetilir; kalıcı davet tablosunda yalnız token hash'i bulunur.

## Gerekçe

Bu model tek-process/SQLite invariant'ıyla uyumludur, side effect ile replay kaydını atomik yapar ve process restart sonrasında da retry güvenliği sağlar.

## Değerlendirilen alternatifler

- Yalnız mobilde double-tap engellemek.
- Process belleğinde kısa süreli key cache'i.
- Bütün mutation'ları koşulsuz last-write-wins yapmak.

## Varsayımlar

- Self-hosted runtime tek yazıcı process ve tek SQLite veritabanı invariant'ını korur.
- İstemci bir kullanıcı niyeti için ürettiği key'i yalnız aynı payload'ın transport retry'larında yeniden kullanır.
- Yedi günlük retention, online mobil retry penceresi için yeterlidir; uzun süreli offline queue henüz kapsamda değildir.

## Sınırlar

- Bu tablo multi-replica desteği sağlamaz.
- Büyük response'lar 512 KiB ile sınırlandırılır.
- Update/delete çakışmaları idempotency değil [[06-kararlar/adr-016-optimistic-concurrency-surumu|optimistic concurrency]] ile çözülür.

## Yeniden değerlendirme koşulları

- Runtime farklı bir transactional datastore'a taşınırsa.
- Offline mutation kuyruğu daha uzun replay retention gerektirirse.

## Canonical kaynaklar

- `apps/neta-app/server/api/v1/mutations.ts`
- `apps/neta-app/server/db/schema/runtime.ts`
- `apps/neta-app/scripts/phase1-auth-smoke.mjs`
