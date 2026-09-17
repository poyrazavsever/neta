---
tur: yol-haritasi
durum: planlanan
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-release-acceptance.md
  - docs/mobile/mobile-ai-acceptance.md
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
- Nonce-bound 30 saniyelik şifreli refresh replay; public locator üzerinden challenge başına beş yanlış QR/manual secret kilidi ve kalıcı SQLite negatif kabulü.
- MOB-8 canonical v1 chat/risk/finance AI; NDJSON, selected-month/currency context, kalıcı lease/retry, structured output ve native actor/generation/cancel sınırı. Sentetik provider HTTP kabulü [[docs/mobile/mobile-ai-acceptance]] sayfasındadır.
- MOB-6/7 otomatik HTTP güvenlik kabulü; signed/native ve iki canlı HTTPS instance kanıtı ayrı kalır.
- Startup/saatlik cihaz expiry/idle/retention/cascade temizliği; ikinci sentetik loopback restore backend'ine eski token HTTP negatifleri ve yeniden pairing kabulü.

Bu liste store-ready `mobile-v1` ilanı değildir. [[docs/mobile/mobile-security-acceptance]] otomasyon ile açık native/release kabulünü ayırır.

MOB-9 yerel release gate ve kanıt kaydı mevcuttur: [[08-operasyon/mobil-yayin|mobil yayın]]. Signed/store/live kabulü planlanandır.

## Yakın

- Signed gerçek cihazda connect/pairing/cookie login/refresh/logout/revoke/parola/restore.
- Aynı binary ile iki canlı HTTPS instance credential/cache/deep-link izolasyonu.
- Restore edilmiş backend'e signed/native eski token negatifleri ve canlı HTTPS migration/restore matrisi.
- Native versioned bearer dosya download/share kabulü.

## Orta

- Signed/native gerçek provider ile AI streaming/analysis/cancel/retry ve iki canlı HTTPS instance kabulü.
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
