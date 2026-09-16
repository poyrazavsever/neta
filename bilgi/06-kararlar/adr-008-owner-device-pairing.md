---
tur: karar
durum: mevcut
karar_durumu: kabul-edilmis-tasarim
onceki_kimlik: K-008
guncellendi: 2026-09-16
guven: yuksek
ozet: "Owner mobil erişimi one-use challenge ve rotasyonlu opaque token family kullanan device pairing tasarımına dayanır."
kaynaklar:
  - docs/self-hosted-redesign/adr-0018-device-pairing.md
  - apps/neta-app/server/auth/device-pairing.ts
  - apps/neta-app/scripts/restore.mjs
  - apps/neta-mobile/src/lib/auth/native-auth-client.ts
  - docs/mobile/mobile-security-acceptance.md
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

> Son güncelleme: **2026-09-16** — Historical reuse, explicit Bearer/scope, native profil/parola, revoke ve izole restore otomatik kabulü geçti; açık ADR tasarım farkları ile signed gerçek cihaz/iki HTTPS instance kabulü ayrı kalır.

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

2026-09-16 otomatik kabulü historical refresh reuse, explicit Bearer/scope sınırı, expiry/disable/revoke/logout-all/parola ve izole restore epoch negatiflerini doğrular. `device_refresh_history` 0016 migration ile eklenir; geri üretilemeyen eski digest geçmişi nedeniyle mevcut aktif cihaz oturumları iptal edilip yeniden pair edilir. Mobil generation/write serialization, geç refresh'in logout veya yeni login sonrasında credential diriltmesini engeller. Native Bearer profil/parola işlemleri web cookie'si gerektirmez; parola değişimi cihaz family'lerini iptal eder.

[[docs/mobile/mobile-security-acceptance]] otomasyonun kanıt sınırını ve açık tasarım farklarını listeler. Mevcut duplicate refresh davranışı katı family compromise'dır; ADR'nin hedef grace/replay'i, challenge'a bağlı yanlış kod denemesi ve cleanup işi tamamlanmış sayılmaz. Signed gerçek cihaz ve iki canlı HTTPS instance kabulü açıktır.

## Yeniden değerlendirme koşulları

- Dynamic-origin Better Auth native cookie deneyi güvenli refresh/revoke/restore lifecycle'ını kanıtlarsa.
- Mobilde client hesapları owner ile aynı lifecycle'ı gerektirirse.
- Merkezi identity/control-plane kararı alınırsa.

## Canonical kaynaklar

- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
