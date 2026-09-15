---
tur: sistem
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - apps/neta-app/server/config.ts
  - apps/neta-app/server/auth
  - apps/neta-app/server/domain/actor.ts
  - apps/neta-app/server/files
  - apps/neta-app/scripts/backup.mjs
  - apps/neta-app/scripts/restore.mjs
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[00-sistem/mevcut-durum|Mevcut durum]]"
  - "[[07-guvenlik/guvenlik-genel-bakis|Güvenlik]]"
etiketler:
  - neta
  - invariant
---

# Değişmez kurallar

Bu kurallardan birini değiştiren iş sıradan refactor değildir. Kod, migration, operasyon belgesi, güvenlik analizi ve bu sayfa birlikte güncellenmelidir.

## Runtime ve veri

1. **Aktif self-hosted runtime Supabase'e bağlı değildir.** Supabase yalnız hazırlanmış export bundle'ından legacy import kaynağı olabilir.
2. **SQLite canonical runtime veritabanıdır.** Ana persistence modeli Drizzle + `better-sqlite3`tır.
3. **Bir instance tek persistent data kökü kullanır.** DB, uploads, backups ve tmp varsayılan olarak `/app/data` altındadır.
4. **Aynı SQLite dosyasına birden fazla yatay app replica yazamaz.** Deployment tek uzun ömürlü Node.js process'i varsayar.
5. **Kullanıcı verisi image/container lifecycle'ından bağımsız kalır.** `/app/data` mutlaka kalıcı volume/disk olmalıdır.
6. **Migration deterministik, ileri yönlü ve startup öncesidir.** SQLite şemasını elle downgrade etmek desteklenmez.
7. **Backup ve restore bütünlüğü kolaylıktan önce gelir.** DB ve upload birlikte ele alınır; manifest doğrulanmadan restore yapılmaz.

## Kimlik ve yetki

8. **Bir instance'ta tek owner/freelancer vardır.** İlk başarılı owner setup'ından sonra public kayıt kapanır.
9. **Client hesapları kontrollü davetle oluşur.** Davet süreli ve tek kullanımlıdır; DB'de raw token değil hash tutulur.
10. **Eski auth materyali import edilmez.** Supabase Auth password hash/session verisi taşınmaz; müşteri yeniden davet edilir.
11. **Authorization scope server-side session actor'dan türetilir.** Request body/query içindeki `ownerId`, `userId` veya `clientId` yetki kaynağı değildir.
12. **Disabled kullanıcı erişemez.** Client erişimi kapatıldığında mevcut session'lar da kaldırılır.
13. **Cross-client veri varlığı sızdırılmamalıdır.** Uygun yerlerde başka scope'taki kaynak `404` gibi görünmelidir.

## Sırlar ve güven sınırları

14. **Secret'lar server-side kalır.** Password hash, session token, davet secret'ı, provider key ve filesystem path public DTO'ya girmez.
15. **AI provider key'i browser'a geri dönmez.** Public ayar yalnız anahtarın varlığını bildirir.
16. **Production remote origin HTTPS kullanır.** Trusted origin listesi açık olmalı; wildcard reddedilir.
17. **Upload kullanıcı beyanına güvenmez.** MIME içeriği doğrulanır, path storage katmanı tarafından üretilir ve authorization metadata üzerinden uygulanır.

## API ve mobil

18. **Mobil API major-version aware olmalıdır.** v1 response envelope/header ve kırıcı değişiklik politikası korunur.
19. **Mobil için ikinci iş kuralı katmanı yazılmaz.** Web action ve `/api/v1` aynı domain/application servislerine ulaşır.
20. **Wire DTO, DB entity değildir.** Response presenter/contract üzerinden üretilir; ham Drizzle satırı dışarı verilmez.
21. **Capability yalnız gerçekten kullanılabilir route grubu için `available` olur.** Planlanan yetenek active capability gibi yayınlanmaz. Mevcut kodun bu kuralla çeliştiği yer [[00-sistem/celiskiler|çelişkilerde]] kayıtlıdır.
22. **Device pairing güvenlik kabulü kod varlığından ayrı tutulur.** Schema, endpoint, token lifecycle ve restore epoch kodu mevcuttur; gerçek cihazda reuse/revoke/restore negatif testleri tamamlanmadan mağaza güvenliği kanıtlanmış sayılmaz.
23. **Instance kimliği domain veya marka değildir.** Kalıcı `instanceId` discovery/meta tutarlılığının temelidir.
24. **Credential farklı origin'e sessizce gönderilmez.** Discovery tarafından verilen URL'ler aynı trusted origin içinde doğrulanır.

## Monorepo ve ürün sınırı

25. **Uygulamalar birbirinin source ağacına relative import yapmaz.** Paylaşım `packages/*` üzerinden olur.
26. **`api-contracts` JSON-safe wire sözleşmelerini; `design-tokens` platformdan bağımsız tokenları taşır.** UI component veya DB entity bu paketlere konmaz.
27. **Landing ve mobile, self-hosted production image'ına girmez.** Docker'ın çalışma ürünü yalnız `@neta/app`tir.
28. **Canonical kaynaklar `bilgi/` için taşınmaz veya kopyalanmaz.** Bu kasa sentezdir; implementation ve `docs/` birincil kanıttır.

## Kanıt haritası

- Runtime/veri: [[README]], `apps/neta-app/server/config.ts`, `server/db/client.ts`, `Dockerfile`.
- Auth/authorization: `apps/neta-app/server/auth/`, `server/domain/actor.ts`.
- Dosya/sır: `apps/neta-app/server/files/`, `server/settings/ai.ts`.
- Backup/restore: `apps/neta-app/scripts/backup.mjs`, `restore.mjs`.
- API/mobil hedefi: [[docs/roadmaps/platform-master-plan]], [[docs/neta-backend-mobile-api-master-plan]], [[docs/self-hosted-redesign/adr-0018-device-pairing]].
