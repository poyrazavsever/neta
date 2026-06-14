---
title: Operasyon
description: Sağlık kontrolü, yedekleme ve geri yükleme işlemleri.
order: 10
---

# Operasyon

Neta self-host kurulumunda operasyonel bakımın temel başlıkları sağlık kontrolü, yedekleme, geri yükleme, log takibi ve güncelleme öncesi hazırlıktır.

## Sağlık Kontrolü

Full-stack kurulumda servislerin doğru çalıştığını kontrol etmek için:

```bash
sh ./scripts/selfhost-doctor.sh
```

Bu script şunları doğrular:

- Docker daemon erişilebilir mi?
- Gerekli containerlar çalışıyor mu?
- `neta-migrations` başarıyla tamamlandı mı?
- `neta-db` healthy durumda mı?
- `neta-web` healthy durumda mı?
- `neta-supabase-proxy` healthy durumda mı?
- Web health endpointi cevap veriyor mu?
- Supabase proxy health endpointi cevap veriyor mu?
- Auth settings endpointi çalışıyor mu?
- Neta tabloları veritabanında var mı?

## Auth Smoke Test

Gerçek Auth akışını test etmek için:

```bash
NETA_DOCTOR_AUTH_SMOKE=1 sh ./scripts/selfhost-doctor.sh
```

Bu kontrol, temiz kurulumda signup ve password login akışını test eder.

Dikkat: Temiz kurulumda bu işlem test kullanıcısı oluşturabilir. İlk admin hesabını manuel oluşturmak istiyorsan bu opsiyonu kullanmadan önce planlı hareket et.

## Yedek Alma

Full-stack modda yedek almak için:

```bash
sh ./scripts/selfhost-backup.sh
```

Yedekler varsayılan olarak şu dizine yazılır:

```text
./backups/<timestamp>/
```

Yedek içeriği:

- `postgres.dump`
- `storage.tar.gz`
- `manifest.txt`

## Farklı Yedek Dizini Kullanma

```bash
NETA_BACKUP_DIR=/path/to/backups sh ./scripts/selfhost-backup.sh
```

Bu yöntem, yedekleri ayrı bir disk veya mount üzerine yazmak için kullanılabilir.

## Geri Yükleme

Bir yedeği geri yüklemek için:

```bash
sh ./scripts/selfhost-restore.sh ./backups/20260101T120000Z
```

Script geri yükleme öncesinde onay ister.

Otomatik veya non-interactive geri yükleme için:

```bash
NETA_RESTORE_FORCE=1 sh ./scripts/selfhost-restore.sh ./backups/20260101T120000Z
```

## Docker Volume Yapısı

Full-stack modda kalıcı veriler Docker volume içinde tutulur:

- `neta-db-data`: PostgreSQL verileri
- `neta-storage-data`: Storage dosyaları

Bu volume'lar silinirse veriler kaybolur.

Şu komut production ortamında dikkatli kullanılmalıdır:

```bash
docker compose -f docker-compose.full.yml down -v
```

Çünkü `-v` parametresi volume'ları siler.

## Log Takibi

Servis loglarını görmek için:

```bash
docker logs neta-web
docker logs neta-auth
docker logs neta-db
docker logs neta-migrations
docker logs neta-supabase-proxy
```

Kayıt, login veya migration sorunlarında özellikle şu loglar önemlidir:

- `neta-auth`
- `neta-migrations`
- `neta-web`

## Güncelleme Öncesi Kontrol Listesi

Yeni sürüme geçmeden önce:

1. Yedek al.
2. Yedek dosyalarının oluştuğunu kontrol et.
3. Mevcut `.env` dosyasını sakla.
4. Yeni sürüm notlarını oku.
5. Deploy sonrası `selfhost-doctor.sh` çalıştır.

Önerilen akış:

```bash
sh ./scripts/selfhost-backup.sh
git pull
docker compose -f docker-compose.full.yml up -d --build
sh ./scripts/selfhost-doctor.sh
```

## Production Notları

MVP full-stack kurulum tek sunucu kullanımına uygundur. Kritik production ortamlarında ek olarak şunlar önerilir:

- Düzenli harici yedek
- HTTPS
- Firewall
- Güçlü secret değerleri
- Sunucu disk izleme
- Log izleme
- Geri yükleme testleri

