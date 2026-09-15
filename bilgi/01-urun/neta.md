---
tur: urun
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - docs/roadmaps/platform-master-plan.md
  - apps/neta-app/server/db/schema/domain.ts
ilgili:
  - "[[01-urun/urun-felsefesi|Ürün felsefesi]]"
  - "[[03-mimari/mimari-genel-bakis|Mimari genel bakış]]"
etiketler:
  - neta
  - urun
---

# Neta

Neta, freelancer ve küçük stüdyoların müşteri ilişkisi ile iş operasyonlarını kendi altyapılarında yönetmesine odaklanan self-hosted bir çalışma alanıdır. Owner; müşteri, proje, görev, takvim, finans, günlük, ticari kayıt, dosya, AI ve ayar akışlarını yönetir. Davetli müşteri yalnız kendi bağına açılmış portal kapsamını görür.

## Üç ürün yüzeyi

| Yüzey | Bugünkü rol | Durum |
| --- | --- | --- |
| `neta-app` | Self-hosted web ürünü, portal ve canonical backend | Mevcut, teknik release adayı |
| `neta-web` | Public landing/ürün anlatımı | Mevcut |
| `neta-mobile` | iOS/Android owner ve portal istemcisi | İstemci kapsamı geniş; backend parity ve evrensel bağlantı tamamlanmadığı için store-blocked |

## Ürün sınırı

Neta Cloud veya merkezi tenant veritabanı bugünkü ürün değildir. Her instance kendi kullanıcılarını, verisini, dosyasını, markasını ve ayarlarını taşır. Mobil hedefte de bağlanılan self-hosted instance veri sahibi ve kimlik sağlayıcısıdır.

## Bugünkü değer

- Tek owner için iş ve müşteri operasyonlarını bir araya getirir.
- Müşteriye tüm workspace yerine kontrollü portal görünümü açar.
- SQLite ve local filesystem ile düşük operasyon karmaşıklığı hedefler.
- Marka, dil ve AI sağlayıcısını instance sahibinin yönetmesine izin verir.
- Legacy Supabase kurulumlarından offline bundle import yolu sunar.

## Hedef genişleme

Aktif roadmap, resmî tek mobil binary'nin domain veya QR ile farklı instance'lara bağlanmasını; sonra owner resource parity, mutation'lar, pairing ve client portal parity'sini hedefler. Bu hedef bugünkü mobil build-time origin davranışı değildir.

## İlgili bilgi

- [[01-urun/yetenekler|Yetenekler]]
- [[01-urun/kullanici-tipleri|Kullanıcı tipleri]]
- [[01-urun/urun-haritasi|Ürün haritası]]
- [[00-sistem/mevcut-durum|Mevcut durum]]

## Kaynaklar

- [[README]]
- [[docs/roadmaps/platform-master-plan]]
- [[docs/self-hosted-redesign/neta-self-hosted-v3-master-plan]]
