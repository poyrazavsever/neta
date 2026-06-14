---
title: Full-Stack Kurulum
description: Neta'yı harici servis gerektirmeden self-host etme rehberi.
order: 5
---

# Full-Stack Kurulum

Full-stack kurulum, Neta'yı harici Supabase hesabına ihtiyaç duymadan kendi sunucunda çalıştırmanın önerilen yoludur. Bu modda uygulama, veritabanı, kimlik doğrulama, REST API, storage ve proxy servisleri birlikte çalışır.

## Gereksinimler

Sunucuda şu bileşenler bulunmalıdır:

- Docker
- Docker Compose
- Git
- En az 2 GB RAM
- Kalıcı disk alanı
- Yayın yapılacak bir domain veya test için localhost

Production kullanımı için domain ve HTTPS önerilir.

## Repository'yi Al

```bash
git clone https://github.com/poyrazavsever/neta.git
cd neta
```

## Environment Dosyasını Üret

Full-stack kurulum için gerekli secret ve token değerlerini üret:

```bash
node scripts/generate-full-stack-env.mjs > .env
```

Bu komut şu değerleri üretir:

- `NEXT_PUBLIC_SITE_URL`
- `NETA_PORT`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_API_PORT`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `JWT_EXPIRY`
- `SMTP_ADMIN_EMAIL`

Domain ile yayın yapacaksan `.env` içindeki URL değerlerini deploy öncesi düzenle.

Örnek:

```env
NEXT_PUBLIC_SITE_URL=https://app.example.com
NEXT_PUBLIC_SUPABASE_URL=https://supabase.example.com
```

Local test için varsayılan değerler yeterlidir.

## Stack'i Başlat

```bash
docker compose -f docker-compose.full.yml up -d --build
```

Bu komut şu işlemleri yapar:

1. Neta uygulamasını build eder.
2. PostgreSQL servisini başlatır.
3. Supabase Auth migrationlarını çalıştırır.
4. Storage ve PostgREST servislerini başlatır.
5. Neta migration dosyalarını uygular.
6. Web uygulamasını başlatır.

## Sağlık Kontrolü

Kurulumdan sonra health check çalıştır:

```bash
sh ./scripts/selfhost-doctor.sh
```

Bu script şunları kontrol eder:

- Docker daemon erişimi
- Container çalışma durumları
- Migration runner başarı durumu
- Veritabanı health durumu
- Web health endpointi
- Supabase proxy endpointi
- Auth settings endpointi
- Neta tablolarının varlığı

İstersen gerçek Auth akışını da test edebilirsin:

```bash
NETA_DOCTOR_AUTH_SMOKE=1 sh ./scripts/selfhost-doctor.sh
```

Bu kontrol temiz kurulumda test kullanıcısı oluşturabilir. İlk admin akışını manuel test etmek istiyorsan bu opsiyonu çalıştırmadan önce dikkatli ol.

## İlk Admin Hesabı

Stack hazır olduktan sonra:

```text
https://senin-domainin/register
```

veya local testte:

```text
http://localhost:3000/register
```

sayfasını aç.

İlk kayıt olan kullanıcı admin kabul edilir. İlk profil oluştuktan sonra public kayıt kapanır ve `/register` sayfası artık `/login` sayfasına yönlendirir.

## Kullanılan Portlar

Varsayılan portlar:

- Neta web: `3000`
- Supabase API proxy: `8000`
- PostgreSQL: `54322`

Bu portlar `.env` dosyasından değiştirilebilir:

```env
NETA_PORT=3000
SUPABASE_API_PORT=8000
POSTGRES_PORT=54322
```

## Container Listesi

Çalışan servisleri görmek için:

```bash
docker ps
```

Beklenen containerlar:

- `neta-web`
- `neta-db`
- `neta-auth`
- `neta-rest`
- `neta-storage`
- `neta-supabase-proxy`

`neta-migrations` tek seferlik çalışır ve başarıyla çıkmış olmalıdır.

## Durdurma ve Yeniden Başlatma

Durdurmak için:

```bash
docker compose -f docker-compose.full.yml stop
```

Yeniden başlatmak için:

```bash
docker compose -f docker-compose.full.yml up -d
```

Volume silinmediği sürece veriler korunur.

## Verileri Sıfırlama

Test ortamında tüm verileri silmek istersen:

```bash
docker compose -f docker-compose.full.yml down -v
```

Bu komut veritabanı ve storage volume'larını siler. Production ortamında yedek almadan kullanılmamalıdır.

