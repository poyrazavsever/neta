---
title: Coolify Kurulumu
description: Neta'yı Coolify üzerinde full-stack olarak yayınlama.
order: 6
---

# Coolify Kurulumu

Coolify, Neta'yı self-host etmek için uygun bir platformdur. Önerilen yöntem, `docker-compose.full.yml` dosyasını kullanarak full-stack kurulum yapmaktır.

## Kurulum Modeli

Coolify üzerinde önerilen model:

```text
Full-stack Neta kurulumu
```

Bu modelde Neta ile birlikte PostgreSQL, Auth, PostgREST, Storage ve proxy servisleri de aynı Compose uygulamasında çalışır.

## Repository Bağlama

Coolify içinde yeni bir proje oluştur ve Neta repository'sini bağla.

Compose dosyası olarak:

```text
docker-compose.full.yml
```

seçilmelidir.

## Environment Değerlerini Üret

Lokal ortamda veya sunucuda şu komutu çalıştır:

```bash
node scripts/generate-full-stack-env.mjs
```

Komutun ürettiği değerleri Coolify environment paneline ekle.

En önemli değerler:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `POSTGRES_PASSWORD`
- `NETA_PORT`
- `SUPABASE_API_PORT`
- `POSTGRES_PORT`

## Domain Ayarları

Neta uygulaması için domain:

```text
neta-web:3000
```

servisine yönlendirilmelidir.

Supabase API için ayrı domain kullanacaksan:

```text
neta-supabase-proxy:8000
```

servisine yönlendirilmelidir.

Örnek yapı:

```text
https://app.example.com        -> neta-web:3000
https://api.example.com        -> neta-supabase-proxy:8000
```

Bu durumda environment değerleri şöyle olmalıdır:

```env
NEXT_PUBLIC_SITE_URL=https://app.example.com
NEXT_PUBLIC_SUPABASE_URL=https://api.example.com
```

## Tek Domain Kullanımı

Coolify üzerinde en temiz yapı ayrı API domain kullanmaktır. Tek domain altında path-based routing yapılacaksa proxy kuralları dikkatli ayarlanmalıdır.

MVP için önerilen pratik yaklaşım:

- Bir domain Neta uygulaması için
- Bir subdomain Supabase API için

## Deploy

Environment değerleri eklendikten sonra deploy başlatılır.

Deploy sırasında:

- Web uygulaması build edilir.
- Veritabanı başlatılır.
- Supabase Auth kendi migrationlarını uygular.
- Neta migrationları `neta-migrations` servisi ile çalışır.
- Web uygulaması proxy ve migration tamamlanmadan başlamaz.

## İlk Kontrol Listesi

Deploy sonrası şunları kontrol et:

- `neta-db` healthy durumda mı?
- `neta-supabase-proxy` healthy durumda mı?
- `neta-web` healthy durumda mı?
- `neta-migrations` başarıyla tamamlandı mı?
- `/register` sayfası ilk admin için açılıyor mu?
- İlk admin oluşturulduktan sonra `/register` kapanıyor mu?

## Sık Yapılan Hatalar

### Yanlış Compose Dosyası

Full-stack self-host için `docker-compose.full.yml` kullanılmalıdır. Sadece `docker-compose.yml` kullanılırsa uygulama harici Supabase bekler.

### Eksik Environment

Coolify panelinde zorunlu env değerleri eksikse Compose build veya runtime sırasında hata verir.

### Yanlış Public URL

`NEXT_PUBLIC_SITE_URL` ve `NEXT_PUBLIC_SUPABASE_URL` gerçek public domainlerle uyumlu olmalıdır. Localhost değerleri production domaininde kullanılmamalıdır.

### Supabase API Domaini Yayınlanmadı

Tarayıcı Auth ve REST çağrıları için `NEXT_PUBLIC_SUPABASE_URL` değerine erişebilmelidir. Bu URL dışarıdan erişilemiyorsa login ve kayıt işlemleri çalışmaz.

