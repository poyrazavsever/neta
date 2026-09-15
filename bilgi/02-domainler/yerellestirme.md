---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/i18n
  - apps/neta-app/server/db/schema/i18n.ts
  - apps/neta-app/app/api/v1/localization/catalog/route.ts
  - docs/self-hosted-redesign/neta-multilingual-i18n-master-plan.md
ilgili:
  - "[[03-mimari/api|API]]"
  - "[[02-domainler/musteri-portali|Müşteri portalı]]"
etiketler:
  - neta
  - domain
  - i18n
---

# Yerelleştirme

## Amaç

Instance'ın aktif dillerini, UI katalog özelleştirmelerini, kullanıcı tercihlerini ve domain içeriği çevirilerini yönetmek.

## Mevcut davranış

Instance varsayılan dili ve aktif locale'leri yönetilebilir. Kullanıcının kişisel `language` tercihi; client için ayrıca portal default locale vardır. Locale çözümü query, preference, client-default, Accept-Language ve instance-default kaynaklarını fallback chain ile birleştirir. UI katalogları public endpoint'ten indirilebilir; belirli domain içerikleri original + localized response modeliyle ele alınır.

## Temel kavramlar / entity'ler

- `instanceLocales`: locale kayıtları ve status.
- `instanceI18nSettings`: default ve catalog davranışı.
- `instanceUiTranslations`: UI message override'ları.
- `contentTranslations`: entity/field/locale bazlı içerik çevirileri.
- `userPreferences.language` ve `clients.portalLocale`.

## İş akışları

- Owner locale ekler/aktif eder ve varsayılanı seçer.
- UI catalog override'ı yapar.
- Owner çevrilebilir domain içeriğini locale bazında kaydeder.
- Client kendi aktif dil tercihini değiştirir; admin başlangıç portal dilini belirler.

## Veri ve API

Tümü SQLite'ta ve backup kapsamındadır. `GET /api/v1/localization/catalog` public'tir; `/api/v1/me` resolved locale metadata'sı döndürür; preferences mutation kullanıcıya özeldir.

## Güvenlik

Public katalog secret taşımaz. Custom translation içeriği render edilirken output encoding sürdürülmelidir. Client, instance default veya başka kullanıcının preference'ını değiştiremez.

## Mevcut sınırlamalar / plan

Backend catalog response'u `catalogVersion`, mobil uygulama parser'ı `version` bekler. Bu contract drift çözülmeden mobil cache invalidation güvenilir kabul edilmemelidir. User-authored revizyon metni otomatik çevrilmez.

## Kaynaklar

- [[docs/self-hosted-redesign/neta-multilingual-i18n-master-plan]]
- [[docs/self-hosted-redesign/i18n-phase-9-release-readiness]]
- `apps/neta-app/server/i18n/`
