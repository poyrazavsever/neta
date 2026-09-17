---
tur: urun
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-ai-acceptance.md
  - docs/mobile/mobile-security-acceptance.md
  - apps/neta-app/app
  - apps/neta-app/server/domain
  - apps/neta-app/server/api/v1/contracts.ts
  - apps/neta-mobile/README.md
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[00-sistem/mevcut-durum|Mevcut durum]]"
  - "[[09-yol-haritasi/planlanan-yetenekler|Planlanan yetenekler]]"
etiketler:
  - neta
  - yetenek
---

# Yetenekler

## Mevcut: self-hosted web/backend

- İlk owner kurulumu, Better Auth email/şifre session'ı ve role-based actor.
- Müşteri CRUD, ilişki aktiviteleri, invite tabanlı client portal hesabı.
- Proje, plan bölümleri, görev, revizyon, takvim, finans ve günlük yönetimi.
- Dashboard/analytics, AI chat, proje riski ve finans analizi.
- Teklif, sözleşme, fatura ve abonelik kayıtları.
- Marka, görünüm, profil, güvenlik, dil ve AI ayarları.
- Local görsel upload, private/portal/public-branding görünürlükleri.
- Instance locale, UI catalog override ve domain içerik çevirileri.
- Online SQLite + uploads backup; doğrulamalı ve rollback'li restore.
- Offline Supabase export bundle dry-run/import/idempotency/rollback araçları.
- Discovery, metadata, health, me, preference ve catalog v1 bootstrap API'si.

## Mevcut ama sınırlı: mobil

- Expo Router ile owner/client screen yapısı ve native UI altyapısı.
- Runtime domain veya secret-free connect QR ile discovery, instance identity ve branding.
- Better Auth cookie ve ayrı owner device pairing access/refresh materyalini instance-scoped SecureStore’da tutma.
- Geniş resource API client/guard ve private cache katmanı.
- Canonical v1 owner read/mutation ve client portal yüzeyleri; cursor pagination, idempotency ve concurrency kontrolleri.
- Chat/risk/seçili ay finance AI v1 taşıması ve sentetik provider kabulü; signed/native ve gerçek provider kanıtı açık.

## Planlanan

- Resmî binary’nin signed cihaz ve iki canlı HTTPS instance ile mağaza kabulü.
- AI streaming/cancel/retry için signed cihaz ve gerçek provider kabulü.
- Ayrı ADR ile notification/push backend ve relay sözleşmesi.
- Store/privacy/support ve production operasyon kabulü.

## Legacy

- Supabase runtime ve Supabase Auth tabanlı eski kurulum modeli.
- Mobilin superseded multi-domain ve sonra build-time fork planlarının tarihsel faz kayıtları; aktif hedef için platform roadmap önceliklidir.

## Capability uyarısı

Capability, yayınlanan route sözleşmesini belirtir; signed/store readiness kanıtı değildir. `ai.assistant.v1` mevcut taşıma yüzeyidir; `mobile-v1` release kabulü tamamlanana kadar planned kalır. Product readiness için kod, otomatik kabul ve açık release kapıları birlikte değerlendirilir.
