---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
onceki_kimlik: K-005
guncellendi: 2026-09-03
guven: yuksek
ozet: "Supabase aktif Neta build/runtime bağımlılığı değildir; yalnız legacy veri import kaynağı olabilir."
kaynaklar:
  - docs/self-hosted-redesign/release-readiness-2026-07-18.md
  - README.md
ilgili:
  - "[[03-mimari/runtime|Runtime]]"
  - "[[05-is-akislari/supabase-importu|Supabase importu]]"
  - "[[06-kararlar/adr-001-sqlite-kalici-veri|ADR-001]]"
  - "[[06-kararlar/adr-004-better-auth-ve-uygulama-profili|ADR-004]]"
etiketler:
  - neta
  - karar
  - supabase
  - legacy
---

# ADR-005 — Supabase runtime bağımlılığının kaldırılması

> Son güncelleme: **2026-09-03** — Toplu karar kaydındaki K-005 bağımsız ADR notuna ayrıldı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Gerçek self-hosting, temel uygulama işlevleri için üçüncü taraf BaaS hesabı veya servisi gerektirmemelidir. Önceki Neta kurulumlarındaki veri yine de kontrollü biçimde taşınabilmelidir.

## Karar

Supabase package, environment değişkeni veya servisi aktif build/runtime için zorunlu değildir. Supabase yalnız legacy export bundle'ının kaynağı olarak import aracında anılabilir.

## Gerekçe

- Self-host edilen sistemin çalışmasını harici BaaS availability ve hesabından ayırır.
- Auth, DB ve storage verisini instance sahibinin kontrolüne taşır.
- Deployment ve secret yüzeyini azaltır.

## Değerlendirilen alternatifler

- Supabase'i auth, database veya storage için zorunlu tutmak.
- Runtime ile legacy migration yolunu aynı dependency graph içinde bırakmak.

## Varsayımlar

- Legacy veri offline ve doğrulanabilir export bundle ile taşınabilir.
- Eski auth şifre hash'leri ve session'lar güvenli biçimde yeniden kullanılamaz.

## Etkilenen sistemler ve sonuçlar

- Legacy kullanıcılar yeni credential/invitation lifecycle'ına girer.
- Supabase referansları mevcut runtime capability kanıtı sayılmaz.
- Yeni bir managed backend seçimi bu kararın küçük revizyonu değil, ayrı mimari karar olur.

## Uygulama kanıtı

[[README]] self-hosted runtime'ı SQLite ve yerel persistence ile tanımlar. Release readiness kaydı aktif dependency/env taramasının Supabase zorunluluğu göstermediğini belgeler.

## Yeniden değerlendirme koşulları

Mevcut self-hosted runtime için dönüş tetikleyicisi yoktur. Gelecekte managed veya merkezi backend seçilirse yeni bir ADR gerekir.

## Canonical kaynaklar

- [[docs/self-hosted-redesign/release-readiness-2026-07-18]]
- [[README]]
