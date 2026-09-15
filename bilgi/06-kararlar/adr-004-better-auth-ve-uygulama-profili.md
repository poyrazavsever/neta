---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
onceki_kimlik: K-004
guncellendi: 2026-09-03
guven: yuksek
ozet: "Kimlik ve oturum Better Auth'ta, Neta rolü ile müşteri bağı appProfiles tablosunda tutulur."
kaynaklar:
  - docs/self-hosted-redesign/phase-2-auth.md
  - apps/neta-app/server/auth
ilgili:
  - "[[03-mimari/kimlik-dogrulama|Kimlik doğrulama]]"
  - "[[02-domainler/kimlik-ve-erisim|Kimlik ve erişim]]"
  - "[[06-kararlar/adr-005-supabase-runtime-bagimliliginin-kaldirilmasi|ADR-005]]"
  - "[[06-kararlar/adr-008-owner-device-pairing|ADR-008]]"
etiketler:
  - neta
  - karar
  - auth
---

# ADR-004 — Better Auth ve uygulama profili ayrımı

> Son güncelleme: **2026-09-03** — Toplu karar kaydındaki K-004 bağımsız ADR notuna ayrıldı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Neta, kimlik doğrulama lifecycle'ını ürün rolü ve müşteri kaydı yetkilendirmesinden ayırmalıdır. Bir auth kullanıcısının owner veya davetli client olarak hangi kapsamda işlem yapabildiği Neta domain'i tarafından belirlenir.

## Karar

Kimlik, credential ve session Better Auth tablolarında yönetilir. Ürün rolü ile client bağı `appProfiles` tablosunda tutulur; request actor session ve uygulama profili birlikte çözülerek oluşturulur.

## Gerekçe

- Auth altyapısı ile Neta authorization modelini birbirine gömmez.
- Owner kurulumu ve client invitation akışlarının ürün kurallarını domain tarafında tutar.
- Supabase Auth runtime bağımlılığına ihtiyaç bırakmaz.

## Değerlendirilen alternatifler

- Supabase Auth'ı runtime'da sürdürmek.
- Credential, session ve ürün rolünü tamamen custom tek tabloda yönetmek.
- Rolü yalnız Better Auth kullanıcı metadata'sında saklamak.

## Varsayımlar

- İlk release için email/password yeterlidir.
- Instance'ta tek owner ve davetle açılmış client hesapları vardır.
- Mobil auth lifecycle, web session modelini zayıflatmadan ayrıca tasarlanabilir.

## Etkilenen sistemler ve sonuçlar

- Yetkilendirme hattı session → profile → actor biçimindedir.
- İlk owner oluşturma ve invitation kabulü atomik olmalıdır.
- Mobil cookie veya pairing seçimi bu temel rol modelini değiştirmemelidir.

## Uygulama kanıtı

`apps/neta-app/server/auth/` session, profil ve actor çözümünü içerir. Mevcut web davranışı [[03-mimari/kimlik-dogrulama|kimlik doğrulama]] sayfasında sentezlenir.

## Yeniden değerlendirme koşulları

- Sosyal auth, SSO veya merkezi identity servisi hedefi.
- Çok owner veya merkezi tenant hesabı gereksinimi.
- Better Auth'ın gerekli mobil lifecycle'ı karşılayamadığının kanıtlanması.

## Canonical kaynaklar

- [[docs/self-hosted-redesign/phase-2-auth]]
- `apps/neta-app/server/auth/`
