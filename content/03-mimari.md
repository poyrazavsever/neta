---
title: Mimari
description: Neta'nın teknik mimarisi ve servis yapısı.
order: 3
---

# Mimari

Neta, modern web teknolojileri ve Supabase uyumlu açık kaynak servisler üzerine kuruludur. Full-stack self-host modunda uygulama ve backend servisleri tek bir Docker Compose yapısı içinde çalışır.

## Genel Yapı

Full-stack kurulumda çalışan ana servisler:

- `neta-web`: Next.js uygulaması
- `neta-db`: PostgreSQL ve pgvector
- `neta-auth`: Supabase Auth
- `neta-rest`: PostgREST
- `neta-storage`: Supabase Storage
- `neta-supabase-proxy`: Nginx tabanlı API proxy
- `neta-migrations`: Veritabanı migration runner

Bu servisler birlikte Neta'nın harici Supabase hesabına ihtiyaç duymadan çalışmasını sağlar.

## Next.js Uygulaması

Neta'nın kullanıcı arayüzü Next.js App Router üzerinde çalışır. Uygulama production ortamında standalone build olarak container içine alınır.

Uygulama:

- Dashboard ve modül sayfalarını sunar.
- Supabase Auth ile oturum yönetimi yapar.
- PostgREST üzerinden veritabanı işlemlerini gerçekleştirir.
- Server action ve API route yapıları ile bazı işlemleri sunucu tarafında yürütür.

## PostgreSQL ve pgvector

Veritabanı olarak PostgreSQL kullanılır. Full-stack modda `pgvector/pgvector:pg16` imajı tercih edilir.

PostgreSQL şu verileri saklar:

- Kullanıcı profilleri
- Müşteriler
- Projeler
- Görevler
- Finans kayıtları
- Journal kayıtları
- Client portal ilişkileri
- Uygulama ayarları

pgvector desteği, ileride AI ve embedding tabanlı özellikler için hazır altyapı sağlar.

## Supabase Auth

Kimlik doğrulama için Supabase Auth kullanılır. Full-stack modda Auth servisi Neta'nın kendi PostgreSQL veritabanına bağlanır.

Auth servisi:

- Kullanıcı kaydı
- Parola ile giriş
- JWT üretimi
- Oturum yönetimi
- Auth tablolarının migration işlemleri

gibi işleri yürütür.

Neta, ilk admin hesabı oluşturulduktan sonra public kayıt akışını kapatır. Bu kontrol veritabanı fonksiyonu ve trigger ile desteklenir.

## PostgREST

PostgREST, PostgreSQL üzerindeki public schema için REST API sağlar. Supabase istemcisi uygulama içinde bu API üzerinden veri okuma ve yazma işlemleri yapar.

Row Level Security politikaları PostgreSQL tarafında uygulanır. Böylece veri erişimi uygulama koduna ek olarak veritabanı seviyesinde de kontrol edilir.

## Supabase Storage

Dosya depolama için Supabase Storage API kullanılır. Full-stack modda dosyalar Docker volume içinde lokal disk backend ile saklanır.

Bu yapı MVP için yeterlidir. Daha ileri production senaryolarında S3 uyumlu harici storage desteği değerlendirilebilir.

## Nginx Proxy

`neta-supabase-proxy`, Supabase uyumlu API giriş noktası sağlar.

Proxy üzerinden:

- `/auth/v1`
- `/rest/v1`
- `/storage/v1`
- `/health`

gibi endpointler ilgili servislere yönlendirilir.

Uygulama container içinden internal URL ile bu proxy'ye bağlanır. Kullanıcı tarafında ise public Supabase API URL değeri kullanılır.

## Migration Runner

`neta-migrations` servisi tek seferlik çalışan bir container'dır. Görevi, Supabase Auth ve Storage tabloları hazır olduktan sonra Neta'nın kendi SQL dosyalarını doğru sırayla uygulamaktır.

Full-stack modda kullanıcı migration dosyalarını manuel çalıştırmaz. Compose başlatıldığında migration runner bu işi otomatik yapar.

## Veri Akışı

Tipik bir istek akışı şöyledir:

1. Kullanıcı tarayıcıdan Neta arayüzünü açar.
2. Next.js uygulaması oturum bilgisini Supabase Auth ile doğrular.
3. Veri istekleri PostgREST üzerinden PostgreSQL'e gider.
4. PostgreSQL RLS politikaları erişim kontrolünü uygular.
5. Dosya işlemleri Storage API üzerinden volume tabanlı depoya yazılır.

Bu mimari, self-host kullanım için sade, taşınabilir ve Docker tabanlı bir yapı sağlar.

