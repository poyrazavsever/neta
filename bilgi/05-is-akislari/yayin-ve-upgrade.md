---
tur: is-akisi
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-release-acceptance.md
  - README.md
  - Dockerfile
  - docs/self-hosted-redesign/phase-8-import-release.md
  - docs/self-hosted-redesign/release-readiness-2026-07-18.md
ilgili:
  - "[[08-operasyon/yayin-hazirligi|Yayın hazırlığı]]"
  - "[[03-mimari/migrasyonlar|Migrasyonlar]]"
etiketler:
  - neta
  - is-akisi
  - release
---

# Yayın ve upgrade

## Akış

1. Release commit/tag ve dependency lock doğrulanır.
2. Lint, typecheck, app/web build, mobil check ve etkilenen phase smoke'lar çalıştırılır.
3. Capability listesi gerçek route/authorization kapsamıyla karşılaştırılır.
4. Production backup alınır ve ayrı hedefte restore provası yapılır.
5. Yeni image build/pull edilir; tek replica korunur.
6. Maintenance/cutover planına göre eski process durdurulur ve yeni image startup migration ile başlatılır.
7. Liveness/readiness, owner login, müşteri, proje, file/branding ve portal smoke yapılır.
8. Mobil etkisi varsa discovery/meta/contract consumer testleri ve minimum version politikası kontrol edilir.
9. Hata halinde eski image + upgrade öncesi backup ile rollback edilir.

## “Eski image'e dön” neden yetmez?

Yeni migration DB şemasını ileri taşır. Schema downgrade desteklenmez; eski binary yeni schema ile uyumlu olmayabilir. Bu nedenle rollback çifti application image + matching pre-upgrade backup'tır.

## Dış ortam işleri

DNS, TLS certificate, proxy header, persistent volume, off-site backup, production data validation ve gerçek kullanıcı smoke repository testlerinin dışında kalır.

## Mobil release gate

Owner/client/AI resource parity’si kodda ve otomatik kabulde mevcuttur. Store release signed cihaz, iki canlı HTTPS instance ve operasyon kanıtını bekler. [[08-operasyon/mobil-yayin|Mobil yayın]] kaynak kalite ile reviewer/hash’li strict store acceptance’ı ayırır; UI/native graph gate’i gerçek cihaz veya signing yerine geçmez.

## Kaynaklar

- [[README]]
- [[docs/self-hosted-redesign/phase-8-import-release]]
- [[docs/self-hosted-redesign/release-readiness-2026-07-18]]
