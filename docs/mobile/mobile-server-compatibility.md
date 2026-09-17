---
title: Mobil-server compatibility matrisi
status: code-matrix-verified-live-matrix-open
last_updated: 2026-09-17
---

# Mobil-server uyumluluğu

ADR-020 uyarınca API major ve server’ın minimumSupportedVersion alanı ayrı kapıdır; exact server/client sürüm eşitliği gerekmez. Server env’i NETA_MINIMUM_MOBILE_VERSION, mobil sürüm Expo config version’dır. API major v1 dışı reddedilir. Kaynak app sürümü bugün 0.1.0’dır; capability ayrı gate’tir ve mobile-v1 release kabulüne kadar planned kalır.

| Mobil | API | Server minimum | Kod davranışı |
|---|---|---|---|
| 0.1.0 | v1 / 1.2.0 | null / 0.1.0 | Uyumluluk kapısı geçer; resource capability ayrıca kontrol edilir |
| 0.1.0 | v1 | 0.2.0 | INCOMPATIBLE_CLIENT, güncelleme gerekir |
| 0.1.0 | v2 / bilinmeyen major | herhangi | INCOMPATIBLE_CLIENT |
| 1.0.0-rc.1 | v1 | 1.0.0 | Stable sürüm minimumunu karşılamaz |
| 1.0.0 | v1 | 1.0.0-rc.1 | Minimumu karşılar |
| 1.0.0+build.42 | v1 | 1.0.0+build.9 | Build metadata sıralamayı değiştirmez |
| Geçerli app | v1 | malformed/partial/leading-zero | Fail closed; bağlantı kabul edilmez |

2026-09-17’de eski numeric-only comparator’ın RC’yi stable ile eşit sayması düzeltildi. Prerelease identifier’ları SemVer sırasıyla, numeric identifier’lar precision kaybı olmadan karşılaştırılır. Helper’ın eski partial comparison fallback’i korunur; discovery minimum/current gate’i tam geçerli SemVer ister. Varsayılan server minimum null’dır; bu değer legacy server feature parity’si garantisi değildir.

## Release kabulü

Her signed candidate ile en az desteklenen eski server, güncel server, daha yüksek minimum ilan eden server ve yanlış API major senaryosu owner/client hesaplarında denenir. Yeni server aynı API v1’de additive response alanlarını korur; eski mobile resource/status/error/parser davranışı smoke edilir. Gerçek sürüm/instanceId ve temiz sonuç raporu release/evidence/compatibility.md dosyasına eklenir; bu canlı matris henüz pending’dir.

Minimum sürüm yalnız zorunlu protokol/güvenlik gerekçesiyle, yeni binary ilgili mağazalarda erişilebilir olduktan sonra yükseltilir. Rollback veya kendiliğinden tüm client’ları engelleme aracı olarak kullanılmaz. Native module/config değişimi yeni binary ister; OTA kurulmadı.

Kaynaklar: apps/neta-app/server/config.ts, apps/neta-mobile/src/lib/instance/discovery.ts, version.ts ve version.test.ts; [SemVer 2.0.0](https://semver.org/), [release kabulü](mobile-release-acceptance.md).
