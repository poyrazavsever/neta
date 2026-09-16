# Neta Mobile kurulum kararları

Son güncelleme: 2026-09-16

## Sabitlenen taban

| Bileşen | Sürüm/karar |
| --- | --- |
| Expo | SDK 57 (stable) |
| React Native | 0.86.2 |
| React | 19.2.3 |
| TypeScript | 6.0 strict |
| Node.js | 24 LTS; destek aralığı `>=24 <25` |
| pnpm | 11.5.1 |
| Ruby/CocoaPods | Ruby 3.4.10 + CocoaPods 1.16.2; `Gemfile.lock` ile sabit |
| Routing | Expo Router typed routes |
| Native mimari | Expo development build + New Architecture |
| UI | `packages/design-tokens` + React Native `StyleSheet`; ek styling framework yok |
| Native date/time | Expo SDK 57 uyumlu `@react-native-community/datetimepicker` 9.1.0 |
| Test | Node 24 type-stripping + yerleşik test runner; mobil 129 unit/contract test (2026-09-16); UI arşivleme için root Playwright |

Sürümler Expo'nun SDK 57 uyumluluk matrisi ve resmi `default@sdk-57`
şablonu temel alınarak lockfile'a sabitlenir. Canary/beta paket kullanılmaz.

## Bağımlılık politikası

Bir paket yalnız aşağıdaki koşullardan biri sağlanıyorsa eklenir:

1. Expo Router veya React Native runtime için zorunludur.
2. Ana plandaki güvenlik/veri sınırını uygular (`SecureStore`, `AsyncStorage`).
3. Platform API'sinin güvenilir ortak yüzeyini sağlar (`NetInfo`, safe area).
4. Native development build için gereklidir (`expo-dev-client`).

State, form, query, chart, UI kit ve animation bağımlılıkları ihtiyaç duyulan
fazdan önce eklenmez.

## Klavye ve erişilebilirlik baseline'ı

Ortak `Screen` primitive'i form ekranlarında safe area içinde native
`KeyboardAvoidingView` ve kaydırılabilir içerik kullanır. iOS interaktif,
Android drag ile keyboard dismissal uygular; Android native config
`softwareKeyboardLayoutMode: resize` kullanır. `TextField` label, hata ilişkisi,
invalid state ve live-region davranışını merkezileştirir. Yeni ekranlar bu
primitive'leri atlayamaz. Manuel cihaz matrisi ve acceptance adımları
`docs/mobile-accessibility-baseline.md` içindedir.

## Tasarım sistemi

Semantik renk, spacing, radius, typography ve shadow değerleri
`packages/design-tokens` paketindedir. Mobil taraf bu değerleri
`mobile/src/theme/tokens.ts` üzerinden yeniden export eder. Böylece web DOM
component'leri mobile taşınmadan ortak tasarım dili korunur.

Phase 2'de eklenen `createThemeTokens(mode, brandColors)` fonksiyonu instance
metadata'sından gelecek `primary` ve `accent` renklerini normalize eder ve
foreground rengini kontrast hesabıyla seçer. Neta'nın varsayılan ana rengi
kırmızıdır; discovery sonrası instance branding bu semantik rolleri ezebilir.

## API kontratları

Transport-safe API tipleri ve type guard'lar `packages/api-contracts` paketinde
tutulur. Mobil resource client bu kontratları parser olarak kullanır; ekranlar
ham `fetch` çağırmaz.

İlk cache/query standardı bağımlılık eklemeden kuruldu:

```ts
[instanceId, userId, role, locale, resource, filters]
```

TanStack Query, gerçek feature sayısı ve invalidation ihtiyacı arttığında tekrar
değerlendirilecek. Şimdilik küçük AsyncStorage TTL cache yeterli.

## Windows Android emülatörü ve lokal Metro

Android Studio SDK'sındaki `platform-tools` ve `emulator` klasörleri kullanıcı
PATH'inde bulunmalıdır. `ANDROID_HOME` SDK kökünü göstermelidir.

İlk native development build için repository kökünde `pnpm mobile:android`
çalıştırılır. `android/` yoksa Expo prebuild tarafından üretilir; bu klasör git
tarafından ignore edilir. Sonraki JS geliştirmelerinde `pnpm mobile:start:local`
ve terminalde `a` tuşu kullanılır. Bu komut Metro'yu yalnız IPv4 localhost'ta
dinletir; emülatör bağlantısı ADB `tcp:8081` reverse üzerinden kurulur.

`start:local` ayrıca `EXPO_OFFLINE=1` ile dış Expo hesap API'sine bağımlı olmayan yerel manifest sunar. API bağlantısı kullanıcının doğruladığı Neta instance'ına normal devam eder. Bu ayar loopback CLI wrapper'ındadır. Metro diğer app'lerin geçici `.next*`, `.data`, `.artifacts`, `.tooling` ve vault asset arşivini taramaz; smoke cleanup'ının Windows FSWatcher'ı çökertmesi önlenir.

`Error: cmd: Can't find service: package`, Android package manager henüz hazır
değilken görülür. Uygulama kurulmadan önce aşağıdaki sonuçlar doğrulanır:

```powershell
adb shell getprop sys.boot_completed
# 1
adb shell service check package
# Service package: found
```

2026-09-16 lokal kabulünde API 36.1 AVD'nin eski userdata/quick-boot oturumu
sıfırlandı ve `-gpu swiftshader_indirect -no-snapshot` ile cold boot yapıldı.
Kurulu emulator 36.3.10, `-gpu software` değerini desteklemez. AVD GPU tercihi
SwiftShader ve sonraki açılışlar cold boot olarak ayarlandı. Android debug APK
başarıyla derlendi, emülatöre kuruldu ve Neta instance bağlantı ekranı açıldı.
Bu lokal development kabulü signed production/two-instance release kanıtı değildir.

## iOS Pod ve Xcode kurulumu

Apple Silicon ortamında Ruby 3.4 bir kez kurulur:

```sh
brew install ruby@3.4
pnpm --filter @neta/mobile ios:pods
```

`pnpm mobile:ios` bu Pod adımını otomatik çalıştırır. Proje Ruby/CocoaPods
sürümlerini `mobile/Gemfile.lock` ile sabitler ve gem'leri repository içindeki
ignore edilen `mobile/vendor/bundle` klasörüne kurar.

Repository yolundaki Türkçe/Unicode karakterler bazı CocoaPods podspec
işlemlerinde `ASCII-8BIT`/`UTF-8` uyuşmazlığına neden olabildiği için
`with-neta-ios-fixes.cjs` Podfile'a yalnız üretim sırasında bir encoding
normalizasyonu ekler. Aynı plugin Expo Dev Launcher'ın release key temizleme
build phase'ini açıkça her build'de çalışacak şekilde işaretler. Böylece
`expo prebuild` sonrasında elle Xcode veya Podfile düzenlemesi gerekmez.

## Environment

Public build-time değerleri `EXPO_PUBLIC_*` adıyla verilir. Secret değerler
mobil bundle'a konmaz. Self-host instance origin'i build-time environment
değildir; kullanıcı bağlantı ekranında girer ve discovery ile doğrulanır.

## Faz 0 açıklarının güncel durumu

Eski 2026-07 Faz 0 notunda web/backend kaynakları olmadığı varsayılmıştı. Güncel monorepo canonical backend'i `apps/neta-app`, mobil istemciyi `apps/neta-mobile` altında içerir. Route/schema/versioned auth ve portal kodu artık incelenebilir; otomatik kabul [mobil güvenlik matrisi](mobile-security-acceptance.md) ve [MOB-2–5 denetimi](mobile-phase-2-5-audit.md) ile izlenir. Aşağıdaki tarihsel liste tümüyle güncel açık iş listesi değildir:

- Route, Server Action, DomainService ve schema envanteri.
- Better Auth Expo multi-domain gerçek cihaz spike'ı.
- İki instance arasında cookie/session izolasyonu.
- ADR-0018 ve portal auth lifecycle güncellemesi.
- Mevcut Poyraz UI tokenlarının kaynak web uygulamasından çıkarılması.

Signed gerçek cihaz, iki bağımsız canlı HTTPS instance ve restore runtime lifecycle kabulü hâlâ gerekir. UI screenshot envanteri [assets pipeline](../ui-assets-pipeline.md) içindedir; signed kabulün yerine geçmez.

## Doğrulama durumu

2026-07-29 tarihinde:

- `pnpm --filter @neta/mobile release:check` geçti (lint, strict typecheck, 88
  unit/contract test, i18n, accessibility, public config ve production guard).
- Expo Doctor 20/20 kontrolü geçti.
- iOS production JS bundle'ı Metro ile üretildi.
- Android production JS bundle'ı Metro ile üretildi.
- CocoaPods `Podfile.lock` ve `Pods/Manifest.lock` birebir eşleşti.
- Debug iOS simulator native build'i `xcodebuild` ile başarıyla tamamlandı.
- `git diff --check` geçti.

İmzalı dağıtım build'i bu aşamanın kapsamında değildir; simulator development
build'i imzasız doğrulanmıştır.
