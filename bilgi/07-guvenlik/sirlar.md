---
tur: guvenlik
durum: mevcut
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/server/config.ts
  - apps/neta-app/server/settings/ai.ts
  - apps/neta-app/server/auth/invitations.ts
  - apps/neta-mobile/src/lib/storage/secure-storage.ts
ilgili:
  - "[[03-mimari/kimlik-dogrulama|Kimlik doğrulama]]"
  - "[[03-mimari/ai-mimarisi|AI mimarisi]]"
etiketler:
  - neta
  - guvenlik
  - sirlar
---

# Sırlar

## Envanter

| Sır | Nerede yaşar | Public olmamalı | Rotasyon etkisi |
| --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | Production environment/secret store | Repo, client, backup manifest/log | Auth ve AI key decrypt davranışını etkiler |
| Kullanıcı şifresi/hash'i | Better Auth credential account, SQLite | API/log/import bundle raporu | Session policy'ye göre revoke gerekir |
| Better Auth session token/cookie | SQLite + secure cookie; mobile SecureStore | URL/log/public DTO | Logout/disable ile kaldırılır |
| Portal invite raw token | Yalnız oluşturulan URL ve client input | DB/audit/log | One-use/expiry; DB'de SHA-256 hash |
| AI provider API key | SQLite AES-256-GCM ciphertext; runtime memory | Browser/mobile/public settings | Auth secret değişirse mevcut ciphertext çözülemez |
| Gelecek pairing/device token | Planlanan: raw sadece client response/SecureStore; digest DB | URL/log/audit/analytics | Refresh rotation, reuse revoke, token epoch |

## BETTER_AUTH_SECRET

Production runtime için en az 32 karakter ve zorunludur. Instance'a özgü, sabit ve secret manager/host environment'ta tutulmalıdır. Source, Docker image veya `EXPO_PUBLIC_*` içine konmaz.

AI encryption key bu secretten türetildiği için “auth secret rotasyonu” yalnız session işi değildir. Mevcut AI keys ya önceden decrypt/re-encrypt edilmeli ya owner'dan yeniden alınmalıdır. Bunun için otomatik rotasyon aracı doğrulanmamıştır.

## AI key

AES-256-GCM; random 12-byte IV ve auth tag ile `v1` ciphertext formatı kullanır. Public API yalnız `hasApiKey` döndürür. Ollama seçildiğinde encrypted key temizlenir.

## Mobil storage

Auth cookie/bearer instance ID ile SecureStore'da tutulur; private resource cache instance-scoped'tur. `EXPO_PUBLIC_*` değerler public build config'tir ve hiçbir secret içermemelidir.

## Backup etkisi

Backup DB içindeki hash/ciphertext/session kayıtlarını taşır. Checksum gizlilik sağlamaz. Bundle ayrıca encrypt edilip erişim/retention politikasıyla korunmalıdır.

## Kaynaklar

- `apps/neta-app/server/config.ts`
- `apps/neta-app/server/settings/ai.ts`
- `apps/neta-app/server/auth/invitations.ts`
