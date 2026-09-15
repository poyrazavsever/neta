---
tur: bilesen
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-web/package.json
  - apps/neta-web/app
  - apps/neta-web/README.md
ilgili:
  - "[[01-urun/neta|Neta]]"
  - "[[03-mimari/monorepo|Monorepo]]"
etiketler:
  - neta
  - bilesen
  - landing
---

# neta-web

## Rol

`@neta/web`, Neta'yı, modüllerini, self-hosting değerini, müşteri portalını ve kurulum yolunu anlatan public landing sitesidir. Kullanıcı iş verisinin veya auth'unun sahibi değildir.

## Teknoloji ve çalışma

Next.js 16 + React 19; Poyraz UI v2, GSAP ve Lenis kullanır. Development portu 3001'dir. Ayrı build/start lifecycle'ı vardır.

## Sınırlar

- Canonical backend değildir.
- `/app/data` veya SQLite'a bağlanmaz.
- Self-hosted app Docker image'ına girmez.
- Ürün iddiaları [[00-sistem/mevcut-durum|mevcut durum]] ve capability gerçekliğiyle uyumlu tutulmalıdır.

## Risk

Marketing metni planlanan mobil capability'leri mevcut gibi anlatırsa ürün güveni bozulur. Ayrıca landing Poyraz UI v2, self-hosted app v3 kullanır; bilinçli ayrı tasarım yüzeyi olsa da token/marka drift'i izlenmelidir.

## Kaynaklar

- `apps/neta-web/README.md`
- `apps/neta-web/package.json`
- [[docs/roadmaps/platform-master-plan]]
