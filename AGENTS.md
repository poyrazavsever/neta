# Neta repository agent sözleşmesi

## Zorunlu bilgi rotası

- Repository üzerinde analiz, planlama veya değişiklik yapmadan önce `bilgi/harita.md` dosyasını oku.
- Ardından `bilgi/00-sistem/mevcut-durum.md`, `bilgi/00-sistem/degismez-kurallar.md` ve görevle ilgili sayfaları haritadan seç.
- Mimari veya ürün kararında `bilgi/06-kararlar/karar-kaydi.md` üzerinden ilgili bağımsız ADR'ye git.
- Kritik, güvenlik etkili veya değişmiş olabilecek iddiaları ADR'nin gösterdiği güncel kod ve canonical `docs/` kaynaklarıyla yeniden doğrula.

## Gerçeklik ve karar disiplini

- Çalışan kod mevcut davranışın; aktif ADR ve roadmap hedef davranışın kanıtıdır. İkisini açıkça ayır.
- Planlanan capability'yi mevcut gibi anlatma. Evrensel mobil bağlantı ve device pairing kodu ile signed cihaz/iki canlı instance güvenlik kabulünü ayrı anlat.
- Supabase aktif self-hosted runtime bağımlılığı değildir; yalnız legacy import kaynağı olabilir.
- Aynı SQLite dosyasına yazan birden fazla production replica desteklenmez.
- Yeni kalıcı karar için sıradaki numarayla ayrı `bilgi/06-kararlar/adr-NNN-*.md` oluştur; mevcut kararı değiştirmek için yeni ADR açma.

## Bilgi kasası bakımı

- Anlamlı implementation veya mimari değişiklikten sonra etkilenen bilgi sayfalarını güncelle; yalnız biçim değişikliği için gürültü üretme.
- Yeni, taşınan veya anlamlı biçimde değişen notlardan sonra `pnpm vault:map` çalıştır.
- Bitirmeden önce `pnpm vault:check` çalıştır ve anlamlı kasa değişikliğini `bilgi/00-sistem/gunluk.md` dosyasına ekle.
- `bilgi/harita.md` üretilmiş dosyadır; elle düzenleme.

## Mobil çalışma

- Mobil görevlerde önce `bilgi/09-yol-haritasi/mobil-uygulama-plani.md`, `bilgi/03-mimari/mobil-mimari.md` ve ADR-006/007/008'i oku.
- `apps/neta-mobile` ayrı backend değildir; canonical backend `apps/neta-app` ve versioned `/api/v1` yüzeyidir.
