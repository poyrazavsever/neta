---
tur: sistem
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - apps/neta-app/server/db/schema
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[01-urun/neta|Neta]]"
etiketler:
  - neta
  - sozluk
---

# Sözlük

| Terim | Bu repository'deki anlamı |
| --- | --- |
| Instance | Bir owner'a ait, kendi origin'i, DB'si, dosya alanı ve markası olan self-hosted Neta kurulumu. |
| Owner / freelancer | Instance'ın tek yönetici kullanıcısı; kodda canonical rol değeri `freelancer`. |
| Client | Owner'ın müşteri kaydına bağlı, davetle oluşturulan sınırlı portal kullanıcısı. |
| Portal | Client rolüne açılan, yalnız bağlı müşterinin paylaşılabilir verisini gösteren yüzey. |
| Domain service | Transporttan bağımsız iş kuralları ve transaction koordinasyonu. |
| Actor | Doğrulanmış session'dan türetilen kullanıcı/rol/client bağlamı. |
| Scope | Actor'ın erişebildiği owner veya client veri sınırı. |
| Capability | Bir instance'ın belirli bir API/yetenek sözleşmesini hangi durum ve erişimle sunduğunu bildiren kayıt. |
| Discovery | `/.well-known/neta` ve `/api/v1/meta` ile instance kimliği, API URL'si, sürüm, marka ve dil bilgisini öğrenme. |
| Pairing | Planlanan, kısa ömürlü tek kullanımlık secret ile cihaz token ailesi oluşturma akışı. |
| Persistent data directory | SQLite, upload, backup ve tmp alanlarını barındıran kalıcı kök; production varsayılanı `/app/data`. |
| Canonical kaynak | Güncel kod, migration, README, ADR, roadmap veya runbook; bilgi kasasından daha öncelikli kanıt. |
| Mevcut | Bugünkü implementation içinde doğrulanmış davranış. |
| Planlanan | Belgelenmiş hedef; çalışan capability değildir. |
| Legacy | Eski mimarinin korunmuş import/tarih kayıtları; yeni runtime'ın bağımlılığı değildir. |
| Wire contract | Mobil/backend arasında JSON üzerinden taşınan DTO, enum, envelope ve runtime guard sözleşmesi. |
| Restore rehearsal | Backup'ı ayrı hedefe geri yükleyip bütünlüğü üretimi etkilemeden doğrulama provası. |
