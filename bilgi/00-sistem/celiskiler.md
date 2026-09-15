---
tur: sistem
durum: mevcut
guncellendi: 2026-09-04
guven: yuksek
kaynaklar:
  - apps/neta-app/server/api/v1/contracts.ts
  - apps/neta-app/app/api/v1
  - apps/neta-mobile/app.config.ts
  - docs/neta-backend-mobile-api-master-plan.md
  - docs/mobile/neta-mobile-redesign-master-plan.md
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[00-sistem/acik-sorular|Açık sorular]]"
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
etiketler:
  - neta
  - celiski
---

# Çelişkiler ve drift kayıtları

## C-001 — Capability ilanı ile v1 route kapsamı

**Durum:** 2026-09-03'te MOB-1 ile çözüldü.

**İddia A:** `files.local`, `freelancer.core`, `portal.client` ve `ai.assistant` kodda `available` ilan edilir.

**Kanıt A:** `apps/neta-app/server/api/v1/contracts.ts`.

**İddia B:** Backend'in `/api/v1` ağacında yalnız health, meta, me, preferences ve localization catalog vardır; ilgili resource route grupları yoktur.

**Kanıt B:** `apps/neta-app/app/api/v1/`; [[docs/neta-backend-mobile-api-master-plan]].

**Muhtemel açıklama:** Faz 9 capability'leri web/domain yeteneği anlamında kullandı; mobil API planı capability'yi gerçekten çağrılabilir v1 route garantisi olarak yorumluyor.

**Çözüm kanıtı:** `packages/api-contracts/src/index.ts` yalnız gerçek bootstrap capability'lerini `available` üretir; `mobile-v1` ve resource aileleri `planned`dır. ADR-011 semantiği, route gereksinim matrisi ve contract/boundary testleri bu durumu kilitler.

## C-002 — Mobil ürün modeli

**Durum:** 2026-09-04'te MOB-2 ile implementation çözüldü; tarihsel redesign belgelerinin supersede işareti korunmalıdır.

**İddia A:** Mevcut mobile README, config ve redesign planı her build/fork'u tek instance'a bağlar; production'da `EXPO_PUBLIC_NETA_ORIGIN` zorunludur ve domain/pairing UI yoktur.

**Kanıt A:** `apps/neta-mobile/README.md`, `apps/neta-mobile/app.config.ts`, [[docs/mobile/neta-mobile-redesign-master-plan]].

**İddia B:** Aktif platform planı mağazada bir kez yayınlanan evrensel binary'nin domain veya QR ile farklı self-hosted instance'lara bağlanmasını ister.

**Kanıt B:** [[docs/roadmaps/platform-master-plan]].

**Muhtemel açıklama:** Ürün kararı 2026-09-02'de değişti; implementation eski modelde, platform roadmap yeni hedefte.

**Çözüm kanıtı:** Production origin zorunluluğu kaldırıldı; domain/secret-free QR parser, discovery onayı, instance kaydı, unutma ve instance ID değişim temizliği uygulandı. Phase/config gate'leri evrensel binary'yi kabul eder.

## C-003 — `/me`, preferences ve katalog wire şekilleri

**Durum:** 2026-09-03'te MOB-1 ile çözüldü.

**İddia A:** Backend preferences alanını `language` olarak döndürür; PATCH `language` kabul edip yalnız `{preferences}` döndürür; catalog `catalogVersion` taşır.

**Kanıt A:** `apps/neta-app/app/api/v1/me/route.ts`, `me/preferences/route.ts`, `localization/catalog/route.ts`.

**İddia B:** Mobil `locale`, tam `MeProfile` mutation response'u ve uygulama parser'ında `version` bekler.

**Kanıt B:** `apps/neta-mobile/src/lib/auth/native-auth-client.ts`, mobil feature API'leri; [[docs/neta-backend-mobile-api-master-plan]].

**Muhtemel açıklama:** Contract'lar iki code path'te bağımsız gelişti.

**Çözüm kanıtı:** `/me` kanonik `locale` ve tam profil döndürür; PATCH tam profil response'u üretir; catalog `version` taşır; project asset listesi paginated'dır. Backend ve mobil `packages/api-contracts/fixtures/` örneklerini aynı `pnpm contract:check` kapısında tüketir.

## C-004 — Ortak contract paketi iddiası

**Durum:** 2026-09-03'te MOB-1 ile çözüldü.

**İddia A:** Monorepo planı `packages/api-contracts` paketini backend presenter testleri ile mobil guard'ların ortak sınırı olarak tanımlar.

**Kanıt A:** [[docs/roadmaps/platform-master-plan]], root README.

**İddia B:** Paket bugün mobil tarafından tüketilir; backend route/presenter kodunda workspace paketi importu yoktur.

**Kanıt B:** package dependency/import taraması; [[docs/neta-backend-mobile-api-master-plan]].

**Muhtemel açıklama:** Monorepo taşıması tamamlandı, contract adoption sonraki faza kaldı.

**Çözüm kanıtı:** `@neta/app` workspace dependency'si eklendi; discovery/meta/me/catalog presenter'ları shared guard kullanır ve backend consumer testleri mobil consumer testleriyle aynı fixture'ları çalıştırır.

## C-005 — Lisans beyanı

**İddia A:** Kök README repository'yi proprietary olarak tanımlar.

**Kanıt A:** [[README]].

**İddia B:** Mobil README ve `apps/neta-mobile/LICENSE` mobil uygulamayı MIT olarak dağıtır.

**Kanıt B:** `apps/neta-mobile/README.md`, `apps/neta-mobile/LICENSE`.

**Muhtemel açıklama:** Uygulama bazlı lisanslama bilinçli olabilir; repository bunu açıklamıyor.

**Doğrulanması gereken:** Hangi klasörün hangi lisansa tabi olduğu açık bir lisans matrisiyle belirtilmeli.

## C-006 — Tarihsel release kanıtının güncelliği

**İddia A:** 2026-07-18 readiness raporu Docker Node 22 ve o günkü Next sürümüyle başarı kaydeder.

**Kanıt A:** [[docs/self-hosted-redesign/release-readiness-2026-07-18]].

**İddia B:** Güncel Dockerfile Node 24, app manifesti farklı dependency patch sürümleri kullanır.

**Kanıt B:** `Dockerfile`, `apps/neta-app/package.json`.

**Muhtemel açıklama:** Readiness belgesi zaman damgalı tarihsel kanıttır; sürekli güncel durum beyanı değildir.

**Doğrulanması gereken:** Güncel release'te kontroller yeniden çalıştırılmalı; eski rapor kanıt geçmişi olarak okunmalıdır.
