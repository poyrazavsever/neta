---
tur: is-akisi
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/auth/invitations.ts
  - apps/neta-app/app/api/portal-invitations
ilgili:
  - "[[02-domainler/musteriler|Müşteriler]]"
  - "[[02-domainler/musteri-portali|Müşteri portalı]]"
  - "[[07-guvenlik/tehdit-modeli|Tehdit modeli]]"
etiketler:
  - neta
  - is-akisi
  - davet
---

# Müşteri daveti

## Aktörler

Owner/freelancer, davet edilen müşteri ve Better Auth/SQLite runtime.

## Önkoşullar

Owner authenticated/enabled; müşteri kaydı owner'a ait; henüz auth hesabına bağlı değil; seçilen portal locale aktif/portal-ready.

## Mevcut akış

1. Owner client ID, email, locale ve 1–168 saat expiry ile davet ister; varsayılan 72 saattir.
2. Server 32 byte random base64url raw token üretir; yalnız SHA-256 hash'ini saklar.
3. Aynı client'ın eski pending davetleri transaction içinde revoke edilir.
4. Raw token yalnız invitation URL içinde owner'a döner.
5. Müşteri linki açar; preview hash ile bulunur ve expired ise state güncellenir.
6. Müşteri display name ve şifre belirler.
7. Transaction; user, credential account, client profile, client↔auth bağı, locale preference ve invitation accepted state'ini oluşturur.
8. Sonraki login client role ile portalı açar.

## Negatif durumlar

Expired/revoked/accepted/unknown token; kayıtlı email; zaten bağlı client; eşzamanlı ikinci kabul; owner'ın sahip olmadığı client; portal-ready olmayan locale.

## Güvenlik

Raw token DB/audit'e girmez. Acceptance tek transaction'dır. Davet event'leri audit edilir. Token taşıyan URL browser history/referrer/log riskine sahiptir; kısa expiry ve one-use bu riski azaltır ama delivery kanalını güvenli yapmaz.

## Erişim kapatma

Owner client access'i disable ettiğinde profile disabled olur ve mevcut Better Auth session'ları silinir.

## Kaynaklar

- `apps/neta-app/server/auth/invitations.ts`
- [[docs/self-hosted-redesign/phase-2-auth]]
