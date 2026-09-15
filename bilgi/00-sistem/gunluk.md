---
tur: gunluk
durum: mevcut
guncellendi: 2026-09-03
guven: yuksek
kaynaklar:
  - README.md
  - docs
  - apps
  - packages
ilgili:
  - "[[00-sistem/kasa-semasi|Kasa şeması]]"
etiketler:
  - neta
  - kasa-gunlugu
---

# Bilgi kasası günlüğü

Bu dosya append-only'dir. Eski girdiler olgusal hata düzeltmesi dışında değiştirilmez; düzeltme gerekiyorsa yeni kayıt önceki kayda bağlantı verir.

## [2026-09-02] baslangic | Neta bilgi kasasının ilk kurulumu

Repository, güncel kaynak kod, README, self-hosted ADR/faz kayıtları, mobil planlar, aktif platform roadmap'i ve operasyon scriptleri incelendi. İlk ürün, domain, mimari, güvenlik, operasyon, karar ve roadmap sentezi oluşturuldu.

Öne çıkan ayrımlar:

- Self-hosted web runtime mevcut ve Supabase'den bağımsızdır.
- Mobil discovery/auth bootstrap mevcuttur; geniş v1 resource API parity'si ve device pairing planlanandır.
- Build-time tek-instance mobil davranışı mevcut; evrensel domain/QR bağlantı modeli aktif roadmap hedefidir.

Güncellenen hub sayfalar:

- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[00-sistem/degismez-kurallar|Değişmez kurallar]]
- [[03-mimari/mimari-genel-bakis|Mimari genel bakış]]
- [[03-mimari/runtime|Runtime]]
- [[03-mimari/veri-kaliciigi|Veri kalıcılığı]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[07-guvenlik/tehdit-modeli|Tehdit modeli]]
- [[06-kararlar/karar-kaydi|Karar kaydı]]

Kaynaklar:

- [[README]]
- [[docs/roadmaps/platform-master-plan]]
- [[docs/neta-backend-mobile-api-master-plan]]
- [[docs/self-hosted-redesign/neta-self-hosted-v3-master-plan]]
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
- [[apps/neta-mobile/README]]

## [2026-09-02] lint | İlk bootstrap sağlık kontrolü

Kasanın 74 Markdown sayfasında frontmatter alanları ve enum değerleri, canonical source path'leri, wikilink çözümleme, orphan sayfalar, code fence dengesi ve satır sonu boşlukları kontrol edildi.

Sonuç:

- Kırık wikilink, orphan sayfa ve eksik source path kalmadı.
- `indeks`, `gunluk` ve `yedekleme-ve-geri-yukleme` basename tekrarları farklı bilgi türlerinin bilinçli sayfalarıdır; bağlantılar path-qualified tutuldu.
- Supabase yalnız legacy import; device pairing yalnız planlanan capability olarak anlatıldı.
- Sağlık kontrolünde bulunan yanlış `DomainService` ve portal source path'leri güncel repository yollarına düzeltildi.
- Kasanın bulunabilirliği için kök README'ye indeks ve zorunlu ilk okuma bağlantıları eklendi; agent talimat dosyaları değiştirilmedi.

Kontrol edilen hub'lar:

- [[00-sistem/indeks|İndeks]]
- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[00-sistem/celiskiler|Çelişkiler]]
- [[07-guvenlik/bilinen-riskler|Bilinen riskler]]

## [2026-09-03] karar | Karar kaydı bağımsız ADR'lere ayrıldı

CleverKids Obsidian Vault'un karar-notu ve bakım düzeni yalnızca yapısal referans olarak incelendi. Neta'nın toplu K-001…K-009 kayıtları, Neta'nın mevcut metadata ve kanıt disiplinini koruyarak ayrı ADR dosyalarına taşındı.

Uygulanan kurallar:

- [[06-kararlar/karar-kaydi|Karar kaydı]] yalnız durum ve yönlendirme indeksi oldu.
- Her karar gerekçe, alternatif, varsayım, sonuç, implementation kanıtı ve yeniden değerlendirme koşullarını kendi notunda taşır.
- Eski `K-XXX` kimlikleri `onceki_kimlik` metadata'sıyla korundu; yeni kayıt dizisi ADR-001…ADR-009 oldu.
- Kabul edilmiş fakat uygulanmamış mobil kararlar `planlanan` olarak açıkça ayrıldı.
- Yeni kararlar için sıradaki kimlik ADR-010 olarak belirlendi ve [[00-sistem/kasa-semasi|kasa şeması]] güncellendi.

Oluşturulan karar notları:

- [[06-kararlar/adr-001-sqlite-kalici-veri|ADR-001]]
- [[06-kararlar/adr-002-tek-process-tek-veri-dizini|ADR-002]]
- [[06-kararlar/adr-003-yerel-dosya-depolama|ADR-003]]
- [[06-kararlar/adr-004-better-auth-ve-uygulama-profili|ADR-004]]
- [[06-kararlar/adr-005-supabase-runtime-bagimliliginin-kaldirilmasi|ADR-005]]
- [[06-kararlar/adr-006-mobil-versioned-api-ve-ortak-domain-servisleri|ADR-006]]
- [[06-kararlar/adr-007-evrensel-mobil-uygulama|ADR-007]]
- [[06-kararlar/adr-008-owner-device-pairing|ADR-008]]
- [[06-kararlar/adr-009-backup-restore-ve-downgrade-politikasi|ADR-009]]

## [2026-09-03] karar | Genel harita, agent hookları ve mobil uygulama planı

Vault için üretilmiş eksiksiz `bilgi/harita.md` giriş noktası, root agent talimatı ve Codex lifecycle hookları eklendi. Session başlangıcında ADR özetleri; kullanıcı prompt'unda konuya özel not/karar rotası verilir. Stop kontrolü ürün değişikliği sonrası kasa etkisini ve harita güncelliğini bir kez daha değerlendirtir.

Kalıcı karar:

- [[06-kararlar/adr-010-agent-baglaminda-vault-routing|ADR-010: Agent bağlamında genel harita ve karar routing'i]]

Yeni bakım yüzeyleri:

- [[harita|Neta bilgi haritası]]
- [[00-sistem/agent-baglam-ve-hooklar|Agent bağlamı ve hooklar]]
- `AGENTS.md`, `.codex/hooks.json`, `.codex/hooks/neta-vault.mjs`
- `pnpm vault:map`, `pnpm vault:check`, `pnpm vault:hooks:test`

Mobil için aktif roadmap, backend API planı ve çalışan Expo istemci incelenerek tek yürütme planı oluşturuldu:

- [[09-yol-haritasi/mobil-uygulama-plani|Neta Mobile uygulama planı]]

Plan; contract/capability freeze, runtime domain bağlantısı, owner read/mutation dilimleri, owner parity, device pairing, client portal, AI/bildirim ve store release kapılarını mevcut/planlanan ayrımıyla sıralar.

## [2026-09-03] senkronizasyon | MOB-0 ve MOB-1 tamamlandı

Mobil ürün/auth/contract kararları ADR-011…ADR-020 olarak donduruldu. Backend ile mobil arasında ortak bootstrap wire sınırı uygulandı; capability ilanı gerçek route kapsamına indirildi ve `mobile-v1` minimum owner yüzeyi tamamlanana kadar `planned` yapıldı.

Uygulanan ana değişiklikler:

- Discovery, meta, owner/client me, preferences, catalog, error ve pagination fixture'ları `@neta/api-contracts` altında ortaklaştırıldı.
- Backend explicit presenter ve runtime guard; mobil canonical parser ve aynı fixture consumer testlerini kullanıyor.
- `/me`, preference PATCH, catalog version ve project asset pagination drift'leri kapatıldı.
- Better Auth cookie ilk mobil auth transport'u oldu; eski bearer materyali okunmuyor.
- JSON `404/405`, strict mutation body, `401/403` politikası ve secret-free fixture taraması CI kapısına eklendi.
- `pnpm contract:check`, API boundary ve canlı auth/invitation smoke başarıyla geçti.

Güncellenen sayfalar:

- [[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]
- [[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]

## [2026-09-04] senkronizasyon | MOB-2 ve MOB-3 owner read dilimi

Evrensel mobil instance bağlantısı ve minimum owner read dikey dilimi uygulandı. Production binary artık build-time origin gerektirmez; domain veya secret-free connect QR ile discovery, onay, login ve instance unutma akışı kullanır.

Backend'e dashboard, müşteri, proje/plan/revizyon, görev ve takvim GET route'ları eklendi. Strict query, timezone-aware calendar boundary, kararlı sıralama, opaque cursor, session-derived owner scope ve shared DTO sınırı uygulandı. Client rolü `403`, bulunmayan/cross-scope kimlik `404`, oturumsuz istek `401`, read-only route'a write `405` ile canlı smoke'ta doğrulandı.

Mobilde granular capability gate açıldı; MOB-4'e ait mutation kontrolleri minimum read ekranlarından kaldırıldı. `mobile-v1`, signed iOS/Android ve iki canlı HTTPS instance kanıtı tamamlanana kadar `planned` kaldı.

Güncellenen sayfalar:

- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[00-sistem/celiskiler|C-002]]
- [[00-sistem/acik-sorular|Açık sorular]]
- [[03-mimari/api|API mimarisi]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[04-bilesenler/neta-mobile|neta-mobile]]
- [[07-guvenlik/bilinen-riskler|Bilinen riskler]]
- [[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]
- [[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]
- [[09-yol-haritasi/teknik-borc|Teknik borç]]

## [2026-09-04] senkronizasyon | MOB-4 ve MOB-5 owner mutation/parity dilimi

Owner mobil kapsamı core mutation ve geniş parity ile ilerletildi. Client/project/task/calendar create-update-delete akışları; finance ve journal; profil/parola/session; general/appearance/locale/AI settings ile file/project asset API'leri versioned `/api/v1` yüzeyine bağlandı.

Kalıcı retry güvenliği için SQLite idempotency kaydı eklendi. Aynı actor/method/route/key ve payload tek side effect üretir; farklı payload `409` döner. Update/delete işlemleri opaque version/`If-Match` ile stale write'ı engeller. Portal davet URL'si mobilde gösterilir fakat raw token idempotency kaydına yazılmaz.

Güvenlik ve veri doğruluğu değişiklikleri:

- Finans özetleri currency bazında gruplanır; kur olmadan para birimleri birleştirilmez.
- AI anahtarı GET yanıtında dönmez ve provider değişiminde yeni key + parola doğrulaması gerekir.
- Yeni mobil v1 görsel upload'ları gerçek decode/re-encode sonrasında `metadataSanitized=true` alır.
- Capability-gated mobil navigasyon planlanan AI yüzeyini gizler.

Doğrulama:

- `pnpm contract:check`
- `pnpm phase1:auth-smoke` (idempotency replay, key conflict, stale mutation ve secret-free invite kaydı dahil)
- `pnpm --filter @neta/app build`

Kalıcı karar:

- [[06-kararlar/adr-021-api-mutation-idempotency-kaydi|ADR-021: API mutation idempotency kaydı]]

Güncellenen sayfalar:

- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[03-mimari/api|API mimarisi]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[06-kararlar/karar-kaydi|Karar kaydı]]
- [[07-guvenlik/bilinen-riskler|Bilinen riskler]]
- [[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]
- [[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]

## [2026-09-15] senkronizasyon | Pairing ve portal kodu ile release kanıtı ayrıldı

Çalışma ağacındaki MOB-6 owner pairing ve MOB-7 client portal transport'u doğrulandı. Pairing SQLite tabloları, challenge/exchange/refresh/revoke route'ları, mobil instance-scoped bearer transport'u ve restore token epoch rotation'ı kodda bulunur. Client portal dashboard/project/task/revision/profile route'ları ve mobil istemcisi de kodda yer alır. Capability manifesti bu iki route ailesini `available` ilan eder; `mobile-v1` mağaza kabulü için `planned` kalır.

`pnpm contract:check`, `pnpm phase9:api-boundary`, `pnpm phase1:auth-smoke` ve `pnpm phase9:smoke` geçti. Signed iOS/Android ile iki canlı HTTPS instance, pairing reuse/revoke/restore ve cross-client negatif E2E kabulü açık olduğundan bu kod varlığı production güvenlik kanıtı sayılmaz. Eski mobil phase-0 gate'in pairing eylemini yasaklayan kontrolü güncel faza uyarlandı.

Mevcut durum, API/mobil/kimlik mimarisi, ADR-006/007/008/017 ve karar indeksi, mobil plan, güvenlik/restore/domain/bileşen/teknik borç sayfaları çalışan kod ile kabul sınırını ayıracak şekilde güncellendi.
- [[03-mimari/api|API mimarisi]]
- [[03-mimari/mobil-mimari|Mobil mimari]]
- [[04-bilesenler/api-contracts|api-contracts]]
- [[00-sistem/mevcut-durum|Mevcut durum]]
- [[00-sistem/celiskiler|Çelişkiler]]
- [[07-guvenlik/bilinen-riskler|Bilinen riskler]]

Sıradaki aktif faz MOB-2'dir: production build-time origin zorunluluğunu runtime domain/QR instance bağlantısına taşımak.
