---
title: MOB-6/7 mobil güvenlik kabulü
status: automated-acceptance-native-open
last_updated: 2026-09-16
---

# MOB-6/7 mobil güvenlik kabulü

Pairing ve portal kodunun otomatik kabul kapısı:

```sh
pnpm mobile:security:check
```

Windows PowerShell execution policy `pnpm.ps1` dosyasını engelliyorsa `pnpm.cmd mobile:security:check` kullanılır. Execution policy değiştirmek gerekmez.

Komut, yedi backend migration/maintenance/replay testini, yalnız mobil güvenlik yüzeyini çalıştıran auth smoke'unu ve mobil unit testlerini çalıştırır. Backend yalnız `127.0.0.1` üzerinde, ayrı `.data/phase1-auth-smoke-*` veritabanı ve ayrı Next dist diziniyle açılır. Geliştiricinin veya production instance'ın veritabanı kullanılmaz. Test runtime'ı kapanır; izole veri/backup fixture'ları inceleme için kalır.

## Otomasyon kapsamı ve kanıt sınırı

| Alan | Kontrol | Kanıt |
|---|---|---|
| Challenge | Yanlış parola, üç pending sınırı, expired/locked/revoked, kaynak rate limit; bilinen locator'a farklı IP'lerden eşzamanlı yanlış QR/manual secret beşte kilitlenir, doğru secret da reddedilir, bağımsız challenge korunur | Gerçek HTTP ve kalıcı attempt counter; süre/durum negatiflerinde fixture SQL |
| Exchange | QR ve normalize manuel kod; eşzamanlı exchange'de tek başarı | Gerçek HTTP ve SQLite transaction |
| Auth sınırı | Geçersiz/revoked Bearer + geçerli cookie reddedilir; cookie-only çalışır | Gerçek HTTP |
| Scope | İzinli read, eksik write/read/settings yetkisi, owner → portal reddi | Gerçek HTTP; kısıtlı scope fixture SQL |
| Rotation | Üç rotasyondan sonra ilk token reuse; eski access iptali; bağımsız family korunur | Gerçek HTTP ve digest geçmişi |
| Refresh yarışı | Aynı token/nonce için iki başarı ve birebir aynı pair, tek rotation/history; farklı nonce veya legacy nonce'sız tekrar family compromise | Gerçek HTTP ve SQLite/audit kontrolü |
| Replay negatifleri | Grace expiry, successor supersession, ciphertext corruption, disabled/epoch-invalid family; bağımsız family korunur | Gerçek HTTP; expiry/ciphertext negatiflerinde fixture SQL |
| Kalıcı replay | SQLite kapat/aç sonrası decrypt; cihaz/epoch/digest/nonce/expiry/key/ciphertext değişimi reddi; tam expiry sınırı; plaintext yokluğu ve FK cascade | Gerçek disk SQLite ve AES-256-GCM unit testleri |
| Lifecycle | Access/refresh expiry, 30 gün idle, disabled owner, epoch, tek cihaz revoke, logout-all; refresh lifetime bitince access de reddedilir | Gerçek HTTP; expiry/idle/disable/epoch fixture SQL |
| Hesap parity | Cookie olmadan Bearer profil/parola değişimi; yanlış parola; web/device iptali | Gerçek HTTP; yeni parola Better Auth sign-in ile doğrulanır |
| Backup/restore | Gerçek backup ve yeni hedefe restore; epoch/digest SQLite kontrolü; ikinci backend eski access/refresh'i reddeder, geçerli cookie'ye fallback yapmaz; owner login ve fresh pairing çalışır; kaynak DB korunur | Restore edilmiş SQLite ve ayrı loopback Next backend; signed/native veya canlı HTTPS kanıtı değildir |
| Maintenance | Başlangıç ve saatlik timer; expiry/idle sınırı, 500 kayıtlık partiler, retention/cascade, aktif family geçmişi ve periyodik hata retry | Gerçek migration'larla in-memory SQLite unit testleri; standalone production startup smoke'u expiry işinin readiness'den önce çalıştığını doğrular |
| Portal | İki davetli gerçek client session'ı; karşılıklı ID/filter/revision/profile/owner-route negatifleri | Gerçek HTTP ve yan etki SQL kontrolü |
| Dosya | İzinli download, private/foreign/missing metadata ve download reddi; foreign delete varlık gizler | Gerçek HTTP, dosya kaydı korunur |
| V1 dosya | Cookie olmadan owner Bearer image/PDF upload-download, aynı-key replay, farklı-payload conflict, forged PDF ve scope/invalid Bearer negatifleri; iki client için legacy ve v1 read negatifleri | Gerçek HTTP ve byte/MIME kontrolü |
| Secret/audit | Raw pairing secret/code/access/refresh DB, WAL ve tüm test server log'unda bulunmaz; audit tipleri vardır | İzole runtime taraması |
| Mobil yarış | Instance başına single-flight; response loss/restart aynı SecureStore nonce'sıyla retry; ağ/server hatasında credential korunur, auth rejection temizler; logout/geç response yeni login'i bozamaz | Platformdan bağımsız unit; gerçek Keychain/Keystore kanıtı değildir |

## 0016 yükseltme davranışı

`0016_device-refresh-history.sql`, tüketilmiş refresh token'ların keyed digest geçmişini ekler. Önceki sürümün `previous_refresh_digest` alanı backfill edilir. Daha eski tüketilmiş token özetleri önceki kodda silindiği için geri üretilemez; migration mevcut aktif **cihaz** oturumlarını iptal eder. Bu cihazlar güncellemeden sonra yeniden eşleştirilir. Web cookie oturumları bu migration tarafından değiştirilmez.

Yeni aktif family'lerde her başarılı rotasyon tüketilmiş digest'i aynı transaction içinde kaydeder. Geçmiş session silinene kadar korunur ve foreign-key cascade ile silinir; raw token saklanmaz. Eski `previous_refresh_digest` alanı uyumluluk için korunur. Production upgrade öncesi backup alınır; normal startup migration yolu kullanılır.

## 0017 ve nonce-bound grace

`0017_device-pairing-replay.sql`, public locator digest'i ve şifreli replay tablosunu ekler. Yalnız locator'sız eski pending challenge'lar iptal edilir; mevcut cihaz/web oturumları ve tüketilmiş digest geçmişi korunur. Manuel kod artık sekiz karakter public locator + tire + 10 karakter secret'tır; QR secret da aynı locator'ı opaque credential içinde taşır. Eski pending kod yeniden üretilir.

İstekten önce SecureStore'a yazılan kriptografik `requestId`, tüketilmiş token için 30 saniyelik replay'i seçer. Aynı nonce ve hâlâ güncel successor birebir aynı yanıtı alır. Farklı nonce, legacy nonce'sız tekrar, grace expiry, supersession veya bozuk ciphertext aktif family'yi kapatır; ikinci aktif token oluşmaz. Mobil timeout 10 saniyedir; hemen retry grace'e sığar, uzun kesinti sonrasında yeniden pairing gerekebilir. Nonce device-bound proof değildir. Yeni `expo-crypto` native bağımlılığı development client'ın yeniden derlenmesini gerektirir.

Yanıt AES-256-GCM ile server secret'tan domain-separated türetilen anahtarla şifrelenir; AAD cihaz, epoch, consumed/request/successor digest ve expiry'yi bağlar. DB/WAL/log taraması plaintext token içermediğini doğrular. Restore epoch rotation replay satırlarını da atomik siler.

## Cihaz oturumu temizliği

`instrumentation.ts` Node runtime başlangıcında `device-maintenance.ts` işini çalıştırır; tek timer saatlik tekrarlar ve process'i açık tutmaz. Build sırasında çalışmaz. Startup hatası runtime açılışını durdurur; periyodik hata credential/SQL detayı olmadan raporlanır ve sonraki saat tekrar denenir. Request handler'ları toplu temizlik çalıştırmaz.

Refresh lifetime sona eren veya 30 gün kullanılmayan aktif session `expired` olur. Access ve refresh doğrulamaları aynı sınırı temizlik saatini beklemeden uygular. `revoked_at`, expiry/idle sınırının zamanıdır. Expired/revoked/compromised session kapanışından 30 gün sonra silinir; keyed digest geçmişi foreign-key cascade ile gider. Aktif family'nin geçmişi yaşına bakılmadan korunur. Kapanış zamanı bilinmeyen legacy kayıt otomatik silinmez. Challenge'lar expiry'den bir gün sonra temizlenir; auth audit kayıtları bu iş tarafından silinmez.

Kapalı/expired/epoch-invalid bir family'de historical refresh reuse, kapanış durumunu veya `revoked_at` zamanını değiştirmeden `401` verir. Böylece eski token tekrarları retention zamanını uzatamaz. Aktif geçerli family'deki nonce-bound grace dışı reuse compromise politikasını uygular.

Her tur expiry, session delete, challenge delete ve replay delete için ayrı ayrı en fazla 500 kayıt işler; kalan backlog sonraki saat ilerler. İş tek immediate transaction'dır. Expired/kapalı replay kaydı temizlenir; ciphertext normalde sonraki saatlik turda, backlog varsa sonraki turlarda fiziksel silinir. 30 saniyelik kullanım sınırı cleanup saatini beklemez. Rotasyon/revoke/restore replay'i hemen siler. Lifecycle `expired` status'u ayrıca migration gerektirmez; replay/locator şeması 0017 ile eklenir.

Restore HTTP turu backup anında aktif, backup sonrasında iptal edilmiş, daha önce iptal edilmiş ve compromised tokenları kullanır. Geri yüklenen backend'e eski refresh ve access ile yapılan istekler `401` döner; restore sonrası yeni pairing normal çalışır. Bu tur yalnız sentetik, ayrı loopback DB/runtime üzerinde yürür.

Standalone startup ayrıca `pnpm --filter @neta/app mobile:maintenance:runtime --fixture "<auth-smoke restore fixture yolu>" --dist .next` ile doğrulanır. Önce production standalone artifact ve `mobile:security:check` fixture'ı üretilmelidir. Runner yalnız `.data/phase1-auth-smoke-<timestamp>/restored-security-fixture` hedefini kabul eder; developer/production DB hedefini reddeder. Geçici expired session/history ekler, production backend açılışı ve readiness sonrası gerçek SQL durumunu kontrol eder; kendi fixture kaydını sonunda cascade ile kaldırır. 2026-09-16 doğrulamasında ayrı `.next-device-maintenance-build` artifact'i kullanıldı; normal geliştirici build dizini korunmuştur. Bu loopback standalone test signed native veya canlı HTTPS kabulü değildir.

## Açık kabul maddeleri

Ek ortak dosya regresyonu `pnpm --filter @neta/app phase3:storage-smoke --authorization-only` ile çalışır. Bu açık kapsam, upload/read/delete/avatar/branding/path-validation kontrollerini çalıştırır; ayrı privileged symlink senaryosunu çalıştırmaz. Tam `phase3:storage-smoke` bu Windows makinesinde symlink oluşturma `EPERM` hatasına takılır; symlink güvenlik kabulü geçmiş sayılmaz. Linux veya symlink yetkili Windows ortamında tam smoke ayrıca gerekir.

Bu otomasyon `mobile-v1` veya store readiness'i açmaz. Aşağıdaki kanıtlar ayrıca gerekir:

- Signed iOS/Android gerçek cihazda connect, pairing, cookie login, refresh, logout, parola, revoke ve restore.
- Aynı binary ile iki bağımsız canlı HTTPS instance ve credential/cache/deep-link izolasyonu.
- Restore edilmiş backend'e signed/native eski token negatifleri ve canlı HTTPS production-like migration/restore matrisi. Sentetik loopback HTTP kabulü otomasyonda yer alır.
- Gerçek dosyalarda native picker/download/share ve client portal negatifleri.
- Native binary download/share ve versioned Bearer transport kodda uygulanmıştır; HTTP kabulü geçer. Signed gerçek cihazda picker/share/redirect/temizleme ve Bearer session ile bütünleşik kabul ayrıca gerekir. Legacy `/api/files` cookie yüzeyi korunur.
- Release compatibility, privacy/support/store ve incident/upgrade/rollback runbook'ları.

Canonical tasarım: [ADR-0018](../self-hosted-redesign/adr-0018-device-pairing.md). Çalışma sırası: [platform planı](../roadmaps/platform-master-plan.md).
