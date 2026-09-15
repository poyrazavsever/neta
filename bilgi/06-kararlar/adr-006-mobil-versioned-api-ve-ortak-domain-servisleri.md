---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
onceki_kimlik: K-006
guncellendi: 2026-09-03
guven: yuksek
ozet: "Mobil istemci versioned /api/v1 sözleşmesini, web ve mobil ise aynı domain/application servislerini kullanır."
kaynaklar:
  - docs/roadmaps/platform-master-plan.md
  - docs/neta-backend-mobile-api-master-plan.md
  - apps/neta-app/server/api/v1
ilgili:
  - "[[03-mimari/api|API]]"
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
  - "[[04-bilesenler/api-contracts|api-contracts]]"
  - "[[06-kararlar/adr-007-evrensel-mobil-uygulama|ADR-007]]"
  - "[[06-kararlar/adr-008-owner-device-pairing|ADR-008]]"
etiketler:
  - neta
  - karar
  - api
  - mobil
---

# ADR-006 — Mobil için versioned API ve ortak domain servisleri

> Son güncelleme: **2026-09-03** — MOB-1 ortak bootstrap contract/presenter sınırı uygulandı; resource parity planlanan olarak kaldı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Owner ve portal resource transport'u kodda mevcut; release kabulü açık

## Bağlam

Next.js Server Actions web'e özgü transport mekanizmasıdır ve native mobil istemci için kararlı bir wire contract değildir. Aynı iş kurallarının web ve mobil için iki ayrı backend yolunda çoğalması drift riski doğurur.

## Karar

Mobil istemci version-aware `/api/v1` HTTP sözleşmesini kullanacaktır. Web action'ları ve mobil route'lar aynı transport-bağımsız domain/application servislerini çağıracaktır. Paylaşılan paket source of truth değil, wire contract sınırıdır.

## Gerekçe

- Mobil için açık, test edilebilir ve sürümlenebilir bir API sağlar.
- Authorization ve iş kurallarının transportlar arasında çoğalmasını önler.
- Presenter ve contract testleriyle istemci drift'ini görünür kılar.

## Değerlendirilen alternatifler

- Mobil için ayrı backend veya BaaS.
- Server Actions davranışını native istemcide emüle etmek.
- Route handler içinde domain kurallarını yeniden yazmak.

## Varsayımlar

- Domain servisleri Next.js request/response nesnelerinden bağımsız kalabilir.
- Instance capability ve API versiyonu discovery sırasında doğrulanabilir.
- Mobil ile backend release'leri aynı anda güncellenmeyebilir.

## Etkilenen sistemler ve sonuçlar

- Hedef istek hattı auth → parse → service → presenter → response biçimindedir.
- `packages/api-contracts` shared wire tipleri ve şemaları taşır.
- Consumer contract testleri ve capability doğruluğu release gate olmalıdır.

## Mevcut ve planlanan davranış

Bootstrap/discovery, owner resource read/mutation/parity, pairing ve client portal transport'u `/api/v1` altında kodda mevcuttur. Backend ve mobil shared contract/guard sınırını kullanır; strict input, presenter, JSON 404/405, kalıcı idempotency ve optimistic concurrency uygulanmıştır. Signed cihaz, iki canlı HTTPS instance, pairing restore/revoke ve cross-client izolasyon kabulü ayrı release kanıtı olarak açıktır.

## Yeniden değerlendirme koşulları

- Canonical backend'in Next.js runtime'dan ayrılması.
- Versioned REST yerine farklı bir wire protocolünün ölçülmüş üstünlük ve migration planıyla seçilmesi.

## Canonical kaynaklar

- [[docs/roadmaps/platform-master-plan]]
- [[docs/neta-backend-mobile-api-master-plan]]
- `apps/neta-app/server/api/v1/`
