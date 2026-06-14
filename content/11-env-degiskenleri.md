---
title: Ortam Değişkenleri
description: Neta kurulumunda kullanılan environment değişkenleri.
order: 11
---

# Ortam Değişkenleri

Neta kurulumunda environment değişkenleri uygulamanın hangi URL'leri kullanacağını, Supabase bağlantılarını, JWT secret değerlerini ve portları belirler.

## Dosya Ayrımı

Docker Compose:

```text
.env
```

dosyasını kullanır.

Lokal Next.js geliştirme:

```text
.env.local
```

dosyasını kullanır.

Bu ayrım önemlidir. `.env.local` hosted Supabase'e bakarken Docker full-stack farklı bir `.env` ile çalışıyor olabilir.

## Full-Stack Değerleri

Full-stack mod için env üretmek:

```bash
node scripts/generate-full-stack-env.mjs > .env
```

Temel değişkenler:

```env
NETA_INSTALL_MODE=full-stack
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NETA_PORT=3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
SUPABASE_API_PORT=8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
POSTGRES_PASSWORD=...
POSTGRES_PORT=54322
JWT_EXPIRY=3600
SMTP_ADMIN_EMAIL=admin@neta.local
```

## `NEXT_PUBLIC_SITE_URL`

Neta uygulamasının public URL değeridir.

Local örnek:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Production örnek:

```env
NEXT_PUBLIC_SITE_URL=https://app.example.com
```

Auth redirect ve site URL kontrollerinde kullanılır.

## `NEXT_PUBLIC_SUPABASE_URL`

Tarayıcıdan erişilebilen Supabase API URL değeridir.

Full-stack local örnek:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
```

Production örnek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://api.example.com
```

Bu URL dışarıdan erişilebilir olmalıdır. Tarayıcı Auth, REST ve Storage çağrıları için bu değeri kullanır.

## `SUPABASE_INTERNAL_URL`

Uygulama container içinden Supabase proxy'ye bağlanırken kullanılabilir.

Full-stack Compose içinde varsayılan:

```env
SUPABASE_INTERNAL_URL=http://neta-supabase-proxy:8000
```

Bu değer genellikle manuel ayarlanmaz, Compose içinde verilir.

## `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase anon JWT değeridir. Client tarafında kullanılabilir, ama yine de doğru JWT secret ile üretilmiş olmalıdır.

Full-stack modda script tarafından otomatik üretilir.

## `SUPABASE_SERVICE_ROLE_KEY`

Service role key yüksek yetkili bir anahtardır.

Güvenlik kuralları:

- Client tarafında paylaşılmamalıdır.
- Public repository'ye yazılmamalıdır.
- Sadece server-side işlemlerde kullanılmalıdır.
- Coolify/Dokploy gibi panellerde secret olarak saklanmalıdır.

## `JWT_SECRET`

Supabase Auth ve JWT doğrulama için kullanılan gizli değerdir.

`NEXT_PUBLIC_SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` bu secret ile uyumlu olmalıdır. Secret değişirse tokenlar da yeniden üretilmelidir.

## `POSTGRES_PASSWORD`

Bundled PostgreSQL için ana parola değeridir.

Full-stack modda:

- `neta-db`
- `neta-auth`
- `neta-rest`
- `neta-storage`
- `neta-migrations`

servislerinin veritabanı bağlantılarında kullanılır.

## Port Değerleri

```env
NETA_PORT=3000
SUPABASE_API_PORT=8000
POSTGRES_PORT=54322
```

Bu değerler host makinede hangi portların dışarı açılacağını belirler.

Container içi portlar genellikle sabittir.

## SMTP Değerleri

MVP kurulumda e-posta doğrulama varsayılan olarak otomatik onaylıdır. Yine de ileride e-posta akışları için SMTP ayarları kullanılabilir.

Örnek:

```env
SMTP_ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_SENDER_NAME=Neta
```

## App-Only Değerleri

App-only modda minimum değerler:

```env
NEXT_PUBLIC_SITE_URL=https://app.example.com
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Migration için ayrıca:

```env
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

## Güvenlik Notları

- `.env` ve `.env.local` dosyalarını commit etme.
- Service role key'i sadece sunucu tarafında kullan.
- Production ortamında güçlü secret değerleri kullan.
- Domain ve Supabase URL değerlerinin birbiriyle uyumlu olduğundan emin ol.
- Coolify/Dokploy panellerinde secret değerlerini public build loglarında göstermemeye dikkat et.

