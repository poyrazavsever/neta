---
tur: karar
durum: planlanan
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "mobile-v1, bootstrap varlığını değil evrensel bağlantı, session ve minimum owner read yüzeyinin birlikte doğrulanmasını ifade eder."
kaynaklar:
  - docs/roadmaps/platform-master-plan.md
  - docs/neta-backend-mobile-api-master-plan.md
  - bilgi/09-yol-haritasi/mobil-uygulama-plani.md
ilgili:
  - "[[06-kararlar/adr-006-mobil-versioned-api-ve-ortak-domain-servisleri|ADR-006]]"
  - "[[06-kararlar/adr-007-evrensel-mobil-uygulama|ADR-007]]"
etiketler:
  - neta
  - karar
  - mobil
  - capability
---

# ADR-011 — `mobile-v1` hazırlık anlamı

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Planlanan

## Bağlam

`mobile-v1` mevcut kodda yalnız bootstrap route'ları varken `available` ilan edilmektedir. Bu ad, istemcinin üretimde kullanılabilir minimum mobil deneyime sahip olduğu izlenimini verir ve bulunmayan owner resource API'lerini gizler.

## Karar

`mobile-v1` aggregate bir hazırlık capability'sidir. Ancak aşağıdaki bütün koşullar birlikte sağlandığında `available` olur:

- runtime domain bağlantısı ve iki instance arasında credential/cache izolasyonu;
- discovery, meta, health, catalog ve `/me` ortak contract testleri;
- email/password session lifecycle'ı;
- owner dashboard, client, project, task ve calendar read capability'leri;
- iOS/Android canlı smoke ve capability/route matrisi.

Tekil capability'ler kendi kapıları tamamlandığında bağımsız açılabilir. `mobile-v1`, mağaza release'inin bütün hukuk ve operasyon kapılarının tamamlandığı anlamına gelmez.

## Gerekçe

Aggregate adın gerçek bir kullanıcı yolunu garanti etmesi capability overclaim'i önler. Granular capability'lerin bağımsız açılması ise aşamalı teslimi engellemez.

## Değerlendirilen alternatifler

- `mobile-v1` değerini yalnız discovery/bootstrap anlamında tutmak.
- Aggregate capability'yi tamamen kaldırmak.
- Bütün owner parity tamamlanana kadar hiçbir capability yayınlamamak.

## Varsayımlar

- Mobil uygulama capability detail listesindeki `planned` durumunu feature-ready kabul etmez.
- Minimum owner read kapsamı ilk kullanılabilir ürün dilimidir.

## Yeniden değerlendirme koşulları

- İlk mobil release yalnız portal veya yalnız dashboard ürünü olarak daraltılırsa.
- Capability negotiation yerine farklı bir version/feature protokolü seçilirse.

## Canonical kaynaklar

- [[docs/roadmaps/platform-master-plan]]
- [[docs/neta-backend-mobile-api-master-plan]]
- [[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]
