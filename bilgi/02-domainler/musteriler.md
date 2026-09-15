---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/db/schema/domain.ts
  - apps/neta-app/server/services/domain.ts
  - apps/neta-app/server/repositories
  - apps/neta-app/app/(dashboard)/clients
ilgili:
  - "[[02-domainler/musteri-portali|Müşteri portalı]]"
  - "[[02-domainler/projeler-ve-planlama|Projeler ve planlama]]"
etiketler:
  - neta
  - domain
  - musteriler
---

# Müşteriler

## Amaç

Owner'ın müşteri ilişkilerini, satış pipeline durumunu, iletişim bilgilerini, ilişki aktivitelerini ve opsiyonel portal hesabı bağını yönetmek.

## Mevcut davranış

Owner müşteri oluşturur, günceller, arşivler/siler ve detayını görüntüler. Pipeline `lead`, `contacted`, `proposal_sent`, `won`, `lost`; yaşam durumu `active`, `paused`, `archived` değerlerini kullanır. Müşteriye tarihli aktiviteler eklenebilir. Portal hesabı müşteri satırına sonradan davetle bağlanır.

## Temel kavramlar / entity'ler

- `clients`: owner, iletişim, şirket, status, pipeline, portal locale ve auth bağı.
- `clientActivities`: müşteriyle ilişkili zaman çizelgesi kaydı.
- `portalInvitations` ve `appProfiles`: müşteri domain kaydını auth/portal hesabına bağlar.

## İş akışları

- Müşteri oluşturma → ilişki aktivitesi → proje/iş kaydı.
- Müşteri detayından davet üretme → client hesabına atomik bağlama.
- Portal locale ve erişim durumunu owner'ın yönetmesi.

## Veri ve API

SQLite'ta owner scope ile saklanır. Web bugün Server Action ve domain service kullanır. Mobil client contract'ları vardır; `/api/v1/clients` resource route grubu henüz backend'de yoktur.

## Yetkilendirme

Owner tüm kendi müşteri kayıtlarını yönetir. Client kendi bağlı müşteri kapsamına portal servisleri üzerinden erişir; başka client kaynağı görünmez olmalıdır.

## Bağımlılıklar

[[02-domainler/kimlik-ve-erisim|Kimlik]], [[02-domainler/projeler-ve-planlama|projeler]], [[02-domainler/finans-ve-ticari-kayitlar|ticari kayıtlar]], [[02-domainler/yerellestirme|yerelleştirme]].

## Güvenlik

Cross-owner/client scope, PII, davet email'i ve client-auth çift yönlü bağ kritik invariantlardır. Client silme/arşiv davranışının bağlı finans/proje kayıtlarına etkisi migration/foreign-key politikasıyla birlikte değerlendirilmelidir.

## Mevcut sınırlamalar / plan

Mobil list/detail/mutation transport'u planlanandır. Merkezi CRM entegrasyonu veya multi-owner tenant modeli yoktur.

## Kaynaklar

- `apps/neta-app/server/db/schema/domain.ts`
- `apps/neta-app/server/services/domain.ts`
- [[docs/self-hosted-redesign/phase-5-freelancer-backend]]
- [[docs/self-hosted-redesign/phase-6-portal-backend]]
