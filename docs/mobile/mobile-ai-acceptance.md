---
title: MOB-8 mobil AI taşıması ve kabulü
status: automated-acceptance-native-provider-open
last_updated: 2026-09-17
---

# MOB-8 mobil AI taşıması

Canonical backend `apps/neta-app` içinde mevcut domain service, context builder ve provider adapter kullanılır. Mobil için ayrı backend yoktur. `ai.assistant.v1` route capability'si available'dır; `mobile-v1` ve signed/store kabulü bundan bağımsızdır. Provider ayarı eksikse transport mevcuttur, çağrı kararlı validation hatası verir.

## HTTP sözleşmesi

| Route | Davranış |
|---|---|
| `GET /api/v1/chat/sessions` | Owner-scoped, cursor/limit paginated session DTO; private/no-store |
| `POST /api/v1/chat/sessions` | Strict optional title, Idempotency-Key, 201 session DTO |
| `DELETE /api/v1/chat/sessions/:id` | Owner-scope domain delete; mesajlar FK cascade ile silinir |
| `GET /api/v1/chat/sessions/:id/messages` | User/assistant DTO'ları, cursor/limit pagination |
| `POST /api/v1/chat/sessions/:id/messages` | Strict `{content, sourceLocale}`, Idempotency-Key; NDJSON stream |
| `POST /api/v1/projects/:id/risk-analysis` | Strict boş body, Idempotency-Key; structured riskLevel/summary/recommendations/projectId/generatedAt |
| `POST /api/v1/finance/analysis` | Strict `{month: YYYY-MM}`, Idempotency-Key; structured summary/recommendations/disclaimer/generatedAt |

NDJSON event'leri shared `ChatStreamEvent` guard'ını kullanır: `message.delta`, kalıcı assistant DTO taşıyan `message.completed` ve privacy-safe `error`. Stream HTTP 200 başladıktan sonra upstream hatası event ile bildirilir; başlangıç/auth/validation hataları v1 JSON envelope ve doğru HTTP status'u döndürür. V1, nosniff, no-store ve proxy buffering kapatma header'ları vardır.

Input gerçek body reader üzerinden 32 KiB ile sınırlandırılır; yalnız Content-Length'e güvenilmez. Chat content 8.000, assistant output 100.000 karakter; context 16.000 karakter, history son 40 conversation mesajı, output chat 8.192/analysis 4.096 token ile sınırlıdır. Structured sonuç Zod/AI SDK Output.object ile doğrulanır; bozuk provider output'u 502 verir. GET query'leri strict'tir; non-GET yalnız locale query'sini kabul eder. Locale public aktif katalogla doğrulanır.

## Yetki ve privacy

Owner cookie ve explicit Bearer desteklenir; client 403, eksik/revoked token 401 alır. Invalid Bearer geçerli cookie'ye fallback yapmaz. Chat, bağlamdaki clients/projects/tasks/finance/journal read scope'larının tamamını; GET için settings:read, mutation için settings:write ister. Risk settings/projects/tasks/clients read; finance settings/finance read ister. Salt write scope özel veriyi provider'a gönderme yetkisi değildir. Stream/analysis tamamlanmadan auth yeniden doğrulanır; revoke/disable sonrası assistant kalıcılaştırılmaz.

Provider key mobil DTO'ya gönderilmez. Prompt/context seçilen instance provider'ına gider; journal note da mevcut chat context'inin parçasıdır. Ayrı provider egress/redaction/opt-in iyileştirmeleri tamamlanmış sayılmaz. SDK stream onError log'u susturulur, normalizeAiError raw error/request/prompt/key gövdesi loglamaz. Notifications/telemetry'ye özel içerik eklenmedi.

Finans ay filtresi provider context'inde uygulanır. Para birimleri ayrı gruplanır; minor-unit conversion currency fraction digits ile, toplamlar BigInt ile hesaplanır. En fazla 200 işlem detayı paylaşılır; toplamlar seçili aralığın bütün kayıtlarını kapsar ve detay sınırı prompt'ta belirtilir. Son context boyut sınırı yine uygulanır. Veri yoksa provider çağrılmadan kararlı boş analiz döner.

## Kalıcı retry ve iptal

`server/ai/operations.ts`, mevcut api_idempotency_records tablosunda actor/method/route/key kapsamlı pending/failed/completed envelope tutar; yeni migration gerekmez. Normalize edilmiş payload hash'i farklı payload reuse'u 409 yapar. Aynı iş devam ederken 409, tamamlanmış sonuçta provider'a tekrar gitmeden aynı DTO replay edilir. Owner başına en fazla üç aktif lease vardır; dördüncü çağrı 503 alır.

Provider I/O transaction dışında çalışır. Pending claim ve ilk kullanıcı mesajı kısa immediate transaction içinde, assistant + completed yanıtı başka bir immediate transaction içinde atomiktir. Kullanıcı mesaj ID'si scope/key'den deterministik türetilir; failed retry aynı mesajı kullanır. Lease server timeout + 30 saniyedir; crash sonrası expiry ile devralınabilir. Eski lease'in geç completion/failure yazısı yeni denemeyi bozamaz. Failed/expired denemede provider tekrar çağrılabilir ve maliyet oluşabilir; upstream seviyesinde exactly-once garantisi yoktur. Replay kayıtları ortak yedi günlük opportunistic retention'a tabidir; key yeni kullanıcı niyetinde yeniden kullanılmaz.

Request disconnect/cancel ve server timeout provider abortSignal'ına bağlanır; kısmi assistant kalıcılaştırılmaz. Mobil requestId yerine chat Idempotency-Key'i aynı session'a bağlı saklar, yeni niyette yeni key üretir. Native streaming ortak origin/actor/generation/refresh auth yolunu, credentials=omit ve redirect reddini kullanır. Reader UTF-8 chunk sınırlarını korur, 512 KiB sınırı uygular, terminal acknowledgement olmadan başarı üretmez; logout/account değişiminden sonra chunk'ı reddeder ve cancel/failure'da lock'u bırakır. HTTP/ekran timeout'u 45 saniyedir; server timeout 1–120 saniye konfigüre edilebilir, uzun ayarda mobil erken iptal edebilir. Stop sonrası eski işlem kapanmadan yeni send açılmaz; farklı session'a retry gönderilmez. Chat listeleri bütün cursor sayfalarını takip eder ve diske cache yazılmaz.

Ollama OpenAI-compatible `/chat/completions` adapter'ını kullanır; OpenAI provider'ın Responses yolu korunur. Legacy web `/api/chat`, `/api/project-risk`, `/api/finance-analysis` sözleşmeleri korunur; ortak context/provider düzeltmelerinden yararlanır.

## Otomatik kabul

```sh
pnpm mobile:ai:check
pnpm contract:check
```

Windows'ta pnpm.cmd kullanılabilir. AI gate dört lease/idempotency/transaction/concurrency unit testini ve gerçek Next HTTP runtime'ını çalıştırır. Backend yalnız loopback'te, ayrı `.data/mobile-ai-smoke-*` DB ve ayrı Next dist kullanır; bütün provider çağrıları sentetik OpenAI-compatible loopback fixture'a gider. Gerçek key, geliştirici DB'si ve ücretli provider kullanılmaz. Runtime kapanır, config restore edilir, dist temizlenir; sentetik DB inceleme için kalır.

HTTP matrisi chat persistence/replay/pagination, selected-month ve JPY finance, structured risk, provider 429 privacy, bozuk structured output, timeout/cancel, retry'da tek user message, owner/foreign/client/Bearer/scope/invalid-cookie-fallback ve capability davranışını doğrular. Stream sırasında revoke fixture SQL ile uygulanır; sonuç kalıcılaştırılmaz ve replay 401 olur. Mobil unit'ler split UTF-8/emoji, stale auth, blocked-read cancel, eksik completion ve private error mesajı reddini doğrular.

2026-09-17 doğrulaması: dört operation unit testi ve HTTP matrisi, 138 mobil test, shared contract/presenter ve iki consumer TypeScript kontrolü, API boundary, legacy web AI boundary, hedef backend lint ve mobil lint geçti. İzole Next production build ve Android JS/Hermes production export’u başarılıdır. Bu çıktılar signed native binary veya gerçek provider kabulü değildir.

## Açık release kabulü

- Signed iOS/Android gerçek cihazda Keychain/Keystore, NDJSON/cancel/retry ve gerçek provider kabulü.
- İki canlı HTTPS instance ile AI credential/cache/generation ve proxy streaming davranışı.
- Production-like provider/model compatibility ve maliyet/egress/key rotation runbook'u; fixture gerçek model kalitesini kanıtlamaz.
- Self-hosted push/notification relay, opt-in ve payload privacy için ayrı ADR. Push capability açılmadı; offline mutation queue kapsam dışıdır.

Kaynak: [mobil plan](../../bilgi/09-yol-haritasi/mobil-uygulama-plani.md), [güvenlik kabulü](mobile-security-acceptance.md).
