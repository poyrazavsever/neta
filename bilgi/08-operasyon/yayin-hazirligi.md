---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - package.json
  - apps/neta-app/package.json
  - apps/neta-mobile/package.json
  - docs/self-hosted-redesign/release-readiness-2026-07-18.md
ilgili:
  - "[[05-is-akislari/yayin-ve-upgrade|Yayın ve upgrade akışı]]"
  - "[[07-guvenlik/bilinen-riskler|Bilinen riskler]]"
etiketler:
  - neta
  - operasyon
  - release
---

# Yayın hazırlığı

## Monorepo kapıları

```bash
pnpm lint:all
pnpm typecheck:all
pnpm build:all
pnpm mobile:check
```

Değişikliğe göre app phase smoke/boundary, i18n integrity/release gate, import/backup/restore ve mobil release check de çalıştırılır.

## Self-hosted app checklist

- Tek-replica ve persistent volume.
- Startup migration + readiness.
- Production HTTPS origin/trusted origins/auth secret.
- Backup + ayrı target restore rehearsal.
- Owner/client auth, customer/project/task, file/branding, portal negative smoke.
- Supabase runtime dependency regression boundary.
- Image non-root ve dependency audit değerlendirmesi.

## Mobil checklist

- Native/static/a11y/i18n/config gate.
- İki gerçek instance'a rebuildsiz connect testi hedef model için zorunlu.
- Discovery/meta/me/catalog ortak contract consumer testi.
- Owner ve client route authorization; offline/error state; logout/cache purge.
- Backend resource API 404'leri kapanmadan store release yok.
- Pairing capability yalnız server schema/lifecycle/restore epoch ve negatif testlerle açılır.

## Kanıt tarihi uyarısı

2026-07-18 release-readiness o tarihteki dependency/runtime için tarihsel kanıttır. Güncel Node 24/Docker/package sürümlerinde tekrar çalıştırılmadan bugünkü release sertifikası sayılmaz.

## Kaynaklar

- [[README]]
- [[docs/self-hosted-redesign/release-readiness-2026-07-18]]
- [[docs/roadmaps/platform-master-plan]]
