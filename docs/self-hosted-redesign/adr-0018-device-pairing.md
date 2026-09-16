---
title: ADR-0018 — Mobil Device Pairing ve Token Lifecycle
status: implementation-pending-security-acceptance
date: 2026-07-17
last_updated: 2026-09-16
---

# ADR-0018 — Mobil device pairing ve token lifecycle

## Bağlam

React Native istemcisi kullanıcı tarafından girilen self-hosted Neta URL'sine bağlanacak. Web session cookie'sini kopyalamak, uzun ömürlü API key vermek veya owner şifresini cihazda sürekli saklamak güvenli bir pairing modeli değildir.

Faz 9 yalnızca discovery ve API v1 temelini yayınlamıştı. 2026-09-15 çalışma ağacında pairing schema/route ve mobil transport kodu eklendi; bu tasarımın güvenlik kabulü ayrı doğrulanmalıdır.

## Karar

İlk device pairing sürümü owner cihazları için tek kullanımlık, kısa ömürlü bir pairing challenge ve DB-backed opaque token modeli kullanacaktır.

Kodda kullanılan endpoint'ler:

```text
POST   /api/v1/pairing/challenges
POST   /api/v1/pairing/exchange
POST   /api/v1/device-sessions/refresh
GET    /api/v1/device-sessions
DELETE /api/v1/device-sessions/:id
```

### Pairing oluşturma

- Yalnızca aktif freelancer session'ı pairing oluşturabilir.
- Browser owner'dan güncel şifre veya eşdeğer step-up doğrulaması istenir.
- QR credential'ı `LOCATOR.<256-bit-secret>`, manuel kod `LOCATOR-<10-karakter-secret>` biçimindedir. Locator sekiz rastgele Crockford Base32 karakterden oluşan public challenge kimliğidir; secret değildir. Manuel secret'ın 10 karakterlik gücü korunur; kod toplam 19 karakter gösterilir.
- DB'de yalnızca HMAC/SHA-256 digest saklanır; raw secret yalnızca bir kez gösterilir.
- Challenge en fazla 5 dakika geçerlidir ve tek kullanımlıdır.
- Challenge; creator, expiry, attempt count, requested scopes ve durum içerir.
- Aynı owner için en fazla üç aktif challenge bulunabilir.
- Beş başarısız deneme challenge'ı kilitler.
- Oluşturma ve exchange IP/instance seviyesinde rate limit ve auth audit event üretir.

### Exchange

Mobil istemci şu bilgileri gönderir:

- Pairing secret/code
- Cihazda üretilmiş opaque install ID
- Kullanıcının verdiği device name
- Platform (`ios`/`android`)
- App version
- OS version'ın hassas olmayan major bilgisi

Server challenge'ı locator digest'iyle bulur ve credential digest'ini timing-safe karşılaştırmayla `BEGIN IMMEDIATE` transaction içinde doğrular ve tüketir. Aynı transaction device session/token family kaydını oluşturur. Geçerli pending challenge için yanlış QR/manual secret aynı kalıcı sayacı artırır; farklı IP'lerden eşzamanlı denemeler de beşte kilitlenir. Bilinmeyen locator kaynak rate limit'ine tabidir. Expired/consumed/locked/unknown ve yanlış secret aynı `401` envelope'unu döndürür.

Owner role/scopeları server tarafından atanır. İstemci owner/user ID veya scope seçemez.

### Token modeli

- Tokenlar JWT değil, 256-bit opaque random bearer değerleridir.
- Kalıcı doğrulama kayıtları keyed digest'tir. Grace için cihaz başına en fazla bir token-pair yanıtı AES-256-GCM ile şifrelenmiş olarak ayrıca saklanır; plaintext token DB/log/audit'e yazılmaz.
- Access token varsayılan 15 dakika geçerlidir.
- Refresh token varsayılan 30 gün geçerlidir.
- Her refresh işleminde access ve refresh token birlikte rotate edilir.
- Eski refresh token yeniden kullanılırsa token family `compromised` olur ve family içindeki tüm tokenlar atomik revoke edilir.
- Mobil, kriptografik rastgele `requestId` değerini istekten önce instance-scoped SecureStore'a yazar. Aynı tüketilmiş token + aynı requestId, rotasyondan itibaren 30 saniye içinde ve successor hâlâ güncelse birebir aynı yanıtı alır; ikinci rotation/history kaydı oluşmaz. Ağ hatasında pending işlem korunur, logout'ta silinir. 30 saniye sonrasındaki tekrar yeniden pairing gerektirebilir.
- Şifreli replay; cihaz, epoch, consumed digest, request digest, successor digest ve expiry'ye authenticated additional data ile bağlıdır. Kapalı/disabled/expired/epoch-invalid session replay alamaz. Farklı requestId, requestId'siz legacy tekrar, grace expiry, superseded successor veya bozuk ciphertext aktif family'yi atomik `compromised` yapar. RequestId device-bound proof değildir; ilk sürüm bearer modeli olarak kalır.
- Replay expiry request sırasında anında uygulanır. Rotasyon/revoke/restore kaydı siler; startup/saatlik bounded maintenance expired/kapalı replay'leri temizler. Ciphertext, cleanup backlog'u varsa sonraki turlara kadar DB'de kalabilir; expiry sonrasında kullanılamaz.
- Bearer token yalnızca `Authorization: Bearer` header'ında kabul edilir; query, URL veya log'a yazılmaz.
- Raw tokenlar API response dışında hiçbir log/audit kaydına girmez.
- React Native tokenları iOS Keychain/Android Keystore destekli secure storage'da tutar.
- İlk sürüm bearer modelidir. Device-bound public key/DPoP ayrı ADR olmadan eklenmez.

### Scope

İlk pairing yalnızca freelancer cihazı içindir. Token scope'ları explicit allowlist'tir:

```text
profile:read
clients:read
projects:read
tasks:read
calendar:read
finance:read
journal:read
```

Mutation scope'ları ilgili `/api/v1` resource endpoint'leri ve authorization testleri yayınlandıkça ayrı ayrı eklenir. `*` veya implicit admin scope kullanılmaz.

Client portal pairing'i owner pairing'inden ayrı ürün/güvenlik kararıdır; ilk implementasyona dahil değildir.

## Device token lifecycle

Durumlar:

```text
pending_pairing -> active -> expired
                         -> revoked
                         -> compromised
```

- `pending_pairing`: Challenge üretildi, token yok.
- `active`: Exchange tamamlandı ve token family kullanılabilir.
- `expired`: Refresh lifetime sona erdi.
- `revoked`: Owner, kullanıcı disable, şifre güvenlik olayı veya “tüm cihazlardan çıkış” nedeniyle kapatıldı.
- `compromised`: Refresh reuse veya güvenlik sinyali tespit edildi.

Kurallar:

- Owner dashboard'u cihaz adı, platform, oluşturulma, son kullanım ve yaklaşık IP bilgisini görür.
- Owner tek cihazı veya tüm cihazları revoke edebilir.
- Client/freelancer hesabı disable edildiğinde tüm device session'lar transaction içinde revoke edilir.
- Owner şifresi değiştiğinde varsayılan politika tüm device session'ları revoke etmektir.
- 30 gün kullanılmayan device session expire edilir.
- Son kullanım zamanı en fazla beş dakikada bir coalesce edilerek yazılır.
- Token cleanup job'u uygulama başlangıcında ve kontrollü periyotta expired kayıtları temizler; aktif request path'i toplu cleanup yapmaz.
- 2026-09-16 retention ayrıntısı: Node startup ve saatlik iş, her tabloda 500 kayıt sınırıyla expiry/30 gün idle session'ları `expired` işaretler. Kapalı session'lar kapanışından 30 gün, challenge'lar expiry'den bir gün sonra silinir. Aktif family'nin bütün tüketilmiş digest'leri korunur; kapalı session silinince cascade olur. Kapanış zamanı olmayan legacy session korunur; audit retention bu işin kapsamı dışındadır. Auth süresi/idle sınırı request doğrulamasında saatlik işi beklemeden uygulanır.

## Backup ve restore güvenliği

Eski DB backup'ı revoke edilmiş token kayıtlarını yeniden aktif hale getirebilir. Pairing implementasyonunun release blocker'ı:

1. `device_security_state` içinde bir device token epoch tutulur.
2. Bütün token digest doğrulamaları bu epoch'a bağlanır.
3. `db:restore` başarılı atomik swap sonrasında epoch'u yeni random değerle rotate eder.
4. Böylece restore tüm eski device tokenları otomatik geçersiz kılar.
5. Owner restore sonrasında cihazları yeniden pair eder.

Epoch rotation aynı transaction'da şifreli replay kayıtlarını da siler; tüketilmiş digest geçmişi korunur. `0017_device-pairing-replay.sql` replay tablosu ve locator digest'ini ekler, yalnız locator'sız eski pending challenge'ları iptal eder. Mevcut cihaz/web oturumları ve history korunur; eski pending kodlar yeniden oluşturulur.

Bu mekanizma uygulanmadan device token endpoint'leri yayınlanamaz.

## HTTPS ve transport

- Remote pairing, exchange, refresh ve authenticated API için HTTPS zorunludur.
- Reverse proxy `X-Forwarded-Proto`/canonical origin'i doğru iletmelidir.
- HTTP yalnızca loopback/emulator geliştirme ortamında kabul edilir ve production token üretmez.
- TLS sertifika hatası kullanıcı tarafından sessizce bypass edilemez.
- Discovery API origin değiştirirse mobil istemci kullanıcı onayı olmadan credential göndermez.

## Audit ve privacy

Audit event'leri:

- `pairing_created`
- `pairing_failed`
- `pairing_consumed`
- `device_session_refreshed`
- `device_session_refresh_replayed`
- `device_session_revoked`
- `device_token_reuse_detected`

Audit metadata raw token, pairing secret, tam IP geçmişi veya gereksiz device fingerprint içermez. Device name kullanıcı tarafından değiştirilebilir ve output-encode edilir.

## Güvenlik kabulü için zorunlu testler

- Pairing raw secret'ın DB/log'da bulunmaması
- Expired, consumed, locked ve brute-force challenge negatifleri
- Concurrent double exchange'de yalnızca bir başarı
- Owner/client role ve cross-owner negatifleri
- Access expiry ve refresh rotation
- Refresh reuse ile family revoke
- Disabled user ve password change revoke
- Restore sonrası token epoch invalidation
- HTTPS/loopback policy
- Tokenların URL, error ve audit output'una sızmaması

## Sonuç

Kodda `auth.device-pairing.v1` capability'si `available`, pairing/device-session route'ları, DB digest/token epoch ve mobil bearer refresh transport'u mevcuttur. Bu durum signed gerçek cihazda double exchange, reuse/revoke, restore ve tenant negatif kabulünün yerine geçmez. Tasarım ile kodun kalan farkları ve yukarıdaki güvenlik testleri mağaza yayını öncesinde kapatılmalıdır.

2026-09-16 otomasyonunda `device_refresh_history` ile her tüketilmiş keyed digest aynı rotation transaction'ında tutulur. 0016 migration önceki digest'i backfill eder ve daha eski geçmişi geri üretilemeyen mevcut aktif cihaz oturumlarını revoke ederek yeniden pairing gerektirir. Explicit device scope ve geçersiz Authorization header'ında cookie fallback reddi API sınırındadır. Disabled owner gözlendiğinde family'ler iptal edilir; Bearer profil/parola parity'si web cookie'sinden bağımsızdır. Native auth generation/write serialization, geç ağ sonucunun logout/new-login sonrası credential diriltmesini engeller.

`pnpm mobile:security:check` challenge başına yanlış secret kilidi/concurrent exchange, nonce-bound grace ve strict reuse negatifleri, revoke/logout-all/password, maintenance expiry/retention/cascade ve iki gerçek client session'ının karşılıklı HTTP/file negatiflerini doğrular. Gerçek backup'tan geri yüklenen ikinci loopback backend eski access/refresh'i reddeder; replay kayıtları temizlenir, yeni owner login/pairing çalışır ve kaynak family korunur. SQLite reopen ve ciphertext/AAD/key tamper unit testleri kalıcı replay sınırını doğrular. [Kabul matrisi](../mobile/mobile-security-acceptance.md) sentetik HTTP runtime kanıtını signed/live kanıttan ayırır. Grace/replay ve challenge deneme bağlama kod farkları kapandı. Signed gerçek cihaz ve iki canlı HTTPS instance kabulü açıktır.
