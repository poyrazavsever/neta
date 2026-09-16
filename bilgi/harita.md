---
tur: sistem
durum: mevcut
guncellendi: 2026-09-16
guven: yuksek
ozet: "Neta bilgi kasasındaki bütün kalıcı notları tek satırlık özetlerle yönlendiren üretilmiş genel indeks."
kaynaklar:
  - bilgi
ilgili:
  - "[[00-sistem/indeks|Küratörlü indeks]]"
  - "[[00-sistem/kasa-semasi|Kasa şeması]]"
etiketler:
  - neta
  - harita
  - indeks
---

# Neta bilgi haritası

> Bu dosya `pnpm vault:map` ile üretilir. Elle değiştirilmez; not ekleme, taşıma veya anlamlı metadata değişikliğinden sonra yeniden üretilir.

## Zorunlu okuma rotası

1. Her Neta görevinin başında önce bu haritadan geç.
2. [[00-sistem/mevcut-durum|Mevcut durum]] ve [[00-sistem/degismez-kurallar|değişmez kuralları]] oku.
3. Yalnız görevle ilgili domain, mimari, güvenlik ve ADR notlarını seç.
4. Kritik veya değişmiş olabilecek iddiaları notların gösterdiği canonical kod ve `docs/` kaynaklarında yeniden doğrula.
5. Planlanan bir kararı çalışan capability gibi anlatma.

## Kapsam

Bu harita **100** kalıcı Markdown notunu listeler. Tek satırlık özet yönlendirme içindir; karar veya implementation kanıtının yerine geçmez.

## 00 — Sistem ve bakım

- [[00-sistem/indeks|Neta yaşayan bilgi kasası]] — Bu klasör, repository ve canonical dokümanların üzerinde çalışan bağlantılı sentez katmanıdır. Kaynak kodun veya docs/ belgelerinin yerine geçmez. Bir iddia kritikse ilgili sayfadaki kaynak… _(sistem · mevcut)_
- [[00-sistem/mevcut-durum|Mevcut durum]] — 2026-09-16 MOB-2–5 denetiminde runtime kimlik izolasyonu, native production auth Origin, auth route/logout döngüsü, relation/core pagination, mutation retry/cache ve versioned dosya downloa… _(sistem · mevcut)_
- [[00-sistem/acik-sorular|Açık sorular]] — Bu liste yalnız gerçek karar veya kanıt açığını içerir. Bir soru çözüldüğünde sonuç ilgili mimari/karar sayfasına taşınır ve buradan kapanış bağlantısı verilir. _(sistem · mevcut)_
- [[00-sistem/agent-baglam-ve-hooklar|Agent bağlamı ve hooklar]] — Agentların genel haritadan başlamasını, ilgili ADR bağlamını almasını ve kalıcı kod değişikliklerinden sonra kasayı senkronize etmesini sağlayan prompt/hook düzeni. _(sistem · mevcut)_
- [[00-sistem/celiskiler|Çelişkiler ve drift kayıtları]] — Durum: 2026-09-03'te MOB-1 ile çözüldü. _(sistem · mevcut)_
- [[00-sistem/degismez-kurallar|Değişmez kurallar]] — Bu kurallardan birini değiştiren iş sıradan refactor değildir. Kod, migration, operasyon belgesi, güvenlik analizi ve bu sayfa birlikte güncellenmelidir. _(sistem · mevcut)_
- [[00-sistem/gunluk|Bilgi kasası günlüğü]] — Bu dosya append-only'dir. Eski girdiler olgusal hata düzeltmesi dışında değiştirilmez; düzeltme gerekiyorsa yeni kayıt önceki kayda bağlantı verir. _(gunluk · mevcut)_
- [[00-sistem/kasa-semasi|Bilgi kasası şeması]] — Repository kökü Obsidian vault'tur. bilgi/, kod ve canonical dokümanların üzerinde çalışan, insan ve AI için kalıcı sentez katmanıdır. docs/ nasıl/nerede/faz kanıtını; bilgi/ ise sistemler… _(sistem · mevcut)_
- [[00-sistem/sozluk|Sözlük]] — Sözlük hakkında kalıcı Neta bilgi notu. _(sistem · mevcut)_

## 01 — Ürün

- [[01-urun/kullanici-tipleri|Kullanıcı tipleri]] — Kodda auth rolü değildir; deployment, secret, volume, TLS, backup, restore ve upgrade sorumluluğu taşır. Çoğu kurulumda owner ile aynı kişi olabilir; güvenlik modelinde compromised host ayr… _(urun · mevcut)_
- [[01-urun/neta|Neta]] — Neta, freelancer ve küçük stüdyoların müşteri ilişkisi ile iş operasyonlarını kendi altyapılarında yönetmesine odaklanan self-hosted bir çalışma alanıdır. Owner; müşteri, proje, görev, takv… _(urun · mevcut)_
- [[01-urun/urun-felsefesi|Ürün felsefesi]] — Neta'nın ana ayrımı self-hosting'dir. Kimlik, iş verisi, dosya ve ayar bir merkezi SaaS hesabında değil, owner'ın yönettiği instance'ta bulunur. Mobil istemci hedefte bile bağımsız veri oto… _(urun · mevcut)_
- [[01-urun/urun-haritasi|Ürün haritası]] — Bugünkü öncelik yeni ekran eklemek değil, mobilin zaten ifade ettiği temel owner/client akışlarını backend'in gerçek, yetkili ve test edilmiş v1 resource API'lerine bağlamaktır. Bunun önces… _(urun · mevcut)_
- [[01-urun/yetenekler|Yetenekler]] — /api/v1/meta bugün bazı geniş capability'leri available döndürse de karşılık gelen resource route'ları yoktur. Product readiness değerlendirmesinde capability string'i tek başına kanıt sayı… _(urun · mevcut)_

## 02 — Domainler

- [[02-domainler/ai-ve-analiz|AI ve analiz]] — Owner'a opsiyonel AI sohbeti, proje risk analizi ve finans analizi sunmak; provider seçimini self-hosted instance sahibinde bırakmak. _(domain · mevcut)_
- [[02-domainler/dosyalar-ve-markalama|Dosyalar ve markalama]] — Avatar, marka görselleri ve proje asset'lerini güvenli local storage'da tutmak; instance'ın workspace adı, logo, favicon, renk ve görünüm ayarlarını web ve discovery yüzeylerine uygulamak. _(domain · mevcut)_
- [[02-domainler/finans-ve-ticari-kayitlar|Finans ve ticari kayıtlar]] — Owner'ın nakit akışı kayıtlarını ve müşteri işi etrafındaki teklif, sözleşme, fatura ve abonelik nesnelerini yönetmek. _(domain · mevcut)_
- [[02-domainler/gorevler-ve-takvim|Görevler ve takvim]] — Owner'ın yapılacak işlerini ve zaman tabanlı olaylarını; gerektiğinde müşteri/proje bağlarıyla birlikte yönetmek. _(domain · mevcut)_
- [[02-domainler/gunluk|Günlük domaini]] — Owner'ın tarihli çalışma/yaşam notlarını ve opsiyonel ruh hali, enerji, memnuniyet gibi skorlarını saklamak. _(domain · mevcut)_
- [[02-domainler/instance-ve-mobil-baglanti|Instance ve mobil bağlantı]] — Bir mobil istemcinin bağlandığı self-hosted Neta origin'ini doğrulaması, kalıcı instance kimliğini tanıması ve doğru auth/API sınırını kullanması. _(domain · mevcut)_
- [[02-domainler/kimlik-ve-erisim|Kimlik ve erişim]] — Bir instance'ın tek owner'ını ve davetli client kullanıcılarını doğrulamak; her isteği server-side role/scope bağlamına dönüştürmek. _(domain · mevcut)_
- [[02-domainler/musteri-portali|Müşteri portalı]] — Owner'ın tüm çalışma alanını açmadan, davet edilmiş müşteriye yalnız kendi proje ve paylaşılmış iş bilgisini sunmak. _(domain · mevcut)_
- [[02-domainler/musteriler|Müşteriler]] — Owner'ın müşteri ilişkilerini, satış pipeline durumunu, iletişim bilgilerini, ilişki aktivitelerini ve opsiyonel portal hesabı bağını yönetmek. _(domain · mevcut)_
- [[02-domainler/projeler-ve-planlama|Projeler ve planlama]] — Müşteri veya side project yaşam döngüsünü, ilerlemeyi, plan bölümlerini, proje görevlerini, paylaşılabilir dosyaları ve müşteri revizyonlarını tek bağlamda tutmak. _(domain · mevcut)_
- [[02-domainler/yedekleme-ve-geri-yukleme|Yedekleme ve geri yükleme domaini]] — Bir instance'ın DB, auth, ayar, çeviri ve upload verisini birlikte; doğrulanabilir ve geri alınabilir biçimde korumak. _(domain · mevcut)_
- [[02-domainler/yerellestirme|Yerelleştirme]] — Instance'ın aktif dillerini, UI katalog özelleştirmelerini, kullanıcı tercihlerini ve domain içeriği çevirilerini yönetmek. _(domain · mevcut)_

## 03 — Mimari

- [[03-mimari/ai-mimarisi|AI mimarisi]] — Vercel AI SDK adapter'ları üzerinden Gemini, OpenAI ve Groq; OpenAI-compatible base URL üzerinden Ollama seçilir. Her provider için default model vardır, owner model adını override edebilir… _(mimari · mevcut)_
- [[03-mimari/api|API mimarisi]] — Başarı {ok:true,data}, hata {ok:false,error} zarfındadır ve v1 header kullanılır. Discovery endpoint'i doğrudan discovery dokümanı döndürür. Bilinmeyen v1 yolları JSON 404, yanlış metotlar… _(mimari · mevcut)_
- [[03-mimari/deployment|Deployment mimarisi]] — Kök multi-stage Dockerfile Node 24 slim üzerinde frozen pnpm lockfile ile yalnız @neta/app dependency graph'ını kurar, Next standalone build üretir ve non-root nextjs user olarak çalıştırır… _(mimari · mevcut)_
- [[03-mimari/dosya-depolama|Dosya depolama]] — Dosya bytes local uploads/ ağacında, authorization ve bütünlük metadata'sı SQLite files tablosunda yaşar. Kullanıcı path seçmez; kind ve server-generated ID'den storage path üretilir. _(mimari · mevcut)_
- [[03-mimari/kimlik-dogrulama|Kimlik doğrulama mimarisi]] — Better Auth, Drizzle SQLite adapter ile aynı neta.db içinde user/account/session/verification verisini tutar. Uygulamaya özgü rol ve client bağı appProfiles tablosundadır. getSessionContext… _(mimari · mevcut)_
- [[03-mimari/migrasyonlar|Migrasyonlar]] — Drizzle SQL migration'ları apps/neta-app/server/db/migrations/ altında versioned dosyalardır. scripts/migrate.mjs SQLite pragmalarını uygular, Drizzle migrator'ı çalıştırır ve runtimechecks… _(mimari · mevcut)_
- [[03-mimari/mimari-genel-bakis|Mimari genel bakış]] — Neta'nın canonical backend'i neta-app içindedir. Web UI, portal ve mobil farklı transport/istemci yüzeyleri olsa da iş kurallarının DomainService/repository/specialized service katmanlarınd… _(mimari · mevcut)_
- [[03-mimari/mobil-mimari|Mobil mimari]] — Instance kimliği aktif/kayıtlı hedef bazında doğrulanır; değişim native auth generation/session/cache'i temizler. Native cookie auth production CSRF için selected origin'i gönderir. JSON/bi… _(mimari · mevcut)_
- [[03-mimari/monorepo|Monorepo]] — Root pnpm-workspace.yaml, apps/ ve packages/ paketlerini kapsar. Tek package manager pnpm@11.5.1, tek lockfile ve Node 24 engine sözleşmesi vardır. Root package yalnız orchestration scriptl… _(mimari · mevcut)_
- [[03-mimari/runtime|Runtime]] — Self-hosted ürün Next.js 16 App Router + React 19 üzerinde Node.js runtime'dır. Better Auth, better-sqlite3, Drizzle, local filesystem ve opsiyonel AI provider adapter'ları aynı @neta/app p… _(mimari · mevcut)_
- [[03-mimari/sqlite|SQLite]] — Tek owner ve tek process self-hosting modelinde ayrı database servisini kaldırır; app verisi ile auth verisini aynı backup/cutover sınırında tutar; kurulum ve geri yükleme yüzeyini küçültür. _(mimari · mevcut)_
- [[03-mimari/veri-kaliciigi|Veri kalıcılığı]] — DATADIR değiştirilebilir; ancak bu alt alanların aynı kalıcı kök içinde olması backup/restore ve atomik rename modelinin temelidir. _(mimari · mevcut)_

## 04 — Bileşenler

- [[04-bilesenler/api-contracts|api-contracts]] — @neta/api-contracts, mobil ile backend arasında taşınacak JSON-safe DTO, envelope, pagination, domain resource ve runtime guard sözleşmelerini toplar. _(bilesen · mevcut)_
- [[04-bilesenler/design-tokens|design-tokens]] — @neta/design-tokens, platformdan bağımsız spacing, radius, typography, shadow ve semantic light/dark color değerlerini üretir. Instance primary/accent renklerinden okunabilir foreground ve… _(bilesen · mevcut)_
- [[04-bilesenler/desktop-assistant|desktop-assistant]] — tools/desktop-assistant, pnpm ürün workspace'inin dışında tutulan Python masaüstü yardımcı aracıdır. requests, clipboard/input automation, SymPy, Pillow ve PyMuPDF gibi bağımlılıklar kullan… _(bilesen · mevcut)_
- [[04-bilesenler/neta-app|neta-app]] — @neta/app, self-hosted owner web uygulaması, client portalı ve canonical backend'dir. Neta iş verisinin, auth'un, dosyanın, ayarın, discovery'nin ve operasyon scriptlerinin sahibi bu pakett… _(bilesen · mevcut)_
- [[04-bilesenler/neta-mobile|neta-mobile]] — @neta/mobile, owner workspace ve sınırlı client portalını iOS/Android'e taşıyan Expo/React Native istemcisidir. Ayrı backend değildir; bağlandığı neta-app instance'ını kullanır. _(bilesen · mevcut)_
- [[04-bilesenler/neta-web|neta-web]] — @neta/web, Neta'yı, modüllerini, self-hosting değerini, müşteri portalını ve kurulum yolunu anlatan public landing sitesidir. Kullanıcı iş verisinin veya auth'unun sahibi değildir. _(bilesen · mevcut)_

## 05 — İş akışları

- [[05-is-akislari/ilk-kurulum|İlk kurulum]] — Yeni self-hosted instance'ı kalıcı veri, doğru origin ve tek owner hesabıyla güvenli biçimde kullanılabilir hale getirmek. _(is-akisi · mevcut)_
- [[05-is-akislari/mobil-instance-baglantisi|Mobil instance bağlantısı]] — Connect QR yalnız origin taşır; ayrı owner pairing QR'ı origin + one-use secret taşır. Salt kısa kodun domain çözmesi merkezi resolver gerektirir ve ilk sürümde yoktur; manuel pairing domai… _(is-akisi · mevcut)_
- [[05-is-akislari/musteri-daveti|Müşteri daveti]] — Owner/freelancer, davet edilen müşteri ve Better Auth/SQLite runtime. _(is-akisi · mevcut)_
- [[05-is-akislari/supabase-importu|Legacy Supabase importu]] — Eski Neta kurulumundan hazırlanmış offline export bundle'ını Supabase'e runtime bağlantısı kurmadan yeni SQLite/local-filesystem instance'a taşımak. _(is-akisi · legacy)_
- [[05-is-akislari/yayin-ve-upgrade|Yayın ve upgrade]] — Yeni migration DB şemasını ileri taşır. Schema downgrade desteklenmez; eski binary yeni schema ile uyumlu olmayabilir. Bu nedenle rollback çifti application image + matching pre-upgrade bac… _(is-akisi · mevcut)_
- [[05-is-akislari/yedekleme-ve-geri-yukleme|Yedekleme ve geri yükleme akışı]] — Restore aynı filesystem rename varsayar. Pairing geldiğinde başarılı restore sonunda device token epoch rotate edilmeden bu akış güvenli sayılmayacaktır. _(is-akisi · mevcut)_

## 06 — Kararlar

- [[06-kararlar/karar-kaydi|Karar kaydı]] — Neta mimari kararlarının bağımsız ADR notlarına açılan durum ve yönlendirme indeksi. _(karar · mevcut)_
- [[06-kararlar/adr-001-sqlite-kalici-veri|ADR-001 — Self-hosted persistence için SQLite]] — Self-hosted Neta'nın ana runtime veritabanı SQLite, erişim katmanı better-sqlite3 ve Drizzle'dır. _(karar · mevcut)_
- [[06-kararlar/adr-002-tek-process-tek-veri-dizini|ADR-002 — Tek process, tek persistent data directory]] — Bir Neta instance'ı tek Node.js process'i ve tek kalıcı veri diziniyle çalışır. _(karar · mevcut)_
- [[06-kararlar/adr-003-yerel-dosya-depolama|ADR-003 — Yerel filesystem storage]] — Upload byte'ları yerel persistent filesystem'da, erişim metadata'sı SQLite'ta saklanır. _(karar · mevcut)_
- [[06-kararlar/adr-004-better-auth-ve-uygulama-profili|ADR-004 — Better Auth ve uygulama profili ayrımı]] — Kimlik ve oturum Better Auth'ta, Neta rolü ile müşteri bağı appProfiles tablosunda tutulur. _(karar · mevcut)_
- [[06-kararlar/adr-005-supabase-runtime-bagimliliginin-kaldirilmasi|ADR-005 — Supabase runtime bağımlılığının kaldırılması]] — Supabase aktif Neta build/runtime bağımlılığı değildir; yalnız legacy veri import kaynağı olabilir. _(karar · mevcut)_
- [[06-kararlar/adr-006-mobil-versioned-api-ve-ortak-domain-servisleri|ADR-006 — Mobil için versioned API ve ortak domain servisleri]] — Mobil istemci versioned /api/v1 sözleşmesini, web ve mobil ise aynı domain/application servislerini kullanır. _(karar · mevcut)_
- [[06-kararlar/adr-007-evrensel-mobil-uygulama|ADR-007 — Resmî tek evrensel mobil uygulama]] — Neta Mobile tek resmî store binary'si olarak runtime'da domain veya QR ile self-hosted instance'a bağlanır. _(karar · mevcut)_
- [[06-kararlar/adr-008-owner-device-pairing|ADR-008 — Owner device pairing tasarımı]] — Owner mobil erişimi one-use challenge ve rotasyonlu opaque token family kullanan device pairing tasarımına dayanır. _(karar · mevcut)_
- [[06-kararlar/adr-009-backup-restore-ve-downgrade-politikasi|ADR-009 — Backup/restore doğrulaması ve downgrade politikası]] — Backup DB ve upload manifest/checksum'larını birlikte doğrular; restore staged swap kullanır ve schema downgrade desteklenmez. _(karar · mevcut)_
- [[06-kararlar/adr-010-agent-baglaminda-vault-routing|ADR-010 — Agent bağlamında genel harita ve karar routing'i]] — Neta üzerinde çalışan agent önce genel bilgi haritasından geçer; static talimat ve Codex hookları ilgili karar bağlamını prompt'a taşır. _(karar · mevcut)_
- [[06-kararlar/adr-011-mobile-v1-hazirlik-anlami|ADR-011 — `mobile-v1` hazırlık anlamı]] — mobile-v1, bootstrap varlığını değil evrensel bağlantı, session ve minimum owner read yüzeyinin birlikte doğrulanmasını ifade eder. _(karar · planlanan)_
- [[06-kararlar/adr-012-ilk-mobil-auth-transportu|ADR-012 — İlk mobil auth transport'u]] — İlk mobil auth, instance domain'i üzerinde email/password ile oluşturulan Better Auth cookie session'ıdır; parola saklanmaz, pairing daha sonra gelir. _(karar · mevcut)_
- [[06-kararlar/adr-013-disabled-session-http-politikasi|ADR-013 — Disabled session HTTP politikası]] — Eksik, süresi dolmuş, revoke edilmiş veya disabled hesaba ait session v1 API'de 401; doğrulanmış fakat rolü yetersiz actor 403 alır. _(karar · mevcut)_
- [[06-kararlar/adr-014-ilk-surum-instance-kapsami|ADR-014 — İlk sürüm instance kapsamı]] — İlk evrensel mobil sürüm tek aktif instance UX'i sunar; registry, credential ve cache baştan instanceId ile çoklu kayda uygun scope edilir. _(karar · planlanan)_
- [[06-kararlar/adr-015-coklu-para-birimi-ozetleri|ADR-015 — Çoklu para birimi özetleri]] — Finans özetleri para birimi bazında gruplanır; kur dönüşümü olmadan farklı currency tutarları tek toplamda birleştirilmez. _(karar · mevcut)_
- [[06-kararlar/adr-016-optimistic-concurrency-surumu|ADR-016 — Optimistic concurrency sürümü]] — V1 resource version alanı mevcut updatedAt ISO instant değerinin opaque kopyasıdır; stale mutation 409 döner. _(karar · mevcut)_
- [[06-kararlar/adr-017-koleksiyon-pagination-zarfi|ADR-017 — Collection pagination zarfı]] — Bütün v1 collection endpoint'leri, project asset dahil, items ve pageInfo taşıyan tek opaque-cursor pagination zarfını kullanır. _(karar · mevcut)_
- [[06-kararlar/adr-018-client-mobil-auth-siniri|ADR-018 — Client mobil auth sınırı]] — İlk client mobil girişi davet sonrası email/password Better Auth session kullanır; owner device pairing client'a otomatik genişletilmez. _(karar · planlanan)_
- [[06-kararlar/adr-019-v1-validation-http-statusu|ADR-019 — V1 validation HTTP statüsü]] — V1 parse ve iş girdisi validation hataları tutarlı biçimde 400 VALIDATIONERROR döner; 422 invariant ihlalleri için ayrıdır. _(karar · mevcut)_
- [[06-kararlar/adr-020-mobil-server-surum-uyumlulugu|ADR-020 — Mobil-server sürüm uyumluluğu]] — Mobil-server uyumluluğu API major ve server'ın ilan ettiği minimum client SemVer ile belirlenir; aynı v1 içindeki additive alanlar uyumludur. _(karar · mevcut)_
- [[06-kararlar/adr-021-api-mutation-idempotency-kaydi|ADR-021 — API mutation idempotency kaydı]] — Retry edilebilir v1 mutation sonuçları actor, method, route ve Idempotency-Key kapsamında SQLite'ta atomik olarak saklanır. _(karar · mevcut)_
- [[06-kararlar/adr-022-ui-assets-pipeline|ADR-022 — UI assets pipeline]] — UI kaynakları ve sentetik başlangıç çekimleri vault içinde platform/rol/sayfa bazında saklanır; runtime asset kaynağı uygulamalarda kalır. _(karar · mevcut)_

## 07 — Güvenlik

- [[07-guvenlik/bilinen-riskler|Bilinen riskler]] — Bilinen riskler hakkında kalıcı Neta bilgi notu. _(guvenlik · mevcut)_
- [[07-guvenlik/guvenlik-genel-bakis|Güvenlik genel bakışı]] — Neta'nın ana güvenlik sınırı self-hosted instance'tır. Host operatörü filesystem, process environment ve DB'ye fiilen erişebilir. Uygulama içi model tek owner ile davetli client'ları ayırır… _(guvenlik · mevcut)_
- [[07-guvenlik/sirlar|Sırlar]] — Production runtime için en az 32 karakter ve zorunludur. Instance'a özgü, sabit ve secret manager/host environment'ta tutulmalıdır. Source, Docker image veya EXPOPUBLIC içine konmaz. _(guvenlik · mevcut)_
- [[07-guvenlik/tehdit-modeli|Tehdit modeli]] — Owner/client auth materyali; müşteri PII; proje/task/takvim/finans/journal/chat verisi; upload'lar; branding metadata; AI API key'leri; backup bundle'ları; instance kimliği ve gelecekte dev… _(guvenlik · mevcut)_

## 08 — Operasyon

- [[08-operasyon/docker|Docker]] — Runtime nextjs UID 1001 kullanır; /app/data bu kullanıcıya aittir. DATADIR=/app/data, internal port 3000 ve volume declaration vardır. CMD migration'ı server'dan önce çalıştırır. _(operasyon · mevcut)_
- [[08-operasyon/felaket-kurtarma|Felaket kurtarma]] — Doğrulanmış DB + upload bundle'ından tek instance'ı, scope/auth/file bütünlüğünü koruyarak geri getirmek. _(operasyon · mevcut)_
- [[08-operasyon/health-checkler|Health check'ler]] — checkReadiness data dir'de probe file oluşturup siler, select 1 yapar ve runtimechecks tablosunu arar. Hata text'i server-side tutulur; HTTP response check durumlarını döndürür. _(operasyon · mevcut)_
- [[08-operasyon/production|Production]] — HTTPS reverse proxy → tek neta-app container/process → kalıcı /app/data volume. Landing ayrı deploy, mobile ayrı native release'tir. _(operasyon · mevcut)_
- [[08-operasyon/sorun-giderme|Sorun giderme]] — dataDirWritable, databaseReachable, migrationsApplied alanlarını ayır. Disk/permission, DB open/lock ve migration logunu kontrol et. Yalnız liveness 200 ise trafik vermek güvenli değildir. _(operasyon · mevcut)_
- [[08-operasyon/yayin-hazirligi|Yayın hazırlığı]] — Değişikliğe göre app phase smoke/boundary, i18n integrity/release gate, import/backup/restore ve mobil release check de çalıştırılır. _(operasyon · mevcut)_
- [[08-operasyon/yedekleme|Yedekleme]] — Cron ortamında BACKUPRETENTIONCOUNT=14 aynı politikayı verir. _(operasyon · mevcut)_

## 09 — Yol haritası

- [[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]] — Aşağıdaki sıra mobil uygulama planının ilk kritik yoludur. _(yol-haritasi · planlanan)_
- [[09-yol-haritasi/mobil-uygulama-plani|Neta Mobile uygulama planı]] — Neta Mobile'ı build-time tek instance istemcisinden güvenli evrensel uygulamaya taşıyan, backend API ve release kapılarıyla birlikte yürütülen uygulama planı. _(yol-haritasi · mevcut)_
- [[09-yol-haritasi/planlanan-yetenekler|Planlanan yetenekler]] — Bu liste store-ready mobile-v1 ilanı değildir. docs/mobile/mobile-security-acceptance otomasyon ile açık native/release kabulünü ayırır. _(yol-haritasi · planlanan)_
- [[09-yol-haritasi/teknik-borc|Teknik borç]] — Tenant izolasyonu, secret/token lifecycle ve backup bütünlüğü; görsel parity veya yeni feature sayısından önce gelir. Contract drift, yeni mobil endpoint eklenmeden önce kapatılmalıdır. _(yol-haritasi · mevcut)_
- [[09-yol-haritasi/yol-haritasi|Yol haritası sentezi]] — Web self-hosted runtime'ı canonical backend olarak koruyup landing, web app ve resmî evrensel mobile'ı aynı monorepo/contract disiplini altında birleştirmek. Mobil için ikinci backend veya… _(yol-haritasi · planlanan)_

## 10 — Araştırma

- [[10-arastirma/indeks|Araştırma indeksi]] — Bu alan henüz Neta ürün/mimari kararı olmayan incelemeler içindir. Araştırma bulgusu sessizce “mevcut”e dönüşmez; kabul edilirse karar indeksine eklenen bağımsız bir ADR'ye ve ilgili domain… _(arastirma · arastirma)_

## 11 — Kaynaklar

- [[11-kaynaklar/indeks|Kaynak indeksi]] — Bu sayfa canonical kaynak ailelerini ve gelecekte eklenecek dış kaynak notlarını yönlendirir. Kaynak içeriğini kopyalamaz. _(kaynak · mevcut)_

## Assets pipeline

- [[assets-pipeline/indeks|Assets pipeline]] — Mobil, canonical web uygulaması, portal ve landing/docs için sayfa planı, kaynak asset ve gerçek ekran görüntüsü arşivi. _(is-akisi · mevcut)_
- [[assets-pipeline/ui-ux-guncelleme-plani|UI/UX güncelleme planı]] — Fonksiyonel mobil çalışma sonrasında sayfa akışları, tasarım sistemi, asset üretimi ve görsel kabulün sıralı yürütülmesi. _(yol-haritasi · planlanan)_

## Ham kaynak alanı

- [[ham/indeks|Ham kaynak alanı]] — Bu alan repository dışından gelen, henüz işlenmemiş veya provenance amacıyla korunacak varlıklar içindir. _(kaynak · mevcut)_

## Şablonlar

- [[sablonlar/arastirma|Araştırma başlığı]] — Bu bölüm ürün kararı değildir. _(arastirma · arastirma)_
- [[sablonlar/bilesen|Bileşen adı]] — Bileşen adı hakkında kalıcı Neta bilgi notu. _(bilesen · planlanan)_
- [[sablonlar/domain|Domain adı]] — Domain adı hakkında kalıcı Neta bilgi notu. _(domain · planlanan)_
- [[sablonlar/is-akisi|İş akışı adı]] — İş akışı adı hakkında kalıcı Neta bilgi notu. _(is-akisi · planlanan)_
- [[sablonlar/karar|ADR-XXX — Karar başlığı]] — Bu kararın hangi soruya cevap verdiğini anlatan tek cümle. _(karar · planlanan)_
- [[sablonlar/kaynak|Kaynak başlığı]] — Kaynak başlığı hakkında kalıcı Neta bilgi notu. _(kaynak · arastirma)_

## Bakım

- Haritayı üret: `pnpm vault:map`
- Haritanın güncelliğini ve kasa sağlığını denetle: `pnpm vault:check`
