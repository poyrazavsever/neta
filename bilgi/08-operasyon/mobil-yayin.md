---
tur: operasyon
durum: mevcut
guncellendi: 2026-09-17
guven: yuksek
ozet: "MOB-9 source kalite, native generation, reviewer/hash’li release kanıtı ve açık signing/store operasyon kapıları."
kaynaklar:
  - docs/mobile/mobile-data-acceptance.md
  - docs/mobile/mobile-release-acceptance.md
  - docs/mobile/mobile-server-compatibility.md
  - docs/mobile/release/release-candidate.json
  - apps/neta-mobile/scripts/native-release-gate.mjs
  - apps/neta-mobile/scripts/release-readiness-gate.mjs
  - apps/neta-mobile/eas.json
  - .github/workflows/mobile-ci.yml
ilgili:
  - "[[08-operasyon/yayin-hazirligi|Yayın hazırlığı]]"
  - "[[05-is-akislari/yayin-ve-upgrade|Yayın ve upgrade]]"
  - "[[03-mimari/mobil-mimari|Mobil mimari]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil uygulama planı]]"
  - "[[06-kararlar/adr-023-mobil-release-kanit-kaydi|ADR-023]]"
etiketler:
  - neta
  - operasyon
  - mobil
  - release
---

# Mobil yayın

MOB-9 yerel teknik hazırlığı canonical [[docs/mobile/mobile-release-acceptance]] sayfasındadır. Native dizinler generated/ignored’dır; kaynak check bunları istemez, platform native gate’i ise eksik proje/Pods’ta başarısızdır. Windows Expo/autolinking CLI’leri Node entry point’leriyle çalışır. EAS preview/production origin’i boş bırakarak runtime domain/QR modelini korur.

## Komutlar

```sh
pnpm mobile:release:check
pnpm mobile:release:readiness
pnpm mobile:store:check
```

Release check kod kalitesidir. Readiness güvenli blocker JSON raporudur. Store check strict kanıt kaydı, ardından contract/quality/security/AI otomatik kapılarıdır; yayın veya upload yapmaz. Candidate commit, aynı build girdileri, temiz worktree ve reviewer/hash’li yerel evidence zorunludur. [[06-kararlar/adr-023-mobil-release-kanit-kaydi|ADR-023]] bu ayrımı tanımlar.

## Mevcut ve açık kabul

Kaynak/native/fork/config ve sentetik HTTP kabulü gerçek store kabulü değildir. Signed IPA/AAB, gerçek cihaz/iki HTTPS instance, owner/client/file/AI/a11y/performans, production-like migration/restore, TestFlight/Play Internal Testing ve privacy/support/license/incident kanıtları release kaydında pending’dir. Kamu URL’leri, incident alias’ı ve lisans kararı henüz atanmadı; secret veya store credential repo’ya yazılmaz.

[[docs/mobile/mobile-server-compatibility]] API-major/minimum SemVer kod matrisidir. RC stable minimumu geçmez; build metadata sıralamaya etki etmez; malformed minimum fail closed’dur. Canlı eski/yeni client/server kabulü ayrıca kaydedilir. Minimum version store dağıtımı erişilebilir olmadan yükseltilmez ve rollback aracı değildir.

Upgrade öncesi image+backup çifti korunur; restore app kapalıyken ayrı target’ta provadan geçer, device epoch değişir ve yeniden pairing gerekir. Same SQLite’a ikinci replica yazılmaz. AI decrypt için matching BETTER_AUTH_SECRET korunur; key rotation tooling açık borçtur. UI/UX ve assets diff çalışması en son kalır.

## Veri kabul gate’i

pnpm mobile:data:check on SQLite/CLI senaryosu ve ayrı production standalone/gerçek loopback HTTP kontrolünü çalıştırır. Backend Mobile CI ve strict store check bu gate’i içerir. Migration-restore evidence otomatik geçti diye reviewer onayına çevrilmez; production-like/signed kabul pending kalır. [[docs/mobile/mobile-data-acceptance]] kapsamı açıklar.
