---
title: Sorun Giderme
description: Kurulum ve çalışma sırasında karşılaşılan yaygın sorunlar.
order: 12
---

# Sorun Giderme

Bu bölüm, Neta kurulumu ve kullanımı sırasında sık karşılaşılabilecek sorunları açıklar.

## `Database error finding user`

Bu hata genellikle Supabase Auth servisinin Auth tablolarına doğru schema üzerinden erişemediğini gösterir.

Full-stack modda beklenen çözüm:

- `deploy/supabase/db/init.sh` içinde `supabase_auth_admin` rolünün `search_path` ayarı doğru olmalıdır.
- Temiz kurulumda Auth migrationları başarılı tamamlanmalıdır.
- `neta-auth` logları kontrol edilmelidir.

Kontrol:

```bash
docker logs neta-auth
```

Temiz kurulum için:

```bash
docker compose -f docker-compose.full.yml down -v
docker compose -f docker-compose.full.yml up -d --build
```

Production ortamında `down -v` kullanmadan önce yedek alınmalıdır.

## `Database error querying schema`

Bu hata da çoğunlukla Auth schema veya migration state problemiyle ilgilidir.

Kontrol edilmesi gerekenler:

- `neta-auth` migrationları başarıyla tamamlandı mı?
- `auth.users` tablosu var mı?
- `auth.identities` tablosu var mı?
- Auth rolü doğru schema path ile çalışıyor mu?

Full-stack kurulumda bu yapı otomatik hazırlanmalıdır.

## `İlk kurulum kontrolü yapılamadı`

Bu mesaj, uygulamanın şu RPC fonksiyonunu çağırırken hata aldığını gösterir:

```text
public.is_first_admin_setup_available()
```

Olası sebepler:

- `0009_lock_registration_after_first_admin.sql` çalışmamıştır.
- Migration yanlış Supabase projesinde çalışmıştır.
- Uygulama `.env.local` üzerinden farklı Supabase projesine bağlanıyordur.
- PostgREST schema cache güncel değildir.
- Supabase bağlantı bilgileri hatalıdır.

Full-stack modda migration otomatik uygulanır. App-only modda migrationı doğru hosted Supabase projesinde çalıştırman gerekir.

## `/register` Kayıt Kapalı Diyor

Bu her zaman hata değildir.

Eğer ilk admin veya herhangi bir profil kaydı zaten varsa `/register` kapanır ve `/login` sayfasına yönlendirir.

Kontrol mantığı:

```sql
select public.is_first_admin_setup_available();
```

`false` dönüyorsa kayıt kapalıdır.

## Migration Yanlış DB'de Çalıştı

Bu sık yapılan bir hatadır.

Örnek senaryo:

- Docker full-stack DB'de migration çalıştırdın.
- Ama `.env.local` hosted Supabase projesine bakıyor.
- Uygulama hosted Supabase'e bağlandığı için Docker DB'deki migration görünmez.

Çözüm:

- Uygulamanın hangi Supabase URL'ye bağlandığını kontrol et.
- Migrationı aynı projenin veritabanında çalıştır.
- Full-stack test için `.env` ve `docker-compose.full.yml` kullan.

## Docker Daemon Kapalı

Hata örneği:

```text
Cannot connect to the Docker daemon
```

Çözüm:

- Docker Desktop'ı başlat.
- Linux sunucuda Docker servisinin çalıştığını kontrol et:

```bash
sudo systemctl status docker
```

Başlatmak için:

```bash
sudo systemctl start docker
```

## Port Çakışması

Eğer `3000`, `8000` veya `54322` portları doluysa Compose başlatılamayabilir.

`.env` içinde portları değiştir:

```env
NETA_PORT=3010
SUPABASE_API_PORT=8010
POSTGRES_PORT=54323
```

Sonra yeniden başlat:

```bash
docker compose -f docker-compose.full.yml up -d --build
```

## `.env.local` Hosted Supabase'e Bakıyor

Lokal geliştirme sırasında `pnpm dev` çalıştırırsan Next.js `.env.local` dosyasını okur.

Eğer `.env.local` içinde şu varsa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
```

uygulama hosted Supabase'e bağlanır.

Self-host Docker stack için lokal geliştirme yapmak istiyorsan `.env.local` değerlerini self-host API URL'lerine göre düzenle.

## Coolify veya Dokploy Env Eksikleri

Compose dosyası bazı env değerleri eksikse bilinçli olarak fail-fast davranır.

Örnek:

```text
Set NEXT_PUBLIC_SUPABASE_URL in .env
```

Çözüm:

- Environment panelinde tüm zorunlu değerleri gir.
- `NEXT_PUBLIC_SITE_URL` ve `NEXT_PUBLIC_SUPABASE_URL` değerlerinin production domainleriyle uyumlu olduğundan emin ol.

## Health Check Başarısız

Çalıştır:

```bash
sh ./scripts/selfhost-doctor.sh
```

Hangi kontrolün failed olduğunu incele.

Sık sebepler:

- Migration runner tamamlanmamıştır.
- Proxy henüz healthy olmamıştır.
- Veritabanı başlamamıştır.
- Yanlış env değerleri kullanılmıştır.

## Build Hatası

Build için:

```bash
pnpm build
```

Docker build için:

```bash
docker compose -f docker-compose.full.yml up -d --build
```

Build sırasında environment kaynaklı hata alırsan `.env` ve Compose env değerlerini kontrol et.

