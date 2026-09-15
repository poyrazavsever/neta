---
tur: kaynak
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - docs
  - apps
  - packages
ilgili:
  - "[[00-sistem/kasa-semasi|Kasa şeması]]"
  - "[[10-arastirma/indeks|Araştırma indeksi]]"
etiketler:
  - neta
  - kaynak
---

# Kaynak indeksi

Bu sayfa canonical kaynak ailelerini ve gelecekte eklenecek dış kaynak notlarını yönlendirir. Kaynak içeriğini kopyalamaz.

## Repository genel

- [[README]] — Güncel ürün, runtime, deployment ve operasyon başlangıç noktası.
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` — Workspace ve toolchain gerçeği.
- [[docs/roadmaps/platform-master-plan]] — 2026-09-02 itibarıyla üst seviye aktif platform/mobil yönü.

## Self-hosted mimari

- [[docs/self-hosted-redesign/neta-self-hosted-v3-master-plan]] — Self-hosted dönüşüm ana kaydı.
- [[docs/self-hosted-redesign/phase-0-adrs]] — SQLite, storage ve erken mimari kararlar.
- [[docs/self-hosted-redesign/phase-1-runtime]] — Runtime/migration/health/backup kanıtı.
- [[docs/self-hosted-redesign/phase-2-auth]] — Owner/client auth tasarımı.
- [[docs/self-hosted-redesign/phase-3-storage-branding]] — Local files ve branding.
- [[docs/self-hosted-redesign/phase-8-import-release]] — Legacy import, production cutover, backup ve rollback runbook'u.
- [[docs/self-hosted-redesign/phase-9-mobile-api]] — Discovery/bootstrap API v1 sözleşmesi.
- [[docs/self-hosted-redesign/adr-0018-device-pairing]] — Kabul edilmiş, uygulanmamış pairing tasarımı.
- [[docs/self-hosted-redesign/release-readiness-2026-07-18]] — Tarihli release kanıtı; güncel dependency sertifikası değildir.

## Mobil ve API

- [[docs/neta-backend-mobile-api-master-plan]] — Doğrulanmış backend-mobile gap ve faz planı.
- [[docs/neta-backend-mobile-api-gap-and-implementation-brief]] — Ayrıntılı endpoint/uygulama brifi.
- [[docs/mobile/neta-mobile-redesign-master-plan]] — Bugünkü build-time single-instance modelinin kanıtı; aktif ürün yönünde üst roadmap tarafından supersede ediliyor.
- [[docs/mobile/neta-react-native-mobile-master-plan]] — Superseded tarihsel multi-domain plan.
- `apps/neta-mobile/README.md` — Güncel mobile build/release gerçeği.
- `packages/api-contracts/src/index.ts` — Mobil wire type/guard kaynağı; backend adoption eksik.

## Çok dillilik

- [[docs/self-hosted-redesign/neta-multilingual-i18n-master-plan]] — Aktif i18n ana planı.
- [[docs/self-hosted-redesign/i18n-phase-9-release-readiness]] — Migration/backup/API/release kanıtı.
- `apps/neta-app/server/i18n/`, `server/db/schema/i18n.ts` — Güncel implementation.

## Kod kaynakları

- `apps/neta-app/server/db/schema/` — Kalıcı entity gerçeği.
- `apps/neta-app/server/domain/` ve `server/repositories/` — İş/scope/persistence kuralları.
- `apps/neta-app/server/auth/`, `files/`, `settings/`, `ai/`, `api/v1/` — Güvenlik ve transport.
- `apps/neta-app/scripts/` — Migration, backup/restore, import ve release kontrolleri.
- `apps/neta-mobile/src/` — Mevcut native davranış.

## Dış kaynak notları

İlk bootstrap'ta dış kaynak notu yoktur. Yeni notlar `bilgi/11-kaynaklar/<slug>.md` altında [[sablonlar/kaynak|kaynak şablonuyla]] eklenir; ham dosya `bilgi/ham/` altında korunur.
