---
tur: is-akisi
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - apps/neta-app/scripts/backup.mjs
  - apps/neta-app/scripts/restore.mjs
ilgili:
  - "[[08-operasyon/yedekleme|Yedekleme operasyonu]]"
  - "[[02-domainler/yedekleme-ve-geri-yukleme|Backup domaini]]"
etiketler:
  - neta
  - is-akisi
  - backup
---

# Yedekleme ve geri yükleme akışı

## Backup

1. Yeterli disk ve writable `DATA_DIR` doğrulanır.
2. `pnpm db:backup -- --retention-count N` çalıştırılır.
3. SQLite online backup API ile `neta.db` snapshot oluşturulur.
4. Upload ağacı symlink reddedilerek kopyalanır.
5. DB ve her upload için size + SHA-256 manifest yazılır.
6. Retention verildiyse en yeni geçerli N backup korunur.
7. Bundle host dışındaki şifreli hedefe kopyalanır.

## Restore rehearsal

1. Production'ı etkilemeyen ayrı `--target` seçilir.
2. Restore bundle manifest/path/symlink/size/checksum/completeness doğrulamasından geçer.
3. DB açılır; foreign keys, beklenen kayıtlar, locale, files ve login planı doğrulanır.
4. Prova tarihi ve sonucu operasyon kaydına yazılır.

## Gerçek restore

1. Uygulama process'i durdurulur ve maintenance ilan edilir.
2. Doğru bundle ve hedef iki kez doğrulanır.
3. `db:restore -- --from ... --force` çalıştırılır.
4. Script stage DB/uploads oluşturur; mevcut hedefleri rollback path'e taşır.
5. Stage rename ile kurulur; hata olursa eski hedef geri alınır.
6. Migration yalnız hedef release planına göre çalıştırılır.
7. Readiness, owner login, client/project/portal/file smoke yapılır.

## Kritik sınırlar

Restore aynı filesystem rename varsayar. Pairing geldiğinde başarılı restore sonunda device token epoch rotate edilmeden bu akış güvenli sayılmayacaktır.

## Kaynaklar

- [[README]]
- `apps/neta-app/scripts/backup.mjs`
- `apps/neta-app/scripts/restore.mjs`
