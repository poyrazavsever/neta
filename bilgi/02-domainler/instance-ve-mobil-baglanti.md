---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/api/v1
  - apps/neta-app/server/instance
  - apps/neta-mobile/src/lib/instance
  - apps/neta-mobile/app.config.ts
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
  - "[[05-is-akislari/mobil-instance-baglantisi|Mobil bağlantı akışı]]"
etiketler:
  - neta
  - domain
  - instance
  - mobil
---

# Instance ve mobil bağlantı

## Amaç

Bir mobil istemcinin bağlandığı self-hosted Neta origin'ini doğrulaması, kalıcı instance kimliğini tanıması ve doğru auth/API sınırını kullanması.

## Mevcut davranış

Backend `/.well-known/neta`, `/api/v1/meta` ve `/api/v1/health` ile protocol, discovery/API version, `instanceId`, same-origin API linkleri, marka, locale ve capability metadata'sı sunar. Instance ID ilk ihtiyaçta oluşturulur ve SQLite'ta saklandığı için backup/restore ile korunur.

Mobil discovery origin'i normalize eder; production'da HTTPS ister; discovery/meta ID tutarlılığı, API version, minimum client version ve same-origin linkleri doğrular. Instance metadata/cache/auth materyali `instanceId` ile scope edilir.

## Bugünkü sınırlama

Production mobil build origin'i `EXPO_PUBLIC_NETA_ORIGIN` ile sabittir. UI kullanıcının domain girmesine, QR okumasına veya instance değiştirmesine izin vermez.

## Planlanan davranış

Aktif platform planına göre resmî generic binary runtime'da domain alacak veya `origin + secret` QR okuyacaktır. İlk aşama manuel domain + email/password olabilir; owner pairing sonraki güvenlik fazıdır. Domain bilinmeden salt kısa kod merkezi resolver gerektirdiği için ilk kapsam dışındadır.

## API ve yetkilendirme

Discovery/meta/health public ve secret-free olmalıdır. Auth yalnız doğrulanmış same-origin'e gönderilir. Pairing geldiğinde scope/token server tarafından atanacak; client-supplied owner ID kabul edilmeyecektir.

## Güvenlik

TLS downgrade, redirect/origin değişimi, eski instance credential'ının yeni `instanceId`de yeniden kullanılması, QR secret sızıntısı ve malicious discovery temel tehditlerdir.

## Bağımlılıklar

[[02-domainler/kimlik-ve-erisim|Kimlik]], [[02-domainler/dosyalar-ve-markalama|branding]], [[02-domainler/yerellestirme|yerelleştirme]], [[03-mimari/api|API]].

## Kaynaklar

- [[docs/self-hosted-redesign/phase-9-mobile-api]]
- [[docs/roadmaps/platform-master-plan]]
- `apps/neta-mobile/src/lib/instance/discovery.ts`
