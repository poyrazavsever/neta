---
tur: karar
durum: mevcut
karar_durumu: kabul-edilmis-tasarim
onceki_kimlik: K-008
guncellendi: 2026-09-15
guven: yuksek
ozet: "Owner mobil erişimi one-use challenge ve rotasyonlu opaque token family kullanan device pairing tasarımına dayanır."
kaynaklar:
  - docs/self-hosted-redesign/adr-0018-device-pairing.md
  - apps/neta-app/server/auth/device-pairing.ts
  - apps/neta-app/scripts/restore.mjs
  - apps/neta-mobile/src/lib/auth/native-auth-client.ts
ilgili:
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
  - "[[03-mimari/kimlik-dogrulama|Kimlik doğrulama]]"
  - "[[07-guvenlik/tehdit-modeli|Tehdit modeli]]"
  - "[[06-kararlar/adr-004-better-auth-ve-uygulama-profili|ADR-004]]"
  - "[[06-kararlar/adr-009-backup-restore-ve-downgrade-politikasi|ADR-009]]"
etiketler:
  - neta
  - karar
  - mobil
  - auth
---

# ADR-008 — Owner device pairing tasarımı

> Son güncelleme: **2026-09-15** — Pairing schema, route, mobil bearer transport'u ve restore epoch rotation'ı kodda yer alıyor; gerçek cihaz güvenlik kabulü açık.

**Karar durumu:** Kabul edilmiş tasarım · **Uygulama durumu:** Kodda mevcut, güvenlik kabulü açık

## Bağlam

Evrensel mobil istemcinin owner hesabına bağlanması için owner şifresini veya uzun ömürlü statik API key'i cihazda tutmayan, iptal edilebilir ve restore sonrası güvenliği tanımlı bir lifecycle gerekir.

## Karar

Owner pairing; tek kullanımlık kısa ömürlü challenge, DB-backed opaque access/refresh token family, refresh rotation ve reuse detection, açık scope, cihaz iptali ve restore token epoch bileşenlerinden oluşacaktır.

## Gerekçe

- Çalınmış cihaz erişimini tekil olarak iptal etmeyi sağlar.
- Statik API key ve uzun ömürlü bearer secret riskini azaltır.
- Rotation/reuse detection ile token kopyalanmasını görünür ve sınırlandırılabilir kılar.

## Değerlendirilen alternatifler

- Better Auth native cookie session.
- Uzun ömürlü statik API key.
- Stateless JWT access/refresh modeli.

Better Auth cookie yaklaşımının dynamic-origin native lifecycle için yeterliliği hâlâ araştırılabilir; kabul edilmiş ADR-0018 tasarımı uygulama kanıtı değildir.

## Varsayımlar

- İlk pairing kapsamı owner'dır; client mobil auth ayrı karardır.
- Token kayıtları server-side DB'de yaşar ve yalnız hash/opaque kimlikler saklanır.
- Restore eski token'ları yeniden geçerli kılmamalıdır.

## Etkilenen sistemler ve sonuçlar

- Yeni schema, pairing ve refresh route'ları gerekir.
- Rate limit, audit, scope enforcement ve cihaz revoke UX'i gerekir.
- Backup/restore token epoch ile birlikte tasarlanmalıdır.

## Uygulama durumu

`apps/neta-app/server/auth/device-pairing.ts` challenge, exchange, refresh, access context ve revoke akışını; 0015 migration device tablolarını; `restore.mjs` token epoch rotation'ını uygular. Mobil istemci instance-scoped SecureStore ve bearer refresh yolunu içerir. `auth.device-pairing.v1` route capability'si `available`dır. Reuse, revoke, restore ve iki canlı instance için gerçek cihaz/negatif E2E kabulü tamamlanmadan mağaza güvenliği kanıtlanmış sayılmaz.

## Yeniden değerlendirme koşulları

- Dynamic-origin Better Auth native cookie deneyi güvenli refresh/revoke/restore lifecycle'ını kanıtlarsa.
- Mobilde client hesapları owner ile aynı lifecycle'ı gerektirirse.
- Merkezi identity/control-plane kararı alınırsa.

## Canonical kaynaklar

- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
