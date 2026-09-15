---
tur: yol-haritasi
durum: mevcut
guncellendi: 2026-09-04
guven: yuksek
kaynaklar:
  - docs/neta-backend-mobile-api-master-plan.md
  - docs/roadmaps/platform-master-plan.md
  - apps/neta-app
  - apps/neta-mobile
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

- Owner write, finance/journal/settings/files ve portal v1 route'ları kodda yer alır; AI assistant native transport'u eksiktir.
- Mutation idempotency/concurrency persistence kodda yer alır; pairing/portal negatif E2E kabulü açıktır.

## Mobil

- Universal cookie/cache izolasyonu signed iOS/Android ve iki canlı HTTPS instance ile henüz kanıtlanmadı.
- Mutation/form route'ları ve capability gate kodda bulunur; signed cihaz kabulü açıktır.

## Güvenlik ve operasyon

- App-level backup encryption/signature ve standard RPO/RTO yok.
- Restore device token epoch'unu rotate eder; eski token reddinin negatif kabul testi açıktır.
- Upload image metadata stripping/re-encoding doğrulanmamış.
- Readiness beklenen son migration version'ını ayrıntılı doğrulamıyor.
- AI encryption key rotasyon runbook/tooling'i yok.

## Dokümantasyon/yönetişim

- Root proprietary beyanı ile mobile MIT lisansı açıklanmamış.
- Tarihli release report dependency/runtime güncelliği kolayca yanlış okunabilir.
- `desktop-assistant` için ürün/güvenlik README'si yok.
- Eski mobile redesign planı superseded işaretlidir; alt faz belgelerindeki tarihsel tek-instance ifadeleri topluca yeniden yazılmamıştır.

## Öncelik ilkesi

Tenant izolasyonu, secret/token lifecycle ve backup bütünlüğü; görsel parity veya yeni feature sayısından önce gelir. Contract drift, yeni mobil endpoint eklenmeden önce kapatılmalıdır.
