---
tur: is-akisi
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - README.md
  - apps/neta-app/server/auth/setup.ts
  - apps/neta-app/server/auth/auth.ts
ilgili:
  - "[[02-domainler/kimlik-ve-erisim|Kimlik ve erişim]]"
  - "[[08-operasyon/production|Production]]"
etiketler:
  - neta
  - is-akisi
  - kurulum
---

# İlk kurulum

## Amaç

Yeni self-hosted instance'ı kalıcı veri, doğru origin ve tek owner hesabıyla güvenli biçimde kullanılabilir hale getirmek.

## Aktörler

Host operatörü ve ilk owner; çoğunlukla aynı kişi olabilir.

## Mevcut akış

1. Node 24/pnpm 11 ile dependency kurulur veya Docker image build edilir.
2. Kalıcı `DATA_DIR`/`/app/data`, public origin ve en az 32 karakter `BETTER_AUTH_SECRET` yapılandırılır.
3. Remote production için HTTPS reverse proxy hazırlanır.
4. Startup migration'ları uygulanır; readiness doğrulanır.
5. `/register` üzerinden ilk freelancer hesabı oluşturulur.
6. Setup reservation eşzamanlı istekleri sınırlar; profile ve completed state yazılır.
7. Public registration kapanır.
8. Owner workspace branding, locale ve opsiyonel AI sağlayıcısını ayarlar.
9. İlk backup alınır ve ayrı hedefe restore provası yapılır.

## Başarı ölçütü

Readiness sağlıklı; tam olarak bir freelancer profile; tekrar public signup reddediliyor; volume restart sonrası veriyi koruyor; backup restore edilebiliyor.

## Hata/rollback

Owner setup yarıda kalırsa stale lock 10 dakika sonra yeniden alınabilir veya aynı email için repair akışı profile'ı tamamlayabilir. Production secret/volume yanlışsa kullanıcı oluşturmadan önce deployment düzeltilmelidir.

## Güvenlik notları

Secret kaynak kontrolüne girmez. HTTP remote origin kabul edilmez. İlk owner linki internetten erişilebiliyorsa setup gecikmeden tamamlanmalı ve reverse proxy/rate limit korunmalıdır.

## Kaynaklar

- [[README]]
- `apps/neta-app/server/auth/setup.ts`
- [[docs/self-hosted-redesign/phase-2-auth]]
