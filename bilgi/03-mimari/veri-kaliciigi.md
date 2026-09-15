---
tur: mimari
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/config.ts
  - apps/neta-app/server/db/schema
  - apps/neta-app/server/files
  - apps/neta-app/scripts/backup.mjs
ilgili:
  - "[[03-mimari/sqlite|SQLite]]"
  - "[[03-mimari/dosya-depolama|Dosya depolama]]"
  - "[[08-operasyon/yedekleme|Yedekleme]]"
etiketler:
  - neta
  - mimari
  - persistence
---

# Veri kalıcılığı

## Kalıcı veri ağacı

```text
/app/data/
  neta.db       # auth, domain, ayar, i18n, metadata
  uploads/      # avatar, branding ve project asset bytes
  backups/      # local backup bundle'ları
  tmp/          # upload/delete/restore staging
```

`DATA_DIR` değiştirilebilir; ancak bu alt alanların aynı kalıcı kök içinde olması backup/restore ve atomik rename modelinin temelidir.

## Veri sahipliği

Tek owner olmasına rağmen domain tablolarının çoğunda owner user ID açıkça taşınır; bu, scope enforcement ve olası veri bütünlüğü için kullanılır. Client kayıtları aynı DB'de role/profile/client ilişkisiyle izole edilir.

## DB–filesystem koordinasyonu

File metadata SQLite'ta, bytes uploads ağacındadır. Upload/silme servisleri geçici veya trash path kullanarak DB transaction başarısızlığında fiziksel state'i geri alır. Bu tam dağıtık transaction değildir; aynı host/same-filesystem varsayımına dayanır.

## Backup sınırı

DB ve uploads aynı backup bundle'ında doğrulanır. `tmp` runtime staging alanıdır ve backup kapsamı değildir. `backups` dizini kendi içine recursive backup edilmez.

## Kalıcı kimlikler

Instance ID `instance_settings` içinde yaşar ve restore ile korunur. Domain ID'leri opaque string olarak istemcilere taşınmalıdır; istemci UUID formatına iş mantığı bağlamamalıdır.

## Operasyonel sonuçlar

- Volume bağlanmazsa container değişiminde tüm veri kaybolabilir.
- Aynı SQLite/volume'a multi-replica yasaktır.
- Disk doluluğu DB write, upload, backup ve restore staging'i birlikte etkiler.
- Local backup aynı disk arızasına karşı yeterli değildir.
- Filesystem permission ve backup erişimi auth kadar kritik güvenlik sınırıdır.

## Kaynaklar

- [[README]]
- `apps/neta-app/server/config.ts`
- [[docs/self-hosted-redesign/phase-3-storage-branding]]
