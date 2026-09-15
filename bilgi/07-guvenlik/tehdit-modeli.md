---
tur: guvenlik
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/auth
  - apps/neta-app/server/files
  - apps/neta-app/scripts/backup.mjs
  - apps/neta-app/scripts/restore.mjs
  - docs/self-hosted-redesign/adr-0018-device-pairing.md
ilgili:
  - "[[07-guvenlik/guvenlik-genel-bakis|Güvenlik genel bakışı]]"
  - "[[07-guvenlik/bilinen-riskler|Bilinen riskler]]"
etiketler:
  - neta
  - guvenlik
  - tehdit-modeli
---

# Tehdit modeli

## Korunan varlıklar

Owner/client auth materyali; müşteri PII; proje/task/takvim/finans/journal/chat verisi; upload'lar; branding metadata; AI API key'leri; backup bundle'ları; instance kimliği ve gelecekte device tokenları.

## Aktörler ve tehditler

| Aktör | Temel tehdit | Mevcut azaltım | Durum/açık |
| --- | --- | --- | --- |
| Workspace owner | Yanlışlıkla fazla veri paylaşma, zayıf secret/AI config | Owner-only ayarlar, visibility modeli | Owner trusted admin; UX guard'ları ayrıca gerekir |
| Davetli müşteri | Başka client/proje/file verisine erişim | Session-derived client scope, relation check, not-found yaklaşımı | Mobil v1 portal negatif testleri henüz yok |
| Anonim internet kullanıcısı | Brute force, owner signup yarışı, invite token denemesi, public endpoint abuse | Auth rate limit, setup lock, token entropy/expiry, HTTPS | Invite endpoint rate limit ayrıntısı tekrar doğrulanmalı |
| Zararlı upload | Path traversal, MIME spoofing, parser exploit, stored payload | Server path, allowlist, magic bytes, size, no-follow | Re-encode/metadata strip/malware scan yok |
| Compromised AI provider | Prompt/veri sızıntısı, yanıltıcı çıktı | Owner seçimi, timeout, hata normalization | Egress/data minimization ve output trust policy sınırlı |
| Çalınmış backup | Offline auth/PII/veri analizi; encrypted AI blob brute-force | Manifest bütünlüğü | App-level backup encryption/signature yok; off-site şifreleme operatörde |
| Compromised host | DB/file/env secret/full process erişimi | Non-root container, filesystem permission beklentisi | Host ele geçirilince uygulama içi izolasyon koruma sağlamaz |
| Yanlış reverse proxy | HTTP exposure, wrong origin/cookie, spoofed proto/redirect | Production APP_URL HTTPS validation, trusted origin | TLS/header correctness dış operasyon sorumluluğu |
| Kötü niyetli/yanlış discovery origin | Credential'ı başka hosta gönderme | Same-origin URL validation, HTTPS, instance ID | Signed iki-instance redirect/izolasyon E2E testi açık |
| Çalınmış mobil cihaz | Cookie/bearer ve cached data kullanımı | Instance-scoped SecureStore/cache clear, device revoke | Revoke/reuse/restore gerçek cihaz kabulü açık |

## Kritik saldırı yolları

### Cross-client IDOR

Attacker başka project/file/client ID'sini tahmin eder. Kontrol her service call'da actor scope ve relation'dan türetilmelidir; request body'deki client ID'ye güvenilmez. Mobil v1 route'larında contract/negative test zorunludur.

### Invite token sızıntısı

Raw token URL'de olduğu için browser history, referrer, screenshot veya mesaj kanalında sızabilir. Hash-only DB, kısa expiry ve one-use etkisini azaltır. Token log/redaction ve `Referrer-Policy` davranışı ayrıca denetlenmelidir.

### Backup restore ile credential diriltme

Bugünkü Better Auth session kayıtları backup'ta bulunur; restore eski auth state'i geri getirebilir. Device tokenlar için restore epoch rotation kodda vardır, eski token reddi negatif testle doğrulanmalıdır. Better Auth session invalidation/restore politikası ayrıca karara ihtiyaç duyar.

### AI exfiltration

User-authored veya domain verisi prompt'a eklenirse external provider'a çıkar. Prompt injection tool/data erişimini genişletmemeli; sadece gerekli alanlar gönderilmeli ve AI çıktısı yetki kararı olmamalıdır.

## Pairing tehditleri ve açık kabul

Brute force challenge, double exchange, refresh reuse, token logging, over-broad scope ve restore sonrası token resurrection. ADR-0018'in QR secret, keyed digest, rate limit, immediate transaction, opaque rotation/reuse detection ve epoch mekanizmaları kodda yer alır. Gerçek cihaz ve negatif E2E kabulü açık olduğu için güvenlik sonucu tamamlanmış sayılmaz.

## Kaynaklar

- `apps/neta-app/server/auth/`
- `apps/neta-app/server/files/`
- [[docs/self-hosted-redesign/adr-0018-device-pairing]]
