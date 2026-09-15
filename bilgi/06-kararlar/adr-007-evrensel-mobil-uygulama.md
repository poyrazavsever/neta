---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
onceki_kimlik: K-007
guncellendi: 2026-09-03
guven: yuksek
ozet: "Neta Mobile tek resmî store binary'si olarak runtime'da domain veya QR ile self-hosted instance'a bağlanır."
kaynaklar:
  - docs/roadmaps/platform-master-plan.md
  - apps/neta-mobile/README.md
ilgili:
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
  - "[[02-domainler/instance-ve-mobil-baglanti|Instance ve mobil bağlantı]]"
  - "[[05-is-akislari/mobil-instance-baglantisi|Mobil instance bağlantısı]]"
  - "[[06-kararlar/adr-006-mobil-versioned-api-ve-ortak-domain-servisleri|ADR-006]]"
  - "[[06-kararlar/adr-008-owner-device-pairing|ADR-008]]"
etiketler:
  - neta
  - karar
  - mobil
---

# ADR-007 — Resmî tek evrensel mobil uygulama

> Son güncelleme: **2026-09-03** — Toplu karar kaydındaki K-007 bağımsız ADR notuna ayrıldı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Runtime connect kodda mevcut; mağaza kabulü açık

## Bağlam

Her self-hosting kullanıcısının mobil uygulamayı fork edip kendi domain'iyle yeniden derlemesi son kullanıcı için sürdürülebilir bir kurulum modeli değildir. Resmî mobil uygulamanın farklı instance'lara güvenli biçimde bağlanması gerekir.

## Karar

Temel ürün akışı tek resmî Neta Mobile binary'sidir. Kullanıcı runtime'da domain girerek veya QR/bağlantı tarayarak kendi instance'ını seçer; uygulama discovery, compatibility ve instance identity kontrollerinden sonra giriş akışına geçer.

## Gerekçe

- Store dağıtımı ve güncellemesini merkezileştirir.
- Self-host eden kullanıcıdan native build/signing bilgisi istemez.
- Mobil kurulum deneyimini web instance provisioning'den ayırır.

## Değerlendirilen alternatifler

- Her instance için build-time origin ve ayrı store binary'si.
- Kullanıcının mobil repository'yi fork edip imzalaması.
- İlk sürümden itibaren merkezi kısa kod → domain resolver servisi.

## Varsayımlar

- İlk sürüm açık domain veya QR ile doğrudan bağlantı kurabilir; merkezi resolver zorunlu değildir.
- Instance kendi kullanıcı kimliği ve auth state'inin sahibidir.
- TLS ve instance identity hataları kullanıcıya açık biçimde gösterilebilir.

## Etkilenen sistemler ve sonuçlar

- `EXPO_PUBLIC_NETA_ORIGIN` tabanlı tek-instance davranışı hedef model değildir.
- Runtime origin storage, switching/reset, compatibility ve phishing sınırları gerekir.
- Instance başına tam white-label store binary'si ayrı ürün kararıdır.

## Mevcut davranıştan farkı

Mobil istemci production binary için build-time origin gerektirmez. Runtime domain veya secret-free connect QR, discovery/onay, instance-scoped auth/cache ve instance unutma akışı kodda bulunur. Tek resmî store binary'sinin signed iOS/Android cihazlarda iki canlı HTTPS instance ile kabulü henüz tamamlanmamıştır.

## Yeniden değerlendirme koşulları

- App-store politikalarının dinamik self-hosted origin bağlantısını engellemesi.
- Güçlü white-label dağıtımın temel ücretli ürün olması.
- Merkezi resolver'ın güvenlik veya kullanılabilirlik için zorunlu hâle gelmesi.

## Canonical kaynaklar

- [[docs/roadmaps/platform-master-plan]]
- [[apps/neta-mobile/README]]
