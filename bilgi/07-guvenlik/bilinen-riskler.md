---
tur: guvenlik
durum: mevcut
guncellendi: 2026-09-04
guven: yuksek
kaynaklar:
  - docs/neta-backend-mobile-api-master-plan.md
  - docs/roadmaps/platform-master-plan.md
  - apps/neta-app/server
  - apps/neta-mobile
ilgili:
  - "[[07-guvenlik/tehdit-modeli|Tehdit modeli]]"
  - "[[09-yol-haritasi/teknik-borc|Teknik borç]]"
etiketler:
  - neta
  - guvenlik
  - risk
---

# Bilinen riskler

| Risk | Etki | Olasılık | Mevcut azaltım | Gerekli sonraki adım |
| --- | --- | --- | --- | --- |
| Eksik mobil portal/pairing/AI parity'si | Client portal, cihaz lifecycle ve AI mobilde tamamlanamaz | Orta-yüksek | Owner read/write/parity route'ları ve granular capability'ler mevcut | MOB-6–8 portal, pairing ve AI dilimleri |
| Gelecekte mobil/backend DTO drift'i | Login sonrası state/mutation/catalog hatası | Orta | Shared fixture, presenter/guard ve `pnpm contract:check` | Her resource dikey dilimini aynı consumer kapısına ekle |
| Eksik v1 tenant testleri | Cross-client veri sızıntısı | Orta-yüksek | Web DomainService scope guard'ları | Her portal v1 route için negatif E2E |
| Universal instance izolasyonunun native kanıtı eksik | Platform cookie davranışı instance'lar arasında sızabilir | Orta-yüksek | `instanceId` scoped SecureStore/cache, değişen ID temizliği ve unit/smoke | Signed iOS/Android ile iki canlı HTTPS instance E2E |
| Çalınmış backup | Auth, PII, finans, journal ve upload ifşası | Orta | Checksum/manifest | Encrypted off-site storage, access/retention standardı |
| Restore eski session state'ini geri getirir | Revoke edilmiş erişim canlanabilir | Orta | Restore stopped-process ve smoke | Auth restore politikası; pairingte token epoch |
| AI secret auth secret'a bağlı | Secret rotasyonunda AI key kaybı | Orta | AEAD encryption | Versioned key rotation/re-entry runbook |
| Harici AI'ya fazla veri | PII/finans/journal sızıntısı | Orta | Owner opt-in provider | Data minimization/redaction ve call-site audit |
| Upload metadata/parser riski | Decoder açığı veya eski upload'larda gizli metadata | Orta | Yeni mobil v1 görsel upload'ları Sharp ile decode/re-encode edilir; flag yalnız başarıda set edilir | Eski dosyalar için kontrollü re-sanitize/migration kararı ve decoder güncelleme disiplini |
| Yanlış proxy/TLS/origin | Cookie/auth sızıntısı veya login kırılması | Orta | Startup HTTPS/trusted origin validation | Platform-specific TLS/header smoke |
| Tek disk/tek replica | Disk arızasında kesinti ve veri kaybı | Orta | Backup/restore | Off-site restore RPO/RTO ve monitoring |
| Readiness migration kontrolü yüzeysel | Eksik migration “ready” görünebilir | Düşük-orta | Startup migrator + release smoke | Expected migration version/integrity check |

## Kabul edilmeyen yanlış azaltımlar

- Capability string'inin varlığını endpoint testi yerine kullanmak.
- Aynı disk içindeki local backup'ı felaket kurtarma saymak.
- UI route/screen varlığını backend yetki kanıtı saymak.
- Pairing ADR'ini uygulanmış güvenlik kontrolü saymak.
- Checksum'u backup gizliliği veya authenticity imzası saymak.

## Kaynaklar

- [[docs/neta-backend-mobile-api-master-plan]]
- [[docs/roadmaps/platform-master-plan]]
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
