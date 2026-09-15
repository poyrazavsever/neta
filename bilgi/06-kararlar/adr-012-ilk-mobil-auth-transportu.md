---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "İlk mobil auth, instance domain'i üzerinde email/password ile oluşturulan Better Auth cookie session'ıdır; parola saklanmaz, pairing daha sonra gelir."
kaynaklar:
  - apps/neta-app/server/auth/auth.ts
  - apps/neta-mobile/src/lib/auth/native-auth-client.ts
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[03-mimari/kimlik-dogrulama|Kimlik doğrulama]]"
  - "[[06-kararlar/adr-008-owner-device-pairing|ADR-008]]"
etiketler:
  - neta
  - karar
  - mobil
  - auth
---

# ADR-012 — İlk mobil auth transport'u

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Runtime instance cookie yolu kodda; native iki-instance kabulü açık

## Bağlam

İlk teslim email/password Better Auth cookie session kullanır; owner pairing bearer yolu ayrıca kodda yer alır. Mobil cookie materyalini instance kimliği altında SecureStore'da tutar.

## Karar

İlk mobil giriş yolu, doğrulanmış instance origin'inde email/password ile oluşturulan Better Auth session cookie'sidir. Cookie yalnız aynı `instanceId` ve origin için gönderilir, parola hiçbir zaman saklanmaz. Cihaz pairing'i bu yolu bloke etmez ve ADR-008'in ayrı güvenlik fazında owner için eklenir. Belgelenmemiş bearer header birincil v1 contract sayılmaz.

## Gerekçe

Bu seçim yeni token altyapısı icat etmeden çalışan auth sistemini kullanır ve MOB-1 contract çalışmasını pairing güvenlik kapsamından ayırır.

## Değerlendirilen alternatifler

- Pairing tamamlanana kadar mobil auth'u bloke etmek.
- Uzun ömürlü statik API key.
- Stateless JWT access/refresh çifti.

## Varsayımlar

- React Native cookie/header köprüsü gerçek iOS ve Android cihaz testlerinden geçecektir.
- Session revoke, password change ve expiry server tarafından yönetilir.

## Yeniden değerlendirme koşulları

- Native cookie lifecycle'ı güvenilir biçimde doğrulanamazsa.
- ADR-008 pairing ilk release için zorunlu hâle gelirse.
- Better Auth mobil session sözleşmesi değişirse.

## Canonical kaynaklar

- `apps/neta-app/server/auth/auth.ts`
- `apps/neta-mobile/src/lib/auth/native-auth-client.ts`
- [[docs/roadmaps/platform-master-plan]]
