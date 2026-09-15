---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "V1 parse ve iş girdisi validation hataları tutarlı biçimde 400 VALIDATION_ERROR döner; 422 invariant ihlalleri için ayrıdır."
kaynaklar:
  - apps/neta-app/server/domain/errors.ts
  - docs/neta-backend-mobile-api-master-plan.md
ilgili:
  - "[[03-mimari/api|API]]"
etiketler:
  - neta
  - karar
  - api
  - validation
---

# ADR-019 — V1 validation HTTP statüsü

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut, strict parse kapsamı genişletiliyor

## Bağlam

Plan, malformed JSON, schema validation ve domain invariant hatalarının `400` ile `422` arasında route bazında karışmamasını ister. Mevcut `VALIDATION_ERROR` zaten `400`, `INVARIANT_VIOLATION` ise `422` eşlemesine sahiptir.

## Karar

Malformed JSON, bilinmeyen alan, format/range ve kullanıcı girdisi validation hataları `400 VALIDATION_ERROR` döner. `422 INVARIANT_VIOLATION` yalnız syntactically valid isteğin korunmuş domain invariant'ı nedeniyle işlenemediği durumlar içindir. Unsupported locale mevcut ayrı koduyla `400` kalır.

## Gerekçe

Mevcut status haritasını korur, mobil hata sınıflandırmasını sadeleştirir ve aynı hata ailesinin route'a göre değişmesini önler.

## Değerlendirilen alternatifler

- Bütün validation hatalarını `422` yapmak.
- Zod parse için `400`, diğer field validation için `422` kullanmak.

## Varsayımlar

- Domain servisleri invariant ile kullanıcı input validation ayrımını korur.
- Error envelope kararlı `code` alanını taşır.

## Yeniden değerlendirme koşulları

- Public API standardı bütün validation için farklı bir status zorunlu kılarsa.
- Domain error sınıflandırması yeniden tasarlanırsa.

## Canonical kaynaklar

- `apps/neta-app/server/domain/errors.ts`
- [[docs/neta-backend-mobile-api-master-plan]]
