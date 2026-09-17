---
tur: karar
durum: mevcut
karar_durumu: kabul-edildi
guncellendi: 2026-09-17
guven: yuksek
ozet: "Mobil kaynak kalite kapısı ile signed/native/store kabulü ayrı doğrulanır; release kararı source commit ve hash’li, reviewer onaylı kanıt kaydına bağlıdır."
kaynaklar:
  - docs/mobile/mobile-release-acceptance.md
  - docs/mobile/release/release-candidate.json
  - apps/neta-mobile/scripts/release-readiness.mjs
  - apps/neta-mobile/scripts/release-readiness-gate.mjs
  - apps/neta-mobile/scripts/release-readiness.test.mjs
  - .github/workflows/mobile-ci.yml
ilgili:
  - "[[06-kararlar/adr-011-mobile-v1-hazirlik-anlami|ADR-011]]"
  - "[[06-kararlar/adr-020-mobil-server-surum-uyumlulugu|ADR-020]]"
  - "[[08-operasyon/mobil-yayin|Mobil yayın]]"
  - "[[09-yol-haritasi/mobil-uygulama-plani|Mobil plan]]"
etiketler:
  - neta
  - karar
  - mobil
  - release
---

# ADR-023 — Mobil release kanıt kaydı

**Karar durumu:** Kabul edildi · **Uygulama durumu:** Yerel gate ve kayıt mevcut; signed/store kabulü açık

## Bağlam

Native android/ios dizinleri üretilir ve gitignore altındadır. Eski release check temiz checkout’ta mevcut olmayan Podfile.lock’a bağımlıydı; CLI shell shim’leri Windows’ta taşınabilir değildi. Kod gate’leri ve tarihsel simulator/debug build kayıtları gerçek cihaz/mağaza kanıtı değildir. MOB-9 hangi source commit’in hangi sonuçlarla kabul edildiğini açıkça bağlamalıdır.

## Karar

Kaynak kalite kapısı native source/config ve gerçek autolinking çözümlemesini içerir; native project/Pods kontrolü ayrı platform komutunda yapılır. Signed/native/store kabulü reviewer alias’ı, UTC tarih ve SHA-256’lı yerel Markdown kanıtıyla release-candidate.json kaydında tutulur. Bütün zorunlu maddeler geçmeden strict gate exit 1 olur. Report modu blocker’ları kimlik bazında gösterir ve kod CI’sini yalnız dış ortam kanıtı eksik diye kırmaz.

Kayıt candidate source commit’ini referanslar. Sonraki yalnız doküman/kanıt commit’leri kabul edilebilir; candidate HEAD’in atası, build girdileri aynı ve çalışma ağacı temiz olmalıdır. Signed IPA/AAB hash’i, release signing ve certificate fingerprint’i yetkili reviewer beyanıdır; JS export, simulator veya debug signing yerine geçmez. Binary/credential repo’ya girmez. Gate insan beyanını ve kanıt bütünlüğünü doğrular; cihaz testini ya da imza otoritesini kendisi icra etmez.

## Gerekçe

- Clean checkout kaynak CI’si her platformda tekrarlanabilir; missing native/Pods strict native gate’inde görünürdür.
- Kod hazır ile store hazır ayrılır; mobile-v1 bu implementasyonla açılmaz.
- Privacy/support URL, incident owner ve unresolved lisans kararı release’i bloklar; bunlar uydurulmaz.
- Değişmiş kanıt veya source commit önceki kabulü sessizce taşımamış olur.
- CI raporu secret/private içerik yerine yalnız blocker kimliklerini verir; release owner dış ortam kabulünden sorumludur.

## Değerlendirilen alternatifler

Yalnız Markdown checkbox’ı bütünlük/version bağı kurmaz; tüm dış ortam kapılarını PR CI’sinde zorunlu kılmak normal geliştirmeyi bloklar. İmzalı merkezi attestation/control-plane bu çalışma için seçilmedi. Store upload/rollout, OTA, signing credential üretimi ve notification/push bu karara dahil değildir.

## Varsayımlar

Reviewer kanıtı gerçek signed candidate üzerinde üretir ve private veri/sırları rapordan temizler. Binary ve signing credential yetkili harici storage’da korunur. Kanıt dosyaları source commit’inden sonra yalnız doküman commit’iyle eklenebilir.

## Etkilenen sistemler ve sonuçlar

Mobile quality, platform native gate, CI blocker artifact ve strict store check aynı release kaydını kullanır. Store hesabı/cihaz/HTTPS kabulü repo otomasyonunun dışında kalır; pending kayıt release’i durdurur.

## Yeniden değerlendirme koşulları

Merkezi release attestation, otomatik signed-device farm veya OTA sistemi eklendiğinde source/artifact/runtime bağının kapsamı yeniden değerlendirilir.

## Canonical kaynaklar

- [[docs/mobile/mobile-release-acceptance]]
- `docs/mobile/release/release-candidate.json`
- `apps/neta-mobile/scripts/release-readiness-gate.mjs`
- `.github/workflows/mobile-ci.yml`
