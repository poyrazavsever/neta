---
tur: mimari
durum: mevcut
guncellendi: 2026-09-16
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

Project asset en fazla 10 MiB; diğer türler 5 MiB. JPEG/PNG/WebP/GIF; ikon PNG; PDF yalnız project asset; SVG yoktur. V1 image upload gerçek decode/re-encode ile metadata temizler. PDF header/EOF doğrulamasıyla kabul edilir, `metadataSanitized=false` ve download `attachment` olur. Magic-byte kontrolü PDF parsing/malware/content-disarm kabulü değildir; malware scanning uygulanmamıştır.

Mobil dosya indirme URL'si `/api/v1/files/:id` olur. Aynı FileService authorization'ı owner Bearer + `files:read`, owner cookie ve scoped client cookie için uygulanır; response private/no-store'dur. Native indirme seçilmiş origin ve file ID/MIME/size'ı kontrol eder, cache dosyasını share sonrası finally siler. Legacy `/api/files/:id` cookie yüzeyi korunur.

## Operasyon

Uploads DB ile birlikte backup/restore edilmelidir. Sadece DB veya sadece dosya ağacını geri yüklemek referans bütünlüğünü bozabilir.

## Delete authorization

2026-09-16 güvenlik kabulünde iki gerçek client session'ıyla portal-visible/private/foreign download ve metadata negatifleri doğrulandı. Delete, unreadable yabancı dosya ile olmayan ID için aynı `404` üretir; izinli portal dosyasını silme gibi actor'ın görebildiği ama yetkisiz işlemler `403` kalır. Ortak `FileService` read authorization'ını delete öncesinde de uygular. [[docs/mobile/mobile-security-acceptance]] HTTP portal kanıtını native dosya transport kabulünden ayırır.

## Kaynaklar

- `apps/neta-app/server/files/`
- [[docs/self-hosted-redesign/phase-3-storage-branding]]
