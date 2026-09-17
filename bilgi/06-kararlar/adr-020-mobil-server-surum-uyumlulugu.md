---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-17
guven: yuksek
ozet: "Mobil-server uyumluluğu API major ve server'ın ilan ettiği minimum client SemVer ile belirlenir; aynı v1 içindeki additive alanlar uyumludur."
kaynaklar:
  - docs/mobile/mobile-release-acceptance.md
  - apps/neta-app/server/config.ts
  - apps/neta-mobile/src/lib/instance/version.ts
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[03-mimari/api|API]]"
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
etiketler:
  - neta
  - karar
  - mobil
  - compatibility
---

# ADR-020 — Mobil-server sürüm uyumluluğu

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Bootstrap kontrolleri mevcut

## Bağlam

Self-hosted server ile store client aynı anda güncellenmez. Exact server/client sürüm eşitliği self-hosting'i kırar; sınırsız geriye uyumluluk ise contract drift'ini gizler.

## Karar

Uyumluluk iki kapıyla değerlendirilir: mobil yalnız desteklediği API major sürümüne bağlanır; server opsiyonel `minimumSupportedVersion` ile minimum mobil SemVer ilan edebilir. Aynı v1 içindeki yeni response alanları additive olmalı ve eski client tarafından yok sayılabilmelidir. Kırıcı wire değişikliği yeni API major gerektirir.

## Gerekçe

Bu model bağımsız release temposunu destekler, server operatörüne güvenlik gerektiren minimum client yükseltme aracı verir ve patch sürümüne gereksiz kilit oluşturmaz.

## Değerlendirilen alternatifler

- Server ve client sürümlerinin birebir eşleşmesi.
- Yalnız server SemVer karşılaştırması.
- Hiç compatibility kontrolü yapmamak.

## Varsayımlar

- Mobil app version geçerli SemVer'dir.
- V1 runtime guard'ları bilinmeyen additive alanları reddetmez.

2026-09-17 uygulaması prerelease sıralamasını korur: RC stable minimumunu geçmez; build metadata yok sayılır ve malformed minimum fail closed’dur. Kod ve canlı kabul matrisi [[docs/mobile/mobile-server-compatibility]] sayfasındadır.

## Yeniden değerlendirme koşulları

- Desteklenen birden fazla API major aynı client içinde yaşarsa.
- Güvenlik güncellemesi için maksimum client veya minimum server kapısı gerekirse.

## Canonical kaynaklar

- `apps/neta-app/server/config.ts`
- `apps/neta-mobile/src/lib/instance/version.ts`
- [[docs/roadmaps/platform-master-plan]]
