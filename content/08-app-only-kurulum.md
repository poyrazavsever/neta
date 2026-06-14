---
title: App-Only Kurulum
description: Mevcut bir Supabase projesine bağlanarak Neta çalıştırma.
order: 8
---

# App-Only Kurulum

App-only kurulumda yalnızca Neta web uygulaması çalışır. Auth, veritabanı, REST API ve Storage servisleri mevcut bir Supabase projesinden sağlanır.

Bu model, harici Supabase kullanmak isteyen veya mevcut Supabase altyapısına sahip kullanıcılar için uygundur.

## Ne Zaman Kullanılır?

App-only mod şu durumlarda tercih edilebilir:

- Zaten aktif bir Supabase projen varsa
- Veritabanını managed servis olarak kullanmak istiyorsan
- Neta uygulamasını ayrı bir sunucuda yayınlamak istiyorsan
- Full-stack self-host yerine Supabase'in hosted altyapısını kullanmak istiyorsan

İlk MVP için tam self-host hedefleniyorsa full-stack mod daha uygundur.

## Gerekli Değerler

App-only mod için gerekli environment değerleri:

```env
NEXT_PUBLIC_SITE_URL=https://app.example.com
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_INTERNAL_URL=https://project-ref.supabase.co
```

Migration çalıştırmak için ayrıca doğrudan PostgreSQL bağlantısı gerekir:

```env
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

## Migration'ları Uygula

App-only modda migration dosyaları otomatik uygulanmaz. Neta'nın SQL dosyalarını bağlandığın Supabase projesinde çalıştırman gerekir.

Repository kökünde:

```bash
DATABASE_URL='postgresql://postgres:password@host:5432/postgres' sh ./scripts/apply-migrations.sh
```

Bu script şu dosyaları sırayla uygular:

- `supabase/schema.sql`
- `supabase/migrations/0002_add_freelancer_os_core_tables.sql`
- `supabase/migrations/0003_add_project_planning_assets.sql`
- `supabase/migrations/0004_add_business_os_tables.sql`
- `supabase/migrations/0005_add_advanced_crm_tables.sql`
- `supabase/migrations/0006_add_pgvector_and_embeddings.sql`
- `supabase/migrations/0007_add_client_portal_tables.sql`
- `supabase/migrations/0008_add_project_progress_and_quota.sql`
- `supabase/migrations/0009_lock_registration_after_first_admin.sql`

## Doğru Projeye Uyguladığından Emin Ol

En önemli kural:

```text
Migration hangi Supabase projesinde çalıştıysa uygulama da aynı projeye bağlanmalıdır.
```

Uygulama `NEXT_PUBLIC_SUPABASE_URL` değerindeki projeye istek atar. Migration farklı bir projede çalıştıysa `/register`, login veya veri işlemleri hata verebilir.

## Docker ile Başlat

App-only modda şu Compose dosyası kullanılır:

```bash
docker compose up -d --build
```

Bu Compose dosyası sadece web uygulamasını çalıştırır ve harici Supabase değerlerini bekler.

## `.env.local` Uyarısı

Lokal geliştirme sırasında Next.js `.env.local` dosyasını okur.

Eğer `.env.local` şu şekilde hosted Supabase'e bakıyorsa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
```

lokal `pnpm dev` çalıştırdığında self-host Docker veritabanı değil bu hosted Supabase projesi kullanılır.

Self-host Docker stack ile lokal geliştirme yapmak istiyorsan `.env.local` değerlerini buna göre düzenlemen gerekir.

## İlk Admin

Migrationlar doğru projede çalıştıktan sonra `/register` sayfası ilk admin oluşturmak için kullanılabilir.

Eğer `is_first_admin_setup_available()` fonksiyonu `false` dönüyorsa, o projede zaten profil kaydı vardır ve kayıt kapalıdır.

