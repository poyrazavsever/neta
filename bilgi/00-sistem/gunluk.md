---
tur: gunluk
durum: mevcut
guncellendi: 2026-09-16
guven: yuksek
kaynaklar:
  - README.md
  - docs
  - apps
  - packages
ilgili:
  - "[[00-sistem/kasa-semasi|Kasa şeması]]"
etiketler:
  - neta
  - kasa-gunlugu
---

# Bilgi kasası günlüğü

Bu dosya append-only'dir. Eski girdiler olgusal hata düzeltmesi dışında değiştirilmez; düzeltme gerekiyorsa yeni kayıt önceki kayda bağlantı verir.

## [2026-09-02] baslangic | Neta bilgi kasasının ilk kurulumu

Repository, güncel kaynak kod, README, self-hosted ADR/faz kayıtları, mobil planlar, aktif platform roadmap'i ve operasyon scriptleri incelendi. İlk ürün, domain, mimari, güvenlik, operasyon, karar ve roadmap sentezi oluşturuldu.

Öne çıkan ayrımlar:

- Self-hosted web runtime mevcut ve Supabase'den bağımsızdır.
- Mobil discovery/auth bootstrap mevcuttur; geniş v1 resource API parity'si ve device pairing planlanandır.
- Build-time tek-instance mobil davranışı mevcut; evrensel domain/QR bağlantı modeli aktif roadmap hedefidir.

Güncellenen hub sayfalar:

- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[00-sistem/degismez-kurallar|Değişmez kurallar]]
- [[03-mimari/mimari-genel-bakis|Mimari genel bakış]]
- [[03-mimari/runtime|Runtime]]
- [[03-mimari/veri-kaliciigi|Veri kalıcılığı]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[07-guvenlik/tehdit-modeli|Tehdit modeli]]
- [[06-kararlar/karar-kaydi|Karar kaydı]]

Kaynaklar:

- [[README]]
- [[docs/roadmaps/platform-master-plan]]
- [[docs/neta-backend-mobile-api-master-plan]]
- [[docs/self-hosted-redesign/neta-self-hosted-v3-master-plan]]
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
- [[apps/neta-mobile/README]]

## [2026-09-02] lint | İlk bootstrap sağlık kontrolü

Kasanın 74 Markdown sayfasında frontmatter alanları ve enum değerleri, canonical source path'leri, wikilink çözümleme, orphan sayfalar, code fence dengesi ve satır sonu boşlukları kontrol edildi.

Sonuç:

- Kırık wikilink, orphan sayfa ve eksik source path kalmadı.
- `indeks`, `gunluk` ve `yedekleme-ve-geri-yukleme` basename tekrarları farklı bilgi türlerinin bilinçli sayfalarıdır; bağlantılar path-qualified tutuldu.
- Supabase yalnız legacy import; device pairing yalnız planlanan capability olarak anlatıldı.
- Sağlık kontrolünde bulunan yanlış `DomainService` ve portal source path'leri güncel repository yollarına düzeltildi.
- Kasanın bulunabilirliği için kök README'ye indeks ve zorunlu ilk okuma bağlantıları eklendi; agent talimat dosyaları değiştirilmedi.

Kontrol edilen hub'lar:

- [[00-sistem/indeks|İndeks]]
- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[00-sistem/celiskiler|Çelişkiler]]
- [[07-guvenlik/bilinen-riskler|Bilinen riskler]]

## [2026-09-03] karar | Karar kaydı bağımsız ADR'lere ayrıldı

CleverKids Obsidian Vault'un karar-notu ve bakım düzeni yalnızca yapısal referans olarak incelendi. Neta'nın toplu K-001…K-009 kayıtları, Neta'nın mevcut metadata ve kanıt disiplinini koruyarak ayrı ADR dosyalarına taşındı.

Uygulanan kurallar:

- [[06-kararlar/karar-kaydi|Karar kaydı]] yalnız durum ve yönlendirme indeksi oldu.
- Her karar gerekçe, alternatif, varsayım, sonuç, implementation kanıtı ve yeniden değerlendirme koşullarını kendi notunda taşır.
- Eski `K-XXX` kimlikleri `onceki_kimlik` metadata'sıyla korundu; yeni kayıt dizisi ADR-001…ADR-009 oldu.
- Kabul edilmiş fakat uygulanmamış mobil kararlar `planlanan` olarak açıkça ayrıldı.
- Yeni kararlar için sıradaki kimlik ADR-010 olarak belirlendi ve [[00-sistem/kasa-semasi|kasa şeması]] güncellendi.

Oluşturulan karar notları:

- [[06-kararlar/adr-001-sqlite-kalici-veri|ADR-001]]
- [[06-kararlar/adr-002-tek-process-tek-veri-dizini|ADR-002]]
- [[06-kararlar/adr-003-yerel-dosya-depolama|ADR-003]]
- [[06-kararlar/adr-004-better-auth-ve-uygulama-profili|ADR-004]]
- [[06-kararlar/adr-005-supabase-runtime-bagimliliginin-kaldirilmasi|ADR-005]]
- [[06-kararlar/adr-006-mobil-versioned-api-ve-ortak-domain-servisleri|ADR-006]]
- [[06-kararlar/adr-007-evrensel-mobil-uygulama|ADR-007]]
- [[06-kararlar/adr-008-owner-device-pairing|ADR-008]]
- [[06-kararlar/adr-009-backup-restore-ve-downgrade-politikasi|ADR-009]]

## [2026-09-03] karar | Genel harita, agent hookları ve mobil uygulama planı

Vault için üretilmiş eksiksiz `bilgi/harita.md` giriş noktası, root agent talimatı ve Codex lifecycle hookları eklendi. Session başlangıcında ADR özetleri; kullanıcı prompt'unda konuya özel not/karar rotası verilir. Stop kontrolü ürün değişikliği sonrası kasa etkisini ve harita güncelliğini bir kez daha değerlendirtir.

Kalıcı karar:

- [[06-kararlar/adr-010-agent-baglaminda-vault-routing|ADR-010: Agent bağlamında genel harita ve karar routing'i]]

Yeni bakım yüzeyleri:

- [[harita|Neta bilgi haritası]]
- [[00-sistem/agent-baglam-ve-hooklar|Agent bağlamı ve hooklar]]
- `AGENTS.md`, `.codex/hooks.json`, `.codex/hooks/neta-vault.mjs`
- `pnpm vault:map`, `pnpm vault:check`, `pnpm vault:hooks:test`

Mobil için aktif roadmap, backend API planı ve çalışan Expo istemci incelenerek tek yürütme planı oluşturuldu:

- [[09-yol-haritasi/mobil-uygulama-plani|Neta Mobile uygulama planı]]

Plan; contract/capability freeze, runtime domain bağlantısı, owner read/mutation dilimleri, owner parity, device pairing, client portal, AI/bildirim ve store release kapılarını mevcut/planlanan ayrımıyla sıralar.

## [2026-09-03] senkronizasyon | MOB-0 ve MOB-1 tamamlandı

Mobil ürün/auth/contract kararları ADR-011…ADR-020 olarak donduruldu. Backend ile mobil arasında ortak bootstrap wire sınırı uygulandı; capability ilanı gerçek route kapsamına indirildi ve `mobile-v1` minimum owner yüzeyi tamamlanana kadar `planned` yapıldı.

Uygulanan ana değişiklikler:

- Discovery, meta, owner/client me, preferences, catalog, error ve pagination fixture'ları `@neta/api-contracts` altında ortaklaştırıldı.
- Backend explicit presenter ve runtime guard; mobil canonical parser ve aynı fixture consumer testlerini kullanıyor.
- `/me`, preference PATCH, catalog version ve project asset pagination drift'leri kapatıldı.
- Better Auth cookie ilk mobil auth transport'u oldu; eski bearer materyali okunmuyor.
- JSON `404/405`, strict mutation body, `401/403` politikası ve secret-free fixture taraması CI kapısına eklendi.
- `pnpm contract:check`, API boundary ve canlı auth/invitation smoke başarıyla geçti.

Güncellenen sayfalar:

- [[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]
- [[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]

## [2026-09-04] senkronizasyon | MOB-2 ve MOB-3 owner read dilimi

Evrensel mobil instance bağlantısı ve minimum owner read dikey dilimi uygulandı. Production binary artık build-time origin gerektirmez; domain veya secret-free connect QR ile discovery, onay, login ve instance unutma akışı kullanır.

Backend'e dashboard, müşteri, proje/plan/revizyon, görev ve takvim GET route'ları eklendi. Strict query, timezone-aware calendar boundary, kararlı sıralama, opaque cursor, session-derived owner scope ve shared DTO sınırı uygulandı. Client rolü `403`, bulunmayan/cross-scope kimlik `404`, oturumsuz istek `401`, read-only route'a write `405` ile canlı smoke'ta doğrulandı.

Mobilde granular capability gate açıldı; MOB-4'e ait mutation kontrolleri minimum read ekranlarından kaldırıldı. `mobile-v1`, signed iOS/Android ve iki canlı HTTPS instance kanıtı tamamlanana kadar `planned` kaldı.

Güncellenen sayfalar:

- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[00-sistem/celiskiler|C-002]]
- [[00-sistem/acik-sorular|Açık sorular]]
- [[03-mimari/api|API mimarisi]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[04-bilesenler/neta-mobile|neta-mobile]]
- [[07-guvenlik/bilinen-riskler|Bilinen riskler]]
- [[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]
- [[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]
- [[09-yol-haritasi/teknik-borc|Teknik borç]]

## [2026-09-04] senkronizasyon | MOB-4 ve MOB-5 owner mutation/parity dilimi

Owner mobil kapsamı core mutation ve geniş parity ile ilerletildi. Client/project/task/calendar create-update-delete akışları; finance ve journal; profil/parola/session; general/appearance/locale/AI settings ile file/project asset API'leri versioned `/api/v1` yüzeyine bağlandı.

Kalıcı retry güvenliği için SQLite idempotency kaydı eklendi. Aynı actor/method/route/key ve payload tek side effect üretir; farklı payload `409` döner. Update/delete işlemleri opaque version/`If-Match` ile stale write'ı engeller. Portal davet URL'si mobilde gösterilir fakat raw token idempotency kaydına yazılmaz.

Güvenlik ve veri doğruluğu değişiklikleri:

- Finans özetleri currency bazında gruplanır; kur olmadan para birimleri birleştirilmez.
- AI anahtarı GET yanıtında dönmez ve provider değişiminde yeni key + parola doğrulaması gerekir.
- Yeni mobil v1 görsel upload'ları gerçek decode/re-encode sonrasında `metadataSanitized=true` alır.
- Capability-gated mobil navigasyon planlanan AI yüzeyini gizler.

Doğrulama:

- `pnpm contract:check`
- `pnpm phase1:auth-smoke` (idempotency replay, key conflict, stale mutation ve secret-free invite kaydı dahil)
- `pnpm --filter @neta/app build`

Kalıcı karar:

- [[06-kararlar/adr-021-api-mutation-idempotency-kaydi|ADR-021: API mutation idempotency kaydı]]

Güncellenen sayfalar:

- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[03-mimari/api|API mimarisi]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[06-kararlar/karar-kaydi|Karar kaydı]]
- [[07-guvenlik/bilinen-riskler|Bilinen riskler]]
- [[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]
- [[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]

## [2026-09-15] senkronizasyon | Pairing ve portal kodu ile release kanıtı ayrıldı

Çalışma ağacındaki MOB-6 owner pairing ve MOB-7 client portal transport'u doğrulandı. Pairing SQLite tabloları, challenge/exchange/refresh/revoke route'ları, mobil instance-scoped bearer transport'u ve restore token epoch rotation'ı kodda bulunur. Client portal dashboard/project/task/revision/profile route'ları ve mobil istemcisi de kodda yer alır. Capability manifesti bu iki route ailesini `available` ilan eder; `mobile-v1` mağaza kabulü için `planned` kalır.

`pnpm contract:check`, `pnpm phase9:api-boundary`, `pnpm phase1:auth-smoke` ve `pnpm phase9:smoke` geçti. Signed iOS/Android ile iki canlı HTTPS instance, pairing reuse/revoke/restore ve cross-client negatif E2E kabulü açık olduğundan bu kod varlığı production güvenlik kanıtı sayılmaz. Eski mobil phase-0 gate'in pairing eylemini yasaklayan kontrolü güncel faza uyarlandı.

Mevcut durum, API/mobil/kimlik mimarisi, ADR-006/007/008/017 ve karar indeksi, mobil plan, güvenlik/restore/domain/bileşen/teknik borç sayfaları çalışan kod ile kabul sınırını ayıracak şekilde güncellendi.
- [[03-mimari/api|API mimarisi]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[04-bilesenler/api-contracts|api-contracts]]
- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[00-sistem/celiskiler|Çelişkiler]]
- [[07-guvenlik/bilinen-riskler|Bilinen riskler]]

Sıradaki aktif faz MOB-2'dir: production build-time origin zorunluluğunu runtime domain/QR instance bağlantısına taşımak.

## [2026-09-15] senkronizasyon | Lokal kurulum ve runtime doğrulaması

Node 24 ve pnpm 11.5.1 ile monorepo bağımlılıkları frozen lockfile'dan kuruldu. App'in örnek environment'ındaki boş `NETA_MINIMUM_MOBILE_VERSION` artık unset kabul edilir; geçerli dolu SemVer doğrulaması korunur. Owner güvenlik ekranında ilk cihaz listesi yüklemesi effect yaşam döngüsüne uyarlandı.

`pnpm typecheck:all`, app/web build, app/web lint, mobil JS testleri, contract testleri, `pnpm phase9:smoke` ve lokal app/landing/Metro HTTP smoke'u geçti. `mobile:check` bu Windows checkout'unda bulunmayan `ios/Podfile.lock` native gate'inde durdu; signed cihaz ve iki canlı instance release kabulü hâlâ açıktır. Yeni mimari karar açılmadı.

Güncellenen sayfa: [[03-mimari/runtime|Runtime]].

## [2026-09-16] senkronizasyon | Windows Android emülatörü ve lokal mobil açılış

API 36.1 AVD eski userdata/quick-boot oturumu nedeniyle package manager hazır olmadan kalıyordu. AVD sıfırlandı, SwiftShader renderer ve cold boot ile `sys.boot_completed=1` / `Service package: found` doğrulandı. SDK adb/emulator yolları kullanıcı PATH kaydına eklendi; AVD config'i yedeklenerek sonraki açılışlar SwiftShader/cold boot olarak ayarlandı.

Expo prebuild ignore edilen `apps/neta-mobile/android` projesini üretti. Android debug native build geçti, APK emülatöre kuruldu ve Neta instance bağlantı ekranı açıldı. Metro'nun IPv6 localhost ile emülatörün IPv4 localhost uyuşmazlığı `mobile:start:local` komutunda Node IPv4 DNS tercihiyle giderildi; yalnız loopback dinlenir ve ADB reverse kullanılır. Signed production, iki canlı instance ve güvenlik release kabulü açık kalır.

Güncellenen sayfa: [[04-bilesenler/neta-mobile|neta-mobile]]. Canonical kurulum kaynağı: `docs/mobile/mobile-setup.md`.

## [2026-09-16] implementation | MOB-6/7 otomatik güvenlik kabulü

Historical refresh reuse için bütün tüketilmiş keyed digest'ler transaction içinde saklanır. 0016 migration son eski digest'i backfill eder; geçmişi eksik mevcut aktif cihazları revoke ederek yeniden eşleştirme gerektirir. Yerel `.data/neta.db` yedeklendikten sonra migration uygulandı. Web cookie session'ları migration'dan etkilenmez.

API explicit device scope uygular; geçersiz/revoked Bearer geçerli web cookie'sine fallback yapmaz. Disabled owner gözlendiğinde device family'leri kapanır. Bearer profil/parola işlemleri cookie gerektirmez; parola değişimi device/web lifecycle'ını kapatır. Mobil generation ve sıralı storage write, logout/new-login sonrası geç refresh'in credential diriltmesini engeller; güvenlik formu parola sonrası logout yapar. Ortak dosya delete authorization'ı yabancı unreadable dosyanın varlığını `404` ile gizler.

`pnpm mobile:security:check` migration, challenge/rate-limit/concurrent exchange, üç rotasyon sonrası ilk refresh reuse, access expiry, disable/epoch/revoke/logout-all/password, raw DB/WAL/log secret ve audit; iki gerçek davetli client session'ıyla karşılıklı ID/filter/revision/profile/owner-route/download/delete negatiflerini geçti. Mobil 111 unit, shared 6 contract ve backend 2 presenter testi, app production build ve mobil typecheck/targeted lint ile son Android JS export geçti.

Otomatik HTTP ve restore edilmiş DB kanıtı signed gerçek cihaz, restore runtime'ına eski token HTTP/native ve iki canlı HTTPS instance kabulü değildir. ADR-008'in hedef grace/replay, challenge'a bağlı yanlış kod denemesi, cleanup ve native versioned bearer file transport maddeleri açık olarak kaydedildi; `mobile-v1` planned kaldı. Yeni bağımsız ADR açılmadı.

Güncel faz ve kabul matrisi: [[09-yol-haritasi/mobil-uygulama-plani|Mobil plan]], [[09-yol-haritasi/mevcut-oncelikler|Öncelikler]], [[06-kararlar/adr-008-owner-device-pairing|ADR-008]], [[docs/mobile/mobile-security-acceptance]].

Ek doğrulama: Ortak dosya authorization/avatar-delete regresyonu `pnpm --filter @neta/app phase3:storage-smoke --authorization-only` ile geçti. Runner Windows'ta Node üzerinden TypeScript çalıştırır ve bare-Node test çıktısına test-only `server-only` marker ekler. Tam storage smoke sandbox dışında da Windows symlink oluşturma `EPERM` yetkisinde durdu; bu senaryo açık kaldı ve geçmiş sayılmadı. Son targeted lint/diff kontrolü ve `pnpm vault:map` / `pnpm vault:check` geçti (98 Markdown, 21 ADR, 0 bulgu).

## [2026-09-16] implementation | MOB-2–5 eksik tamamlama ve UI assets arşivi

Aktif/kayıtlı instance kimlik değişiminde credential/cache/generation temizliği, explicit native Origin ve credentials=omit auth, account switch/logout sonrası geç async sonuç koruması ve açık auth redirect hedefleri tamamlandı. Core list ve relation/project/finance alt-list cursor takibi, mutation retry key/coalescing ve yalnız GET cache davranışı düzeltildi. Native sign-out geçerli boş JSON gönderir; portal çıkışı profil yüklemesine bağlı değildir. Client hesap self-service yalnız kendi ID'siyle çalışır; workspace owner-only kalır.

Versioned dosya okuma ortak dosya servisine bağlandı. Native indirme origin/id/MIME/size ve generation doğrular, share sonrası geçici dosyayı temizler. Project asset PDF/10 MiB, diğer türler 5 MiB; icon PNG-only ve file/appearance raw hash dahil kalıcı idempotency uygulanır. Native File/FormData/Expo fetch upload redirect'i reddeder, cancellation ve retry key'i korur; gerçek byte acknowledgement olmadığından sahte yüzde göstermez. Legacy web görsel metadata durumu okuma sırasında korunur. File/branding/portal/davet URL'leri canonical APP_URL'den üretilerek standalone iç localhost origin hatası giderildi.

Son backend production build, HTTP device/iki client/file/self-service/origin güvenlik kabulü, API boundary, mobil lint/type ve 129 unit test geçti. Android production JS export geçti. `mobile:check` source/i18n/a11y kapılarından sonra bu Windows checkout'undaki eksik `ios/Podfile.lock` native release gate'inde durdu; signed kabul olarak sayılmadı. Android debug'da gerçek picker avatar upload, proje dört sekmesi, yetkili download/share chooser iptali, geçici dosya temizliği ve backend session silen logout ayrıca geçti.

ADR-022 ile [[assets-pipeline/indeks|UI assets pipeline]] kuruldu: 87 route (42 mobil, 41 canonical app/portal, 4 landing/docs kaynak route'u), 114 kaynak/dependency/ref asset; her sayfada kalıcı UX brief'i, source/export/design/review klasörleri. Arşiv 242 gerçek sentetik PNG içerir: 82 app, 70 landing/docs, 90 Android debug (84 açık/koyu sayfa + 6 dosya/sekme durumu). Koddan inventory, gerçek capture, aranabilir galeri ve hash/ölçü/kapsam kontrol komutları eklendi. Playwright development bağımlılığı kuruldu. Arşiv bütün UX durumlarını veya signed cihazı temsil etmez; görsel yeniden tasarım ve CI visual diff [[assets-pipeline/ui-ux-guncelleme-plani|en son planlanır]].

Canonical denetim: [[docs/mobile/mobile-phase-2-5-audit]], [[docs/ui-assets-pipeline]]. ADR-006/012 ve etkilenen mobil/storage/mevcut durum/öncelik sayfaları güncellendi; ADR indeksi sonraki numarayı 023 olarak tutar. Son kasa ve arşiv kontrolleri ilgili üretilmiş raporlarda yer alır.

## [2026-09-16] implementation | MOB-6/7 cihaz temizliği ve restore HTTP kabulü

Canonical backend Node instrumentation başlangıcında ve tek saatlik unref timer ile cihaz temizliği çalıştırır. Refresh expiry veya 30 gün idle session `expired` olur; access/refresh doğrulaması bu sınırı saatlik işi beklemeden uygular. Her işlem 500 kayıtla sınırlıdır. Kapalı session kapanışından 30 gün sonra tüketilmiş digest geçmişiyle cascade silinir; aktif family geçmişi korunur. Challenge expiry'den bir gün sonra silinir; audit kayıtları ve kapanış zamanı bilinmeyen legacy session korunur. Periyodik hata secret/SQL detayı olmadan raporlanıp sonraki turda denenir; startup hatası runtime'ı durdurur. Kapalı family'ye historical refresh tekrarları kapanış zamanını yenileyerek retention'ı uzatamaz. SQLite text status tipi nedeniyle yeni migration gerekmedi; mevcut ADR-008/ADR-0018 retention ayrıntısıyla güncellendi.

Gerçek backup'tan restore edilen ikinci sentetik loopback backend, backup anında aktif/sonrasında revoked/daha önce revoked/compromised access ve refresh tokenlarını reddetti. Geçerli cookie yanında geçersiz Bearer fallback'i reddedildi; owner login ve fresh pairing çalıştı. Kaynak bağımsız family korundu; restore sonrası yeni device token kaynakta reddedildi. Restore DB/WAL/log raw device secret taraması geçti.

Son `mobile:security:check` dört migration/maintenance testi ve HTTP pairing/lifecycle/restore/iki client izolasyon kabulünü geçti. `contract:check` shared 6, backend 2 ve mobil 129 unit testi ile app/mobile typecheck'i geçti. App lint 0 hata/14 mevcut uyarı, API v1 boundary ve izole Next production build geçti. İlk build veri dizini oluşturma erişimine takıldı; izin verilen sistem temp alanıyla tekrar başarılı oldu. Standalone production backend yalnız auth-smoke restore fixture'ıyla açıldı; maintenance expiry'nin readiness'den önce çalıştığı gerçek SQL ile doğrulandı. Normal geliştirici build/config dosyaları korundu.

Signed iOS/Android, iki canlı HTTPS instance, native/canlı restore ve dosya kabulü hâlâ açıktır. Refresh grace/replay ve challenge'a bağlı yanlış kod deneme sayacı sıradaki açık tasarım işleridir. AI taşıması MOB-8; UI/UX yeniden tasarımı en son kalır. Teknik borç, mevcut durum, mobil mimari, planlanan yetenekler ve öncelikler otomatik kanıtı native/release kabulünden ayıracak biçimde senkronize edildi. Yeni bağımsız ADR açılmadı.

Canonical kanıt ve komutlar: [[docs/mobile/mobile-security-acceptance]], [[06-kararlar/adr-008-owner-device-pairing|ADR-008]], [[09-yol-haritasi/mobil-uygulama-plani|Mobil plan]].

## [2026-09-16] implementation | MOB-6 refresh grace ve challenge deneme bağlama

ADR-008/ADR-0018'in kalan iki yerel kod farkı kapandı. Public sekiz karakter locator, QR/manual secret'ı aynı challenge sayacına bağlar; farklı kaynaklardan eşzamanlı yanlış denemeler kalıcı immediate transaction içinde beşte kilitler. Bilinmeyen locator kaynak rate limit'ine tabidir; durum/secret negatifleri aynı 401 envelope'unu döndürür. Manuel secret'ın 10 karakterlik gücü korunur; locator ile toplam 19 karakter gösterilir. 0017 yalnız locator'sız eski pending challenge'ları iptal eder; mevcut cihaz/web oturumları ve refresh history korunur.

Mobil Expo Crypto requestId'sini refresh'ten önce instance-scoped SecureStore'a yazar; transient hatada pending işlem korunur, logout'ta silinir. Backend aynı consumed token/nonce için 30 saniye boyunca ve successor hâlâ güncelse birebir aynı AES-256-GCM şifreli yanıtı verir. AAD cihaz/epoch/consumed-request-successor digest/expiry'yi bağlar. Farklı nonce, nonce'sız legacy reuse, grace expiry, supersession ve bozuk ciphertext aktif family'yi kapatır. Nonce cihaz anahtar kanıtı değildir; bearer modeli korunur. Expiry anında uygulanır; fiziksel ciphertext cleanup startup/saatlik 500 kayıtlı maintenance ile yapılır, backlog sonraki turlara kalabilir. Rotation/revoke/restore replay'i atomik siler; digest geçmişi korunur.

Son güvenlik kapısı yedi backend migration/maintenance/replay testi ve gerçek HTTP challenge/grace/reuse/lifecycle/restore/iki client izolasyon kabulüyle geçti. SQLite reopen, plaintext taraması ve ciphertext/AAD/key tamper negatifleri geçti. `contract:check` shared 6, backend 2, mobil 134 test ve iki consumer typecheck'iyle geçti. API boundary, targeted app lint ve mobil lint geçti. Ayrı `.next-device-pairing-build` production build ve yalnız sentetik restore fixture'ıyla standalone startup maintenance/readiness smoke'u geçti; normal Next çıktı/config dosyaları korundu.

Mevcut ADR ve etkilenen mevcut durum/mimari/roadmap/teknik borç sayfaları senkronize edildi; yeni bağımsız karar açılmadı. Signed iOS/Android, iki canlı HTTPS instance ve native/canlı restore kabulü açık release kapılarıdır. Sıradaki uygulama dilimi MOB-8 AI taşıması; UI/UX yeniden tasarımı en son kalır.

Android debug development client yeni Expo Crypto modülüyle emülatör mimarisi x86_64 için iki worker'la yeniden derlendi; APK mevcut emulator-5554'e `install -r` ile veriler korunarak güncellendi ve MainActivity açıldı. İlk tüm-mimari derleme kaynak tüketimi nedeniyle durduruldu; emülatör hedefli derleme başarılıdır, signed/store veya iOS kanıtı değildir. Onboarding manuel kod örneği tam locator-secret biçimine uyarlandı. Son kasa kontrolü 101 Markdown, 22 ADR ve sıfır bulguyla geçti.
