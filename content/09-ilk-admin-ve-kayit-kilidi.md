---
title: İlk Admin ve Kayıt Kilidi
description: İlk admin hesabının oluşturulması ve kayıt sisteminin kilitlenmesi.
order: 9
---

# İlk Admin ve Kayıt Kilidi

Neta'nın MVP self-host modeli tek admin odaklıdır. Bu nedenle sistem ilk kurulumda bir admin hesabı oluşturulmasına izin verir ve bu hesap oluştuktan sonra public kayıt ekranını kapatır.

Bu davranış, tek freelancer kullanımında daha güvenli ve kontrollü bir başlangıç sağlar.

## İlk Admin Nasıl Oluşturulur?

Temiz kurulumdan sonra şu sayfayı aç:

```text
/register
```

Bu sayfada oluşturulan ilk kullanıcı Neta çalışma alanının admin kullanıcısı olarak kabul edilir.

Kayıt tamamlandığında:

- Supabase Auth içinde kullanıcı oluşur.
- `public.profiles` tablosunda profil kaydı oluşur.
- Kayıt kilidi aktif hale gelir.
- `/register` sayfası artık açık kalmaz.

## Kayıt Neden Kapanır?

Neta ilk MVP aşamasında public kullanıcı kaydını sürekli açık bırakmaz. Bunun sebepleri:

- Tek freelancer kullanım modelini korumak
- Yetkisiz kullanıcı kaydını engellemek
- Self-host kurulumda basit ve güvenli başlangıç sağlamak
- Daha sonra eklenecek davet veya client portal akışlarını admin kontrollü yapmak

## 0009 Migration Dosyası

Kayıt kilidi şu migration ile eklenir:

```text
supabase/migrations/0009_lock_registration_after_first_admin.sql
```

Bu migration:

- `public.is_first_admin_setup_available()` fonksiyonunu ekler.
- `public.handle_new_user()` trigger fonksiyonunu günceller.
- İlk profil oluştuysa public signup işlemlerini engeller.
- Anon ve authenticated rollerine setup kontrol fonksiyonu için execute yetkisi verir.

## `/register` Sayfasının Davranışı

Temiz kurulumda:

```text
/register
```

açılır ve ilk admin oluşturulabilir.

İlk profil oluştuktan sonra:

```text
/register
```

şu davranışı gösterir:

```text
/login
```

sayfasına yönlendirir ve kayıt kapalı mesajı gösterir.

Bu hata değil, beklenen güvenlik davranışıdır.

## Migration Nerede Çalışmalı?

Full-stack modda migration otomatik çalışır.

```bash
docker compose -f docker-compose.full.yml up -d --build
```

komutu çalıştığında `neta-migrations` servisi gerekli SQL dosyalarını uygular.

App-only modda ise migration bağlanılan Supabase projesinin veritabanında çalıştırılmalıdır:

```bash
DATABASE_URL='postgresql://postgres:password@host:5432/postgres' sh ./scripts/apply-migrations.sh
```

## Hosted Supabase ve Self-Host Karışıklığı

Lokal geliştirmede `.env.local` dosyası hosted Supabase projesine bakıyor olabilir.

Örnek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
```

Bu durumda `localhost` üzerinden çalışan Next.js uygulaması self-host Docker veritabanını değil, hosted Supabase projesini kullanır.

Eğer migrationı Docker DB'de çalıştırıp uygulama hosted Supabase'e bağlıysa migration uygulamada görünmez. Tersi de geçerlidir.

## Yaygın Mesajlar

### Kayıt kapalı

Bu mesaj, ilk admin veya profil kaydının zaten oluşturulduğunu gösterir. Giriş için `/login` kullanılmalıdır.

### İlk kurulum kontrolü yapılamadı

Bu mesaj, uygulamanın `is_first_admin_setup_available()` RPC fonksiyonunu çağırırken hata aldığını gösterir.

Olası sebepler:

- Migration yanlış Supabase projesinde çalıştırılmıştır.
- `0009` migration dosyası hiç çalıştırılmamıştır.
- Supabase bağlantı bilgileri yanlıştır.
- PostgREST schema cache henüz güncellenmemiştir.
- Uygulama `.env.local` üzerinden beklenmeyen bir projeye bağlanıyordur.

