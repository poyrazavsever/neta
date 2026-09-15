---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "Eksik, süresi dolmuş, revoke edilmiş veya disabled hesaba ait session v1 API'de 401; doğrulanmış fakat rolü yetersiz actor 403 alır."
kaynaklar:
  - apps/neta-app/server/auth/session.ts
  - apps/neta-app/scripts/phase1-auth-smoke.mjs
  - docs/self-hosted-redesign/phase-9-mobile-api.md
ilgili:
  - "[[03-mimari/kimlik-dogrulama|Kimlik doğrulama]]"
  - "[[07-guvenlik/tehdit-modeli|Tehdit modeli]]"
etiketler:
  - neta
  - karar
  - auth
  - api
---

# ADR-013 — Disabled session HTTP politikası

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Planlar disabled profil için `401` ve `403` seçeneklerini açık bırakmıştır. Runtime client disable sırasında session'ları revoke eder ve auth resolver disabled profili geçerli actor'a dönüştürmez.

## Karar

Eksik, geçersiz, süresi dolmuş, revoke edilmiş veya disabled hesaba ait session `/api/v1` içinde `401 UNAUTHENTICATED` döner. `403 FORBIDDEN` yalnız geçerli ve enabled actor yanlış role/scope ile eriştiğinde kullanılır. Başka tenant'a ait kaynak uygun yerlerde `404` ile gizlenir.

## Gerekçe

Disabled hesap session'ının kullanılabilir auth materyali sayılmaması mevcut revoke lifecycle'ı ve istemcinin credential temizleme davranışıyla uyumludur. Ayrıca hesap durumunun anonim/güncelliğini yitirmiş credential üzerinden ayrıştırılmasını önler.

## Değerlendirilen alternatifler

- Geçerli cookie ile disabled profil bulunduğunda `403` dönmek.
- Bütün yetki hatalarını `404` yapmak.

## Varsayımlar

- Disable işlemi aktif session'ları kaldırmaya devam eder.
- Mobil `401` aldığında instance-scoped credential ve kullanıcı cache'ini temizler.

## Yeniden değerlendirme koşulları

- Audit veya yönetim gereksinimi disabled session'ı ayrı hata olarak göstermeyi zorunlu kılarsa.
- Auth resolver disabled profilleri session revoke öncesinde uzun süre gözlemleyebilirse.

## Canonical kaynaklar

- `apps/neta-app/server/auth/session.ts`
- `apps/neta-app/scripts/phase1-auth-smoke.mjs`
- [[docs/self-hosted-redesign/phase-9-mobile-api]]
