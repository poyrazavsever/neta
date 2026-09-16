---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-16
guven: yuksek
ozet: "UI kaynakları ve sentetik başlangıç çekimleri vault içinde platform/rol/sayfa bazında saklanır; runtime asset kaynağı uygulamalarda kalır."
kaynaklar:
  - docs/ui-assets-pipeline.md
  - tools/ui-assets
ilgili:
  - "[[assets-pipeline/indeks|Assets pipeline]]"
  - "[[assets-pipeline/ui-ux-guncelleme-plani|UI/UX planı]]"
  - "[[06-kararlar/adr-010-agent-baglaminda-vault-routing|ADR-010]]"
etiketler:
  - neta
  - karar
  - ui
---

# ADR-022 — UI assets pipeline

## Bağlam

Mobil fonksiyonel fazlar sonrasında kapsamlı UI/UX güncellemesi yapılacak. Sayfa, asset, kaynak, tasarım brief'i ve mevcut ekran kanıtının dağınık olması değişikliği incelemeyi ve agent'ın doğru başlangıç noktasını bulmasını zorlaştırır. Kullanıcı bunların vault içinde düzenli arşivlenmesini istedi.

## Karar

`bilgi/assets-pipeline` platform/rol/sayfa dizilimini, ortak kaynak arşivini ve sentetik ekran manifestlerini barındırır. Envanter koddan üretilir, elle doldurulan page planları korunur. Bütün PNG ve asset kopyaları SHA-256 ile doğrulanır. Çekim yalnız izole loopback fixture'da, gerçek auth ve gerçek route'larla yapılır; credential/token vault'a yazılmaz. Uygulamanın runtime asset kaynağı kendi public/assets klasörlerinde kalır.

UI/UX uygulaması işlevsel mobil kapılardan sonra gelir. Şimdiki otomasyon inventory/capture/gallery/integrity'dir; CI visual diff ve signed native UI kabulü ayrı planlanan adımlardır.

## Gerekçe

Sayfa ile kanıt ve tasarım işini aynı yerde ilişkilendirir; mevcut ve planlanan durumu ayırır. Kaynak kopyası mevcut tasarımın karşılaştırılabilir başlangıcını korur. Backend veya uygulama bundle'ına vault bağımlılığı eklemez.

## Değerlendirilen alternatifler

- Yalnız harici tasarım aracında asset/screenshot tutmak.
- Tek klasörde bağlamsız PNG biriktirmek.
- Vault'u doğrudan runtime asset dizini yapmak.

## Varsayımlar

- Route envanteri Next/Expo filesystem router'ından çıkarılabilir.
- Sentetik fixture gerçek veriyi sızdırmadan işlevsel UI oluşturabilir.
- Statik import grafiği dinamik upload'ların yerine geçmez; bunlar tasarım incelemesinde değerlendirilir.

## Sınırlar

Default açık/koyu screenshot, bütün UX durumları veya signed store kabulü değildir. Arşiv binary dosyalar nedeniyle repository boyutunu artırır. İlk, henüz onaylanmamış arşiv tekrar çekimde aynı dosya altında güncellenir. Tasarım incelemesinde onaylı baseline ve gerekli before/after kanıtı sürümlü korunur; sınırsız geçmiş kopyası biriktirilmez. Büyük arşiv büyümesinde LFS veya ayrı artifact deposu değerlendirilir.

## Yeniden değerlendirme koşulları

Route modeli değişirse, arşiv boyutu review/clone akışını zorlaştırırsa veya tasarım ekipleri harici canonical asset yönetimi gerektirirse.

## Canonical kaynaklar

- [[docs/ui-assets-pipeline]]
- `tools/ui-assets/`
- `apps/neta-app/scripts/ui-assets-fixture.mjs`
