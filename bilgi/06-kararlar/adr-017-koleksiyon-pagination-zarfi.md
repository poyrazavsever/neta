---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "Bütün v1 collection endpoint'leri, project asset dahil, items ve pageInfo taşıyan tek opaque-cursor pagination zarfını kullanır."
kaynaklar:
  - packages/api-contracts/src/index.ts
  - docs/neta-backend-mobile-api-master-plan.md
ilgili:
  - "[[03-mimari/api|API]]"
  - "[[06-kararlar/adr-016-optimistic-concurrency-surumu|ADR-016]]"
etiketler:
  - neta
  - karar
  - api
  - pagination
---

# ADR-017 — Collection pagination zarfı

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Contract ve backend koleksiyonları kodda mevcut

## Bağlam

Mobil contract'larda çoğu liste `{items,pageInfo}` beklerken project asset kodunda array beklentisi de vardır. Farklı liste şekilleri parser ve cache davranışını kırılganlaştırır.

## Karar

Bütün v1 collection endpoint'leri, project asset listesi dahil, `{ items, pageInfo: { hasNextPage, nextCursor } }` döndürür. Cursor opaque ve filtre/sıralama bağlamına bağlıdır. Varsayılan limit 20, üst sınır 100'dür; kararlı sıralama eşitlik bozucu resource ID içerir.

## Gerekçe

Tek zarf istemci altyapısını sadeleştirir, büyük workspace'lerde sınırsız response'u engeller ve future additive pagination metadata'sına alan bırakır.

## Değerlendirilen alternatifler

- Küçük listelerde raw array, büyüklerde pagination.
- Offset/limit pagination.
- Project asset'leri için ayrı zarf.

## Varsayımlar

- Cursor istemci tarafından yorumlanmayacaktır.
- Filtre değişince önceki cursor geçersiz sayılacaktır.

## Yeniden değerlendirme koşulları

- Offline-first replication collection protokolünü değiştirirse.
- Belirli bir endpoint cursor yerine zaman aralığı contract'ı gerektirirse.

## Canonical kaynaklar

- `packages/api-contracts/src/index.ts`
- [[docs/neta-backend-mobile-api-master-plan]]
