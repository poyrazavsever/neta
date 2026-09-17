---
tur: yol-haritasi
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-release-acceptance.md
  - docs/mobile/mobile-ai-acceptance.md
  - docs/neta-backend-mobile-api-master-plan.md
  - docs/roadmaps/platform-master-plan.md
  - apps/neta-app
  - apps/neta-mobile
  - docs/mobile/mobile-security-acceptance.md
ilgili:
  - "[[07-guvenlik/bilinen-riskler|Bilinen riskler]]"
  - "[[00-sistem/celiskiler|Çelişkiler]]"
etiketler:
  - neta
  - yol-haritasi
  - teknik-borc
---

# Teknik borç

## API ve contract

- Owner write, finance/journal/settings/files, portal ve AI chat/risk/finance v1 transport’u kodda yer alır. AI sentetik loopback provider HTTP kabulü [[docs/mobile/mobile-ai-acceptance]] sayfasındadır; gerçek provider/signed native kabulü açıktır.
- Mutation idempotency/concurrency persistence ve otomatik pairing/iki client HTTP negatifleri tamamdır; signed/native ve iki canlı HTTPS instance kabulü açıktır.

## Mobil

- Universal cookie/cache izolasyonu signed iOS/Android ve iki canlı HTTPS instance ile henüz kanıtlanmadı.
- Mutation/form route'ları ve capability gate kodda bulunur; signed cihaz kabulü açıktır.

## Güvenlik ve operasyon

- App-level backup encryption/signature ve standard RPO/RTO yok.
- Restore device token epoch'unu rotate eder; sentetik restore backend'ine eski token HTTP negatifleri ve yeniden pairing otomasyonda yer alır. Signed/native ve canlı HTTPS restore matrisi açıktır.
- Device session expiry/idle ve startup/saatlik retention/cascade uygulanmıştır. Nonce-bound 30 saniyelik şifreli replay ve challenge başına beş yanlış secret kilidi otomatik kabul ile kapandı. Signed/native ve iki canlı HTTPS instance kabulü açıktır.
- Yeni native görsel upload sanitize/re-encoding HTTP kabulünde doğrulanır; legacy dosyanın metadata durumu korunur. Signed iOS/Android picker/share/cancel/timeout ve tam Windows/Linux symlink storage kabulü açıktır.
- Migration ledger/readiness ve staging integrity/FK kontrolü kapandı: [[docs/mobile/mobile-data-acceptance]]. Tam schema diff, gerçek pre-upgrade veri/host ve signed native restore kabulü açıktır.
- AI encryption key rotasyon runbook/tooling'i yok.
- AI egress/redaction ve gerçek provider/model compatibility/maliyet kabulü açıktır. Chat context journal note içerir; lease recovery provider seviyesinde exactly-once veya maliyet garantisi sağlamaz. Self-hosted push opt-in/relay için ayrı ADR gerekir.

MOB-9 için source/autolinking/config ve release kanıt gate’i hazırdır; signing/provisioning, iki canlı HTTPS/native kabulü, public privacy/support, incident owner ve lisans çözümü pending’dir. Kanıt kaydı [[08-operasyon/mobil-yayin|mobil yayın]] içinde yönlendirilir.

## Dokümantasyon/yönetişim

- Root proprietary beyanı ile mobile MIT lisansı açıklanmamış.
- Tarihli release report dependency/runtime güncelliği kolayca yanlış okunabilir.
- `desktop-assistant` için ürün/güvenlik README'si yok.
- Eski mobile redesign planı superseded işaretlidir; alt faz belgelerindeki tarihsel tek-instance ifadeleri topluca yeniden yazılmamıştır.

## Öncelik ilkesi

Tenant izolasyonu, secret/token lifecycle ve backup bütünlüğü; görsel parity veya yeni feature sayısından önce gelir. Contract drift, yeni mobil endpoint eklenmeden önce kapatılmalıdır.
