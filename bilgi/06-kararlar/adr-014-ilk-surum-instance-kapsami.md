---
tur: karar
durum: planlanan
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "İlk evrensel mobil sürüm tek aktif instance UX'i sunar; registry, credential ve cache baştan instanceId ile çoklu kayda uygun scope edilir."
kaynaklar:
  - apps/neta-mobile/src/lib/instance/registry.ts
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[06-kararlar/adr-007-evrensel-mobil-uygulama|ADR-007]]"
  - "[[02-domainler/instance-ve-mobil-baglanti|Instance ve mobil bağlantı]]"
etiketler:
  - neta
  - karar
  - mobil
  - instance
---

# ADR-014 — İlk sürüm instance kapsamı

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Registry temeli mevcut, runtime UI planlanan

## Bağlam

Tek resmî binary farklı self-hosted instance'lara bağlanmalıdır. Aynı anda çoklu workspace switching ilk sürümü büyütür; buna rağmen origin'e global bağlanan storage ileride güvenlikli geçişi zorlaştırır.

## Karar

İlk sürüm UI'da tek aktif instance sunar. Registry birden fazla `instanceId` kaydını saklayabilecek yapıda kalır; auth, public catalog ve resource cache her zaman `instanceId` ile scope edilir. Instance unutma işlemi ilgili credential/cache'i atomik temizler. Hızlı switching UX'i sonraki karardır.

## Gerekçe

Bu sınır ilk bağlantı deneyimini sade tutarken veriyi global anahtarlara kilitlemez ve iki-instance izolasyon testini mümkün kılar.

## Değerlendirilen alternatifler

- Yalnız tek kayıt tutan registry.
- İlk release'te çoklu aktif instance ve hızlı hesap değiştirici.
- Her instance için ayrı uygulama binary'si.

## Varsayımlar

- Kullanıcı ilk sürümde instance değiştirmek için mevcut instance'ı unutma/yeniden bağlanma akışını kabul eder.
- `instanceId` kalıcı kimliktir; domain ve marka kimlik değildir.

## Yeniden değerlendirme koşulları

- Çoklu workspace kullanımı temel ürün ihtiyacı hâline gelirse.
- Instance restore/clone semantiği `instanceId` politikasını değiştirirse.

## Canonical kaynaklar

- `apps/neta-mobile/src/lib/instance/registry.ts`
- [[docs/roadmaps/platform-master-plan]]
