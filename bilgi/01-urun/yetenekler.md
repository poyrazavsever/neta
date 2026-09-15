---
tur: urun
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
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
- Build-time belirlenen tek origin için discovery, instance identity ve branding.
- Better Auth sign-in sonucu cookie/bearer materyalini instance-scoped SecureStore'da tutma.
- Geniş resource API client/guard ve private cache katmanı.
- Ancak eksik backend v1 route'ları nedeniyle ekranların çoğu production'da gerçek veriyle tamamlanamaz.

## Planlanan

- Resmî tek mobil binary'de runtime domain/QR instance bağlantısı.
- Mobil owner resource API read ve mutation parity'si.
- Mobil client portal parity'si.
- Idempotency, cursor pagination ve optimistic concurrency.
- Owner device pairing, opaque access/refresh token rotation, revoke/reuse detection.
- Notification, AI streaming ve store operasyonlarının gerçek backend sözleşmeleri.

## Legacy

- Supabase runtime ve Supabase Auth tabanlı eski kurulum modeli.
- Mobilin superseded multi-domain ve sonra build-time fork planlarının tarihsel faz kayıtları; aktif hedef için platform roadmap önceliklidir.

## Capability uyarısı

`/api/v1/meta` bugün bazı geniş capability'leri `available` döndürse de karşılık gelen resource route'ları yoktur. Product readiness değerlendirmesinde capability string'i tek başına kanıt sayılmaz; bkz. [[00-sistem/celiskiler|C-001]].
