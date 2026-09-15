---
tur: mimari
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - package.json
  - pnpm-workspace.yaml
  - pnpm-lock.yaml
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[04-bilesenler/neta-app|neta-app]]"
  - "[[04-bilesenler/neta-web|neta-web]]"
  - "[[04-bilesenler/neta-mobile|neta-mobile]]"
etiketler:
  - neta
  - mimari
  - monorepo
---

# Monorepo

## Mevcut yapı

```text
apps/
  neta-app/       @neta/app
  neta-web/       @neta/web
  neta-mobile/    @neta/mobile
packages/
  api-contracts/  @neta/api-contracts
  design-tokens/  @neta/design-tokens
docs/
tools/desktop-assistant/
```

Root `pnpm-workspace.yaml`, `apps/*` ve `packages/*` paketlerini kapsar. Tek package manager `pnpm@11.5.1`, tek lockfile ve Node 24 engine sözleşmesi vardır. Root package yalnız orchestration scriptleri sağlar.

## Sınırlar

- Uygulama dependency'leri kendi manifestinde yaşar.
- App'ler birbirinin source klasörüne relative import yapmaz.
- JSON wire paylaşımı `api-contracts`, platform-neutral tema değerleri `design-tokens` üzerinden olur.
- `api-contracts` DB entity/repository tipi taşımaz.
- `design-tokens` DOM veya React Native component taşımaz.
- Docker yalnız `@neta/app` dependency graph'ını ve standalone çıktıyı çalıştırır.
- `tools/desktop-assistant` pnpm workspace'in dışında Python yardımcı araçtır.

## Script modeli

Root `app:*`, `web:*`, `mobile:*` filtreleri sunar; `lint:all`, `typecheck:all`, `build:all` ortak kapılardır. App'e özel phase smoke scriptleri root'tan filtrelenerek çalıştırılır.

## Mevcut boşluk

Workspace yapısı kurulmuş olsa da `api-contracts` backend tarafından henüz tüketilmemektedir. Bu nedenle ortak package varlığı contract drift'i otomatik engellemez.

## Değişiklik kuralı

Yeni paylaşım ihtiyacında önce kavramın gerçekten platform-neutral olup olmadığı değerlendirilmelidir. Web UI component'i mobile taşınmaz; iş kuralı app'ler arasında kopyalanmaz; backend source import edilmez.

## Kaynaklar

- `package.json`
- `pnpm-workspace.yaml`
- [[docs/roadmaps/platform-master-plan]]
