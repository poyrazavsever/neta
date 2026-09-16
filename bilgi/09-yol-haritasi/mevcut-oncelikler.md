---
tur: yol-haritasi
durum: planlanan
guncellendi: 2026-09-16
guven: yuksek
kaynaklar:
  - docs/roadmaps/platform-master-plan.md
  - docs/neta-backend-mobile-api-master-plan.md
ilgili:
  - "[[00-sistem/acik-sorular|Açık sorular]]"
  - "[[03-mimari/api|API]]"
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]"
etiketler:
  - neta
  - yol-haritasi
  - oncelik
---

# Mevcut öncelikler

Aşağıdaki sıra [[09-yol-haritasi/mobil-uygulama-plani|mobil uygulama planının]] ilk kritik yoludur.

## 1 — Contract ve ürün freeze ✅

- MOB-0 kararları ADR-011…ADR-020 ile donduruldu.
- `mobile-v1` ve resource capability'leri uygulanana kadar `planned`dır.
- İlk auth Better Auth cookie; pairing ayrı sonraki fazdır.
- DTO, status code, currency, concurrency ve pagination kararları kapandı.

## 2 — Ortak sözleşmeyi gerçek ortak sınır yapmak ✅

- Backend ve mobil shared fixture/guard/presenter sınırını kullanıyor.
- `pnpm contract:check` iki consumer'ı aynı CI kapısında çalıştırıyor.
- Missing/yanlış metot v1 istekleri JSON `404/405` döndürüyor.
- Capability → zorunlu endpoint matrisi shared pakette ve boundary testinde kilitli.

## 3 — Evrensel mobil bootstrap ✅

- Production build-time origin zorunluluğu kaldırıldı; domain/QR + discovery + confirmation + login state machine teslim edildi.
- Origin/instanceId bazlı credential/cache temizliği ve capability gate uygulandı.
- Signed iOS/Android iki canlı HTTPS instance E2E'si release kanıtı olarak açık.

## 4 — Minimum owner gerçek veri dilimi ✅

Dashboard, client, project, task ve calendar read route'ları auth/scope/presenter/pagination, mobile UI gating ve canlı smoke ile teslim edildi.

## 5 — Core mutations ve owner parity ✅

Client, project, task ve calendar mutation'ları persistent idempotency, optimistic concurrency ve cache invalidation ile; finance, journal, settings, locales ve files parity'si shared contract ile teslim edildi.

## 6 — MOB-6/7 güvenlik kabulü ← aktif faz

Owner pairing ve portal transport'u kodda mevcuttur. `pnpm mobile:security:check` historical reuse, Bearer/scope, native profil/parola, revoke/logout-all, restore edilmiş ikinci loopback backend'e eski token HTTP negatifleri/yeniden pairing ve iki gerçek client HTTP/file negatiflerini doğrular. Startup/saatlik expiry/idle/retention/cascade temizliği uygulanmıştır. 0016 sonrası eski aktif cihazlar yeniden eşleştirilir. Nonce-bound 30 saniyelik şifreli replay ve challenge başına beş yanlış QR/manual secret kilidi otomatik kabul ile kapandı. 0017 yalnız eski pending kodları kapatır; mevcut cihaz/web oturumları korunur. Signed cihaz/iki canlı HTTPS instance/native restore kabulü [[docs/mobile/mobile-security-acceptance]] doğrultusunda açık kalır. Sıradaki uygulama dilimi MOB-8 AI taşımasıdır.

## 7 — MOB-8 AI taşıması

Mobil AI UI/parser mevcut; backend versioned chat/risk/finance AI transport'u ve `ai.assistant.v1` capability kabulü planlanandır. Core güvenlik kapılarını geciktirmeden ayrı dikey dilim olarak yürütülür; notification/push ayrı ADR gerektirir.

## 8 — MOB-9 release ve operasyon

Signed iOS/Android, iki canlı HTTPS instance, migration/restore/compatibility matrisi, privacy/support/store ve incident/upgrade/rollback runbook'ları. Otomatik HTTP kabulü store kanıtı yerine geçmez.

## Release ilkesi

2026-09-16 kullanıcı yönlendirmesiyle MOB-2–5 eksik tamamlama denetimi yapıldı: [[docs/mobile/mobile-phase-2-5-audit]]. [[assets-pipeline/indeks|Assets pipeline]] klasör/asset/screenshot altyapısı hazırlandı. [[assets-pipeline/ui-ux-guncelleme-plani|UI/UX tasarım ve CI diff çalışması]] işlevsel mobil kapılardan sonra, en son yürütülecek.

Store/native UI readiness, backend resource readiness yerine geçmez. Her faz ancak gerçek instance + contract + authorization testleriyle tamamlanır.
