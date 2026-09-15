---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/auth
  - apps/neta-app/server/db/schema/auth.ts
  - apps/neta-app/server/domain/actor.ts
  - apps/neta-app/app/api/auth
ilgili:
  - "[[03-mimari/kimlik-dogrulama|Kimlik doğrulama mimarisi]]"
  - "[[02-domainler/musteri-portali|Müşteri portalı]]"
etiketler:
  - neta
  - domain
  - auth
---

# Kimlik ve erişim

## Amaç

Bir instance'ın tek owner'ını ve davetli client kullanıcılarını doğrulamak; her isteği server-side role/scope bağlamına dönüştürmek.

## Mevcut davranış

- Better Auth email/şifre akışı SQLite adapter ile çalışır.
- İlk user create, setup reservation ile korunur; başarılı işlem `freelancer` profilini ve tamamlanmış setup state'i transaction içinde oluşturur.
- Sonraki client auth kullanıcıları public signup ile değil portal daveti kabulü sırasında oluşturulur.
- Session context ancak profil mevcut, enabled ve client için karşılıklı client bağı geçerliyse üretilir.
- Owner/client domain scope `DomainActor` üzerinden çözülür.

## Temel kavramlar

`user`, `account`, `session`, `verification` Better Auth tablolarıdır. `appProfiles` uygulama rolünü, client bağını ve disabled durumunu; `appSetupState` ilk owner kilidini; `portalInvitations` daveti; `authAuditEvents` önemli auth olaylarını taşır.

## Önemli iş akışları

- [[05-is-akislari/ilk-kurulum|İlk owner kurulumu]]
- [[05-is-akislari/musteri-daveti|Müşteri daveti ve kabulü]]
- Client erişimini disable/enable etme; disable sırasında session silme.

## Veri kalıcılığı

Tüm auth kayıtları ana SQLite DB'dedir ve backup kapsamındadır. Eski Supabase password/session verisi import edilmez.

## API yüzeyi

- `/api/auth/*`: Better Auth handler.
- `/api/v1/me`: authenticated profil/session/preference özeti.
- `/api/v1/me/preferences`: kişisel tercih mutation'ı.
- Portal invitation route'ları web akışında mevcuttur; tam mobil v1 davet yüzeyi planlanandır.

## Yetkilendirme

Owner scope yalnız `freelancer`; client scope yalnız `client + clientId` için oluşur. Request'teki sahiplik alanları yetki kaynağı değildir.

## Güvenlik

HttpOnly, SameSite=Lax ve HTTPS'te Secure cookie; auth rate limit; explicit trusted origins; hash-only davet tokenı; audit event'leri vardır. Email verification zorunlu değildir.

## Sınırlamalar ve plan

Mevcut native mobil auth cookie/bearer materyalini SecureStore'da saklar; lifecycle politikası henüz formal olarak kapanmamıştır. Owner device pairing kabul edilmiş tasarımdır ama uygulanmamıştır. Bkz. [[00-sistem/acik-sorular|açık sorular]].

## Kaynaklar

- `apps/neta-app/server/auth/`
- [[docs/self-hosted-redesign/phase-2-auth]]
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
