---
tur: urun
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - docs/self-hosted-redesign/phase-0-adrs.md
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[01-urun/neta|Neta]]"
  - "[[00-sistem/degismez-kurallar|Değişmez kurallar]]"
etiketler:
  - neta
  - urun-ilkeleri
---

# Ürün felsefesi

## Veri sahibinin yanında yaşar

Neta'nın ana ayrımı self-hosting'dir. Kimlik, iş verisi, dosya ve ayar bir merkezi SaaS hesabında değil, owner'ın yönettiği instance'ta bulunur. Mobil istemci hedefte bile bağımsız veri otoritesi olmaz; instance'a bağlanır.

## Küçük ve anlaşılır operasyon

Tek Node process, tek SQLite DB ve tek persistent data kökü bilinçli bir sadelik tercihidir. Bu model yatay ölçeği değil; tek freelancer kullanımında taşınabilirlik, backup anlaşılabilirliği ve düşük yönetim maliyetini optimize eder.

## Kontrollü paylaşım

Müşteri portalı ikinci bir owner paneli değildir. Owner'ın davet ettiği client, yalnız bağlı müşteri ve portal için açılmış kaynaklara ulaşır. Yetki kapsamı kullanıcı girdisinden değil doğrulanmış actor'dan çıkar.

## Özelleştirme instance seviyesindedir

Workspace adı, logo, favicon, renk, görünüm ve diller aynı app kodunu kişiselleştirir. Hedef mobil mimaride branding discovery üzerinden resmî uygulamaya taşınır; her owner için ayrı store binary temel ürün akışı değildir.

## Güvenilirlik gösterişli kolaylıktan önce gelir

Backup/restore bütünlüğü, deterministic migration, secret'ların server-side kalması ve planlananın “çalışıyor” diye ilan edilmemesi ürün güveninin parçasıdır.

## AI seçilebilir bir dış bağımlılıktır

AI core runtime zorunluluğu değildir. Owner sağlayıcı seçer; Ollama ile yerel veya API key ile harici sağlayıcı kullanabilir. Provider arızası temel kayıt yönetiminin çalışmasını engellememelidir.

## İlk release'te bilinçli olmayanlar

- Merkezi Neta hesabı veya tenant cloud.
- Aynı SQLite'a yazan multi-replica.
- Tam offline mutation/merge.
- Domain bilinmeden çalışan merkezi kısa kod resolver.
- Her instance için ayrı mağaza uygulaması.

## Kaynaklar

- [[README]]
- [[docs/self-hosted-redesign/phase-0-adrs]]
- [[docs/roadmaps/platform-master-plan]]
