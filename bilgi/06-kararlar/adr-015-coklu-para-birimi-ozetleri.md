---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "Finans özetleri para birimi bazında gruplanır; kur dönüşümü olmadan farklı currency tutarları tek toplamda birleştirilmez."
kaynaklar:
  - packages/api-contracts/src/index.ts
  - docs/neta-backend-mobile-api-master-plan.md
ilgili:
  - "[[02-domainler/finans-ve-ticari-kayitlar|Finans]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]"
etiketler:
  - neta
  - karar
  - finans
  - api
---

# ADR-015 — Çoklu para birimi özetleri

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Minor-unit tutarlar doğru olsa bile TRY, USD veya EUR değerlerini kur bilgisi olmadan toplamak finansal olarak anlamsızdır. Mevcut mobil contract tek currency özeti varsayar.

## Karar

Finans summary response'u ISO 4217 currency koduna göre gruplu toplamlar taşır ve gruplar currency koduna göre deterministik sıralanır. Kur kaynağı ve timestamp'i olmayan sistem farklı currency değerlerinden birleşik gross/net üretmez. Tek currency workspace de aynı gruplu şekli kullanır.

## Gerekçe

Tek response şekli edge-case'i gizlemez, yanlış finans toplamını önler ve sonradan kur dönüşümü eklenecekse provenance alanını zorunlu kılar.

## Değerlendirilen alternatifler

- Kullanıcı default currency'sine sessiz dönüşüm.
- İlk kaydın currency'sini bütün özet için kullanmak.
- Her istek için yalnız bir currency query parametresi zorunlu kılmak.

## Varsayımlar

- İlk sürüm exchange-rate provider içermez.
- Para tutarları integer minor unit ve uppercase ISO currency olarak taşınır.

## Yeniden değerlendirme koşulları

- Denetlenebilir kur sağlayıcısı, tarih ve dönüşüm politikası kabul edilirse.
- Ürün tek currency workspace invariant'ı koyarsa.

## Canonical kaynaklar

- `packages/api-contracts/src/index.ts`
- `apps/neta-app/server/api/v1/owner-parity.ts`
- [[docs/neta-backend-mobile-api-master-plan]]
