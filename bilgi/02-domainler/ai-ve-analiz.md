---
tur: domain
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-ai-acceptance.md
  - apps/neta-app/server/ai
  - apps/neta-app/server/settings/ai.ts
  - apps/neta-app/server/services/domain.ts
  - apps/neta-app/app/api/chat/route.ts
  - apps/neta-app/app/api/project-risk/route.ts
  - apps/neta-app/app/api/finance-analysis/route.ts
ilgili:
  - "[[03-mimari/ai-mimarisi|AI mimarisi]]"
  - "[[07-guvenlik/sirlar|Sırlar]]"
etiketler:
  - neta
  - domain
  - ai
---

# AI ve analiz

## Amaç

Owner'a opsiyonel AI sohbeti, proje risk analizi ve finans analizi sunmak; provider seçimini self-hosted instance sahibinde bırakmak.

## Mevcut davranış

Owner `gemini`, `openai`, `groq` veya `ollama` seçer ve model override edebilir. Harici sağlayıcılar API key ister; Ollama varsayılan olarak local OpenAI-compatible endpoint kullanır. Provider istekleri timeout ve normalize edilmiş domain hatalarıyla sarılır.

Chat session/message persistence domain şemasındadır. Web chat, project-risk ve finance-analysis route'ları mevcuttur.

## Temel kavramlar / entity'ler

- `userAiSettings`: provider, model, encrypted API key.
- `chatSessions`, `chatMessages`: owner-scope konuşma geçmişi.
- AI runtime: seçili provider adapter'ı, model ve timeout.

## Veri kalıcılığı

AI ayarı ve chat geçmişi SQLite'tadır. API key AES-256-GCM ile şifrelenir; encryption key `BETTER_AUTH_SECRET`ten SHA-256 ile türetilir. Backup şifreli blob'u ve chat verisini içerir.

## API yüzeyi

Legacy web-specific route’lar korunur. 2026-09-17’de `/api/v1/chat/sessions`, session messages NDJSON, `/api/v1/projects/:id/risk-analysis` ve `/api/v1/finance/analysis` uygulandı. Explicit DTO, strict input, owner/device read scope ve persistent lease/idempotency kullanılır; `ai.assistant.v1` available’dır. Sentetik loopback provider HTTP kabulü [[docs/mobile/mobile-ai-acceptance]] kapsamındadır; gerçek provider/signed native kabulü ayrıdır.

## Yetkilendirme

AI settings/runtime owner scope gerektirir. Client portal için doğrulanmış AI capability yoktur.

## Bağımlılıklar

Harici Google/OpenAI/Groq veya host tarafından erişilebilir Ollama; [[02-domainler/projeler-ve-planlama|proje]], [[02-domainler/finans-ve-ticari-kayitlar|finans]] ve chat verileri.

## Güvenlik

Public ayar yalnız `hasApiKey` döndürür. Provider'a gönderilen içerik instance trust boundary'sinden çıkar; compromised provider, prompt injection ve hassas veri minimizasyonu ayrı risklerdir. `BETTER_AUTH_SECRET` değişirse mevcut AI key çözülemez.

## Sınırlamalar / plan

Provider key rotasyonu için ayrı versioned key yönetimi yoktur. Server-side egress allowlist ve içerik redaction kanıtlanmamıştır. Mobil NDJSON/native streaming ve capability gating kodda mevcuttur; signed gerçek cihaz ve provider/model compatibility kabulü açıktır. Push/notification ayrı ADR gerektirir.

## Kaynaklar

- `apps/neta-app/server/settings/ai.ts`
- `apps/neta-app/server/ai/provider.ts`
- [[docs/self-hosted-redesign/phase-7-ai-business-backend]]
