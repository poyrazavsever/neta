---
tur: mimari
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/package.json
  - apps/neta-app/server/config.ts
  - apps/neta-app/server/db/client.ts
  - Dockerfile
  - docker-compose.yml
ilgili:
  - "[[03-mimari/sqlite|SQLite]]"
  - "[[03-mimari/deployment|Deployment]]"
etiketler:
  - neta
  - mimari
  - runtime
---

# Runtime

## Mevcut davranış

Self-hosted ürün Next.js 16 App Router + React 19 üzerinde Node.js runtime'dır. Better Auth, `better-sqlite3`, Drizzle, local filesystem ve opsiyonel AI provider adapter'ları aynı `@neta/app` process'inde çalışır.

## Başlangıç sırası

```text
container/process başlar
  -> DATA_DIR alt dizinleri hazırlanır
  -> Drizzle migration'ları uygulanır
  -> runtime_checks last_migration güncellenir
  -> Next standalone server açılır
  -> readiness DB/yazılabilirlik/migration kontrol eder
```

`predev` ve `prestart` migration çalıştırır; Docker CMD açıkça `node scripts/migrate.mjs && node server.js` uygular.

## Configuration

- `DATA_DIR`: production default `/app/data`, development default app cwd altı `.data`.
- `DATABASE_PATH`: opsiyonel DB override.
- `APP_URL` / `BETTER_AUTH_URL`: canonical origin.
- `BETTER_AUTH_SECRET`: production'da zorunlu ve en az 32 karakter.
- `TRUSTED_ORIGINS`: comma-separated explicit origin; wildcard yok.
- `OLLAMA_BASE_URL`, `AI_REQUEST_TIMEOUT_MS`, `NETA_MINIMUM_MOBILE_VERSION`: opsiyonel.

Build sırasında data path temporary olabilir ve placeholder auth secret kabul edilir; bu yalnız Next production build safhasına özel istisnadır, runtime secret'ı değildir.

## Process ve concurrency

SQLite connection process-global cache'te tutulur. WAL, foreign keys, normal synchronous ve 5 saniye busy timeout vardır. Mimari tek long-lived process varsayar.

## Failure davranışı

- Invalid production HTTP origin veya kısa/eksik auth secret startup'ı durdurur.
- Readiness data dir yazılamıyor, DB erişilemiyor veya migration tablosu yoksa `503` döndürür.
- Liveness yalnız process route'unun yanıt verebildiğini gösterir.

## Sınırlamalar

In-process server cron/scheduler, horizontal writer coordination veya ayrı background worker canonical runtime olarak doğrulanmamıştır.

## Kaynaklar

- `apps/neta-app/server/config.ts`
- `apps/neta-app/server/db/client.ts`
- `Dockerfile`
- [[docs/self-hosted-redesign/phase-1-runtime]]
