---
tur: mimari
durum: mevcut
guncellendi: 2026-09-16
guven: yuksek
kaynaklar:
  - apps/neta-app/server/auth/auth.ts
  - apps/neta-app/server/auth/setup.ts
  - apps/neta-app/server/auth/invitations.ts
  - apps/neta-app/server/auth/session.ts
  - apps/neta-app/server/domain/actor.ts
ilgili:
  - "[[02-domainler/kimlik-ve-erisim|Kimlik ve erişim domaini]]"
  - "[[07-guvenlik/guvenlik-genel-bakis|Güvenlik]]"
etiketler:
  - neta
  - mimari
  - auth
---

# Kimlik doğrulama mimarisi

## Mevcut yapı

Better Auth, Drizzle SQLite adapter ile aynı `neta.db` içinde user/account/session/verification verisini tutar. Uygulamaya özgü rol ve client bağı `appProfiles` tablosundadır. `getSessionContextFromHeaders`, Better Auth session ile profil bütünlüğünü birleştirir.

## İlk owner güvenliği

User-create hook önce `first_freelancer` setup reservation alır. 10 dakikalık stale lock onarımı ve mevcut freelancer sayımı eşzamanlı signup'ların tek owner üretmesini amaçlar. User oluşturulduktan sonra freelancer profile ve completed state transaction içinde yazılır.

## Client hesap modeli

Owner, sahip olduğu client kaydı için raw random token üretir; DB SHA-256 hash, email, locale, expiry ve status saklar. Yeni davet önceki pending daveti revoke eder. Kabul; user, credential account, client profile, client-auth bağı, preference ve accepted state'i transaction içinde oluşturur.

## Session → actor hattı

```text
Better Auth session
  -> app profile
  -> enabled + role/client link check
  -> SessionContext
  -> DomainActor
  -> owner/client scope
```

## Cookie politikası

Cookie prefix `neta`; HttpOnly, SameSite=Lax, path `/`; HTTPS origin'de Secure. Production remote `APP_URL` HTTPS olmalı, `TRUSTED_ORIGINS` wildcard içeremez. Sign-in dakikada 10, sign-up beş dakikada 3 özel limit kullanır; genel rate limit de vardır.

## Mobil bugün

Mobil sign-in `/api/auth/sign-in/email` çağırır; set-cookie veya auth token'ı instance-scoped SecureStore'a yazar ve `/api/v1/me` ile rol doğrular. Bu çalışma mevcut olsa da universal multi-origin lifecycle ve client/owner uzun ömür politikası formal olarak tamamlanmış değildir.

## Owner pairing

ADR-0018 owner için kısa ömürlü one-use challenge, opaque access/refresh token, refresh rotation/reuse detection, scope, revoke ve restore epoch tasarlar. Schema, route ve mobil bearer transport'u kodda yer alır; capability `available`dır. Gerçek cihaz ve restore negatif kabulü açık kalır.

2026-09-16 kodu tüketilmiş keyed digest'lerin bütün geçmişini saklayarak çok kuşaklı reuse'da family'yi compromise eder. Authorization header'ı cookie'ye fallback yapmaz; cihaz scope'ları API sınırında uygulanır. Bearer profil/parola self-service'i cookie gerektirmez; parola değişimi cihazları ve varsayılan olarak web session'larını kapatır. Disabled owner access/refresh kontrolünde gözlendiğinde device family'leri revoke edilir. Mobil generation ve sıralı storage write, eski ağ sonucunun logout/new-login sonrası credential diriltmesini engeller. Otomatik kabul ve gerçek cihaz kanıt sınırı [[docs/mobile/mobile-security-acceptance]] sayfasındadır.

## Riskler

Email verification kapalıdır. `BETTER_AUTH_SECRET` hem auth hem AI-key encryption türetiminde kritik tek sırdır. Disabled profile session loader'da `null` olduğu için v1'in `401/403` politikası ayrıca kararlaştırılmalıdır.

## Kaynaklar

- `apps/neta-app/server/auth/`
- [[docs/self-hosted-redesign/phase-2-auth]]
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
