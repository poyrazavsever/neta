---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - Dockerfile
  - docker-compose.yml
  - docs/self-hosted-redesign/phase-8-import-release.md
ilgili:
  - "[[03-mimari/deployment|Deployment]]"
  - "[[08-operasyon/health-checkler|Health check'ler]]"
  - "[[08-operasyon/yedekleme|Yedekleme]]"
etiketler:
  - neta
  - operasyon
  - production
---

# Production

## Minimum topoloji

HTTPS reverse proxy → tek `neta-app` container/process → kalıcı `/app/data` volume. Landing ayrı deploy, mobile ayrı native release'tir.

## Zorunlu yapılandırma

- `NODE_ENV=production`
- External HTTPS `APP_URL` ve `NEXT_PUBLIC_SITE_URL`
- En az 32 karakter, benzersiz ve kalıcı `BETTER_AUTH_SECRET`
- `DATA_DIR=/app/data`
- Gerekliyse explicit `TRUSTED_ORIGINS`; wildcard yok
- `/app/data` için doğru owner/permission ve yeterli disk

## Operasyon tabanı

- Tek replica kullan.
- Startup migration tamamlanmadan trafik verme.
- `/api/health/live` ile process, `/api/health/ready` ile DB/data/migration readiness izle.
- Backup'ı periyodik al; encrypted off-site kopya ve restore rehearsal yap.
- Proxy TLS, request size/timeouts ve forwarded header ayarlarını doğrula.
- Upgrade'de matching pre-upgrade backup tut.

## Production sayılmayanlar

Local build/test başarısı; gerçek DNS/TLS; external backup; canlı veri importu; gerçek owner/client smoke ve rollback penceresi yerine geçmez.

## Alarm adayları

Readiness 503, disk kullanım artışı, backup yaşlanması/başarısızlığı, repeated auth failure, DB busy/lock hatası, AI upstream rate/timeout ve upload checksum/invariant hataları.

## Kaynaklar

- [[README]]
- [[docs/self-hosted-redesign/phase-8-import-release]]
- [[docs/self-hosted-redesign/release-readiness-2026-07-18]]
