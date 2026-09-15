---
tur: domain
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/app/portal
  - apps/neta-app/server/domain/actor.ts
  - apps/neta-app/server/services/domain.ts
  - apps/neta-app/server/auth/invitations.ts
ilgili:
  - "[[02-domainler/kimlik-ve-erisim|Kimlik ve erişim]]"
  - "[[02-domainler/musteriler|Müşteriler]]"
  - "[[02-domainler/projeler-ve-planlama|Projeler]]"
etiketler:
  - neta
  - domain
  - portal
---

# Müşteri portalı

## Amaç

Owner'ın tüm çalışma alanını açmadan, davet edilmiş müşteriye yalnız kendi proje ve paylaşılmış iş bilgisini sunmak.

## Mevcut davranış

Client hesabı belirli bir `clients` satırına iki yönlü bağlanır. Portal kullanıcıları kendilerine ait dashboard/proje bilgilerini ve portal-visible görev/dosyaları görebilir; revizyon talebi oluşturabilir; profil, şifre, tema ve aktif diller arasındaki tercihini yönetebilir. Owner portal erişimini kapatabilir.

## Temel kavramlar

- `appProfiles.role=client` + zorunlu `clientId`.
- `clients.authUserId` ile karşılıklı bağ.
- Portal-visible task/file ve project relation.
- Client default locale ile kişisel locale preference ayrımı.

## İş akışları

- [[05-is-akislari/musteri-daveti|Davet kabulü]].
- Client login → role-based `/portal` yönlendirmesi.
- Proje/task görüntüleme ve revizyon oluşturma.
- Owner'ın client access disable/enable etmesi.

## Veri ve API

Web portalı DomainService ve server-side scope ile mevcuttur. Mobil portal screen/API client'ları vardır; backend v1 portal resource route'ları yoktur.

## Yetkilendirme

Client scope yalnız session profile'daki `clientId`den türetilir. Proje/file/task ilişkisi tekrar server-side kontrol edilir. Cross-client erişimde varlık sızıntısını azaltmak için not-found davranışı tercih edilir.

## Güvenlik

Davet tokenı hash-only ve tek kullanımlıdır. Client disable edildiğinde session'lar silinir. Portal-visible işaretinin yanlış uygulanması temel veri sızıntısı riskidir; v1 rollout negatif tenant testleri olmadan tamamlanmamalıdır.

## Mevcut sınırlamalar / plan

Client device pairing kararı yoktur; client Better Auth session kullanır. Mobil portal v1 read/revision/profile istemcisi ve backend transport'u kodda bulunur; tenant izolasyonu negatif kabulü açık kalır. Genel gerçek-zamanlı müşteri mesajlaşması mevcut AI chat ile karıştırılmamalıdır.

## Kaynaklar

- [[docs/self-hosted-redesign/phase-6-portal-backend]]
- `apps/neta-app/server/auth/invitations.ts`
- [[docs/roadmaps/platform-master-plan]]
