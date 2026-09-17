# MOB-9 — Migration, readiness ve restore kabulü

Canonical backend apps/neta-app ve tek SQLite writer’dır. Yerel sentetik kabul production/signed cihaz kanıtından ayrıdır.

## Otomatik gate

    pnpm mobile:data:check
    pnpm --filter @neta/app mobile:data:test
    pnpm --filter @neta/app mobile:data:production

Tam gate on SQLite/CLI testi, ardından izole production standalone build ve gerçek loopback HTTP readiness smoke çalıştırır. Backend Mobile CI bu gate’i security/AI kabulünden önce çalıştırır. Strict store check kanıt kaydı tamamlandıktan sonra data gate’ini ister. Store gönderimi veya gerçek veriye restore yapılmaz.

Testler temp alanında kendi DB/backup/target’larını üretir ve temizler. Production smoke ayrı .next-mob9-data-build-* ve .data/mob9-data-build-* kullanır; yalnız kendi child process’ini durdurur, Next config/type dosyalarını byte olarak geri yükler ve kendi çıktısını temizler. Aynı checkout’ta başka build/smoke ile eşzamanlı çalıştırılmaz. Fixture secret/token alanları gerçek credential değildir.

## Mevcut kontrol

server/db/migration-state.mjs release journal sıra/timestamp’larını ve SQL hash’lerini __drizzle_migrations kayıtlarıyla karşılaştırır. Salt runtime_checks tablosu yeterli değildir.

- Readiness bütün journal kayıtları doğru ve eksiksizse hazırdır.
- Release trace .data/env dosyalarını hariç tutar; standalone preparation Next’in ayrıca kopyalayabildiği env dosyalarını yalnız generated paketten çıkarır; paketlenmiş .data kopyası da çıkarılır, runtime volume link’i izlenmez. Runtime config host tarafından verilir. Production smoke pakette local env/data olmamasını ve açık DB path’ini doğrular.
- Startup migrate boş DB/doğru prefix üzerinde forward migration çalıştırır; ledger öncesi/sonrası doğrulanır.
- Eksik ara kayıt, duplicate, değiştirilmiş hash, daha yeni/uyumsuz timestamp, eksik SQL ve bozuk journal reddedilir.
- Aynı SQL’in LF/CRLF biçimleri kabul edilir; başka SQL değişikliği kabul edilmez. Windows/Linux taşınabilirliği için ledger yeniden yazılmaz.
- Restore manifest/checksum sonrası staging integrity_check, foreign_key_check ve desteklenen migration prefix’ini doğrular. Boş/geçmişsiz DB kabul edilmez.
- Desteklenen eski backup ayrı target’a restore edilebilir; trafik forward migration tamamlandıktan sonra verilir.
- Hedef WAL/SHM varsa cutover durur. App’i durdurun, matching release/SQLite ile checkpoint ve temiz kapanış yapın; WAL/SHM’i elle silmeyin.
- Rejected restore kendi staging DB/WAL/SHM’ini temizler ve hedef DB/upload’ı korur.
- Başarılı restore epoch değiştirir, aktif device family’leri revoke eder ve replay ciphertext’ini siler; owner/instance ve upload byte’ları korunur.

Ledger kontrolü tam schema diff değildir; ledger doğruyken yapılmış bütün manuel DDL değişikliklerini tespit etmez. Health tam integrity/FK taraması yapmaz; restore staging’inde bu taramalar uygulanır. Backup manifest’i imzalı değildir; checksum güvenilir kaynak/erişim kontrolünün yerine geçmez.

## Otomatik senaryolar

| Senaryo | Kanıt |
|---|---|
| Empty DB / tekrar startup | Migration tamamlanır; ledger/probe korunur, ready 200 |
| 0016 → 0017 | Önce 503, sonra 200; owner/fixture instance/aktif cihaz/upload korunur; locator’sız challenge revoke edilir |
| Bozuk ledger | Missing/hash/duplicate/future: ready 503, migrate exit 1, ledger/owner değişmez |
| Marker / satır sonu | Tek tablo hazır sayılmaz; LF/CRLF eşdeğer hash kabul edilir |
| Current restore | Upload/fixture instance korunur; epoch değişir, cihaz revoke edilir, replay silinir |
| Previous restore | Ayrı target restore + forward migration başarılıdır |
| Bozuk backup / sidecar | Tampered/untracked byte, future schema, FK bozukluğu, empty DB ve target WAL reddedilir; eski target korunur |
| Bozuk journal / eksik SQL | Kontrol fail closed olur |
| Production HTTP | Paketlenmiş SQL ile plain/v1 health 200; bozuk hash/eksik SQL 503; tamir sonrası 200; internal path/hash public response’a çıkmaz |

Instance satırı sentetiktir; gerçek discovery/restore/token HTTP kabulü [security acceptance](mobile-security-acceptance.md) içindedir.

## Açık production kabulü

Release kaydının migration-restore gate’i pending kalır. Reviewer ayrı production-like target’ta gerçek pre-upgrade DB/upload kopyasını matching secret ile doğrulamalıdır. Owner/client/project/file/branding scope, gerçek instanceId, native eski-token reddi/yeniden pairing, persistent volume, disk izinleri, upgrade süresi ve image + pre-upgrade backup rollback provası kaydedilir. Docker image/build, host filesystem, signed iOS/Android ve iki canlı HTTPS bu loopback testiyle kabul edilmiş sayılmaz.

DB’yi downgrade etmeyin; eski image + pre-upgrade backup çiftiyle maintenance sırasında restore edin. [Release acceptance](mobile-release-acceptance.md) ve [phase 8](../self-hosted-redesign/phase-8-import-release.md) kanıt/operasyon düzenini açıklar.

## 2026-09-17 yerel doğrulama

On SQLite/CLI testi, phase8 import/rollback regression, hedef ESLint ve production build/TypeScript geçti. Son production standalone/HTTP turu 200→503→200, eksik SQL reddi, public response gizliliği ve paketlenmiş local data/env yokluğunu doğruladı. Windows managed agent sandbox’ındaki native alt süreç dosya erişim sınırı nedeniyle production fixture otomatik onaylı sandbox dışı aynı sentetik kapsamda çalıştırıldı. Normal host CLI/CI komutları yukarıdadır; remote CI, Docker image, gerçek host/veri ve signed cihaz kabulü bu sonuçtan çıkarılmaz.
