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

Komut, migration testini, yalnız mobil güvenlik yüzeyini çalıştıran auth smoke'unu ve mobil unit testlerini çalıştırır. Backend yalnız `127.0.0.1` üzerinde, ayrı `.data/phase1-auth-smoke-*` veritabanı ve ayrı Next dist diziniyle açılır. Geliştiricinin veya production instance'ın veritabanı kullanılmaz. Test runtime'ı kapanır; izole veri/backup fixture'ları inceleme için kalır.

## Otomasyon kapsamı ve kanıt sınırı

| Alan | Kontrol | Kanıt |
|---|---|---|
| Challenge | Yanlış parola, üç pending sınırı, expired/locked/revoked, kaynak rate limit | Gerçek HTTP; süre/durum negatiflerinde fixture SQL |
| Exchange | QR ve normalize manuel kod; eşzamanlı exchange'de tek başarı | Gerçek HTTP ve SQLite transaction |
| Auth sınırı | Geçersiz/revoked Bearer + geçerli cookie reddedilir; cookie-only çalışır | Gerçek HTTP |
| Scope | İzinli read, eksik write/read/settings yetkisi, owner → portal reddi | Gerçek HTTP; kısıtlı scope fixture SQL |
| Rotation | Üç rotasyondan sonra ilk token reuse; eski access iptali; bağımsız family korunur | Gerçek HTTP ve digest geçmişi |
| Refresh yarışı | Aynı refresh token için bir başarı, bir ret; family compromise | Gerçek HTTP; mevcut katı tekrar kullanım politikası |
| Lifecycle | Access/refresh expiry, disabled owner, epoch, tek cihaz revoke, logout-all | Gerçek HTTP; expiry/disable/epoch fixture SQL |
| Hesap parity | Cookie olmadan Bearer profil/parola değişimi; yanlış parola; web/device iptali | Gerçek HTTP; yeni parola Better Auth sign-in ile doğrulanır |
| Backup/restore | Gerçek backup ve yeni hedefe restore; epoch değişir, aktif session kalmaz, digest kanıtı korunur | Restore edilmiş SQLite; restore runtime'ına HTTP yapılmaz |
| Portal | İki davetli gerçek client session'ı; karşılıklı ID/filter/revision/profile/owner-route negatifleri | Gerçek HTTP ve yan etki SQL kontrolü |
| Dosya | İzinli download, private/foreign/missing metadata ve download reddi; foreign delete varlık gizler | Gerçek HTTP, dosya kaydı korunur |
| V1 dosya | Cookie olmadan owner Bearer image/PDF upload-download, aynı-key replay, farklı-payload conflict, forged PDF ve scope/invalid Bearer negatifleri; iki client için legacy ve v1 read negatifleri | Gerçek HTTP ve byte/MIME kontrolü |
| Secret/audit | Raw pairing secret/code/access/refresh DB, WAL ve tüm test server log'unda bulunmaz; audit tipleri vardır | İzole runtime taraması |
| Mobil yarış | Instance başına single-flight; geç refresh ve başlamış storage write logout sonrası token diriltemez; yeni login korunur | Platformdan bağımsız unit; gerçek Keychain/Keystore kanıtı değildir |

## 0016 yükseltme davranışı

`0016_device-refresh-history.sql`, tüketilmiş refresh token'ların keyed digest geçmişini ekler. Önceki sürümün `previous_refresh_digest` alanı backfill edilir. Daha eski tüketilmiş token özetleri önceki kodda silindiği için geri üretilemez; migration mevcut aktif **cihaz** oturumlarını iptal eder. Bu cihazlar güncellemeden sonra yeniden eşleştirilir. Web cookie oturumları bu migration tarafından değiştirilmez.

Yeni aktif family'lerde her başarılı rotasyon tüketilmiş digest'i aynı transaction içinde kaydeder. Geçmiş session silinene kadar korunur ve foreign-key cascade ile silinir; raw token saklanmaz. Eski `previous_refresh_digest` alanı uyumluluk için korunur. Production upgrade öncesi backup alınır; normal startup migration yolu kullanılır.

## Açık kabul maddeleri

Ek ortak dosya regresyonu `pnpm --filter @neta/app phase3:storage-smoke --authorization-only` ile çalışır. Bu açık kapsam, upload/read/delete/avatar/branding/path-validation kontrollerini çalıştırır; ayrı privileged symlink senaryosunu çalıştırmaz. Tam `phase3:storage-smoke` bu Windows makinesinde symlink oluşturma `EPERM` hatasına takılır; symlink güvenlik kabulü geçmiş sayılmaz. Linux veya symlink yetkili Windows ortamında tam smoke ayrıca gerekir.

Bu otomasyon `mobile-v1` veya store readiness'i açmaz. Aşağıdaki kanıtlar ayrıca gerekir:

- Signed iOS/Android gerçek cihazda connect, pairing, cookie login, refresh, logout, parola, revoke ve restore.
- Aynı binary ile iki bağımsız canlı HTTPS instance ve credential/cache/deep-link izolasyonu.
- Restore edilmiş backend'e gerçek eski tokenlarla HTTP/native negatifleri; production-like migration/restore matrisi.
- Gerçek dosyalarda native picker/download/share ve client portal negatifleri.
- ADR-0018'in tasarladığı refresh grace/replay, challenge'a bağlı yanlış kod deneme sayacı ve expired session/history cleanup'ının kod farkları. Mevcut refresh yarışı grace sağlamaz; duplicate token family'yi kapatır. Bilinmeyen kod challenge belirlemez; kaynak rate limit'i çalışır, challenge başına yanlış kod kabulü henüz kanıtlanmaz.
- Native binary download/share ve versioned Bearer transport kodda uygulanmıştır; HTTP kabulü geçer. Signed gerçek cihazda picker/share/redirect/temizleme ve Bearer session ile bütünleşik kabul ayrıca gerekir. Legacy `/api/files` cookie yüzeyi korunur.
- Release compatibility, privacy/support/store ve incident/upgrade/rollback runbook'ları.

Canonical tasarım: [ADR-0018](../self-hosted-redesign/adr-0018-device-pairing.md). Çalışma sırası: [platform planı](../roadmaps/platform-master-plan.md).
