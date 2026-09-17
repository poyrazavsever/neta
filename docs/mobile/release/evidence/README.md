# Release evidence dosyalama

Bu klasör gerçek signed candidate kabulü yapıldıktan sonra temizlenmiş raporlar içindir. Başlangıçta hiçbir release maddesi passed değildir. Kaynak otomatizasyon sonucu [MOB-9](../../mobile-release-acceptance.md) sayfasındadır; bu rehber kanıt sayılmaz.

Dosya adları gate ID’siyle aynı lowercase Markdown adı olabilir: signed-ios.md, signed-android.md, two-https-instances.md, owner-client-native.md, ai-provider-native.md, native-a11y-performance.md, migration-restore.md, compatibility.md, store-internal.md, privacy-support-license.md ve operations.md.

Her raporda candidate source commit, app sürümü, gerçek build numarası, test ortamı/platform sürümü, çalıştırılan senaryolar ve açık başarısızlıklar bulunur. Reviewer takım alias’ı ve ISO UTC reviewedAt (örneğin 2026-09-17T12:00:00.000Z) kayda eklenir. Failed/pending madde passed yapılmaz. Reviewer alias’ı ASCII harf/rakam/boşluk/tire/nokta/alt çizgi kullanır.

Signed rapor IPA/AAB hash’i, release sertifika fingerprint’i ve yetkili storage’daki binary’nin gerçek sürümünü bağlar. Sertifika/private key/provisioning profile veya binary burada saklanmaz. Device identifier, e-posta, gerçek workspace içeriği, cookie/token, query secret, invitation/reset URL, log dump veya özel screenshot rapora girmez.

Kanıt dosyası son biçimiyle yazıldıktan sonra SHA-256 hesaplanır:

```powershell
(Get-FileHash -LiteralPath docs/mobile/release/evidence/signed-ios.md -Algorithm SHA256).Hash.ToLowerInvariant()
```

POSIX: shasum -a 256 docs/mobile/release/evidence/signed-ios.md. Record evidence.path repository-relative, evidence.sha256 lowercase hex olmalıdır. Dosya sonradan değişirse hash/yeniden review gerekir. Evidence ve release kaydı candidate source’tan sonra yalnız docs commit’iyle eklenebilir; strict kontrolde çalışma ağacı temiz olmalıdır. Candidate kaynak değişirse yeni binary/matris kabulü gerekir.
