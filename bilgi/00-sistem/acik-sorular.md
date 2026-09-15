---
tur: sistem
durum: mevcut
guncellendi: 2026-09-04
guven: yuksek
kaynaklar:
  - docs/neta-backend-mobile-api-master-plan.md
  - docs/roadmaps/platform-master-plan.md
  - docs/self-hosted-redesign/adr-0018-device-pairing.md
ilgili:
  - "[[00-sistem/celiskiler|Çelişkiler]]"
  - "[[09-yol-haritasi/mevcut-oncelikler|Mevcut öncelikler]]"
etiketler:
  - neta
  - acik-soru
---

# Açık sorular

Bu liste yalnız gerçek karar veya kanıt açığını içerir. Bir soru çözüldüğünde sonuç ilgili mimari/karar sayfasına taşınır ve buradan kapanış bağlantısı verilir.

## Ürün ve mobil

1. **Client mobil oturumu cookie mi, ayrı client pairing mi kullanacak?** ADR-0018 client pairing'i açıkça kapsam dışı bırakıyor.
2. **Better Auth cookie izolasyonu signed native build'de kanıtlanacak mı?** Karar ve JS lifecycle'ı mevcut; iki canlı HTTPS instance ile iOS/Android revoke, password-change ve restore matrisi henüz koşulmadı.

## API ve veri

3. **Finance özetleri çoklu para birimini nasıl ele alacak?** Contract currency gruplamasını zorunlu kılar; conversion ve raporlama ürün politikası hâlâ açıktır.

## Operasyon ve yönetişim

4. **Repository lisansı nedir?** Kök README proprietary derken `apps/neta-mobile/LICENSE` MIT izni veriyor. Dağıtım öncesi hukuk/ürün kararı gerekir.
5. **Backup şifreleme ve off-site retention standardı nedir?** Uygulama checksum ve local retention sunuyor; host dışı şifreleme/saklama operatöre bırakılmış.

## Çözülen sorular

- **Mobil temel karar kapıları:** 2026-09-03/04'te Better Auth cookie, tek aktif instance UI, secret-free connect QR, `mobile-v1` semantiği, `401/403`, updatedAt concurrency ve `{items,pageInfo}` + opaque cursor ADR-011…ADR-020 ile donduruldu; MOB-2/MOB-3 koduna yansıdı.

- **Kasa için kalıcı lint aracı:** 2026-09-03 tarihinde `pnpm vault:map`, `pnpm vault:check` ve `pnpm vault:hooks:test` eklendi. Yerel hook kullanımı kabul edildi; CI workflow'una zorunlu job eklenmesi hâlâ ayrı operasyon kararıdır. Bkz. [[06-kararlar/adr-010-agent-baglaminda-vault-routing|ADR-010]] ve [[00-sistem/agent-baglam-ve-hooklar|agent bağlamı ve hooklar]].
