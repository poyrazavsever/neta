---
tur: yol-haritasi
durum: planlanan
guncellendi: 2026-09-16
guven: yuksek
ozet: "Fonksiyonel mobil çalışma sonrasında sayfa akışları, tasarım sistemi, asset üretimi ve görsel kabulün sıralı yürütülmesi."
kaynaklar:
  - docs/ui-assets-pipeline.md
  - bilgi/assets-pipeline/inventory/pages.json
  - tools/ui-assets
ilgili:
  - "[[assets-pipeline/indeks|Assets pipeline]]"
  - "[[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]"
  - "[[06-kararlar/adr-022-ui-assets-pipeline|ADR-022]]"
etiketler:
  - neta
  - ui
  - ux
  - yol-haritasi
---

# UI/UX güncelleme planı

Bu çalışma en sona alınır. Envanter, dosya sistemi ve mevcut UI çekimleri hazırlandığında tasarım fazı başlamış sayılmaz. Backend auth/contract ve mobilden günlük işlem diliminin kabulü önce gelir.

## 0 — Başlangıç arşivi ve kapsam

Mevcut route ve asset envanterini koddan üret; her sayfanın default açık/koyu görüntüsünü sentetik fixture'da kaydet. Yönlendirmeleri, capability-gated/planned ekranları ve debug native sınırını görünür tut. Page brief'ine temel görev, birincil aksiyon, gerçek kullanıcı sorunu ve scope ekle. Çıkış: eksik route/tema yok, hash kontrolü geçer; mevcut arşiv bu adımın temelidir.

## 1 — UX akışlarının incelenmesi

Öncelik: domain/QR bağlantısı → login/logout ve instance unutma → owner dashboard → client/project/task/calendar günlük işleri → finance/journal → hesap/markalama/dosya → portal → landing/docs. Her akışta başlangıç, başarı, geri dönüş, iptal, hata ve yeniden deneme çizilir. Gereksiz seçim ve adımlar kayıt altına alınır; loading/empty/offline/permission mesajları gerçek backend davranışına bağlanır. Çıkış: her page brief'inde hedef görev, sorun listesi, aksiyon ve kabul ölçütleri dolu.

## 2 — Ortak tasarım sistemi

Renk ve kontrast, typography, spacing, radius, ikon, form, list/card, button, toast/dialog, navigation, skeleton ve empty/error durumları tanımlanır. Owner ve client aynı semantik tokenları kullanır; instance markası korunur. Mobil/web ölçekleri ve safe area ayrı doğrulanır. Yeni marka/ürün kararı gerekiyorsa ADR açılır. Çıkış: açık/koyu ve uzun metin/RTL örnekleriyle bileşen referansı.

## 3 — Wireframe ve sayfa planı

Sayfa başına birincil akış ve gerekli alt durumlar `design/` altında sürümlenir. Telefon/tablet, desktop/narrow; Türkçe/İngilizce/RTL; klavye ve erişilebilir font ölçeği matrisi yapılır. Sadece görünüşü değiştiren wireframe kullanıcı görevini bozmaz. Çıkış: seçilmiş tasarım + açıklanmış kapsam + kontrol edilebilir kabul kriterleri.

## 4 — Asset üretimi

Her asset için `templates/asset-request.json` kopyalanır: kullanım amacı, sayfa/component, tema, boyut, format, kaynak/lisans ve alt metin. Düzenlenebilir kaynak `assets/source/`, optimize çıktı `assets/export/` altında tutulur. Ortak asset shared altında tek kaynak olarak yönetilir. Mevcut ikon sisteminde SVG/code tercih edilir; bitmap gereken görseller ayrı üretim işi olur. Çıkış: source/export ilişkisi, hash, lisans, dark/light ve a11y verisi tamam.

## 5 — Uygulama

Önce token/bileşen, sonra bir uçtan uca akış güncellenir. Asset çıktısı app'in canonical public/assets konumuna alınır; vault runtime bağımlılığı olmaz. API contract, capability, auth ve finans semantiği korunur. Sayfa `plan.json` içindeki `implementationStarted` bu aşamada açılır. Çıkış: işlevsel kontroller ve ilgili layout/form/native etkileşimleri geçer.

## 6 — İnceleme ve görsel regresyon

Eski/yeni çekimler aynı fixture, route, viewport, tema, locale ve runtime ile karşılaştırılır. Metin taşması, kontrast, focus, screen reader, minimum dokunma alanı, font ölçeği, safe area ve klavye kontrol edilir. Her sayfanın loading/empty/error/offline/validation/permission durumu ayrıca çekilir. Riskli değişiklikte gerçek iOS/Android kabulü gerekir. Çıkış: `reviews/` içinde kanıt ve karar, açık bloklayıcı yok.

## 7 — CI ve yayın

**Planlanan:** sabit Playwright/Chromium sürümü, deterministik saat/veri/font; PR'da desktop/narrow light/dark tr/en görsel diff artifact'i; Android/iOS native akışları ayrı test job'ı. Piksel eşiği cihaz/font ortamı ölçülerek belirlenir. Yeni baseline otomatik kabul edilmez; inceleme kaydıyla değiştirilir. Vault integrity check her anlamlı asset değişikliğinde çalışır. Release/support/store görselleri ancak signed kabulden sonra üretilir.

## İş durumları

`baseline → ux-review → design-ready → assets-ready → implementation → review → accepted`. Durum yalnız kanıtla ilerler. `plan.json` ve `reviews/` işin kalıcı kaydıdır; ekran galerisi öncelik listesinin yerine geçmez. Şimdiki durum: **baseline hazırlığı**, görsel güncelleme ve CI diff planlanıyor.
