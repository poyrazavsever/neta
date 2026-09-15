---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/db/schema/domain.ts
  - apps/neta-app/server/services/domain.ts
  - apps/neta-app/app/(dashboard)/journal
ilgili:
  - "[[02-domainler/ai-ve-analiz|AI ve analiz]]"
  - "[[03-mimari/api|API]]"
etiketler:
  - neta
  - domain
  - gunluk
---

# Günlük domaini

## Amaç

Owner'ın tarihli çalışma/yaşam notlarını ve opsiyonel ruh hali, enerji, memnuniyet gibi skorlarını saklamak.

## Mevcut davranış

Web dashboard altında günlük listeleme, oluşturma, güncelleme ve silme akışları bulunur. Domain şemasında skor alanları nullable'dır; mobil form/contract zorunlulukları bununla uyumlu tutulmalıdır.

## Temel kavramlar

- `journalEntries`: owner, tarih, metin ve opsiyonel skorlar.

## Veri kalıcılığı ve API

SQLite'ta owner scope ile saklanır ve genel DB backup'ına dahildir. Web DomainService/Server Action yolunu kullanır. Mobil ekran ve API client bulunur; backend `/api/v1/journal` route grubu yoktur.

## Yetkilendirme

Owner-only kişisel veridir. Client portalına açılmaz.

## Bağımlılıklar

Dashboard/analytics ve gelecekte AI özetiyle ilişkilenebilir. Bu ilişkinin varlığı tüm journal içeriğinin otomatik olarak harici AI sağlayıcısına gönderildiği anlamına gelmez; çağrı kodu ayrıca doğrulanmalıdır.

## Güvenlik

Günlük yüksek hassasiyetli serbest metin içerebilir. Backup, host erişimi, loglama ve AI prompt kapsamı tehdit modelinde ele alınmalıdır.

## Sınırlamalar / plan

Mobil resource API, offline mutation ve conflict merge mevcut değildir. Journal score nullability contract freeze sırasında web domainiyle eşitlenmelidir.

## Kaynaklar

- `apps/neta-app/server/db/schema/domain.ts`
- [[docs/mobile/neta-mobile-redesign-master-plan]]
- [[docs/neta-backend-mobile-api-master-plan]]
