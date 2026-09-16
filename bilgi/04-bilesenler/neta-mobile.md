---
tur: bilesen
durum: mevcut
guncellendi: 2026-09-16
guven: yuksek
kaynaklar:
  - apps/neta-mobile/package.json
  - apps/neta-mobile/app.config.ts
  - apps/neta-mobile/src
  - apps/neta-mobile/README.md
  - docs/mobile/mobile-setup.md
ilgili:
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
  - "[[04-bilesenler/api-contracts|api-contracts]]"
  - "[[04-bilesenler/design-tokens|design-tokens]]"
etiketler:
  - neta
  - bilesen
  - mobile
---

# neta-mobile

## Rol

`@neta/mobile`, owner workspace ve sınırlı client portalını iOS/Android'e taşıyan Expo/React Native istemcisidir. Ayrı backend değildir; bağlandığı `neta-app` instance'ını kullanır.

## Teknoloji

Expo SDK 57, React Native 0.86, React 19, Expo Router, SecureStore, AsyncStorage, native picker/filesystem/sharing ve Neta workspace paketleri.

## Mevcut yapı

- `src/app`: public, owner, portal, form ve portal-form route grupları.
- `src/features`: domain API client'ları, UI ve validation.
- `src/lib/instance`: origin validation, discovery, registry ve version kontrolleri.
- `src/lib/auth`: native auth material ve `/me` normalization.
- `src/lib/resource`: instance-scoped read cache.
- `src/providers`: session, theme, locale ve environment state.

## Bugünkü çalışma sınırı

Production'da build-time origin zorunlu değildir. Domain veya secret-free QR keşfi, metadata onayı, instance unutma, Better Auth login ve owner pairing bearer akışı vardır. Owner read/mutation/parity ile portal API istemcisi kodda bulunur; signed cihaz kabulü açık kalır.

## Lokal Android çalıştırma

`pnpm mobile:android` ignore edilen native Android projesini gerektiğinde prebuild ile üretir ve development APK'sını kurar. `pnpm mobile:start:local`, Metro'yu IPv4 localhost ile başlatır; ADB reverse emülatörün 8081 bağlantısını host'a taşır. 2026-09-16 Windows lokal kabulünde API 36.1 emülatör cold boot/SwiftShader ile açıldı, package manager ve debug build doğrulandı; instance bağlantı ekranı çalıştı. Signed production ve iki canlı instance kabulü bunun dışında kalır.

## Güvenlik

Remote production HTTPS, same-origin URL validation, instance identity, SecureStore namespace ve cache isolation vardır. Aynı origin farklı instance ID döndürürse eski auth/cache temizlenir. Signed native iki-instance, pairing revoke/reuse/restore ve portal tenant izolasyonu kabulü henüz tamamlanmamıştır.

## Planlanan yön

Sıradaki yön pairing ve client portal güvenlik kabulü ile AI native taşımasıdır. `mobile-v1`, signed native release kapıları tamamlanana kadar `planned` kalır.

## Kaynaklar

2026-09-16 MOB-6/7 otomatik güvenlik kabulü backend historical reuse/Bearer scope/profil/parola, izole restore DB ve iki client HTTP/file negatiflerini doğrular. Native auth generation ve sıralı storage write logout/new-login sonrası geç refresh credential dirilmesini önler; owner güvenlik formu parola değişiminden sonra yeniden giriş ister. Son Android JS export ve 111 mobil unit geçti. Signed gerçek cihaz ve iki canlı HTTPS instance kanıtı [[docs/mobile/mobile-security-acceptance]] doğrultusunda ayrı kalır.

- `apps/neta-mobile/README.md`
- [[docs/mobile/neta-mobile-redesign-master-plan]]
- [[docs/roadmaps/platform-master-plan]]
