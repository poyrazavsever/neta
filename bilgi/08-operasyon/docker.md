---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - Dockerfile
  - docker-compose.yml
  - .dockerignore
ilgili:
  - "[[08-operasyon/production|Production]]"
  - "[[03-mimari/runtime|Runtime]]"
etiketler:
  - neta
  - operasyon
  - docker
---

# Docker

## Image yapısı

1. `deps`: Node 24 slim, Corepack, root lock/workspace ve `@neta/app` filtered frozen install.
2. `builder`: repository source ve dependency'lerle `@neta/app` build.
3. `runner`: standalone output, scripts, migrations ve native SQLite dependency'leri.

Runtime `nextjs` UID 1001 kullanır; `/app/data` bu kullanıcıya aittir. `DATA_DIR=/app/data`, internal port 3000 ve volume declaration vardır. CMD migration'ı server'dan önce çalıştırır.

## Compose sözleşmesi

Named `neta-data` volume, required auth secret, external origin env'leri, 30 saniyelik readiness healthcheck ve `unless-stopped` restart policy.

## Güvenli kullanım

- Production secret'ı image build arg/source içine koyma.
- Volume'u silme/recreate etmeden önce backup doğrula.
- Replica count'i 1 tut.
- Proxy ile TLS terminate et; container portunu gereksiz public açma.
- Image upgrade öncesi restore rehearsal yap.
- Container user'ın volume yazabildiğini ve host backup agent'ının en az yetkiyle eriştiğini doğrula.

## Sık hata

- Volume bağlanmadı: app çalışır görünür ama redeploy'da data kaybolur.
- Yanlış APP_URL: cookie/trusted-origin/auth callback bozulur.
- Auth secret değişti: session ve encrypted AI key davranışı etkilenir.
- İki replica: SQLite writer contention/semantic destek dışı.

## Kaynaklar

- `Dockerfile`
- `docker-compose.yml`
- [[README]]
