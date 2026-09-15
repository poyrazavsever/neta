---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/files
  - apps/neta-app/server/branding
  - apps/neta-app/server/db/schema/storage.ts
  - apps/neta-app/app/api/files
  - apps/neta-app/app/api/branding
ilgili:
  - "[[03-mimari/dosya-depolama|Dosya depolama]]"
  - "[[02-domainler/projeler-ve-planlama|Projeler]]"
etiketler:
  - neta
  - domain
  - dosya
  - branding
---

# Dosyalar ve markalama

## Amaç

Avatar, marka görselleri ve proje asset'lerini güvenli local storage'da tutmak; instance'ın workspace adı, logo, favicon, renk ve görünüm ayarlarını web ve discovery yüzeylerine uygulamak.

## Mevcut davranış

`FileService` dosya metadata'sı ile fiziksel yazmayı koordine eder. Upload geçici dosyaya `0600` moduyla yazılır, final path service tarafından üretilir ve DB transaction başarısız olursa dosya geri alınır. Silme, dosyayı önce tmp/trash'a taşıyarak DB işlemiyle koordine edilir.

Branding owner-only mutation ile SQLite'a yazılır; root layout, manifest, portal ve `/api/v1/meta` public marka çıktısını kullanır.

## Temel kavramlar / entity'ler

- `files`: sahip, uploader, auth user/proje bağı, kind, visibility, storage path, MIME, boyut ve SHA-256.
- `instanceBranding`: uygulama/workspace adı, light/dark logo, ikon, ana/accent renk, color mode ve radius.
- Kind: `avatar`, `branding_logo`, `branding_icon`, `project_asset`.
- Visibility: `private`, `portal`, `public_branding`.

## Veri kalıcılığı

Metadata SQLite'ta, bytes `DATA_DIR/uploads` altındadır. DB ve upload ağacı birlikte backup/restore edilir.

## API yüzeyi

Web için `POST /api/files`, `GET/DELETE /api/files/:id` ve branding route'u vardır. Public branding yalnız referans verilmiş public marka asset'ini sunar. Mobilin versioned files resource API'si henüz yoktur.

## Yetkilendirme

Owner kendi dosyalarını görür/siler. Client kendi avatarını yönetebilir; proje asset'ini ancak bağlı projede ve `portal` görünürlükte okuyabilir. Branding upload owner-only ve public read kontrollüdür.

## Güvenlik

5 MB sınırı, görsel MIME allowlist'i, magic-byte kontrolü, PNG-only ikon, normalize dosya adı, server-generated path, no-follow read ve metadata boyut doğrulaması vardır. SVG kabul edilmez. Bu kontroller içerik decode/re-encode veya malware scanning yaptığı anlamına gelmez.

## Sınırlamalar / plan

Yalnız görsel formatları desteklenir. Görsel metadata temizliği doğrulanmış değildir ve mobil API planında açık boşluktur. Object storage/CDN mevcut değildir.

## Kaynaklar

- `apps/neta-app/server/files/service.ts`
- `apps/neta-app/server/files/policy.ts`
- [[docs/self-hosted-redesign/phase-3-storage-branding]]
