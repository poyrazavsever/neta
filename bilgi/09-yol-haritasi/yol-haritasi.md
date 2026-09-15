---
tur: yol-haritasi
durum: planlanan
guncellendi: 2026-09-03
guven: yuksek
kaynaklar:
  - docs/roadmaps/platform-master-plan.md
  - docs/neta-backend-mobile-api-master-plan.md
  - docs/mobile/neta-mobile-redesign-master-plan.md
ilgili:
  - "[[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]"
  - "[[09-yol-haritasi/planlanan-yetenekler|Planlanan yetenekler]]"
etiketler:
  - neta
  - yol-haritasi
---

# Yol haritası sentezi

## Yön

Web self-hosted runtime'ı canonical backend olarak koruyup landing, web app ve resmî evrensel mobile'ı aynı monorepo/contract disiplini altında birleştirmek. Mobil için ikinci backend veya duplicated domain logic kurulmayacak.

Mobilin iş paketi, karar kapıları, güvenlik testleri ve store çıkış kriterleri [[09-yol-haritasi/mobil-uygulama-plani|mobil uygulama planında]] yürütülür.

## Aktif faz akışı

| Faz | Amaç | Durum özeti |
| --- | --- | --- |
| M0 | Monorepo yerleşimi ve workspace tooling | Tamamlanmış kabul ediliyor |
| P0 | Ürün/auth/capability/wire contract freeze | Sıradaki karar kapısı |
| P1 | Shared contracts, backend presenter ve CI consumer tests | Planlanan |
| P2 | Evrensel mobile bootstrap, runtime domain bağlantısı | Planlanan |
| P3 | Owner P0 read slice: dashboard/müşteri/proje/görev/takvim | Planlanan |
| P4 | Güvenli mutation/idempotency/concurrency | Planlanan |
| P5 | Owner parity: finans/günlük/files/settings/AI vb. | Planlanan |
| P6 | Owner device pairing ve lifecycle | Planlanan |
| P7 | Client portal mobil parity | Planlanan |
| P8 | AI streaming, bildirim ve ileri istemci akışları | Planlanan |
| P9 | Store release ve operasyon | Planlanan |
| P10 | Multi-instance, resolver, offline, white-label/cloud seçenekleri | Gelecek kapsam |

## Sıralama mantığı

Contract ve capability doğruluğu olmadan yeni endpoint eklemek drift'i büyütür. Runtime domain connect olmadan store binary evrensel hedefi karşılamaz. Owner read slice kanıtlanmadan geniş mutation ve portal yüzeyi açılmaz. Pairing, restore token epoch ve negatif güvenlik testlerinden önce yayınlanmaz.

## Tarihsel belge kullanımı

`docs/mobile/neta-mobile-redesign-master-plan.md` bugünkü build-time implementation'ın kanıtıdır; aktif ürün yönünde `docs/roadmaps/platform-master-plan.md` önceliklidir. `docs/mobile/neta-react-native-mobile-master-plan.md` superseded'dir.

## Kaynaklar

- [[docs/roadmaps/platform-master-plan]]
- [[docs/neta-backend-mobile-api-master-plan]]
- [[docs/mobile/neta-mobile-redesign-master-plan]]
