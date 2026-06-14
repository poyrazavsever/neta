---
title: Dokümantasyon
description: Neta kurulum ve kullanım dokümantasyonu.
order: 1
---

# Neta Dokümantasyonu

Neta, freelancerlar için tasarlanmış self-host edilebilir bir çalışma alanıdır. Amaç; müşteri, proje, görev, finans, takvim, günlük ve performans takibini tek bir panelde toplamak ve freelancerların günlük operasyonlarını harici SaaS araçlarına bağımlı kalmadan yönetebilmesini sağlamaktır.

Bu dokümantasyon, Neta'yı tanımak, kendi sunucunda çalıştırmak ve ilk kurulumu doğru tamamlamak için hazırlanmıştır. İçerikler hem teknik kullanıcılar hem de Coolify, Dokploy gibi panel tabanlı araçlarla kurulum yapmak isteyenler için adım adım düzenlenmiştir.

## Kimler İçin?

Neta özellikle şu kullanıcılar için uygundur:

- Tek başına çalışan freelancerlar
- Küçük ölçekli danışmanlar
- Yazılım, tasarım, içerik, pazarlama veya danışmanlık hizmeti veren bağımsız profesyoneller
- Müşteri ve proje operasyonlarını tek panelde yönetmek isteyen self-host kullanıcıları
- Kendi verisini kendi sunucusunda tutmak isteyen teknik kullanıcılar

Neta'nın ilk MVP sürümü tek admin odaklıdır. Yani sistem ilk kurulumda bir admin hesabı oluşturur ve sonrasında public kayıt ekranını kapatır. Bu yaklaşım, kişisel kullanım ve tek freelancer senaryosu için daha kontrollü bir güvenlik modeli sağlar.

## Self-Host Yaklaşımı

Neta iki farklı kurulum modeli destekler:

- **Full-stack kurulum:** Neta uygulaması, PostgreSQL, Supabase Auth, PostgREST, Storage ve proxy servisleri aynı Docker Compose yapısı içinde çalışır.
- **App-only kurulum:** Neta uygulaması mevcut bir Supabase veya Supabase uyumlu backend'e bağlanır.

İlk MVP için önerilen kurulum **full-stack self-host** modudur. Bu modda harici Supabase hesabına ihtiyaç yoktur. Veritabanı, kimlik doğrulama ve dosya depolama servisleri kendi sunucunda çalışır.

## Dokümantasyonda Neler Var?

Bu dokümantasyon şu bölümlerden oluşur:

- Özellikler
- Teknik mimari
- Kurulum modları
- Full-stack kurulum
- Coolify kurulumu
- Dokploy kurulumu
- App-only kurulum
- İlk admin hesabı ve kayıt kilidi
- Operasyon, sağlık kontrolü, yedekleme ve geri yükleme
- Ortam değişkenleri
- Sorun giderme
- Güvenlik ve mevcut sınırlar

## Önemli Kavramlar

Neta'yı doğru kurmak için şu ayrımları bilmek önemlidir:

- `.env` dosyası Docker Compose kurulumlarında kullanılır.
- `.env.local` dosyası lokal Next.js geliştirme sırasında kullanılır.
- Full-stack modda migration dosyaları `neta-migrations` servisi tarafından otomatik çalıştırılır.
- App-only modda migration dosyalarını bağlandığın Supabase projesinin veritabanında manuel çalıştırman gerekir.
- İlk admin oluşturulduktan sonra `/register` sayfası kapanır ve giriş için `/login` kullanılır.

## Önerilen Başlangıç

Kendi sunucusunda hızlı kurulum yapmak isteyen kullanıcılar için önerilen yol:

```bash
node scripts/generate-full-stack-env.mjs > .env
docker compose -f docker-compose.full.yml up -d --build
sh ./scripts/selfhost-doctor.sh
```

Ardından tarayıcıdan Neta adresini açıp ilk admin hesabını oluşturabilirsin.

