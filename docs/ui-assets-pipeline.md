# Neta UI/UX assets pipeline

Güncelleme: 2026-09-16. Bu teslim **mevcut UI envanteri, asset arşivi ve ekran görüntüsü toplama altyapısıdır**. Yeni görsel tasarım, onaylı görsel karşılaştırma baseline'ı ve CI üzerinden tasarım yayınlama sonraki çalışmadır.

## Kapsam ve kaynak

- Mobil owner, client portal, public ve form route'ları.
- Canonical web uygulaması, client portalı, auth sayfaları ve business sayfaları.
- Landing, Türkçe/İngilizce içerik ve dokümantasyon sayfaları.
- Uygulama public/assets dizinlerindeki bitmap, SVG, logo, ikon, font, video; landing referansları.
- Native Expo Router navigation bitmap/drawable'ları ve Expo Symbols Android ikon fontu kurulu dependency kaynağından ayrıca arşivlenir; paket ve kaynak yolu kaydedilir. Font preview reference olarak ayrılır. Statik mobil graph bu ortak dependency asset'lerini üst küme olarak ilişkilendirir; gerçek bundle'ın her dosyayı kullandığı iddiası değildir.
- Runtime asset kaynağı `apps/` içindedir. Vault kopyaları tasarım arşividir; uygulama vault'tan dosya import etmez.

## Dosya sistemi

```text
bilgi/assets-pipeline/
  indeks.md                       # Vault navigasyonu ve çalışma sınırı
  ui-ux-guncelleme-plani.md        # Sonraki UI çalışmasının aşamaları
  inventory/
    pages.json                    # Kaynak route, actor, dependency ve asset eşlemesi
    assets.json                   # Kaynak/kopya yolu, SHA-256, boyut, kullanım türü
    docs-pages.json               # Türkçe/İngilizce dynamic docs örnekleri
  shared/{mobile,app,web}/originals/
                                  # Mevcut runtime/reference asset kopyaları
  pages/{platform}/{actor}/{page}/
    page.json                     # Üretilmiş teknik envanter
    plan.json                     # Elle geliştirilen UX brief ve kabul kriterleri
    screenshots/
      {theme}-{locale}-{size}-{state}.png
      manifest.json               # Ölçü, fixture, tarih, hash, route ve gerçek durum
    assets/source/                # Düzenlenebilir tasarım kaynağı
    assets/export/                # Kullanıma hazır SVG/bitmap/export
    design/                       # Akış, wireframe ve tasarım revizyonları
    reviews/                      # Görsel/UX/a11y/işlevsel inceleme kanıtları
  templates/                      # Tekrar kullanılabilir plan ve asset isteği şemaları
  reports/                        # Toplama kapsamı, başarısızlıklar ve sağlık kontrolü
```

Page kimliği `platform + actor + page` ile benzersizdir. Owner ve client `home` sayfaları birbirinden ayrıdır. Dinamik route dosyası tek sayfa kimliğidir; gerçek örnek ID yalnız fixture manifest'inde bulunur. Layout ve redirect girişleri ayrı ürün ekranı gibi uydurulmaz; yönlendirme durumu görüntü metadata'sına yazılır.

## Çalıştırma

1. `pnpm ui:assets:inventory`: Route/import graph taraması ve mevcut asset'lerin arşiv kopyaları. `page.json` üretilir. Her sayfanın başlangıç `plan.json` brief'i amaç, birincil aksiyon, review sırası ve inceleme sorularını taşır; UX incelemesi gerektiren taslaktır. Mevcut elle düzenlenmiş brief korunur; yalnız eski boş goal/action şablonu başlangıç brief'iyle tamamlanır.
2. `pnpm app:build` ve `pnpm web:build`: Gerçek build'leri hazırla.
3. Ayrı terminalde `pnpm ui:assets:fixture`: `127.0.0.1:4310` üzerinde ayrı SQLite/upload alanı aç. Kişisel `.data` kullanılmaz; runtime descriptor `.artifacts/ui-assets/runtime.json` altında ignore edilir.
4. Landing'i `pnpm --filter @neta/web exec next start --hostname 127.0.0.1 --port 4311` ile başlat.
5. `pnpm ui:assets:capture:web`: Playwright ile owner/client/public session'ları, açık/koyu tema, tam sayfa PNG. Windows varsayılan tarayıcı `msedge`; CI için `NETA_UI_BROWSER=chromium` ve `pnpm exec playwright install chromium` gerekir.
6. Android'de dev APK kurulu, `adb` PATH'te ve emülatör boot tamam olmalı. `EXPO_PUBLIC_NETA_UI_CAPTURE=1`, `EXPO_PUBLIC_NETA_ORIGIN=http://127.0.0.1:4310` ile `pnpm mobile:start:local` aç. `pnpm ui:assets:capture:mobile` native UI'da örnek hesaplarla gerçek login yapıp route'ları toplar.
7. `pnpm ui:assets:gallery`: Yerel, aranabilir `bilgi/assets-pipeline/galeri.html` oluştur. `pnpm ui:assets:check`: Kaynak ve arşiv hash'lerini, PNG ölçülerini, route kapsamını ve manifest'leri doğrula. `--require-complete` eksik açık/koyu screenshot'ı kapı hatası yapar.
8. Not değişikliklerinden sonra `pnpm vault:map` ve `pnpm vault:check`.

Fixture port çakışmasında `NETA_UI_PORT` kullanılabilir; mobile origin/ADB reverse de aynı portu kullanmalıdır. Fixture süreçleri Ctrl+C ile yalnız sahip oldukları runtime'ı kapatır. Android çekiminden önce kullanıcı kendi hesabından çıkış yapmış olmalıdır; collector açık fixture session'ını UI ile kapatıp fixture origin onayını, email input'unu, login/logout geçişini ve rolü kontrol eder. Gerçek kullanıcı hesabında collector çalıştırılmaz. Bir ekran açılamazsa başarısızlığı kaydeder; aynı login/yanlış rol görüntüsünü bütün sayfalara başarı olarak yazmaz.

Windows standalone runtime dosyaları çalışırken build için kilitli olabilir: fixture'ı Ctrl+C ile kapat, build'i tamamla, yeni fixture başlat. Native collector yalnız opt-in debug bundle'ın yerel Hermes inspector'ını kullanarak whitelist route'u `dismissAll + replace` ile açar; modal üstünde yanlış alt ekranı çekmez. Root layout'tan gerçek pathname, grup, rol, oturum durumu ve tema okunur ve PNG manifest'ine eklenir. Rota/rol/tema uyuşmazlığı hata olur. Bu hook production'da açık değildir; normal connect origin onayı ve login/logout UI'da yapılır. Collector'ın route seçimi production deep-link veya signed cihaz E2E kabulü sayılmaz.

Native çekim öncesi Expo Dev Menu'de **Tools button** kapatılır ve eski LogBox hata paneli olmayan temiz runtime açılır. Collector bu overlay'ler görünürse çekimi reddeder; hatayı gizleyip başarı saymaz. Debugger bağlantısı bütün çekim turunda tek WebSocket'te tutulur. `pnpm ui:assets:capture:mobile --resume` aynı fixture runtime'ından, `native-v2-clean` kanıtlı ve hash'i değişmemiş çekimleri yeniden kullanır; yeni fixture veya eski/kanıtsız çekimler tekrar alınır. Reused/captured/failed raporda ayrılır.

Backend veya belirli sayfa değişiminde `pnpm ui:assets:capture:mobile --pages=projects-id` seçilen page ID'lerini owner/client ve iki temada yeniden alır; login/logout ve origin onayı korunur. Rapor bu hedefli turu, PNG manifest'leri tam arşivi gösterir. Varsayılan komut bütün native route'ları toplar.

Ek Android dosya kontrolü: native capture sonrası oturum kapalıyken `pnpm ui:assets:smoke:mobile`. Yalnız ayrı fixture DB'de çalışır; proje plan/görev/revizyon/dosya sekmelerini arşivler, dosya butonundan Android paylaşım chooser'ını açıp iptal eder ve geçici download temizliğini doğrular. Repository PNG'sini yalnız probe'a ait Downloads adıyla picker üzerinden yükler; private/sanitized own avatar kaydını ve native logout sonrası yeni backend session'ın silindiğini kontrol eder. Mevcut Downloads dosyasını ezmez; probe kaynağını sonunda temizler. Chooser iptal kontrolü alıcı uygulamaya gerçek dosya teslimi veya signed/iOS kabulü değildir. `reports/native-file-smoke.json` gerçek sonuçları taşır.

## Toplama kuralları

- Yalnız `fixture: true` ve loopback runtime kabul edilir. Kullanıcının gerçek DB'sini toplama script'ine verme.
- Owner/client session'ları ayrı tutulur. API key, parola, bearer, pairing secret veya davet token'ı vault metadata'sında bulunmaz.
- Parola/QR içeren web alanları maskelenir; native capture login yazımı tamamlandıktan sonra yapılır. Token içeren davet adresi route metadata'sında `/invite/[fixture]` olarak saklanır.
- Görüntü boyutu gerçek PNG header'ından okunur; Android emulator görüntüsü iOS/signed cihaz kanıtı sayılmaz.
- Açık/koyu varyant metadata'sı istenen tema ile render durumunu ayırır. Landing'in mevcut teması ürün davranışıdır; tasarım incelemesi öncesi zorla yeniden renklendirilmez.
- Default capture, bütün loading/error/offline/validation/RTL/tablet durumlarının kabulü değildir. Bu durumlar sayfa `plan.json` içinde sonraki tur için listelenir.
- Asset eşlemesi statik import/layout/public-path taramasıdır. Runtime'da sunucudan gelen avatar/branding/proje dosyaları fixture verisidir; statik asset kataloğuyla karıştırılmaz.

## UI güncelleme aşamaları (sonraki çalışma)

İlk çekimin ek gözlemleri `bilgi/assets-pipeline/reports/capture-notes.json` altında tutulur. Landing full-page PNG'sinde ekran dışındaki scroll-dependent story görselleri gizli kalabilir; viewport/scroll-state çekimleri sonraki UX turudur. Lokal Next sunucusunda image disk cache oluşturma `EPERM` uyarısı görüldü; cache dizini workspace içinde oluşturuldu. 152 sayfa HTTP 200 ve arşiv hash kontrolü, bütün image-network yanıtlarının kabulü değildir. Pinlenmiş görsel ortamda cache/resource ve animasyon durumları ayrıca doğrulanır.

| Aşama | İş | Dosya / çıktı | Çıkış koşulu |
| --- | --- | --- | --- |
| 0 — Baseline | Route/actor/tema/locale envanterini doğrula, default screenshot'ları gözden geçir | `inventory`, `screenshots`, kapsam raporu | Eksik ekran açıkça kayıtlı; yanlış ekran başarı sayılmıyor |
| 1 — UX inceleme | Her sayfanın amacı, birincil aksiyonu, bilgi hiyerarşisi, geri dönüş ve hata kurtarması | Sayfa `plan.json`, `design/flow-*` | Sorun ve hedef ölçülebilir; kapsam kullanıcı tarafından anlaşılabilir |
| 2 — Sistem | Mevcut token/component sisteminden typography, spacing, semantic renk, ikon, responsive kurallar | Ortak design-spec; sayfa referansları | Web/native sınırları korunmuş; a11y kontrast ve dokunma alanı doğrulanmış |
| 3 — Wireframe | Önce owner günlük akışı, sonra portal, public/onboarding, ayar/form ekranları | `design/wireframe-vNN-*` | İzin, offline, empty, loading ve validation halleri tasarlanmış |
| 4 — Asset üretimi | Her gerçek ihtiyaç için source → export; SVG/ikon sistemi öncelikli, raster yalnız gerektiğinde | `assets/source`, `assets/export`, asset request kayıtları | Boyut/MIME/lisans/tema/alt-text/provenance kayıtlı; gereksiz dekoratif asset yok |
| 5 — Uygulama | Küçük dikey dilimler; onaylanan tasarımın canonical app dosyalarına taşınması | Kod + sayfa review kaydı | API/auth/cache/locale davranışı bozulmuyor; loading/error gerçek kalıyor |
| 6 — Doğrulama | Aynı fixture ile before/after; farklı viewport/locale/tema; keyboard/screen-reader/offline turu | `reviews`, yeni screenshot manifest'leri | İşlevsel testler + gerçek görsel inceleme + a11y tamam |
| 7 — Yayın | Baseline değiştirme gerekçesi, değişiklik kapsamı, regresyon kanıtı | Review kararı ve release notu | Review edilmiş somut sonuç; signed/native release kapıları ayrıca tamam |

Başlangıç sırası: bağlantı/login → owner dashboard/navigation → clients/projects/tasks → calendar/finance/journal → settings/files/localization → portal → landing/docs. Bir sayfa değişimi ortak component'i etkiliyorsa bütün kullanım sayfaları tekrar alınır. Onaylanan mevcut baseline silinmez; revizyonlu captures ile kıyaslanır.

## Sonraki otomasyon/CI

Tasarım onayından sonra aynı fixture ve browser/device sürümü pinlenerek görsel karşılaştırma eklenir. İlk aşamada düşük maliyetli inventory/hash/manifest check CI'ya alınır. Web visual job uygulama build'i + sentetik fixture + Playwright browser'ı çalıştırır; native visual job ayrı emulator/Mac runner'ında çalışır. Yeni baseline otomatik kabul edilmez; farklar review artifact'i olur. Signed iOS/Android, iki canlı HTTPS instance ve release güvenlik kapıları UI pipeline'ın yerine geçmez.

## Kaynaklar

- `tools/ui-assets/`, `apps/neta-app/scripts/ui-assets-fixture.mjs`
- `apps/neta-mobile/src/lib/instance/ui-capture-route.ts`
- `docs/mobile/mobile-security-acceptance.md`
- [Playwright screenshot API](https://playwright.dev/docs/screenshots), [Playwright browser channels](https://playwright.dev/docs/browsers)
- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
