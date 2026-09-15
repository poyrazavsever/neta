---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "V1 resource version alanı mevcut updatedAt ISO instant değerinin opaque kopyasıdır; stale mutation 409 döner."
kaynaklar:
  - packages/api-contracts/src/index.ts
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[03-mimari/api|API]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]"
etiketler:
  - neta
  - karar
  - api
  - concurrency
---

# ADR-016 — Optimistic concurrency sürümü

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Mobil ve web aynı kaydı farklı zamanlarda güncelleyebilir. Koşulsuz update, daha yeni verinin eski mobil form tarafından sessizce ezilmesine yol açar.

## Karar

V1 resource presenter'ları `version` alanını ilgili kaydın UTC ISO `updatedAt` değerinden üretir; istemci bu değeri opaque kabul eder. Update/delete mutation'ı son okunan version'ı gönderir. Eşleşmeyen version `409 CONFLICT` döndürür ve kayıt değişmez. Create işleminde version yoktur.

## Gerekçe

Mevcut schema timestamp'lerini kullanır, yeni global counter zorunluluğu doğurmaz ve istemciye deterministik stale-write sinyali verir.

## Değerlendirilen alternatifler

- Koşulsuz last-write-wins.
- Ayrı integer revision kolonu.
- HTTP ETag/If-Match'i tek concurrency mekanizması yapmak.

## Varsayımlar

- Güncelleme işlemleri `updatedAt` değerini aynı transaction içinde değiştirir.
- İstemci version değerini parse etmez veya yerel saatle üretmez.

## Yeniden değerlendirme koşulları

- Aynı zaman damgası çözünürlüğünde çakışma kanıtlanırsa.
- Event-sourcing veya integer revision şeması kabul edilirse.

## Canonical kaynaklar

- `packages/api-contracts/src/index.ts`
- `apps/neta-app/server/api/v1/mutations.ts`
- `apps/neta-app/server/api/v1/owner-mutations.ts`
- [[docs/roadmaps/platform-master-plan]]
