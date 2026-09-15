---
tur: mimari
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - apps/neta-app
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[03-mimari/runtime|Runtime]]"
  - "[[03-mimari/api|API]]"
  - "[[07-guvenlik/guvenlik-genel-bakis|Güvenlik]]"
etiketler:
  - neta
  - mimari
---

# Mimari genel bakış

## Sistem şekli

Neta'nın canonical backend'i `neta-app` içindedir. Web UI, portal ve mobil farklı transport/istemci yüzeyleri olsa da iş kurallarının DomainService/repository/specialized service katmanlarından geçmesi hedeflenir.

```mermaid
flowchart TB
  subgraph Istemciler
    OW[Owner browser]
    CW[Client browser]
    MM[Mobile]
  end
  OW --> WA[Next pages + Server Actions/routes]
  CW --> WA
  MM --> V1[/api/v1]
  WA --> AU[Session + actor]
  V1 --> AU
  AU --> DS[Domain/application services]
  DS --> RP[Drizzle repositories]
  DS --> SP[File / branding / i18n / AI services]
  RP --> DB[(SQLite)]
  SP --> DB
  SP --> FS[(uploads)]
  SP --> AI[Opsiyonel AI provider]
```

## Mevcut katmanlar

- **Transport:** Next pages/server components, Server Actions, route handlers, kısmi `/api/v1`.
- **Kimlik/scope:** Better Auth session, `appProfiles`, `DomainActor`, owner/client scope guard.
- **Domain:** müşterilerden ticari kayıtlara kadar merkezi `DomainService` ve repository'ler.
- **Özel servisler:** dosya, branding, settings, i18n, AI, instance discovery.
- **Persistence:** tek SQLite DB + local upload ağacı.
- **Operasyon:** migration, backup/restore, import, health ve Docker.

## Trust boundary'leri

1. İnternet/reverse proxy → Next runtime.
2. Anonim/public discovery ve branding → authenticated resource yüzeyi.
3. Better Auth session → uygulama profili/actor.
4. Owner scope → client scope.
5. Uygulama → local filesystem/SQLite.
6. Uygulama → harici AI provider.
7. Host → backup/off-site storage.
8. Mobil secure storage → instance origin/API.

## Bugünkü mimari asimetri

Web transport domain servislerine geniş ölçüde bağlıdır. Mobil istemci için geniş contract ve ekran yüzeyi vardır, fakat backend v1 transport katmanı yalnız bootstrap endpoint'lerini sunar. Hedef yeni domain kuralı yazmak değil, mevcut servislerin önüne parse/auth/presenter içeren versioned route'lar koymaktır.

## Scale ve availability sınırı

Tek process/tek DB/tek local volume tasarımı multi-replica HA değildir. Scale-up ve iyi backup hedeflenir; aynı SQLite'a paylaşımlı filesystem üzerinden çoklu writer desteklenmez.

## İlgili sayfalar

- [[03-mimari/veri-kaliciigi|Veri kalıcılığı]]
- [[03-mimari/kimlik-dogrulama|Kimlik doğrulama]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[03-mimari/ai-mimarisi|AI mimarisi]]

## Kaynaklar

- [[README]]
- [[docs/roadmaps/platform-master-plan]]
- [[docs/self-hosted-redesign/neta-self-hosted-v3-master-plan]]
