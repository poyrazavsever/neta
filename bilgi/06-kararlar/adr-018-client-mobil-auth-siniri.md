---
tur: karar
durum: planlanan
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "İlk client mobil girişi davet sonrası email/password Better Auth session kullanır; owner device pairing client'a otomatik genişletilmez."
kaynaklar:
  - apps/neta-app/server/auth/invitations.ts
  - docs/roadmaps/platform-master-plan.md
  - docs/self-hosted-redesign/adr-0018-device-pairing.md
ilgili:
  - "[[02-domainler/musteri-portali|Müşteri portalı]]"
  - "[[06-kararlar/adr-008-owner-device-pairing|ADR-008]]"
  - "[[06-kararlar/adr-012-ilk-mobil-auth-transportu|ADR-012]]"
etiketler:
  - neta
  - karar
  - mobil
  - portal
---

# ADR-018 — Client mobil auth sınırı

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Auth temeli mevcut, portal mobil parity planlanan

## Bağlam

ADR-008 owner cihazını pairing ile bağlamayı tasarlar. Client hesabı owner'ın cihaz scope'una ve yetkilerine sahip değildir; pairing tasarımını sessizce client'a genişletmek tenant ve lifecycle varsayımlarını karıştırır.

## Karar

İlk client mobil auth, owner tarafından gönderilen davetle oluşturulan instance-owned hesabın email/password Better Auth session'ını kullanır. ADR-008 pairing yalnız owner kapsamındadır. Client pairing istenirse scope, revoke ve davet ilişkisi ayrı ADR ve capability ile tanımlanır.

## Gerekçe

Mevcut davet ve session lifecycle'ını yeniden kullanır; yüksek yetkili owner token tasarımını client portalına yanlışlıkla taşımayı önler.

## Değerlendirilen alternatifler

- Owner ve client için aynı pairing endpoint/scope'u.
- Merkezi Neta hesabı üzerinden client auth.
- Client portalını ilk mobil sürümden tamamen kaldırmak.

## Varsayımlar

- Client hesabı yalnız bağlı `clientId` scope'una erişir.
- Davet sonrası parola kullanıcı tarafından belirlenir ve mobilde saklanmaz.

## Yeniden değerlendirme koşulları

- Passwordless client deneyimi ürün gereksinimi olursa.
- Merkezi identity/control-plane kabul edilirse.

## Canonical kaynaklar

- `apps/neta-app/server/auth/invitations.ts`
- [[docs/roadmaps/platform-master-plan]]
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
