---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/db/schema/domain.ts
  - apps/neta-app/server/services/domain.ts
  - apps/neta-app/app/(dashboard)/tasks
  - apps/neta-app/app/(dashboard)/calendar
ilgili:
  - "[[02-domainler/projeler-ve-planlama|Projeler ve planlama]]"
  - "[[03-mimari/api|API]]"
etiketler:
  - neta
  - domain
  - gorevler
  - takvim
---

# Görevler ve takvim

## Amaç

Owner'ın yapılacak işlerini ve zaman tabanlı olaylarını; gerektiğinde müşteri/proje bağlarıyla birlikte yönetmek.

## Mevcut davranış

Görev durumları `todo`, `in_progress`, `done`, `cancelled`; öncelikler `low`, `medium`, `high`, `urgent`dır. Görev proje/müşteriye bağlanabilir ve portal görünürlüğü taşıyabilir. Takvim olayları `meeting`, `focus`, `deadline`, `personal`, `finance` türlerini kullanır.

## Temel kavramlar

- `tasks`: başlık/açıklama, durum, öncelik, tarih ve ilişki bilgileri.
- `calendarEvents`: zaman aralığı, tür, başlık/açıklama ve ilişki bilgileri.
- Project task, bağımsız ikinci entity değil `tasks` içindeki proje bağıdır.

## İş akışları

- Task oluşturma, güncelleme, tamamlatma/iptal ve proje ilişkisi.
- Takvim olayı oluşturma/güncelleme/silme.
- Dashboard/analytics özetlerinde yakın ve geciken işleri hesaplama.
- Portal kullanıcısına yalnız paylaşılabilir görevleri gösterme.

## Veri ve API

SQLite'ta tutulur; web Server Action + DomainService üzerinden çalışır. Mobil screens ve API client'lar vardır; backend `/api/v1/tasks` ve `/api/v1/calendar` henüz yoktur.

## Yetkilendirme

Owner scope her mutation'da server-side uygulanır. Client yalnız kendi müşterisine bağlı ve portal için açık kaynakları görür.

## Güvenlik ve veri kalitesi

Timezone/business-date ayrımı wire contract'ta açık olmalıdır. Mobil planındaki `allDay` beklentisi web domain şemasında doğrulanmış alan değildir; backend desteği gelmeden capability sayılmaz.

## Sınırlamalar / plan

Mobil pagination, idempotency ve concurrency planlanandır. Recurrence veya dış takvim sync'i mevcut domain capability olarak doğrulanmamıştır.

## Kaynaklar

- `apps/neta-app/server/db/schema/domain.ts`
- [[docs/mobile/neta-mobile-redesign-master-plan]]
- [[docs/neta-backend-mobile-api-master-plan]]
