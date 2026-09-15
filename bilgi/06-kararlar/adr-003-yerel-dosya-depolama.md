---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
onceki_kimlik: K-003
guncellendi: 2026-09-03
guven: yuksek
ozet: "Upload byte'ları yerel persistent filesystem'da, erişim metadata'sı SQLite'ta saklanır."
kaynaklar:
  - docs/self-hosted-redesign/phase-3-storage-branding.md
  - apps/neta-app/server/files
ilgili:
  - "[[03-mimari/dosya-depolama|Dosya depolama]]"
  - "[[02-domainler/dosyalar-ve-markalama|Dosyalar ve markalama]]"
  - "[[06-kararlar/adr-002-tek-process-tek-veri-dizini|ADR-002]]"
  - "[[06-kararlar/adr-009-backup-restore-ve-downgrade-politikasi|ADR-009]]"
etiketler:
  - neta
  - karar
  - dosya-depolama
---

# ADR-003 — Yerel filesystem storage

> Son güncelleme: **2026-09-03** — Toplu karar kaydındaki K-003 bağımsız ADR notuna ayrıldı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Self-hosted instance upload'ları harici object storage zorunluluğu olmadan saklamalı; dosya görünürlüğü ve sahipliği byte yolundan değil doğrulanmış ürün metadata'sından yönetilmelidir.

## Karar

Upload byte'ları persistent yerel filesystem'da, dosya metadata'sı ve erişim kapsamı SQLite'ta tutulur.

## Gerekçe

- Harici object storage servis bağımlılığını kaldırır.
- DB ve upload'ların tek instance veri alanında taşınmasını mümkün kılar.
- Yetkilendirmeyi ham dosya yolundan ayırır.

## Değerlendirilen alternatifler

- S3-compatible object storage.
- Veritabanında blob saklama.
- Public static klasörden doğrudan sunma.

## Varsayımlar

- Tek host ve yazılabilir persistent volume vardır.
- Staging ile final dosya yolu aynı filesystem üzerindedir.
- DB metadata'sı ile dosya byte'ları birlikte yedeklenir.

## Etkilenen sistemler ve sonuçlar

- Dosya servisleri path traversal ve symlink sınırını enforcement etmelidir.
- Client portal erişimi metadata tabanlı görünürlük kontrolünden geçer.
- Çok node, CDN veya remote object storage bu kararın doğal uzantısı değildir.

## Uygulama kanıtı

`apps/neta-app/server/files/` storage root, upload koordinasyonu ve yetkilendirilmiş erişim akışlarını içerir. Ayrıntı [[03-mimari/dosya-depolama|dosya depolama]] sayfasındadır.

## Yeniden değerlendirme koşulları

- Multi-node runtime veya CDN zorunluluğu.
- Tek volume kapasitesini aşan medya kullanımı.
- Remote/off-site storage'ın ürün gereksinimi hâline gelmesi.

## Canonical kaynaklar

- [[docs/self-hosted-redesign/phase-3-storage-branding]]
- `apps/neta-app/server/files/`
