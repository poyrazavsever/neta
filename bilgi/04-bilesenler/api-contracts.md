---
tur: bilesen
durum: mevcut
guncellendi: 2026-09-03
guven: yuksek
kaynaklar:
  - packages/api-contracts/package.json
  - packages/api-contracts/src/index.ts
  - apps/neta-mobile/src/features
  - docs/neta-backend-mobile-api-master-plan.md
ilgili:
  - "[[03-mimari/api|API]]"
  - "[[04-bilesenler/neta-mobile|neta-mobile]]"
etiketler:
  - neta
  - bilesen
  - api-contracts
---

# api-contracts

## Rol

`@neta/api-contracts`, mobil ile backend arasında taşınacak JSON-safe DTO, envelope, pagination, domain resource ve runtime guard sözleşmelerini toplar.

## Mevcut kapsam

Dashboard, client, project, task, calendar, finance, journal, settings, files, portal ve chat gibi geniş bir wire model içerir. Mobil ve backend dependency olarak paketi tüketir. Bootstrap discovery/meta/me/preferences/catalog, capability ve pagination fixture'ları package içindedir.

## Olmaması gerekenler

- Drizzle row/schema/repository tipi.
- Server-only secret veya filesystem path.
- React/React Native UI component'i.
- Transporttan bağımsız domain kuralının istemci kopyası.

## Mevcut uygulama

Backend presenter'ları shared guard ile çıktı doğrular; backend ve mobil consumer testleri aynı fixture setini kabul etmek zorundadır. `pnpm contract:check` bu bağı tek CI kapısında çalıştırır. Geniş resource DTO'larının backend route uygulaması ise henüz planlanandır.

## Hedef kullanım

- Backend response presenter fixture'ları aynı guard'dan geçer.
- Mobile request/response parser'ları canonical shape'i kullanır.
- Capability yalnız sözleşmenin endpoint matrisi ve authorization testleri geçince açılır.
- Additive v1 değişiklikleri ve breaking v2 ayrımı test edilir.

## Kapanan drift

`language/locale`, `catalogVersion/version`, preference mutation response ve project asset pagination farkları MOB-1'de kanonik hale getirildi. Geçişte yalnız PATCH input'unda `language` alias'ı ve catalog response'unda `catalogVersion` alanı süreli olarak korunur.

## Kaynaklar

- `packages/api-contracts/src/index.ts`
- [[docs/neta-backend-mobile-api-master-plan]]
