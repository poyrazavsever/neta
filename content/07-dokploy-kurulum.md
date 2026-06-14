---
title: Dokploy Kurulumu
description: Neta'yı Dokploy üzerinde self-host etme adımları.
order: 7
---

# Dokploy Kurulumu

Dokploy üzerinde Neta'yı yayınlamak için önerilen yol full-stack Docker Compose kurulumudur. Bu kurulumda Neta, kendi PostgreSQL ve Supabase uyumlu servisleriyle birlikte çalışır.

## Yeni Compose App Oluştur

Dokploy panelinde yeni bir Compose app oluştur.

Repository olarak Neta repository'sini seç ve Compose dosyası olarak şunu kullan:

```text
docker-compose.full.yml
```

## Environment Hazırlığı

Neta için gerekli env değerlerini üret:

```bash
node scripts/generate-full-stack-env.mjs
```

Çıkan değerleri Dokploy environment bölümüne ekle.

Production için özellikle şu değerleri düzenle:

```env
NEXT_PUBLIC_SITE_URL=https://app.example.com
NEXT_PUBLIC_SUPABASE_URL=https://api.example.com
```

`JWT_SECRET`, `POSTGRES_PASSWORD`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini gizli bilgi olarak sakla.

## Servis Yönlendirmeleri

Neta web uygulaması:

```text
neta-web:3000
```

Bundled Supabase API:

```text
neta-supabase-proxy:8000
```

olarak yönlendirilmelidir.

Önerilen domain yapısı:

```text
app.example.com  -> neta-web:3000
api.example.com  -> neta-supabase-proxy:8000
```

Bu yapı, tarayıcı tarafındaki Auth, REST ve Storage çağrılarının doğru proxy'ye gitmesini sağlar.

## Deploy Süreci

Dokploy deploy başlattığında:

1. `neta-db` başlar.
2. Supabase Auth kendi tablolarını hazırlar.
3. Storage ve PostgREST servisleri başlar.
4. `neta-migrations` Neta SQL dosyalarını uygular.
5. Proxy healthy olduktan sonra web uygulaması başlar.

Bu sıra Compose içindeki dependency kurallarıyla yönetilir.

## İlk Admin Hesabı

Deploy tamamlandıktan sonra:

```text
https://app.example.com/register
```

sayfasını aç.

İlk kullanıcı oluşturulduktan sonra kayıt ekranı kapanır. Daha sonra giriş için:

```text
https://app.example.com/login
```

sayfası kullanılır.

## Dokploy Sonrası Kontrol

Şunları kontrol et:

- Web domaini açılıyor mu?
- API domaininde `/health` endpointi cevap veriyor mu?
- İlk admin oluşturulabiliyor mu?
- Giriş yapılabiliyor mu?
- Dokploy servis loglarında migration hatası yok mu?

API health kontrolü örneği:

```text
https://api.example.com/health
```

## Güncelleme

Yeni sürüme geçmeden önce yedek al:

```bash
sh ./scripts/selfhost-backup.sh
```

Ardından Dokploy üzerinden yeni deploy başlat.

## Dikkat Edilmesi Gerekenler

- `docker-compose.yml` değil, full-stack kurulum için `docker-compose.full.yml` kullanılmalıdır.
- `NEXT_PUBLIC_SUPABASE_URL` dışarıdan erişilebilir olmalıdır.
- Service role key hiçbir zaman client tarafında paylaşılmamalıdır.
- PostgreSQL volume kalıcı olmalıdır.
- Storage volume kalıcı olmalıdır.

