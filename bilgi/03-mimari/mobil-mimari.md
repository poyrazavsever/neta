---
tur: mimari
durum: mevcut
guncellendi: 2026-09-16
guven: yuksek
kaynaklar:
  - apps/neta-mobile
  - packages/api-contracts
  - packages/design-tokens
  - docs/mobile/neta-mobile-redesign-master-plan.md
  - docs/roadmaps/platform-master-plan.md
  - docs/mobile/mobile-security-acceptance.md
ilgili:
  - "[[04-bilesenler/neta-mobile|neta-mobile]]"
  - "[[03-mimari/api|API]]"
  - "[[02-domainler/instance-ve-mobil-baglanti|Instance bağlantı domaini]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]"
  - "[[06-kararlar/adr-006-mobil-versioned-api-ve-ortak-domain-servisleri|ADR-006]]"
  - "[[06-kararlar/adr-007-evrensel-mobil-uygulama|ADR-007]]"
  - "[[06-kararlar/adr-008-owner-device-pairing|ADR-008]]"
etiketler:
  - neta
  - mimari
  - mobil
---

# Mobil mimari

## 2026-09-16 — MOB-2–5 tamamlama ve UI arşivi

Instance kimliği aktif/kayıtlı hedef bazında doğrulanır; değişim native auth generation/session/cache'i temizler. Native cookie auth production CSRF için selected origin'i gönderir. JSON/binary resource transport ortak 401 refresh ve generation kontrolü kullanır. Cache yalnız GET'tir; transient retry coordinator aynı kullanıcı işleminin idempotency key'ini korur.

Core listeler cursor ile devam eder; relation/project/activity/finance alt listeleri cursor collector kullanır. Project asset binary download `/api/v1/files/:id` ile aynı backend FileService scope'una bağlanır. Project PDF/10 MiB, image sanitize, native cache/share/cleanup ve owner logout kodda mevcuttur. Portal formları client rolüyle, owner formları freelancer rolüyle açılır; belirsiz root redirect döngüleri kaldırıldı.

Denetim ve kanıt sınırı [[docs/mobile/mobile-phase-2-5-audit]] içindedir. [[assets-pipeline/indeks|UI assets pipeline]] yalnız tasarım arşivi/capture altyapısıdır; mobil runtime vault'tan asset import etmez. Yeni görsel tasarım en son gelir.

## Mevcut teknoloji

Expo SDK 57, React Native 0.86, React 19, Expo Router, SecureStore, AsyncStorage ve platform-neutral Neta packages kullanılır. Route ağacı public, owner, portal ve modal form gruplarına ayrılmıştır.

## Bugünkü bootstrap

1. App config production/preview için origin'i opsiyonel tutar; development/fork değeri yalnız ilk açılış default'udur.
2. Kullanıcı domain veya secret-free `neta://connect` QR ile instance'ı keşfeder ve metadata'yı görerek onaylar.
3. Discovery/health/meta/catalog aynı-origin ve instance ID kontrollerinden geçer.
4. Login Better Auth email endpoint'ine gider.
5. Better Auth cookie materyali `instanceId` namespace'iyle SecureStore'a yazılır; eski bearer materyali okunmaz ve girişte temizlenir.
6. `/api/v1/me` role göre owner veya portal shell'i açar.
7. Resource read cache instance'a göre izole edilir.

## Mevcut ürün modeli

Tek resmî binary farklı self-hosted instance'lara runtime'da bağlanabilir. UI ilk sürümde tek aktif instance sunar; registry, auth ve cache `instanceId` ile ayrışır. Connect QR secret taşımaz ve device pairing değildir.

## Aktif hedef mimari

Platform roadmap'ın hedefi App Store/Play Store'da tek Neta binary'sidir. Bugünkü connect QR yalnız origin taşır; ayrı pairing QR'ı `origin + secret` taşır. Instance-owned hesaplar ve merkezi resolver olmadan bağlantı kodda vardır. Store kabulü signed cihaz ve iki canlı HTTPS instance kanıtını bekler.

```mermaid
stateDiagram-v2
  [*] --> DomainGirisi
  DomainGirisi --> Discovery
  Discovery --> Giris: instance doğrulandı
  Giris --> OwnerShell: freelancer
  Giris --> PortalShell: client
  Discovery --> Hata: TLS/ID/version uyumsuz
```

## Contract katmanı

`@neta/api-contracts` JSON-safe DTO, runtime guard, capability ve fixture; `@neta/design-tokens` semantic tema üretir. Mobil ve backend bootstrap ile owner resource sözleşmelerini ortak paketten tüketir. Capability-gated navigasyon, server'ın yayınlamadığı planlanan yüzeyleri gizler.

## Backend bağımlılığı

Owner read dilimi dashboard, müşteri, proje/plan/revizyon, görev ve takvim için; mutation dilimi client/project/task/calendar için mevcuttur. Finans, günlük, hesap/session, marka/locale/AI ayarları ve dosya/proje asset owner parity'si de `/api/v1` üzerinden çalışır. Mobil shared guard, capability, targeted invalidation ve instance-scoped cache kullanır. Client portal v1 read/revision/profile istemcisi de backend route'larına bağlanır.

## Güvenlik

Production HTTPS, same-origin discovery URL, minimum version, instance ID ve instance-scoped SecureStore vardır. İlk auth transport'u Better Auth cookie'dir; owner için pairing access/refresh bearer yolu ayrıca kodda bulunur. Backend restore token epoch rotation'ı uygular. İki canlı instance izolasyonu ile pairing/revoke/restore gerçek cihaz kabulü bekler.

2026-09-16 otomatik güvenlik kabulü historical refresh digest/reuse, explicit device scope, Bearer → cookie fallback reddi, native profil/parola ve iki gerçek client session'ının negatif HTTP/file izolasyonunu doğrular. Native auth generation ve storage write sırası, logout/new-login sonrası eski ağ sonucunun credential diriltmesini engeller. İzole restore DB kontrolü signed/native restore kanıtı değildir; [[docs/mobile/mobile-security-acceptance]] açık kabul ve tasarım farklarını listeler.

MOB-2–5 denetiminde native auth taşıması Expo fetch + `credentials: omit` ile scoped SecureStore Cookie/Bearer'a bağlandı; işletim sisteminin örtük cookie deposu kullanılmaz. Sign-in `/me` ID eşleşmesi, flat actor binding ve provider operasyon epoch'u yanlış hesap/geç kalan UI sonucunu reddeder. File/appearance multipart upload aynı generation-aware wrapper'ı, redirect reddini ve gerçek dosya boyutunu kullanır; byte acknowledgement olmayan yüklemede sahte yüzde gösterilmez. Hesap self-service `/me/profile`, `/me/password`, `/me/sessions` yalnız çağıranın user ID'sinde owner/client için ortaktır; workspace ayarları owner-only kalır. Portal logout veri yüklemesinden bağımsızdır. Canonical ayrıntı: [[docs/mobile/mobile-phase-2-5-audit]].

Versioned file, appearance, portal asset ve davet URL'leri canonical `APP_URL` kaynağından üretilir; Next standalone'ın proxy arkasındaki iç `request.url` origin'i dış adres authority'si değildir. Cookie sign-out JSON başlığıyla boş JSON nesnesi gönderir; lokal credential/cache temizliği finally'dedir.

## Kaynaklar

- `apps/neta-mobile/README.md`
- `apps/neta-mobile/src/providers/session-provider.tsx`
- `apps/neta-mobile/src/lib/instance/discovery.ts`
- [[docs/roadmaps/platform-master-plan]]

Uygulama sırası ve release kapıları için [[09-yol-haritasi/mobil-uygulama-plani|mobil uygulama planına]] git.
