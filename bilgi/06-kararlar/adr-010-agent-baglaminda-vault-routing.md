---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-03
guven: yuksek
ozet: "Neta üzerinde çalışan agent önce genel bilgi haritasından geçer; static talimat ve Codex hookları ilgili karar bağlamını prompt'a taşır."
kaynaklar:
  - AGENTS.md
  - .codex/hooks.json
  - .codex/hooks/neta-vault.mjs
  - tools/vault/generate-map.mjs
ilgili:
  - "[[harita|Bilgi haritası]]"
  - "[[00-sistem/agent-baglam-ve-hooklar|Agent bağlamı ve hooklar]]"
  - "[[00-sistem/kasa-semasi|Kasa şeması]]"
  - "[[06-kararlar/karar-kaydi|Karar kaydı]]"
etiketler:
  - neta
  - karar
  - agent
  - vault
---

# ADR-010 — Agent bağlamında genel harita ve karar routing'i

> Son güncelleme: **2026-09-03** — Genel harita, repository talimatı ve Codex lifecycle hookları birlikte tanımlandı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Yapılandırıldı; repository-local hooklar kullanıcı güveninden sonra aktif

## Bağlam

Kasa büyüdükçe bir agentın bütün notları okuması pahalı, hiçbirini okumadan doğrudan kod araması yapması ise karar ve mevcut/planlanan ayrımını kaçırmaya açıktır. Kullanıcı her çalışmanın genel indeksten geçmesini ve alınmış kararların prompt davranışını doğrudan etkilemesini istemektedir.

## Karar

`bilgi/harita.md` bütün kalıcı notların üretilmiş genel indeksidir ve zorunlu ilk giriş noktasıdır. Kök `AGENTS.md` bu rotayı static proje talimatı olarak verir. Codex `SessionStart`/`SubagentStart` hookları ADR özetlerini, `UserPromptSubmit` hooku konuya özel not ve karar rotasını prompt'a ekler. `Stop` hooku kalıcı kod değişikliklerinden sonra kasa senkronizasyonunun değerlendirilmesini sağlar.

## Gerekçe

- Harita bütün notları tek satırlık routing birimleri hâline getirir.
- Static `AGENTS.md`, hooklar devre dışı veya güvenilmemiş olsa bile temel sözleşmeyi korur.
- Dinamik hook yalnız ilgili bağlamı seçerek prompt şişmesini sınırlar.
- ADR özetleri tek kaynaklarından okunduğu için kopya karar listesi çürümez.
- Bitiş kontrolü mevcut dirty worktree'yi baseline alarak kullanıcıya ait önceki değişiklikleri mümkün olduğunca ayırır.

## Değerlendirilen alternatifler

- Bütün vault içeriğini her prompt'a eklemek: token maliyeti ve ilgisiz bağlam nedeniyle reddedildi.
- Yalnız elle bakımlı bir indeks kullanmak: yeni notların unutulma ve orphan kalma riski nedeniyle tek başına yeterli görülmedi.
- Yalnız hook kullanmak: trust veya feature ayarı nedeniyle hook çalışmadığında rota kaybolacağı için reddedildi.
- Hookun kasayı otomatik değiştirmesi: yanlış sentez ve kullanıcı değişikliğini sahiplenme riski nedeniyle reddedildi.

## Varsayımlar

- Agent repository kökünü ve `bilgi/` klasörünü okuyabilir.
- Node.js 24 ve Git geliştirme ortamında mevcuttur.
- Repository-local hooklar kullanıcı tarafından incelenip güvenilir olarak işaretlenir.
- ADR `ozet` alanları kısa ve yönlendirici tutulur.

## Etkilenen sistemler ve sonuçlar

- `bilgi/harita.md` artık zorunlu ve üretilmiş giriş noktasıdır.
- Root agent prompt'u `AGENTS.md` ile kalıcı davranış kazanır.
- `.codex/hooks.json` prompt routing ve bitiş kontrolünü etkinleştirir.
- `pnpm vault:map`, `vault:check` ve `vault:hooks:test` bakım sözleşmesinin parçasıdır.
- Hook tanımı değiştiğinde Codex yeniden trust onayı isteyebilir.

## Uygulama kanıtı

`AGENTS.md`, `.codex/hooks.json`, `.codex/hooks/neta-vault.mjs` ve `tools/vault/` scriptleri repository'de bulunur. Davranış [[00-sistem/agent-baglam-ve-hooklar|agent bağlamı ve hooklar]] sayfasında açıklanır ve `pnpm vault:hooks:test` ile doğrulanır.

## Yeniden değerlendirme koşulları

- Codex hook wire formatı veya trust modeli değişirse.
- Harita 25 KB yönlendirme bütçesini aşar veya routing doğruluğu düşerse.
- CI tarafında daha güçlü semantik sync denetimi uygulanırsa.
- Başka agent runtime'ları için aynı dinamik hook davranışı gerekli hâle gelirse.

## Canonical kaynaklar

- `AGENTS.md`
- `.codex/hooks.json`
- `.codex/hooks/neta-vault.mjs`
- `tools/vault/generate-map.mjs`
- `tools/vault/check.mjs`
