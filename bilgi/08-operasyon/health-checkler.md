---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
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
| `/api/health/ready` | Data dir writable, DB query çalışıyor, `runtime_checks` tablosu var | 503 + check booleans |
| `/api/health` | Hafif uyumluluk endpoint'i | Uygulamaya göre |
| `/api/v1/health` | Mobil discovery için versioned readiness | v1 envelope/503 |

## Readiness ayrıntısı

`checkReadiness` data dir'de probe file oluşturup siler, `select 1` yapar ve `runtime_checks` tablosunu arar. Hata text'i server-side tutulur; HTTP response check durumlarını döndürür.

## Ne kanıtlamaz

- Bütün domain CRUD akışlarının doğru çalıştığını.
- En son migration'ın gerçekten uygulanmış olduğunu ayrıntılı biçimde; yalnız `runtime_checks` tablosunun varlığını kontrol eder.
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
