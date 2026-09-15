---
tur: urun
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/auth
  - apps/neta-app/server/domain/actor.ts
  - apps/neta-app/server/db/schema/auth.ts
ilgili:
  - "[[02-domainler/kimlik-ve-erisim|Kimlik ve erişim]]"
  - "[[02-domainler/musteri-portali|Müşteri portalı]]"
etiketler:
  - neta
  - kullanici
---

# Kullanıcı tipleri

## Owner / freelancer

- Bir instance'ta yalnız bir tane olması hedeflenen yönetici rolüdür.
- Kod içi canonical rol değeri `freelancer`dır; ürün dilinde owner denebilir.
- İlk public registration ile oluşur; setup tamamlanınca yeni public kayıt kapanır.
- Tüm owner-scope domain verisini, instance ayarlarını, marka/dil/AI ayarlarını ve müşteri davetlerini yönetir.
- Gelecek device pairing tasarımı ilk olarak bu role yöneliktir.

## Davetli müşteri / client

- Önce owner-scope bir müşteri kaydı vardır; auth hesabı bu kayda bağlanır.
- Hesap süreli ve tek kullanımlık owner davetiyle oluşturulur.
- Portal rol değeri `client`tır ve geçerli bir `clientId` bağı zorunludur.
- Yalnız kendi müşterisine ait portal verisini, portal-visible proje dosyalarını ve kendi avatarını kullanabilir.
- Owner client erişimini kapattığında profil disable olur ve session'lar silinir.

## Anonim internet kullanıcısı

- Landing sayfası, login/register koşullu ekranları, davet preview/accept ve sınırlı discovery/meta/health/localization/branding yüzeyleriyle etkileşebilir.
- Owner setup tamamlandıktan sonra public hesap açamaz.
- Private dosya, owner domainleri veya portal verisine erişemez.

## Host operatörü

Kodda auth rolü değildir; deployment, secret, volume, TLS, backup, restore ve upgrade sorumluluğu taşır. Çoğu kurulumda owner ile aynı kişi olabilir; güvenlik modelinde compromised host ayrı bir tehdittir.

## Harici sistem aktörleri

- AI sağlayıcısı: owner'ın açık seçimiyle prompt/veri alabilecek dış trust domain.
- Reverse proxy: TLS termination ve doğru origin/proto aktarımı için güvenilir altyapı.
- Legacy Supabase export: runtime servisi değil, offline import girdisi.

## Planlanan mobil aktör

Paired device ayrı kullanıcı değildir; owner'a bağlı, scope'lu ve revoke edilebilir token family olarak tasarlanmıştır. Henüz runtime entity'si yoktur.
