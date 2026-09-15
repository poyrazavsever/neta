---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/db/schema/domain.ts
  - apps/neta-app/server/services/domain.ts
  - apps/neta-app/app/(dashboard)/finance
  - apps/neta-app/app/(dashboard)/business
ilgili:
  - "[[02-domainler/musteriler|Müşteriler]]"
  - "[[02-domainler/ai-ve-analiz|AI ve analiz]]"
etiketler:
  - neta
  - domain
  - finans
---

# Finans ve ticari kayıtlar

## Amaç

Owner'ın nakit akışı kayıtlarını ve müşteri işi etrafındaki teklif, sözleşme, fatura ve abonelik nesnelerini yönetmek.

## Mevcut davranış

Finans kayıtları gelir/gider (`income`, `expense`) ve ödeme durumu (`planned`, `pending`, `paid`, `cancelled`) taşır; müşteri/projeye bağlanabilir. Dashboard/analytics ve AI finans analizi bu veriden beslenir. `proposals`, `contracts`, `invoices`, `subscriptions` tabloları ile owner web sayfaları/domain service işlemleri mevcuttur.

## Temel kavramlar / entity'ler

- `financeTransactions`: amount, currency, tür, ödeme durumu ve ilişkiler.
- `proposals`, `contracts`, `invoices`, `subscriptions`: ayrı yaşam döngüsü ve müşteri/proje bağları olan ticari kayıtlar.

## İş akışları

- Gelir/gider kaydı ve ödeme durumu güncelleme.
- Tarih aralığına göre finans özeti ve analiz.
- Teklif/fatura/sözleşme/abonelik oluşturma ve lifecycle takibi.

## Veri ve API

SQLite'ta owner scope ile kalır. Web uygulaması çalışır. Mobil finans ekranı/API contract'ı vardır ancak backend v1 resource route'u yoktur. Ticari kayıtlar mevcut mobil redesign kapsamı dışında belirtilmiştir.

## Yetkilendirme

Bu alan owner-only kabul edilir; client portalına açık endpoint kanıtlanmamıştır. Scope session actor'dan gelir.

## Güvenlik

Finans verisi hassastır; logs, AI prompt'ları ve backup erişimi ayrıca değerlendirilmelidir. Mobilde integer minor-unit wire politikası hedeflenir; DB/storage türü ile DTO birbirine karıştırılmamalıdır.

## Sınırlamalar / açık kararlar

Çoklu currency kayıtların tek summary'de nasıl toplanacağı kararsızdır. Muhasebe/ödeme gateway entegrasyonu veya kur dönüşümü mevcut capability değildir.

## Kaynaklar

- `apps/neta-app/server/db/schema/domain.ts`
- [[docs/self-hosted-redesign/phase-7-ai-business-backend]]
- [[docs/neta-backend-mobile-api-master-plan]]
