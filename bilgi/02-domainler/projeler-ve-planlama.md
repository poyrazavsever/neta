---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/db/schema/domain.ts
  - apps/neta-app/server/services/domain.ts
  - apps/neta-app/app/(dashboard)/projects
  - apps/neta-app/app/portal
ilgili:
  - "[[02-domainler/musteriler|Müşteriler]]"
  - "[[02-domainler/gorevler-ve-takvim|Görevler ve takvim]]"
  - "[[02-domainler/dosyalar-ve-markalama|Dosyalar]]"
etiketler:
  - neta
  - domain
  - projeler
---

# Projeler ve planlama

## Amaç

Müşteri veya side project yaşam döngüsünü, ilerlemeyi, plan bölümlerini, proje görevlerini, paylaşılabilir dosyaları ve müşteri revizyonlarını tek bağlamda tutmak.

## Mevcut davranış

Proje tipi `client_project` veya `side_project`; durum `planning`, `active`, `paused`, `completed`, `cancelled`; progress modu `manual` veya `auto` olabilir. Proje bir müşteriye bağlanabilir. Owner plan bölümleri ve görevleri yönetir. Client portalında yalnız kendisine bağlı proje ve paylaşılabilir içerik görünür; revizyon talebi oluşturulabilir.

## Temel kavramlar / entity'ler

- `projects`: owner/client bağı, zaman, durum, progress ve proje metadata'sı.
- `projectPlanningSections`: sıralı plan içeriği.
- `tasks`: opsiyonel proje ilişkisi.
- `projectRevisions`: client kaynaklı talep ve durum.
- `files`: project asset metadata ve portal visibility.

## İş akışları

- Müşteri projesi veya side project oluşturma.
- Plan bölümlerini düzenleme, task bağlama ve progress hesaplama.
- Dosyayı private veya portal-visible yükleme.
- Client revizyon talebi → owner işlem/durum güncellemesi.

## Veri kalıcılığı ve API

SQLite + local uploads birlikte kullanılır. Web domain service/Server Action ile çalışır. Mobil project API istemcileri ve contract'lar vardır; backend v1 project/planning/revision/resource route'ları planlanandır.

## Yetkilendirme

Owner yalnız kendi proje scope'unu yönetir. Client yalnız bağlı `clientId` projelerini ve açık alt kaynakları okuyabilir/yazabilir. Project ID tek başına yetki vermez.

## Güvenlik

Portal görünürlüğü task/file bazında açıkça doğrulanmalıdır. Revizyon user-authored metindir; kaynak locale korunur ve sessiz machine translation uygulanmaz.

## Sınırlamalar / plan

Mobil optimistic concurrency, cursor pagination ve idempotent mutation henüz mevcut değildir. Cross-client negatif contract testleri v1 rollout'un zorunlu kapısıdır.

## Kaynaklar

- `apps/neta-app/server/services/domain.ts`
- [[docs/self-hosted-redesign/phase-5-freelancer-backend]]
- [[docs/self-hosted-redesign/phase-6-portal-backend]]
- [[docs/neta-backend-mobile-api-master-plan]]
