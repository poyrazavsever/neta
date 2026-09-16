---
tur: yol-haritasi
durum: planlanan
guncellendi: 2026-09-16
guven: yuksek
kaynaklar:
  - docs/roadmaps/platform-master-plan.md
  - docs/neta-backend-mobile-api-master-plan.md
  - docs/self-hosted-redesign/adr-0018-device-pairing.md
  - docs/mobile/mobile-security-acceptance.md
ilgili:
  - "[[01-urun/yetenekler|Yetenekler]]"
  - "[[06-kararlar/karar-kaydi|Karar kaydı]]"
etiketler:
  - neta
  - yol-haritasi
  - planlanan
---

# Planlanan yetenekler

## Kodda mevcut, native/release kabulü ayrı

- Capability/JSON v1 fallback, shared contract/presenters/consumer CI ve runtime domain/QR bootstrap.
- Owner read/mutation, pagination/validation/idempotency/concurrency; finance/journal/settings/locales/files parity yüzeyleri.
- Owner pairing/refresh history/reuse/scopes/revoke/restore epoch ve portal read/revision/profile transport'u.
- MOB-6/7 otomatik HTTP güvenlik kabulü; signed/native ve iki canlı HTTPS instance kanıtı ayrı kalır.

Bu liste store-ready `mobile-v1` ilanı değildir. [[docs/mobile/mobile-security-acceptance]] otomasyon ile açık native/tasarım kabulünü ayırır.

## Yakın

- Signed gerçek cihazda connect/pairing/cookie login/refresh/logout/revoke/parola/restore.
- Aynı binary ile iki canlı HTTPS instance credential/cache/deep-link izolasyonu.
- Restore edilmiş backend'e eski token HTTP/native negatifleri.
- ADR-008 hedef refresh grace/replay, challenge'a bağlı yanlış kod denemesi ve expired session/history cleanup.
- Native versioned bearer dosya download/share kabulü.

## Orta

- Backend versioned AI chat/risk/finance transport'u; mobil parser/UI'nin gerçek backend capability kabulü.
- Analytics ve ileri file/media/native parity kabulü.
- Self-hosted notification/push sözleşmesi ve ayrı ADR.
- Compatibility/privacy/support/store ve operasyon runbook'ları.

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
