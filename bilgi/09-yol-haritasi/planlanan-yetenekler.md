---
tur: yol-haritasi
durum: planlanan
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - docs/roadmaps/platform-master-plan.md
  - docs/neta-backend-mobile-api-master-plan.md
  - docs/self-hosted-redesign/adr-0018-device-pairing.md
ilgili:
  - "[[01-urun/yetenekler|Yetenekler]]"
  - "[[06-kararlar/karar-kaydi|Karar kaydı]]"
etiketler:
  - neta
  - yol-haritasi
  - planlanan
---

# Planlanan yetenekler

## Yakın

- Capability doğruluğu ve JSON v1 fallback.
- Shared wire contract + backend presenters + consumer CI.
- Runtime domain entry ve resmî universal mobile bootstrap.
- Owner dashboard/client/project/task/calendar read API.
- Cursor pagination, request validation ve deterministic presentation.
- Owner CRUD mutation, idempotency key ve optimistic concurrency.

## Orta

- Finans, journal, analytics, file/media, settings, localization ve AI mobile parity.
- Owner device pairing: challenge, opaque token family, refresh rotation/reuse detection, scopes, revoke.
- Restore token epoch.
- Client portal read/mutation parity ve ayrı auth lifecycle kararı.
- Native AI streaming ve self-hosted notification sözleşmesi.

## Sonraki / ayrı karar gerektiren

- Birden çok kayıtlı instance ve switching.
- Merkezi kısa kod → domain resolver.
- Universal/app links.
- Tam offline mutation queue ve conflict merge.
- Instance başına white-label store binary.
- Neta Cloud/central tenant backend.

## Durum kuralı

Bir yetenek ancak schema/route/service/authorization/contract/negative test ve operasyon etkileri tamamlandığında `mevcut`e taşınır. ADR veya ekran tasarımı tek başına yeterli değildir.

## Kaynaklar

- [[docs/roadmaps/platform-master-plan]]
- [[docs/neta-backend-mobile-api-master-plan]]
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
