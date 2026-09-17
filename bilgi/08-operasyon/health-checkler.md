---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-data-acceptance.md
  - apps/neta-app/app/api/health
  - apps/neta-app/app/api/v1/health/route.ts
  - apps/neta-app/server/db/health.ts
ilgili:
  - "[[08-operasyon/production|Production]]"
  - "[[03-mimari/migrasyonlar|Migrasyonlar]]"
etiketler:
  - neta
  - operasyon
  - health
---

# Health check'ler

| Endpoint | Anlam | Başarısızlık |
| --- | --- | --- |
| `/api/health/live` | Node/Next process route cevaplıyor | Process/network sorunu |
| /api/health/ready | Data dir writable, DB query çalışıyor, release migration journal/SQL hash ledger’ı eksiksiz eşleşiyor | 503 + check booleans |
| `/api/health` | Hafif uyumluluk endpoint'i | Uygulamaya göre |
| `/api/v1/health` | Mobil discovery için versioned readiness | v1 envelope/503 |

## Readiness ayrıntısı

checkReadiness probe file oluşturup siler, select 1 yapar ve release journal sıra/timestamp/SQL hash’lerini DB ledger’ıyla doğrular. Hata text’i server-side tutulur; HTTP yalnız check durumlarını döndürür.

## Ne kanıtlamaz

- Bütün domain CRUD akışlarının doğru çalıştığını.
- Ledger doğruyken yapılan bütün manuel DDL değişikliklerini; bu tam schema diff değildir.
- DB’nin tam integrity/FK taramasını; restore staging’inde ayrıca uygulanır.
- Upload read/write ve backup hedefini.
- AI provider erişimini.
- Reverse proxy TLS/origin doğruluğunu.
- Mobil resource API parity'sini.

## Operasyon kullanımı

Liveness restart kararı, readiness traffic gating için kullanılmalıdır. Deploy sonrası ayrıca owner login, client/project/portal/file smoke gerekir. Health endpoint'in 200 dönmesi release acceptance değildir.

## Kaynaklar

- `apps/neta-app/server/db/health.ts`
- `apps/neta-app/app/api/health/`
- `apps/neta-app/app/api/v1/health/route.ts`

## MOB-9 veri kabulü

[[docs/mobile/mobile-data-acceptance]] source ve production standalone/loopback HTTP kanıtını gerçek host/signed kabulünden ayırır.
