---
tur: sistem
durum: mevcut
guncellendi: 2026-09-03
guven: yuksek
kaynaklar:
  - README.md
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[harita|Genel bilgi haritası]]"
  - "[[00-sistem/mevcut-durum|Mevcut durum]]"
  - "[[00-sistem/degismez-kurallar|Değişmez kurallar]]"
etiketler:
  - neta
  - indeks
---

# Neta yaşayan bilgi kasası

Bu klasör, repository ve canonical dokümanların üzerinde çalışan bağlantılı sentez katmanıdır. Kaynak kodun veya `docs/` belgelerinin yerine geçmez. Bir iddia kritikse ilgili sayfadaki kaynaklardan yeniden doğrulanmalıdır.

## Genel indeks

- [[harita|Neta bilgi haritası]] — Kasadaki bütün kalıcı notları tek satırlık özetlerle listeleyen, `pnpm vault:map` ile üretilmiş zorunlu ilk giriş noktası.

Bu sayfa insan tarafından kürate edilen konu indeksi, `harita.md` ise eksiksiz genel indekstir. Agent önce haritadan geçer, sonra bu indeks ve görevle ilgili notlara iner.

## Önce okunacaklar

- [[00-sistem/mevcut-durum|Mevcut durum]] — Neta'nın bugün gerçekten çalışan yüzeylerinin kısa ve yoğun özeti.
- [[00-sistem/degismez-kurallar|Değişmez kurallar]] — Uygulama değişikliklerinde korunması gereken ürün, veri ve güvenlik sınırları.
- [[00-sistem/kasa-semasi|Kasa şeması]] — Bu bilgi katmanının bakım, senkronizasyon ve kanıt kuralları.
- [[00-sistem/agent-baglam-ve-hooklar|Agent bağlamı ve hooklar]] — Harita, ADR prompt routing'i ve görev sonu senkronizasyon kontrolü.
- [[00-sistem/celiskiler|Çelişkiler]] — Kod ile belgeler veya iki plan arasındaki bilinen uyuşmazlıklar.
- [[00-sistem/acik-sorular|Açık sorular]] — İnsan kararı ya da uygulama kanıtı bekleyen konular.

## Ürün

- [[01-urun/neta|Neta]] — Ürün sınırı ve üç ana yüzey.
- [[01-urun/urun-felsefesi|Ürün felsefesi]] — Self-hosting, veri sahipliği ve sade operasyon ilkeleri.
- [[01-urun/kullanici-tipleri|Kullanıcı tipleri]] — Owner/freelancer, davetli müşteri ve anonim kullanıcı.
- [[01-urun/yetenekler|Yetenekler]] — Mevcut, planlanan ve legacy yeteneklerin ayrımı.
- [[01-urun/urun-haritasi|Ürün haritası]] — Kullanıcı ihtiyaçlarının uygulama yüzeylerine dağılımı.

## Domainler

- [[02-domainler/kimlik-ve-erisim|Kimlik ve erişim]] — İlk owner, session, rol, davet ve erişim kapatma.
- [[02-domainler/musteriler|Müşteriler]] — Müşteri kaydı, ilişki aktivitesi ve portal hesabı bağı.
- [[02-domainler/projeler-ve-planlama|Projeler ve planlama]] — Proje yaşam döngüsü, plan bölümleri ve revizyonlar.
- [[02-domainler/gorevler-ve-takvim|Görevler ve takvim]] — İş takibi, tarihler ve takvim olayları.
- [[02-domainler/finans-ve-ticari-kayitlar|Finans ve ticari kayıtlar]] — Gelir/gider, teklif, sözleşme, fatura ve abonelik.
- [[02-domainler/gunluk|Günlük]] — Owner'ın tarihli not ve skor kayıtları.
- [[02-domainler/dosyalar-ve-markalama|Dosyalar ve markalama]] — Upload metadata, görünürlük ve instance markası.
- [[02-domainler/yerellestirme|Yerelleştirme]] — Instance dilleri, UI katalogları ve içerik çevirileri.
- [[02-domainler/ai-ve-analiz|AI ve analiz]] — Sağlayıcı ayarları, sohbet ve analiz akışları.
- [[02-domainler/musteri-portali|Müşteri portalı]] — Müşteriye sınırlandırılmış proje, görev ve revizyon alanı.
- [[02-domainler/instance-ve-mobil-baglanti|Instance ve mobil bağlantı]] — Discovery, kimlik ve hedef bağlantı modeli.
- [[02-domainler/yedekleme-ve-geri-yukleme|Yedekleme ve geri yükleme]] — Kalıcı veri bütünlüğü domaini.

## Mimari ve bileşenler

- [[03-mimari/mimari-genel-bakis|Mimari genel bakış]] — Sistem akışı ve trust boundary'leri.
- [[03-mimari/monorepo|Monorepo]] — Workspace sınırları ve paylaşım ilkeleri.
- [[03-mimari/runtime|Runtime]], [[03-mimari/veri-kaliciigi|veri kalıcılığı]], [[03-mimari/sqlite|SQLite]] — Çalışma ve veri modeli.
- [[03-mimari/api|API]], [[03-mimari/kimlik-dogrulama|kimlik doğrulama]] — Web ve mobil transport sınırı.
- [[03-mimari/dosya-depolama|Dosya depolama]], [[03-mimari/migrasyonlar|migrasyonlar]], [[03-mimari/deployment|deployment]] — Operasyonel mimari.
- [[03-mimari/mobil-mimari|Mobil mimari]], [[03-mimari/ai-mimarisi|AI mimarisi]] — İstemci ve harici sağlayıcı katmanları.
- [[04-bilesenler/neta-app|neta-app]], [[04-bilesenler/neta-web|neta-web]], [[04-bilesenler/neta-mobile|neta-mobile]] — Ürün uygulamaları.
- [[04-bilesenler/api-contracts|api-contracts]], [[04-bilesenler/design-tokens|design-tokens]], [[04-bilesenler/desktop-assistant|desktop-assistant]] — Paylaşılan paketler ve yardımcı araç.

## İş akışları, kararlar ve güvenlik

- [[05-is-akislari/ilk-kurulum|İlk kurulum]], [[05-is-akislari/musteri-daveti|müşteri daveti]], [[05-is-akislari/mobil-instance-baglantisi|mobil bağlantı]].
- [[05-is-akislari/yedekleme-ve-geri-yukleme|Backup/restore]], [[05-is-akislari/supabase-importu|legacy import]], [[05-is-akislari/yayin-ve-upgrade|yayın/upgrade]].
- [[06-kararlar/karar-kaydi|Karar kaydı]] — Her biri ayrı dosyada yaşayan ADR'lerin durum ve yönlendirme indeksi.
- [[07-guvenlik/guvenlik-genel-bakis|Güvenlik genel bakışı]], [[07-guvenlik/tehdit-modeli|tehdit modeli]], [[07-guvenlik/sirlar|sırlar]], [[07-guvenlik/bilinen-riskler|bilinen riskler]].

## Operasyon ve yol haritası

- [[08-operasyon/production|Production]], [[08-operasyon/docker|Docker]], [[08-operasyon/health-checkler|health check'ler]].
- [[08-operasyon/yedekleme|Yedekleme]], [[08-operasyon/felaket-kurtarma|felaket kurtarma]], [[08-operasyon/yayin-hazirligi|yayın hazırlığı]], [[08-operasyon/sorun-giderme|sorun giderme]].
- [[09-yol-haritasi/yol-haritasi|Yol haritası]], [[09-yol-haritasi/mevcut-oncelikler|mevcut öncelikler]], [[09-yol-haritasi/mobil-uygulama-plani|mobil uygulama planı]], [[09-yol-haritasi/planlanan-yetenekler|planlanan yetenekler]], [[09-yol-haritasi/teknik-borc|teknik borç]].

## Araştırma, kaynak ve bakım

- [[10-arastirma/indeks|Araştırma indeksi]] — Henüz ürüne kabul edilmemiş inceleme alanları.
- [[11-kaynaklar/indeks|Kaynak indeksi]] — Canonical kaynak aileleri ve dış kaynak notları.
- [[00-sistem/sozluk|Sözlük]] — Repository'de kullanılan temel terimler.
- [[00-sistem/gunluk|Kasa günlüğü]] — Append-only bakım geçmişi.
- `bilgi/sablonlar/` — Yeni kalıcı bilgi sayfaları için tekrar kullanılabilir iskeletler.
- `pnpm vault:map`, `pnpm vault:check`, `pnpm vault:hooks:test` — Genel indeks, kasa sağlığı ve prompt hook testleri.
