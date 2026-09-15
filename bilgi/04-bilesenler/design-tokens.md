---
tur: bilesen
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - packages/design-tokens/package.json
  - packages/design-tokens/src/index.ts
  - apps/neta-mobile/src/theme
ilgili:
  - "[[04-bilesenler/neta-mobile|neta-mobile]]"
  - "[[02-domainler/dosyalar-ve-markalama|Markalama]]"
etiketler:
  - neta
  - bilesen
  - design-tokens
---

# design-tokens

## Rol

`@neta/design-tokens`, platformdan bağımsız spacing, radius, typography, shadow ve semantic light/dark color değerlerini üretir. Instance primary/accent renklerinden okunabilir foreground ve türetilmiş state renkleri oluşturur.

## Mevcut içerik

- Neta red brand paleti.
- Spacing/radius/typography/shadow scales.
- Light ve dark semantic colors.
- `createThemeTokens` ile dynamic brand color uygulama.
- Hex normalization, contrast ve color-mixing yardımcıları.

## Sınırlar

DOM, CSS class, React veya React Native component içermez. Platform adapter'ı tüketen uygulamanın sorumluluğudur. Bugün ana tüketici mobile'dır; self-hosted web Poyraz UI v3 ve kendi server-rendered CSS token zincirini kullanır.

## Risk / plan

“Ortak token” tüm yüzeylerin pixel-identical olduğu anlamına gelmez. Landing Poyraz UI v2, app v3 ve mobile native token katmanı arasındaki semantik isimler bilinçli biçimde hizalanmalı; görsel component paylaşımı hedeflenmemelidir.

## Kaynaklar

- `packages/design-tokens/src/index.ts`
- [[docs/roadmaps/platform-master-plan]]
