---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-data-acceptance.md
  - README.md
  - apps/neta-app/server/config.ts
  - apps/neta-app/server/db/health.ts
  - apps/neta-mobile/README.md
ilgili:
  - "[[08-operasyon/health-checkler|Health check'ler]]"
  - "[[08-operasyon/docker|Docker]]"
  - "[[03-mimari/api|API]]"
etiketler:
  - neta
  - operasyon
  - troubleshooting
---

# Sorun giderme

## App başlamıyor

- `BETTER_AUTH_SECRET` production'da var mı ve ≥32 karakter mi?
- `APP_URL` geçerli HTTPS origin mi? Localhost istisnası dışında HTTP reddedilir.
- `TRUSTED_ORIGINS` wildcard/path içeriyor mu?
- `/app/data` yazılabilir ve doğru user'a ait mi?
- Startup migration logu ve native `better-sqlite3` uyumu nedir?

## Readiness 503

`dataDirWritable`, `databaseReachable`, `migrationsApplied` alanlarını ayır. Disk/permission, DB open/lock ve migration logunu kontrol et. Yalnız liveness 200 ise trafik vermek güvenli değildir.

## Login/cookie sorunu

External origin ile `APP_URL`, TLS ve proxy host/proto uyuşuyor mu? Cookie Secure/SameSite davranışı doğru mu? Profile disabled veya client↔auth bağı kırık mı? Auth secret deploymentlar arasında değişti mi?

## Dosya görünmüyor

DB metadata ile uploads path aynı restore point'ten mi? File size değişmiş mi? Owner/client/project relation ve visibility doğru mu? Symlink/path elle değiştirilmiş mi?

## Mobil discovery çalışıyor, ekranlar 404

Discovery başarısı resource erişimini kanıtlamaz. Capability → route matrisi, API sürümü ve actor/resource scope kontrol edilir. Owner/portal/AI route’ları mevcuttur; çapraz scope kaynaklar veri sızdırmamak için 404 dönebilir. [[docs/neta-backend-mobile-api-master-plan]] canonical route kaynağıdır.

## Mobil dil/tema güncellenmiyor

Canonical preferences locale/timezone ve MeProfile yanıtını, catalog version’ını, seçili instance/actor/generation ve cache invalidation’ı kontrol edin. Eski language/locale ve PATCH response drift’i kapandı; historical parser biçimine geri dönmeyin.

## AI key hatası

Provider seçimi/key varlığı, model adı, timeout/upstream durumunu kontrol et. `BETTER_AUTH_SECRET` değiştiyse encrypted key decrypt edilemez; owner key'i yeniden girmek zorunda kalabilir.

## Restore başarısız

App durmuş mu? Bundle manifest, path, size/checksum ve ekstra file kontrolünü geçiyor mu? Target mevcutsa bilinçli `--force` verildi mi? Aynı filesystem staging için yeterli disk var mı?

## Kaynaklar

- [[README]]
- `apps/neta-app/server/config.ts`
- `apps/neta-app/server/db/health.ts`

## 2026-09-17 — Migration/restore 503

Eksik migration forward upgrade ile tamamlanır. Hash/sıra uyuşmazlığı veya daha yeni DB’de matching release + doğrulanmış backup seçilir; ledger elle düzeltilmez. Eksik paketlenmiş journal/SQL artifact hatasıdır. WAL/SHM hatasında app’i durdurup matching release/SQLite ile checkpoint/temiz kapanış yapın; WAL’ı elle silmeyin. [[docs/mobile/mobile-data-acceptance]] kapsamı açıklar.
