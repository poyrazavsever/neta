---
tur: karar
durum: mevcut
guncellendi: 2026-09-16
guven: yuksek
ozet: "Neta mimari kararlarının bağımsız ADR notlarına açılan durum ve yönlendirme indeksi."
kaynaklar:
  - docs/self-hosted-redesign/phase-0-adrs.md
  - docs/self-hosted-redesign/adr-0018-device-pairing.md
  - docs/roadmaps/platform-master-plan.md
  - README.md
ilgili:
  - "[[00-sistem/degismez-kurallar|Değişmez kurallar]]"
  - "[[00-sistem/celiskiler|Çelişkiler]]"
etiketler:
  - neta
  - karar
  - indeks
---

# Karar kaydı

Bu sayfa karar metinlerini toplamaz; her kalıcı karar kendi ADR dosyasında yaşar. Buradaki tablo hangi kararın nerede bulunduğunu ve uygulama durumunu gösterir. Gerekçe, alternatifler, sonuçlar ve yeniden değerlendirme koşulları ilgili ADR'dedir.

## Kararlar

| ADR | Karar | Karar durumu | Uygulama durumu |
|---|---|---|---|
| [[06-kararlar/adr-001-sqlite-kalici-veri\|ADR-001]] | Self-hosted persistence için SQLite | Kabul edildi | Mevcut |
| [[06-kararlar/adr-002-tek-process-tek-veri-dizini\|ADR-002]] | Tek process, tek persistent data directory | Kabul edildi | Mevcut |
| [[06-kararlar/adr-003-yerel-dosya-depolama\|ADR-003]] | Yerel filesystem storage | Kabul edildi | Mevcut |
| [[06-kararlar/adr-004-better-auth-ve-uygulama-profili\|ADR-004]] | Better Auth ve uygulama profili ayrımı | Kabul edildi | Mevcut |
| [[06-kararlar/adr-005-supabase-runtime-bagimliliginin-kaldirilmasi\|ADR-005]] | Supabase runtime bağımlılığının kaldırılması | Kabul edildi | Mevcut |
| [[06-kararlar/adr-006-mobil-versioned-api-ve-ortak-domain-servisleri\|ADR-006]] | Mobil için versioned API ve ortak domain servisleri | Kabul edildi | Resource transport'u kodda; release kabulü açık |
| [[06-kararlar/adr-007-evrensel-mobil-uygulama\|ADR-007]] | Resmî tek evrensel mobil uygulama | Kabul edildi | Runtime connect kodda; mağaza kabulü açık |
| [[06-kararlar/adr-008-owner-device-pairing\|ADR-008]] | Owner device pairing tasarımı | Kabul edilmiş tasarım | Kodda mevcut; güvenlik kabulü açık |
| [[06-kararlar/adr-009-backup-restore-ve-downgrade-politikasi\|ADR-009]] | Backup/restore doğrulaması ve downgrade politikası | Kabul edildi | Mevcut |
| [[06-kararlar/adr-010-agent-baglaminda-vault-routing\|ADR-010]] | Agent bağlamında genel harita ve karar routing'i | Kabul edildi | Yapılandırıldı; local trust gerekli |
| [[06-kararlar/adr-011-mobile-v1-hazirlik-anlami\|ADR-011]] | `mobile-v1` hazırlık anlamı | Kabul edildi | Planlanan |
| [[06-kararlar/adr-012-ilk-mobil-auth-transportu\|ADR-012]] | İlk mobil auth transport'u | Kabul edildi | Kısmen mevcut |
| [[06-kararlar/adr-013-disabled-session-http-politikasi\|ADR-013]] | Disabled session HTTP politikası | Kabul edildi | Mevcut |
| [[06-kararlar/adr-014-ilk-surum-instance-kapsami\|ADR-014]] | İlk sürüm instance kapsamı | Kabul edildi | Kısmen mevcut |
| [[06-kararlar/adr-015-coklu-para-birimi-ozetleri\|ADR-015]] | Çoklu para birimi özetleri | Kabul edildi | Mevcut |
| [[06-kararlar/adr-016-optimistic-concurrency-surumu\|ADR-016]] | Optimistic concurrency sürümü | Kabul edildi | Mevcut |
| [[06-kararlar/adr-017-koleksiyon-pagination-zarfi\|ADR-017]] | Collection pagination zarfı | Kabul edildi | Contract ve backend kodda |
| [[06-kararlar/adr-018-client-mobil-auth-siniri\|ADR-018]] | Client mobil auth sınırı | Kabul edildi | Kısmen mevcut |
| [[06-kararlar/adr-019-v1-validation-http-statusu\|ADR-019]] | V1 validation HTTP statüsü | Kabul edildi | Mevcut |
| [[06-kararlar/adr-020-mobil-server-surum-uyumlulugu\|ADR-020]] | Mobil-server sürüm uyumluluğu | Kabul edildi | Mevcut |
| [[06-kararlar/adr-021-api-mutation-idempotency-kaydi\|ADR-021]] | API mutation idempotency kaydı | Kabul edildi | Mevcut |
| [[06-kararlar/adr-022-ui-assets-pipeline\|ADR-022]] | Vault içinde UI assets pipeline | Kabul edildi | Envanter ve arşivleme kodda; tasarım/CI diff planlanan |

## Kayıt kuralları

- Yeni bir kalıcı mimari veya ürün kararı sıradaki kesintisiz numarayla `adr-NNN-kisa-baslik.md` dosyası açar.
- Var olan karar değiştiğinde yeni ADR açılmaz; aynı dosya güncellenir ve önceki hüküm tarihçeyi koruyacak biçimde görünür bırakılır.
- `durum`, kararın implementation içindeki hâlini; `karar_durumu`, kararın yönetişim yaşam döngüsünü anlatır.
- Bu indeks karar ayrıntısını tekrar etmez. Yeni ADR eklendiğinde yalnızca tabloya bir satır eklenir.
- Canonical ADR veya kod ile bu sentez çelişirse [[00-sistem/celiskiler|çelişkiler]] kaydedilir.

## Sıradaki numara

Yeni ve bağımsız bir karar için sıradaki kimlik **ADR-023**'dir.
