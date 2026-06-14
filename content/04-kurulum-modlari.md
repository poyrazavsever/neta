---
title: Kurulum Modları
description: Full-stack ve app-only kurulum seçenekleri.
order: 4
---

# Kurulum Modları

Neta iki farklı kurulum modeli destekler. Doğru modeli seçmek, migration, environment ve veri konumu açısından önemlidir.

## Full-Stack Kurulum

Full-stack kurulumda Neta ile birlikte gerekli backend servisleri de aynı sunucuda çalışır.

Bu mod şunları içerir:

- Neta web uygulaması
- PostgreSQL
- Supabase Auth
- PostgREST
- Supabase Storage
- Nginx proxy
- Otomatik migration runner

Bu modda harici Supabase hesabına gerek yoktur. İlk MVP için önerilen self-host yolu budur.

## App-Only Kurulum

App-only kurulumda sadece Neta uygulaması çalışır. Veritabanı, Auth, Storage ve API servisleri mevcut bir Supabase projesinden veya Supabase uyumlu bir backend'den sağlanır.

Bu mod şu durumlarda uygundur:

- Zaten aktif bir Supabase projen varsa
- Veritabanını managed servis olarak kullanmak istiyorsan
- Sadece Neta arayüzünü kendi sunucunda yayınlamak istiyorsan

Bu modda migration dosyalarını bağlandığın Supabase projesinin veritabanında manuel çalıştırman gerekir.

## Hangi Mod Seçilmeli?

Çoğu self-host kullanıcısı için önerilen seçenek:

```text
Full-stack kurulum
```

Çünkü bu mod:

- Harici servis gerektirmez.
- Migration işlemlerini otomatik yapar.
- Coolify ve Dokploy gibi araçlarda tek Compose dosyasıyla çalışır.
- Veriyi aynı sunucuda tutar.

App-only mod ise daha ileri kullanıcılar veya mevcut Supabase altyapısını kullanmak isteyenler için uygundur.

## `.env` ve `.env.local` Ayrımı

Bu ayrım kurulum hatalarının en sık sebebidir.

Docker Compose kurulumlarında `.env` dosyası kullanılır.

```bash
node scripts/generate-full-stack-env.mjs > .env
docker compose -f docker-compose.full.yml up -d --build
```

Lokal Next.js geliştirme sırasında ise Next.js `.env.local` dosyasını okur.

```bash
pnpm dev
```

Eğer `.env.local` hosted Supabase projesine bakıyorsa, lokal geliştirme ortamında self-host Docker veritabanına değil hosted Supabase'e bağlanırsın.

## Migration Nerede Çalışır?

Full-stack modda:

- Migration işlemleri `neta-migrations` servisi tarafından otomatik yapılır.
- Kullanıcının SQL dosyalarını manuel çalıştırması gerekmez.

App-only modda:

- Migration dosyaları mevcut Supabase projesinde çalıştırılmalıdır.
- Uygulamanın bağlandığı `NEXT_PUBLIC_SUPABASE_URL` hangi projeyi gösteriyorsa, migration da o projenin veritabanında olmalıdır.

## Coolify ve Dokploy İçin Öneri

Coolify ve Dokploy gibi araçlarda en pratik yöntem:

- Compose dosyası olarak `docker-compose.full.yml` seçmek
- Generated environment değerlerini panelde tanımlamak
- Neta domainini `neta-web:3000` servisine yönlendirmek
- Supabase API gerekiyorsa `neta-supabase-proxy:8000` servisini ayrıca yayınlamak

Bu yapı, kullanıcıya harici Supabase hesabı gerektirmeden tam self-host deneyimi sağlar.

