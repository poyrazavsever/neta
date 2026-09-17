---
title: MOB-9 mobil release kabulü ve operasyon
status: local-gates-ready-store-acceptance-open
last_updated: 2026-09-17
---

# MOB-9 release kabulü

Canonical backend apps/neta-app, mobil sözleşme /api/v1 ve ilk UX tek aktif instance’dır. Release candidate yalnız kod kalitesiyle mağazaya hazır sayılmaz. Bu belge güncel MOB-9 kaynağıdır; Temmuz phase-22/redesign-phase-12 derleme kayıtları tarihsel kanıttır.

## Komutlar ve anlamları

```sh
pnpm mobile:release:check
pnpm mobile:release:readiness
pnpm mobile:store:check
```

İlk komut lint/TypeScript/unit/i18n/a11y/config, native source/autolinking ve release-record unit kapılarıdır; signing veya gerçek cihaz testi yapmaz. Readiness komutu blocker kimliklerini JSON olarak gösterir ve rapor modunda sıfır exit code verir. Store check önce strict release kaydını doğrular, eksik kanıtta exit 1 olur; ancak ardından contract, mobil quality ve sentetik security/AI HTTP gate’lerini çalıştırır. Komut build, store upload, rollout veya otomatik yayın yapmaz.

## Release kaydı

[release-candidate.json](release/release-candidate.json) başlangıçta bütün kabul maddelerini pending tutar. Hazır olmayan madde için passed işaretlenmez. Release source commit’i 40 karakter Git SHA, appVersion package sürümüyle aynı olmalıdır. Candidate commit HEAD’in atası olmalı; apps/packages/tools/.github ve build girdileri o commit’ten sonra değişmemelidir. Yalnız doküman/kanıt commit’leri source commit’i değiştirmeden eklenebilir. Strict kontrolde tracked/untracked çalışma ağacı temiz olmalıdır; ignored local output’lar readiness kanıtı değildir.

Her passed madde reviewer takım alias’ı, UTC reviewedAt ve docs/mobile/release/evidence altında gerçek Markdown kanıt dosyasının SHA-256’sını ister. Gelecek tarih, eksik/değişmiş dosya, farklı revision, duplicate/eksik gate, dış URL veya traversal kanıt yolu reddedilir. Gate kaydı bir insanın kabul beyanını doğrular; cihaz testini, dış URL’nin yayınını veya imza sertifikasının güvenini bağımsız olarak kanıtlamaz. Evidence dosyası sonuç, ortam, sürüm, yöntem ve temizlenmiş rapor özeti içerir; gerçek token, cookie, şifre, e-posta, cihaz identifier’ı veya özel workspace içeriği içermez.

Signed iOS maddesi IPA; Android maddesi AAB adı, binary SHA-256, release signing beyanı, sertifika SHA-256 ve gerçek pozitif build version ister. Binary veya credential repo’ya konmaz; yetkili release storage’da tutulur. JS/Hermes export’u, simulator app’i ve debug sertifikalı release APK store kanıtı değildir. Sertifika fingerprint’i ve hash release owner tarafından apksigner/jarsigner/codesign çıktısı ve store build bilgisiyle doğrulanıp rapora eklenir.

| Gate | Zorunlu kabul özeti |
|---|---|
| signed-ios / signed-android | İki platform signed binary, permission/privacy incelemesi, gerçek build kimliği ve sertifika/hash |
| two-https-instances | Aynı binary ile iki farklı instanceId/public HTTPS origin; rebuild yok, credential/cache/locale/file izolasyonu |
| owner-client-native | Owner ve iki client; connect/login/foreground/refresh/logout/revoke/parola/disable/restore, negatif portal/file erişimi |
| ai-provider-native | Gerçek provider/model, NDJSON/proxy/cancel/retry, scope/privacy ve provider ayarı eksik hata state’i |
| native-a11y-performance | VoiceOver/TalkBack, büyük font, keyboard/rotation/tablet/reduced motion ve release performans bütçeleri |
| migration-restore | Empty/mevcut/pre-upgrade DB, upload checksum, ayrı target restore, epoch/old-token negatif ve image+backup rollback |
| compatibility | Yayınlanan API-major/minimum-version matrisi ve eski mobil/yeni server smoke |
| store-internal | TestFlight + Play Internal Testing kurulumu ve store metadata/screenshot/review erişimi kabulü |
| privacy-support-license | Yayında HTTPS privacy/support URL, veri/SDK/AI beyanı ve kayıtlı lisans kararı |
| operations | Incident sorumlusu, upgrade/restore/rollback/secret-key kaybı ve support prosedürü provası |

Public URL, incidentOwner ve licenseDecision henüz belirlenmediği için kayıt null/pending’dir. Proprietary kök README ile Expo telifli MIT mobil LICENSE çelişkisi ürün/lisans sahibi tarafından çözülmeden approved olmaz; bu çalışma lisans seçmez.

## Temiz checkout ve native generation

Native android/ios klasörleri gitignore altındadır. Kaynak kalite gate’i bu klasörleri istemez; Android Expo/RN autolinking’i gerçekten çözümler. Windows’ta CLI shell shim’i yerine Node entry point’i çalıştırılır. Platform native gate’i eksik proje/Pods’ta başarılı olmaz:

```sh
pnpm --filter @neta/mobile exec expo prebuild --platform android --no-install
pnpm --filter @neta/mobile native:verify --platform android
# macOS, Ruby 3.4 ve Gemfile.lock Bundler sürümüyle:
pnpm --filter @neta/mobile ios:pods
pnpm --filter @neta/mobile native:verify --platform ios
```

Mevcut native klasörü kişisel değişikliklerle doluysa prebuild --clean uygulanmaz; ayrı temiz checkout kullanılır. Podfile/Manifest eşitliği iOS gate’inde zorunludur. Kaynakta sabitlenen Gemfile.lock toolchain’i üretilecek Pods lock’unun yerine geçmez; native dependency çözümlemesi her candidate için saklanır.

EAS preview/production profilleri origin’i boş tutar; resmi app domain/QR ile bağlanır. Fork varsayılan origin’i app config’in opsiyonel yolundan ayrı kontrol edilir. Production environment’daki origin override’larının binary manifest’ine girmediği candidate üzerinde yeniden doğrulanır. EAS remote appVersionSource + autoIncrement build kimliklerinin otoritesidir; NETA_* config smoke numaraları gerçek EAS build numarası kanıtı değildir. Native/config değişikliği yeni binary ister; OTA altyapısı kurulmadı.

Expo project ID, Apple Team/provisioning, Android upload key ve store hesapları henüz bu kayıtla doğrulanmadı. Bunlar için yeni hesap/anahtar üretilmez ve store gönderimi yapılmaz. Yetkili hesapla signed candidate üretildiğinde kaynak commit, binary hash ve gerçek build sürümü kayda eklenir.

## Veri, upgrade ve restore matrisi

| Senaryo | Yerel otomatik kapsam | Dış ortam kabulü |
|---|---|---|
| Empty DB | Data gate empty/repeated startup + production standalone health; security/AI ilk owner | Production image, persistent volume ve readiness |
| Mevcut DB / migration | Data gate 0016→0017 owner/fixture instance/device/upload; missing/hash/duplicate/future ledger negatifleri | Upgrade öncesi gerçek şema kopyası, mevcut owner/client/file ve aynı instanceId |
| Backup/restore | Data gate checksum/integrity/FK/prefix/target-WAL negatifleri; security gate old-token/fresh pairing HTTP | Ayrı production-like target, eşleşen secret, upload bütünlüğü ve native eski-token reddi |
| Rollback | Canonical staged restore/checksum kuralları | Eski image + pre-upgrade backup; SQL downgrade yapılmaz |

Otomatik sentetik başarı gerçek production verisi/host/cihaz kabulü yerine geçmez. Restore sırasında app durdurulur; aynı SQLite’a ikinci replica yazılmaz. Başarılı restore device token epoch’unu değiştirir; cihazlar yeniden pair edilir. InstanceId korunur. BETTER_AUTH_SECRET ve encrypted AI key’leri koruyan matching secret ayrı güvenli kanalda korunur; bu çalışma key-rotation aracı eklemez.

## Operasyon sırası

1. Kaynak commit/lockfile, metadata/SDK/permission ve license kararını dondur; privacy/support ve incident alias’ını belirle.
2. Contract, mobile quality, data/security/AI otomatik gate ve origin’siz iki JS export’unu çalıştır.
3. Ayrı temiz native checkout’tan signed iki binary üret; gerçek build numaralarını ve hash/sertifika çıktısını sakla.
4. İki HTTPS instance, owner/client/native/file/AI/a11y/compatibility ve restore matrisiyle TestFlight/Play Internal Testing kabulünü tamamla.
5. Kanıt Markdown’larını temizle, hash’leri release kaydına ekle ve sadece docs/evidence commit’ini at; strict store check’i çalıştır.
6. Rollout yetkili store owner’ı tarafından ayrı işlemle başlatılır. Auth/veri sızıntısı/crash regresyonunda rollout duraklatılır; store binary geri alınamayabilir, hotfix yeni build numarası ister.
7. Backend regresyonunda image + matching pre-upgrade backup ile ayrı restore provası ve maintenance/cutover yap; minimumSupportedVersion rollback aracı değildir.
8. Incident sırasında app/server sürümü, güvenli hata kodu, yaklaşık zaman ve token’sız hostname topla. Cookie/token/log dump/private screenshot istenmez. Etki ve recovery aralığını postmortem’e ekle.

## 2026-09-17 yerel doğrulama

Production environment/origin boş iken pnpm mobile:release:check geçti: lint, TypeScript, 140 mobil test, i18n/a11y/phase/native/fork/config ve release guard. Release evidence için beş test ayrıca geçti; son test geçici ayrı Git deposunda source commit → evidence-only commit kabulünü, dirty worktree ve değişmiş kaynak reddini gerçek CLI ile doğrular. Fixture reviewer/artifact değerleri gerçek store kabulü değildir. pnpm contract:check shared altı contract, iki backend presenter, iki consumer TypeScript ve 140 mobil testi doğruladı.

Origin’siz iOS/Android JS/Hermes production export üretildi. Android native project/autolinking ve native klasörleri olmayan ayrı source kopyasının config/autolinking gate’i geçti. Eksik iOS proje/Pods gate’i exit 1, eksik release record strict gate’i exit 1 verdi; report ready=false’dur. YAML üç job ile parse edildi. Remote CI, macOS/iOS native compile, signed artifact veya fiziksel cihaz kabulü bu doğrulamada yapılmış sayılmaz.

## CI’nin kanıt sınırı

Mobile CI source/contract/vault quality, origin’siz iOS/Android JS export ve blocker JSON artifact üretir. Ayrı Android job temiz prebuild sonrası native graph gate’i çalıştırır; backend job sentetik security/AI kabulünü çalıştırır. Bu job’lar signing, fiziksel cihaz veya store submit yapmaz. Yeni workflow yürütme sonucu remote CI çalıştıktan sonra doğrulanır; yerel gate sonucu remote CI geçmişi değildir.

Kaynaklar: [compatibility](mobile-server-compatibility.md), [security](mobile-security-acceptance.md), [AI](mobile-ai-acceptance.md), [native matrix](redesign-phase-12/native-a11y-matrix.md), [Expo versioning](https://docs.expo.dev/build-reference/app-versions/), [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/).

## MOB-9 veri kabul devamı

pnpm mobile:data:check on SQLite/CLI testi ve ayrı production standalone/loopback HTTP kontrolünü çalıştırır; backend CI ve strict store check kapsamındadır. Readiness release ile eşleşmeyen ledger’ı hazır saymaz. Restore staging integrity/FK ve prefix’i swap öncesinde doğrular; WAL/SHM target reddedilir. [Data acceptance](mobile-data-acceptance.md) host/signed kabul ayrımını açıklar. Migration-restore evidence pending kalır.
