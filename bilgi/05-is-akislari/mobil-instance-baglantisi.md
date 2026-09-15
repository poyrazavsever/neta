---
tur: is-akisi
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-mobile/app.config.ts
  - apps/neta-mobile/src/lib/instance/discovery.ts
  - apps/neta-mobile/src/providers/session-provider.tsx
  - docs/roadmaps/platform-master-plan.md
ilgili:
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
  - "[[02-domainler/instance-ve-mobil-baglanti|Instance bağlantı domaini]]"
etiketler:
  - neta
  - is-akisi
  - mobil
---

# Mobil instance bağlantısı

## Mevcut akış: build-time origin

1. Preview/production build `EXPO_PUBLIC_NETA_ORIGIN=https://...` ile üretilir.
2. App açıldığında session provider kayıtlı aktif instance'ın origin'ini build origin'iyle karşılaştırır; farklıysa kullanmaz.
3. Origin normalize edilir; remote production HTTPS zorunludur.
4. `/.well-known/neta` çağrılır; protocol/discoveryVersion/instanceId doğrulanır.
5. Discovery'nin API/health/meta/catalog URL'leri aynı-origin olmak zorundadır.
6. Health, meta ve public catalog yüklenir; discovery/meta instance ID ve client version kontrol edilir.
7. Instance metadata/cache kaydedilir.
8. Better Auth email/şifre girişi yapılır; auth material SecureStore'a instance ID altında yazılır.
9. `/api/v1/me` rolü doğrular ve owner/portal shell açılır.

## Hedef akış: henüz uygulanmadı

```text
welcome -> domain gir veya QR tara -> discovery -> onay/giriş
        -> email/şifre (ilk faz olabilir)
        -> pairing exchange (sonraki güvenlik fazı)
        -> owner veya portal shell
```

Connect QR yalnız origin taşır; ayrı owner pairing QR'ı origin + one-use secret taşır. Salt kısa kodun domain çözmesi merkezi resolver gerektirir ve ilk sürümde yoktur; manuel pairing `domain + code` kullanır.

## Güvenlik kontrolleri

Credential yalnız validated origin'e; HTTPS downgrade yok; unexpected `instanceId` eski credential'ı sessizce kullanmamalı; minimum mobile version enforce edilmeli; TLS hatası bypass edilmemeli.

## Açık kabul kapıları

Runtime domain UI, resource v1 route'ları, shared DTO ve pairing server kodda vardır. Signed iki-instance cihaz izolasyonu, pairing restore/revoke ve portal tenant negatif E2E kabulü henüz açık olduğundan store hazır oluşu ilan edilmez.

## Kaynaklar

- `apps/neta-mobile/src/lib/instance/discovery.ts`
- [[docs/self-hosted-redesign/phase-9-mobile-api]]
- [[docs/roadmaps/platform-master-plan]]
