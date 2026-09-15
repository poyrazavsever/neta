---
tur: mimari
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/files/service.ts
  - apps/neta-app/server/files/policy.ts
  - apps/neta-app/server/files/paths.ts
  - apps/neta-app/server/db/schema/storage.ts
ilgili:
  - "[[02-domainler/dosyalar-ve-markalama|Dosyalar ve markalama]]"
  - "[[03-mimari/veri-kaliciigi|Veri kalıcılığı]]"
etiketler:
  - neta
  - mimari
  - storage
---

# Dosya depolama

## Tasarım

Dosya bytes local `uploads/` ağacında, authorization ve bütünlük metadata'sı SQLite `files` tablosunda yaşar. Kullanıcı path seçmez; kind ve server-generated ID'den storage path üretilir.

## Yazma akışı

1. Boyut, claimed MIME ve magic bytes doğrulanır.
2. Original name normalize edilir; SHA-256 hesaplanır.
3. Actor ve kind'dan owner/auth user/project/visibility çözülür.
4. Bytes `tmp/upload-*.tmp` içine exclusive ve `0600` ile yazılır.
5. Final path oluşturulur; DB metadata transaction içinde eklenir.
6. DB hatasında geçici/final dosya temizlenir.

## Okuma ve silme

Read authorization metadata üzerinden uygulanır. Fiziksel file `O_NOFOLLOW` ile açılır, regular file ve kayıtlı byte size doğrulanır. Silme önce aynı data kökündeki tmp trash path'ine rename eder; DB transaction başarısızsa geri taşır.

## Erişim matrisi

| Dosya | Owner | İlgili client | Public |
| --- | --- | --- | --- |
| Owner/client avatarı | Scope'a göre | Kendi avatarı | Hayır |
| Private project asset | Kendi owner scope'u | Hayır | Hayır |
| Portal project asset | Kendi owner scope'u | Bağlı projesinde | Hayır |
| Referanslı branding asset | Yönetir | Görüntüler | Kontrollü public read |

## Güvenlik sınırları

5 MB, JPEG/PNG/WebP/GIF; ikon PNG; SVG yoktur. Magic-byte doğrulaması parsing saldırılarını tamamen ortadan kaldırmaz. Image re-encode, EXIF stripping, malware scanning ve content-disarm doğrulanmamıştır.

## Operasyon

Uploads DB ile birlikte backup/restore edilmelidir. Sadece DB veya sadece dosya ağacını geri yüklemek referans bütünlüğünü bozabilir.

## Kaynaklar

- `apps/neta-app/server/files/`
- [[docs/self-hosted-redesign/phase-3-storage-branding]]
