---
tur: is-akisi
durum: mevcut
guncellendi: 2026-09-16
guven: yuksek
ozet: "Mobil, canonical web uygulaması, portal ve landing/docs için sayfa planı, kaynak asset ve gerçek ekran görüntüsü arşivi."
kaynaklar:
  - docs/ui-assets-pipeline.md
  - tools/ui-assets
  - bilgi/assets-pipeline/inventory/pages.json
  - bilgi/assets-pipeline/inventory/assets.json
ilgili:
  - "[[assets-pipeline/ui-ux-guncelleme-plani|UI/UX güncelleme planı]]"
  - "[[06-kararlar/adr-022-ui-assets-pipeline|ADR-022]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil plan]]"
etiketler:
  - neta
  - ui
  - ux
  - assets
---

# Assets pipeline

UI/UX güncellemesine **işlevsel mobil fazlar ve kabul kapıları sonrasında** dönülecek. Şimdiki teslim, başlangıç envanteri ve tekrar çalıştırılabilir arşivleme hattıdır; görsel tasarım uygulaması başlamadı.

- [Ekran galerisi](galeri.html): platform, rol ve sayfa adıyla aranabilir; PNG'leri tam boy açar.
- [Sayfa envanteri](inventory/pages.json): 87 gerçek route; layout/native-intent altyapısı sayfa sayılmaz.
- [Asset envanteri](inventory/assets.json): 114 görsel, video, font, native navigation asset'i ve referans; kaynak yolu, arşiv kopyası, SHA-256 ve runtime/reference/dependency ayrımı.
- [Arşiv sağlık raporu](reports/assets-health.json): route/tema kapsamı, PNG ölçüleri ve kaynak/arşiv hash kontrolü.
- [Android dosya smoke kanıtı](reports/native-file-smoke.json): gerçek picker upload, yetkili download/share iptali, geçici dosya temizliği ve backend logout.
- [Docs içerikleri](inventory/docs-pages.json): Türkçe/İngilizce içerik route'ları ayrı çekilir.
- [[assets-pipeline/ui-ux-guncelleme-plani|Güncelleme sırası ve kabul ölçütleri]].

## Klasör sözleşmesi

```text
assets-pipeline/
  indeks.md / ui-ux-guncelleme-plani.md / galeri.html
  inventory/                 # Üretilmiş sayfa, asset ve docs envanteri
  shared/<platform>/originals/ # Mevcut kaynakların birebir arşivi
  templates/                 # Asset talebi ve tasarım inceleme şablonları
  reports/                   # Gerçek çekim sonuçları
  pages/<platform>/<actor>/<page-id>/
    page.json                # Route, kod, ortak layout/import ve asset ilişkileri
    plan.json                # Kalıcı, elle geliştirilecek sayfa brief'i
    screenshots/             # Açık/koyu PNG ve manifest.json
    assets/source/           # Yeni asset'in düzenlenebilir kaynağı
    assets/export/           # Uygulamada kullanılacak optimize çıktı
    design/                  # Akış, wireframe ve tasarım seçenekleri
    reviews/                 # UX/a11y/görsel inceleme kayıtları
```

`platform`: mobile/app/web; `actor`: owner/client/public. Kaynak kodla üretilen envanter güncellenebilir; elle düzenlenen `plan.json` yeniden üretimde ezilmez. Her sayfada amaç, birincil aksiyon, inceleme sırası ve review soruları içeren başlangıç brief'i vardır; bunlar UX incelemesi gerektiren taslaktır. Ortak asset tek arşivde tutulur, sayfa manifestleri ona referans verir. Uygulama runtime'ı bu vault klasöründen asset import etmez.

## Tekrar üretim

Canonical komut ve fixture kurulumu: [[docs/ui-assets-pipeline]]. Windows'ta `pnpm.cmd` kullanılabilir.

```sh
pnpm ui:assets:inventory
pnpm ui:assets:fixture
# Ayrı terminal: landing production port 4311; Expo loopback + capture flag
pnpm ui:assets:capture:web
pnpm ui:assets:capture:mobile
pnpm ui:assets:smoke:mobile
pnpm ui:assets:gallery
pnpm ui:assets:check --require-complete
```

Çekim yalnız izole loopback sentetik veritabanında yapılır. Gerçek kullanıcının verisi, cookie, pairing secret, parola veya token vault'a konmaz. Çekim manifesti tema, locale, route, runtime, tarih, boyut ve hash taşır. Yönlendirilen route'lar `redirect` olarak işaretlenir.

## Kanıtın kapsamı

Başlangıç arşivi **242 PNG**: canonical app/portal 82, landing/docs 70, Android debug 90 (84 açık/koyu sayfa ve 6 proje/dosya etkileşim durumu). 87 route'un her iki tema kaydı vardır. Hash/ölçü/kapsam kontrolü geçti; görsel UX onayı henüz verilmedi. Native tam 84 sayfa turu `reports/mobile-baseline-capture.json`, hedefli son çekim `reports/mobile-capture.json` altında kayıtlıdır.

Web başlangıcı desktop ve açık/koyu temadır; docs içerikleri tr/en'dir. Android başlangıcı Türkçe telefon viewport'unda **debug development client** çekimidir. Default sayfa görüntüsü bütün loading/offline/validation/modal/tablet/iOS durumlarının kabul edildiği anlamına gelmez. Bu varyantlar sayfa planlarında açık işlerdir. Signed gerçek cihaz ve iki HTTPS instance güvenlik kabulü ayrıca yürütülür.

Sayfa–asset bağlantıları statik import/layout grafiğinden çıkarılır; runtime kullanıcı upload'ları arşivlenmez. Dinamik asset eşleştirmeleri tasarım brief'inde doğrulanır. Gelecekteki CI görsel karşılaştırma/eşik/onay hattı [[assets-pipeline/ui-ux-guncelleme-plani|planlanandır]].
