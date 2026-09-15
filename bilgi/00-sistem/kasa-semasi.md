---
tur: sistem
durum: mevcut
guncellendi: 2026-09-03
guven: yuksek
kaynaklar:
  - README.md
  - docs
  - AGENTS.md
  - .codex/hooks.json
ilgili:
  - "[[harita|Genel bilgi haritası]]"
  - "[[00-sistem/indeks|İndeks]]"
  - "[[00-sistem/gunluk|Kasa günlüğü]]"
etiketler:
  - neta
  - kasa-bakimi
---

# Bilgi kasası şeması

## Rolü

Repository kökü Obsidian vault'tur. `bilgi/`, kod ve canonical dokümanların üzerinde çalışan, insan ve AI için kalıcı sentez katmanıdır. `docs/` nasıl/nerede/faz kanıtını; `bilgi/` ise sistemler arası anlamı, bugünkü durumu, karar gerekçesini, riskleri ve bağlantıları anlatır.

## Kaynak önceliği

Güncel davranış için genel sıra:

1. Çalışan güncel kod, schema ve testler.
2. Güncel aktif roadmap/ADR ve operasyon sözleşmeleri.
3. Tarihli release kanıtları ve tamamlanmış faz raporları.
4. Superseded/legacy planlar.
5. Bu bilgi kasası.

İki canonical kaynak çatışırsa sessizce seçim yapılmaz; [[00-sistem/celiskiler|çelişkiler]] güncellenir. Planlanan bilgi hiçbir zaman “mevcut” diye özetlenmez.

## Metadata sözleşmesi

Üretilen bilgi sayfaları şu frontmatter alanlarını kullanır:

- `tur`: sistem, urun, domain, mimari, bilesen, is-akisi, karar, guvenlik, operasyon, yol-haritasi, arastirma veya kaynak.
- `durum`: `mevcut`, `planlanan`, `legacy`, `kaldirilacak`, `gecersiz-kilindi`, `arastirma`.
- `guncellendi`: `YYYY-MM-DD`.
- `guven`: `yuksek`, `orta`, `dusuk`.
- `kaynaklar`: repository-relative canonical kaynak yolları.
- `ilgili`: anlamlı Obsidian wikilink'leri.
- `etiketler`: az sayıda kalıcı konu etiketi.

Karar notları ayrıca `karar_durumu`, tek cümlelik `ozet` ve eski toplu kimlik varsa `onceki_kimlik` alanlarını kullanır. `durum` implementation gerçeğini; `karar_durumu` ise yönetişim lifecycle'ını anlatır. İzin verilen karar durumları `onerildi`, `kabul-edildi`, `kabul-edilmis-tasarim`, `reddedildi` ve `gecersiz-kilindi` değerleridir.

Bir sayfa mevcut ve planlanan davranışı birlikte sentezleyebilir; bu durumda sayfanın ana durumu bugünkü konuyu, alt başlıklar ise ayrımı açıkça belirtir.

## Yazım ve bağlantı kuralları

- Kod satırı kataloğu yerine refactor sonrası da anlamlı kalan kavramlar yazılır.
- Teknik iddialar en az bir canonical kaynağa kadar izlenebilir olmalıdır.
- Kasa içi navigasyon wikilink, dış web kaynakları normal Markdown linki kullanır.
- Aynı isimli sayfalarda path-qualified link kullanılır.
- Mermaid yalnız sistem ilişkisini metinden daha açık gösterdiğinde kullanılır.
- `ham/` girdileri işlendikten sonra kullanıcı istemedikçe değiştirilmez.
- Yeni sayfa gerçek bir bilgi kimliği hak etmiyorsa mevcut hub güncellenir.

## Genel harita

- `bilgi/harita.md` kasadaki bütün kalıcı Markdown notlarının eksiksiz genel indeksidir.
- Agent her görevin başında önce haritadan geçer, sonra görevle ilgili az sayıda notu seçer.
- `harita.md` elle düzenlenmez; `pnpm vault:map` frontmatter ve sayfa içeriğinden deterministik üretir.
- Yeni/taşınmış/silinmiş not veya anlamlı `ozet`, `durum`, `tur`, `guncellendi` değişikliği haritanın yeniden üretilmesini gerektirir.
- `bilgi/00-sistem/indeks.md` küratörlü ana navigasyondur; genel haritanın eksiksizliği ile aynı işi tekrar etmez.

## Karar kayıt düzeni

- Her kalıcı mimari veya ürün kararı `bilgi/06-kararlar/adr-NNN-kisa-baslik.md` altında ayrı bir nottur.
- [[06-kararlar/karar-kaydi|Karar kaydı]] ayrıntı kopyalamayan yönlendirme indeksidir.
- Yeni karar sıradaki kesintisiz ADR numarasını alır. Aynı karar değişti diye yeni ADR açılmaz.
- Değişen hüküm silinmez; önceki ifade tarihçeyi koruyacak şekilde görünür bırakılır ve en üstteki son-güncelleme satırı yenilenir.
- Gerekçe, değerlendirilen alternatifler, varsayımlar, sonuçlar, uygulama kanıtı ve yeniden değerlendirme koşulları ADR'nin içinde bulunur.
- Kabul edilmiş ama uygulanmamış karar `durum: planlanan` kalır; tasarım belgesi tek başına aktif capability kanıtı değildir.
- Karar notu sık okunan bir yönlendirme birimidir; 25 KB'ı aşmamalı, tekrar eden durum ayrıntıları ilgili mimari/domain sayfasına bağlanmalıdır.
- Yeni ADR oluşturulurken `bilgi/sablonlar/karar.md` kullanılır; indeks ve gerekiyorsa çapraz bağlantılar aynı değişiklikte güncellenir.

## Büyük görev öncesi okuma

Bir AI agent en az şunları okumalıdır:

1. [[harita|Genel bilgi haritası]]
2. [[00-sistem/mevcut-durum|Mevcut durum]]
3. [[00-sistem/degismez-kurallar|Değişmez kurallar]]
4. Görevle ilgili domain/mimari sayfaları ve bağımsız ADR'ler
5. [[00-sistem/celiskiler|Çelişkiler]] ve [[00-sistem/acik-sorular|açık sorular]]
6. Sayfalarda işaret edilen canonical kaynaklar

## Agent prompt ve hook sözleşmesi

- Root `AGENTS.md` zorunlu bilgi rotasını static proje talimatı olarak taşır; `CLAUDE.md` aynı talimatı import eder.
- Codex `SessionStart` ve `SubagentStart` hookları harita rotasıyla ADR özetlerini prompt bağlamına ekler.
- `UserPromptSubmit` yalnız eşleşen konu için ilgili sayfa ve karar özetlerini yönlendirir; eşleşmeyen prompt'a içerik eklemez.
- `Stop` hooku ürün kodu değiştiğinde kasa etkisinin değerlendirilmesini ve kasa değiştiğinde haritanın güncel olmasını ister; kasayı kendisi değiştirmez.
- Hooklar prompt/transcript veya secret saklamaz. Geçici state yalnız dirty-path fingerprint'i içerir.
- Repository-local Codex hooku ilk çalıştırmada kullanıcı trust onayı gerektirir. Ayrıntı [[00-sistem/agent-baglam-ve-hooklar|agent bağlamı ve hooklar]] sayfasındadır.

## Repository senkronizasyonu

“Bilgi kasasını senkronize et” dendiğinde:

1. `git status`, `git diff` ve gerekirse ilgili `git log` incelenir.
2. Değişen mevcut davranış, invariant, API, iş akışı, güvenlik varsayımı, roadmap durumu ve teknik borç çıkarılır.
3. Yalnız etkilenen sentez sayfaları güncellenir.
4. Planlanan özellik tamamlandıysa durum kanıtla birlikte değiştirilir.
5. Navigation değiştiyse [[00-sistem/indeks|indeks]] güncellenir.
6. `pnpm vault:map` ve `pnpm vault:check` çalıştırılır.
7. Format-only değişiklik değilse [[00-sistem/gunluk|günlüğe]] `senkronizasyon` girdisi eklenir.

## Dış kaynak ekleme

1. Ham varlık uygun `bilgi/ham/` altına konur ve korunur.
2. [[11-kaynaklar/indeks|Kaynak indeksinden]] erişilen bir kaynak notu oluşturulur.
3. İddialar, Neta bağlantısı, güven ve karar etkisi çıkarılır.
4. Önce var olan ürün/domain/mimari/risk/araştırma sayfası güncellenir.
5. Kabul edilmemiş araştırma “mevcut mimari”ye dönüştürülmez.
6. Günlüğe `kaynak-ekleme` girdisi eklenir.

## Sorgu iş akışı

Neta hakkında soru cevaplanırken önce [[00-sistem/indeks|indeks]], sonra ilgili sentez sayfaları okunur. Kritik, güvenlik etkili veya değişmiş olabilecek iddialar kod/dokümanla yeniden doğrulanır. Kalıcı değeri olan sonuç uygun sayfaya işlenir ve `sorgu` günlüğü eklenir.

## Lint / sağlık kontrolü

Şunlar denetlenir:

- Kırık veya belirsiz wikilink, orphan/duplicate sayfa.
- Frontmatter, tarih, durum ve güven alanı eksikleri.
- Kaynaksız önemli iddia ve eski source path.
- Planlananın mevcut gibi anlatılması.
- Kod–doküman çelişkisi ve çözülen ama açık kalan soru/risk.
- Mimari değişikliğin `mevcut-durum` ve invariantlara yansımaması.
- Genel haritanın üretilmiş güncel içerikten sapması.
- ADR numarasının kesintili, indeks dışı veya gerekli bölümleri eksik olması.

Gerçek bulgular [[00-sistem/celiskiler|çelişkiler]], [[00-sistem/acik-sorular|açık sorular]], [[07-guvenlik/bilinen-riskler|bilinen riskler]] veya [[09-yol-haritasi/teknik-borc|teknik borç]] sayfasına işlenir; sırf alan doldurmak için bulgu üretilmez.

## Günlük türleri

`baslangic`, `kaynak-ekleme`, `sorgu`, `senkronizasyon`, `lint`, `arastirma`, `karar`.
