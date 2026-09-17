---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
kaynaklar:
  - docs/mobile/mobile-data-acceptance.md
  - docs/mobile/mobile-release-acceptance.md
  - apps/neta-app/scripts/restore.mjs
  - docs/self-hosted-redesign/phase-8-import-release.md
  - README.md
ilgili:
  - "[[08-operasyon/yedekleme|Yedekleme]]"
  - "[[03-mimari/migrasyonlar|Migrasyonlar]]"
etiketler:
  - neta
  - operasyon
  - disaster-recovery
---

# Felaket kurtarma

## Hedef

Doğrulanmış DB + upload bundle'ından tek instance'ı, scope/auth/file bütünlüğünü koruyarak geri getirmek.

## Recovery sırası

1. Olayı sınırla; uygulamayı durdur, volume'u read-only snapshotla ve mevcut state'i koru.
2. Restore point'i zaman, release ve manifest bütünlüğüyle seç.
3. Mümkünse ayrı target'ta rehearsal yap.
4. Matching application image/tag'i hazırla.
5. Canonical restore scriptiyle DB/uploads staged swap uygula.
6. Gerekliyse yalnız matching release'in forward migration'ını çalıştır.
7. Readiness ve foreign-key/integrity kontrolleri yap.
8. Owner login, client link, müşteri/proje/task, file/branding ve portal smoke yap.
9. Incident nedenini ve veri kaybı aralığını kaydet.

## Senaryolar

- **Bozuk/tamper bundle:** Restore reddedilir; başka restore point seçilir.
- **Upgrade regresyonu:** Eski image + pre-upgrade backup; DB down migration yok.
- **Disk/host kaybı:** Off-site encrypted bundle ve yeni persistent volume gerekir.
- **Secret kaybı:** DB restore tek başına auth/AI decrypt sürekliliği sağlamaz; matching secret gerekir.
- **Kısmi upload kaybı:** Sadece DB restore edilmez; eşleşen bundle kullanılır.

## Pairing restore davranışı

Canonical restore scripti device token epoch’unu başarılı swap sonrasında değiştirir. Eski tokenlar yeniden geçerli olmaz; fresh pairing gerekir. İkinci loopback backend otomatik HTTP kabulü [[docs/mobile/mobile-security-acceptance]] sayfasındadır; signed/native production-like restore kabulü release kaydında açıktır.

## Açık operasyon kararı

Resmî RPO/RTO, backup retention süresi, encryption mekanizması ve restore rehearsal periyodu seçilmemiştir.

## Kaynaklar

- `apps/neta-app/scripts/restore.mjs`
- [[docs/self-hosted-redesign/phase-8-import-release]]

## Migration/readiness kabulü

Restore staging integrity/FK ve migration prefix’i doğrulanır. Target WAL/SHM varsa cutover durur: app’i durdurun ve matching release/SQLite ile checkpoint/temiz kapanış yapın; sidecar’ları elle silmeyin. Eski backup sonrası forward migration tamamlanana kadar ready 503’tür. [[docs/mobile/mobile-data-acceptance]] yerel/production kabulünü ayırır.
