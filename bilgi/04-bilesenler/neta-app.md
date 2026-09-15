---
tur: bilesen
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/package.json
  - apps/neta-app/app
  - apps/neta-app/server
ilgili:
  - "[[03-mimari/runtime|Runtime]]"
  - "[[03-mimari/api|API]]"
etiketler:
  - neta
  - bilesen
  - neta-app
---

# neta-app

## Rol

`@neta/app`, self-hosted owner web uygulaması, client portalı ve canonical backend'dir. Neta iş verisinin, auth'un, dosyanın, ayarın, discovery'nin ve operasyon scriptlerinin sahibi bu pakettir.

## İç yapı

- `app/`: App Router pages, Server Actions, portal, invite ve route handlers.
- `server/auth`: Better Auth, setup, invitation ve session.
- `server/domain`: actor, errors, database contract, types ve DomainService.
- `server/repositories`: Drizzle persistence adapters.
- `server/db`: connection, schema ve migrations.
- `server/files`, `branding`, `settings`, `i18n`, `ai`, `api/v1`: specialized application services.
- `scripts/`: migration, backup/restore, import ve phase/release kontrolleri.

## Teknoloji

Next.js 16, React 19, Better Auth, SQLite/better-sqlite3, Drizzle, Poyraz UI v3, Tailwind ve Vercel AI SDK.

## Girdi/çıktı

Browser için HTML/Server Actions/web route'ları; mobil için kısmi `/api/v1`; persistent output olarak SQLite ve uploads. Opsiyonel AI provider'a outbound request yapar.

## Bağımlılık sınırı

Mobile veya landing source'una import yapmamalıdır. Hedefte `@neta/api-contracts` presenter/consumer test sınırı olur; bugün bu entegrasyon eksiktir.

## Operasyon

Root Dockerfile bu paketi standalone üretir. Migration server'dan önce çalışır. App için `/app/data` volume, TLS proxy ve tek replica zorunludur.

## Risk / plan

Geniş web domain yüzeyine karşı mobil v1 route kapsamı dardır. Öncelik domain kurallarını kopyalamadan resource transport'u tamamlamaktır.

## Kaynaklar

- `apps/neta-app/package.json`
- [[README]]
- [[docs/self-hosted-redesign/neta-self-hosted-v3-master-plan]]
