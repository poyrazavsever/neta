---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
onceki_kimlik: K-002
guncellendi: 2026-09-03
guven: yuksek
ozet: "Bir Neta instance'ı tek Node.js process'i ve tek kalıcı veri diziniyle çalışır."
kaynaklar:
  - README.md
  - Dockerfile
  - docker-compose.yml
ilgili:
  - "[[03-mimari/runtime|Runtime]]"
  - "[[03-mimari/veri-kaliciigi|Veri kalıcılığı]]"
  - "[[06-kararlar/adr-001-sqlite-kalici-veri|ADR-001]]"
  - "[[06-kararlar/adr-003-yerel-dosya-depolama|ADR-003]]"
etiketler:
  - neta
  - karar
  - runtime
---

# ADR-002 — Tek process, tek persistent data directory

> Son güncelleme: **2026-09-03** — Toplu karar kaydındaki K-002 bağımsız ADR notuna ayrıldı.

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Mevcut

## Bağlam

SQLite veritabanı, upload'lar ve yedekler birlikte tutarlı ve kolay işletilebilir bir self-hosted deployment sınırına ihtiyaç duyar.

## Karar

Bir Neta instance'ı tek uzun ömürlü Node.js process'iyle ve tek persistent data directory ile çalışır. Container dağıtımında bu sınır `/app/data` volume'üdür.

## Gerekçe

- SQLite ve yerel dosyaların sahipliğini açık tutar.
- Yedekleme, restore ve upgrade prosedürlerini tek veri alanında toplar.
- Hedef kullanıcı için harici koordinasyon servislerini ortadan kaldırır.

## Değerlendirilen alternatifler

- Aynı SQLite dosyasına yazan birden çok uygulama replica'sı.
- Shared object storage ve harici veritabanıyla yatay ölçekleme.

İlk seçenek desteklenmeyen tutarlılık riski taşır; ikincisi farklı bir operasyon ve ürün modelidir.

## Varsayımlar

- Tek host kapasitesi hedef freelancer workload'u için yeterlidir.
- Persistent volume uygulama image'ından bağımsız yaşar.
- Operatör upgrade/restore sırasında tek process kuralını korur.

## Etkilenen sistemler ve sonuçlar

- Horizontal high availability ve multi-writer deployment yoktur.
- `/app/data` kaybı DB, upload ve yerel backup'ları birlikte etkileyebilir.
- Off-site backup operasyonel olarak ayrıca gereklidir.

## Uygulama kanıtı

Kök `Dockerfile`, `docker-compose.yml` ve [[README]] tek uygulama servisi ile persistent volume modelini tanımlar.

## Yeniden değerlendirme koşulları

- Ürün SLA veya kapasite hedefinin tek hostu aşması.
- Cloud control plane veya çok kiracılı servis kararı.
- Persistence katmanının local filesystem dışına taşınması.

## Canonical kaynaklar

- [[README]]
- `Dockerfile`
- `docker-compose.yml`
