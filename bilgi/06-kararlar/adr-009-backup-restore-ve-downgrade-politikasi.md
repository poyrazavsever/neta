---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
onceki_kimlik: K-009
guncellendi: 2026-09-03
guven: yuksek
ozet: "Backup DB ve upload manifest/checksum'larını birlikte doğrular; restore staged swap kullanır ve schema downgrade desteklenmez."
kaynaklar:
  - apps/neta-app/scripts/backup.mjs
  - apps/neta-app/scripts/restore.mjs
  - docs/self-hosted-redesign/phase-8-import-release.md
ilgili:
  - "[[08-operasyon/yedekleme|Yedekleme]]"
  - "[[08-operasyon/felaket-kurtarma|Felaket kurtarma]]"
  - "[[02-domainler/yedekleme-ve-geri-yukleme|Yedekleme ve geri yükleme]]"
  - "[[06-kararlar/adr-001-sqlite-kalici-veri|ADR-001]]"
  - "[[06-kararlar/adr-003-yerel-dosya-depolama|ADR-003]]"
etiketler:
  - neta
  - karar
  - backup
  - restore
---

# ADR-009 — Backup/restore doğrulaması ve downgrade politikası

> Son güncelleme: **2026-09-03** — Toplu karar kaydındaki K-009 bağımsız ADR notuna ayrıldı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

Neta'nın kalıcı durumu yalnız SQLite dosyasından ibaret değildir; upload byte'ları da tutarlı kurtarma kümesinin parçasıdır. Eksik, değiştirilmiş veya daha yeni schema içeren backup'ın sessizce restore edilmesi veri kaybı doğurabilir.

## Karar

Backup SQLite snapshot'ı ile upload envanterini manifest ve checksum'larla birlikte üretir. Restore önce staging alanında doğrular, uygulama duruyken swap yapar ve hata durumunda rollback uygular. Schema downgrade desteklenmez.

## Gerekçe

- Partial veya tampered backup'ı cutover öncesinde reddeder.
- DB ile filesystem verisinin aynı kurtarma birimi olduğunu görünür kılar.
- Yarım restore sonrası çalışma riskini azaltır.

## Değerlendirilen alternatifler

- Çalışan DB dosyasını ve upload klasörünü sıradan kopyalamak.
- Doğrulamasız in-place overwrite.
- Her migration için down migration desteklemek.

## Varsayımlar

- Restore sırasında uygulama process'i durdurulabilir.
- Staging ve hedef aynı filesystem üzerinde atomic rename destekler.
- Operatör sürüm düşürmeden önce uygun image ve pre-upgrade backup'ı korur.

## Etkilenen sistemler ve sonuçlar

- Release rollback yalnız eski image'a dönmek değildir; schema uyumlu veri restore'u gerektirir.
- Off-site encryption/retention host operatörünün ayrıca çözmesi gereken alandır.
- Gelecekteki pairing token'ları restore epoch stratejisi gerektirir.

## Uygulama kanıtı

`apps/neta-app/scripts/backup.mjs` ve `restore.mjs` snapshot, manifest/checksum, staging ve rollback akışlarını uygular.

## Yeniden değerlendirme koşulları

- Remote object storage veya distributed persistence'a geçiş.
- Online zero-downtime restore zorunluluğu.
- Point-in-time recovery hedefinin ürün gereksinimi olması.

## Canonical kaynaklar

- `apps/neta-app/scripts/backup.mjs`
- `apps/neta-app/scripts/restore.mjs`
- [[docs/self-hosted-redesign/phase-8-import-release]]
