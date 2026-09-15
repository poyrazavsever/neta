---
tur: mimari
durum: mevcut
guncellendi: 2026-09-04
guven: yuksek
kaynaklar:
  - apps/neta-app/app/api
  - apps/neta-app/server/api/v1
  - packages/api-contracts/src/index.ts
  - docs/neta-backend-mobile-api-master-plan.md
ilgili:
  - "[[04-bilesenler/api-contracts|api-contracts]]"
  - "[[03-mimari/kimlik-dogrulama|Kimlik doğrulama]]"
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
etiketler:
  - neta
  - mimari
  - api
---

# API mimarisi

## İki transport ailesi

1. **Web transport:** Server Actions/server component yüklemeleri ile legacy `/api/files`, `/api/chat`, analiz, branding ve invitation route'ları. Bugünkü web ürününün geniş çalışan yüzeyi budur.
2. **Mobil/public v1:** Versioned JSON envelope kullanan `/api/v1`; bootstrap ve minimum owner read kapsamı vardır.

## Mevcut v1 yüzeyi

| Endpoint | Auth | Amaç |
| --- | --- | --- |
| `/.well-known/neta` | Public | Protocol, instance ID ve API link discovery |
| `/api/v1/health` | Public | Readiness |
| `/api/v1/meta` | Public | Instance, branding, locale, capability, client version |
| `/api/v1/me` | Session | User/session/preference/locale özeti |
| `/api/v1/me/preferences` | Session | Locale/color mode/timezone güncelleme; tam profil response |
| `/api/v1/localization/catalog` | Public | UI message catalog |
| `/api/v1/dashboard/overview` | Freelancer | Owner dashboard read modeli |
| `/api/v1/clients`, `/clients/:id` | Freelancer | Müşteri liste/detay |
| `/api/v1/projects`, `/projects/:id` | Freelancer | Proje liste/detay |
| `/api/v1/projects/:id/planning-sections`, `/revisions` | Freelancer | Proje planı ve revizyon read |
| `/api/v1/tasks`, `/tasks/:id` | Freelancer | Görev liste/detay |
| `/api/v1/calendar/events`, `/calendar/events/:id` | Freelancer | Sınırlı tarih aralığı ve etkinlik detayı |

Başarı `{ok:true,data}`, hata `{ok:false,error}` zarfındadır ve v1 header kullanılır. Discovery endpoint'i doğrudan discovery dokümanı döndürür. Bilinmeyen v1 yolları JSON `404`, yanlış metotlar JSON `405` döndürür.

## Hedef request hattı

```text
auth -> actor/scope -> strict parse -> domain/application service -> presenter -> v1 response
```

Route içine domain kuralı veya client-supplied scope kopyalanmaz. Ham DB row ve secret response'a girmez.

## Contract sınırı

`@neta/api-contracts`, bootstrap DTO'ları, runtime guard'ları, capability matrisi ve fixture'ları için ortak wire sınırıdır. Backend explicit presenter üretir; mobil aynı guard ve fixture'ları tüketir. Storage alanı `language`, presenter'da `locale` olur. Catalog kanonik `version` ile süreli `catalogVersion` geçiş alanını birlikte taşır. Bütün koleksiyonlar `{items,pageInfo}` zarfını kullanır.

## Capability problemi

Capability manifesti çalışan bootstrap, owner read, core mutation, owner parity, device pairing ve client portal ailelerini granular `available` capability'lerle ilan eder. `mobile-v1` ve AI assistant native taşıması release/route kapıları tamamlanana kadar `planned` kalır. `available` route varlığını gösterir; signed cihaz ve iki canlı instance kabulünün yerine geçmez.

## Planlanan altyapı

Write resource route'ları, SQLite idempotency store, optimistic concurrency, finance/journal/settings/locales/files owner parity, read query allowlist'leri, opaque cursor, owner scope, granular capability sözlüğü, JSON fallback ve presenter sınırı mevcuttur. Portal v1 transport'u ile device pairing schema/route lifecycle'ı kodda mevcuttur; tenant izolasyonu ve restore güvenliği için kabul kanıtı açık kalır. Native chat streaming planlanandır.

## Kaynaklar

- [[docs/self-hosted-redesign/phase-9-mobile-api]]
- [[docs/neta-backend-mobile-api-master-plan]]
- `apps/neta-app/app/api/v1/`
