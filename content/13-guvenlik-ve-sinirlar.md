---
title: Güvenlik ve Sınırlar
description: MVP self-host modelinin güvenlik yaklaşımı ve mevcut sınırları.
order: 13
---

# Güvenlik ve Sınırlar

Neta'nın ilk self-host MVP sürümü tek freelancer kullanımına göre tasarlanmıştır. Güvenlik yaklaşımı basit, anlaşılır ve self-host edilebilir bir model üzerine kuruludur.

## Tek Admin Modeli

İlk kurulumda yalnızca bir admin hesabı oluşturulur. İlk admin hesabı oluştuğunda public kayıt ekranı kapanır.

Bu yaklaşım:

- Yetkisiz kayıtları engeller.
- Self-host kurulumda basit güvenlik modeli sağlar.
- Freelancer odaklı tek kullanıcı senaryosuna uygundur.

Çoklu ekip veya çoklu rol yapısı MVP kapsamının dışındadır.

## Public Signup Kilidi

Kayıt kilidi sadece UI seviyesinde değildir. Veritabanı trigger fonksiyonu da ilk profil oluştuktan sonra public signup denemelerini engeller.

Bu sayede biri doğrudan Supabase Auth signup endpointine istek atsa bile veritabanı seviyesinde kayıt engellenir.

## Service Role Key Güvenliği

`SUPABASE_SERVICE_ROLE_KEY` yüksek yetkili bir anahtardır.

Kurallar:

- Client tarafında kullanılmamalıdır.
- Public repository'ye eklenmemelidir.
- Loglarda gösterilmemelidir.
- Sadece server-side işlemlerde kullanılmalıdır.
- Coolify/Dokploy içinde secret olarak saklanmalıdır.

Bu key sızarsa veritabanı üzerinde yüksek yetkili işlemler yapılabilir.

## Row Level Security

Neta tablolarında Row Level Security politikaları kullanılır. Amaç, kullanıcı verilerinin veritabanı seviyesinde de izole edilmesidir.

MVP tek admin modeliyle çalışsa bile RLS yapısının korunması önemlidir. Gelecekte client portal, davet ve daha gelişmiş kullanıcı akışları bu temel üzerine genişletilebilir.

## JWT Secret

`JWT_SECRET`, Supabase Auth tokenlarının imzalanması için kullanılır.

Bu secret değişirse:

- Mevcut tokenlar geçersiz hale gelebilir.
- Anon key ve service role key yeniden üretilmelidir.

Production ortamında güçlü ve rastgele bir secret kullanılmalıdır.

## Storage Sınırları

Full-stack MVP kurulumda Storage lokal disk backend ile çalışır.

Bu yapı:

- Tek sunucu kullanımına uygundur.
- Basit backup/restore akışı sağlar.
- Harici storage servisi gerektirmez.

Ancak yüksek ölçekli production ortamlarında S3 uyumlu harici storage daha uygun olabilir.

## Yedekleme Sorumluluğu

Self-host kurulumda veri sorumluluğu kullanıcıdadır.

Düzenli yedek alınmalıdır:

```bash
sh ./scripts/selfhost-backup.sh
```

Yedekler mümkünse aynı sunucu dışında da saklanmalıdır.

## HTTPS ve Ağ Güvenliği

Production ortamında:

- HTTPS kullanılmalıdır.
- PostgreSQL portu public internete açılmamalıdır.
- Sadece gerekli portlar dışarı açılmalıdır.
- Sunucu firewall kuralları düzenlenmelidir.
- Admin panel ve deploy panel erişimleri korunmalıdır.

## SMTP ve E-posta

MVP kurulumda e-posta doğrulama otomatik onaylı olabilir. Production ortamında e-posta akışları kullanılacaksa SMTP ayarları yapılmalıdır.

SMTP ayarları olmadan bazı e-posta tabanlı Auth akışları beklenen şekilde çalışmayabilir.

## Mevcut Sınırlar

İlk MVP self-host sürümünde şu alanlar sınırlıdır:

- Çoklu ekip yönetimi
- Gelişmiş rol ve izin sistemi
- Çok tenantlı SaaS modeli
- Otomatik scheduled backup
- Harici S3 storage entegrasyonu
- High availability kurulum
- Gelişmiş audit log sistemi
- Kurumsal SSO

Bu sınırlar, ilk sürümün sade, kurulabilir ve freelancer odaklı kalmasını sağlar.

## Gelecek Genişletme Alanları

İlerleyen fazlarda şu alanlar geliştirilebilir:

- Admin kontrollü kullanıcı davetleri
- Client portal kullanıcı yönetimi
- Takım üyeleri ve roller
- S3 uyumlu storage
- Otomatik backup planlama
- Daha gelişmiş gözlemleme ve loglama
- SMTP ve e-posta şablonları
- Import/export araçları

Neta'nın self-host temeli bu genişletmeler için uygun bir başlangıç sağlar.

