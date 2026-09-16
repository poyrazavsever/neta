---
title: MOB-2–5 eksik tamamlama denetimi
status: implementation-verified-native-release-open
last_updated: 2026-09-16
---

# MOB-2–5 eksik tamamlama denetimi

Önceki faz başlıklarının tamamlanmış görünmesi bütün istemci davranışlarının doğru olduğu anlamına gelmiyordu. 2026-09-16 denetiminde aşağıdaki runtime eksikleri giderildi.

| Faz | Bulunan sorun | Sonuç ve kanıt |
|---|---|---|
| MOB-2 | Aynı ID yeni origin'e taşınırsa veya eski hedef registry kaydı farklı ID dönerse credential/cache kalabiliyordu | Aktif ve kayıtlı hedef kimliği birlikte kontrol edilir; ilgili native generation, session ve cache temizlenir. Identity unit testleri |
| MOB-2 | Auth HTTP redirect farklı origin'e credential/body taşıyabiliyordu | JSON/binary client her redirect'in origin'ini doğrular; seçilmiş instance origin'i authoritative |
| MOB-3 | Clients/projects/tasks yalnız ilk sayfayı gösteriyordu | Cursor ve append/dedup ile “Daha fazla yükle”; pagination unit testi |
| MOB-3/5 | Owner project detail asset capability fallback'i vardı; indirilen URL cookie-only idi | Gerçek asset listesi; `/api/v1/files/:id` owner Bearer/cookie ve scoped portal cookie read |
| MOB-4 | POST yanıtı list-cache'e yazılıyor, mutation read-cache'den dönebiliyordu | Yalnız GET cache'den okunur/yazılır; mutation yalnız hedef cache'i invalidate eder |
| MOB-4 | Başarısız transport sonrası yeni key duplicate kayıt oluşturabiliyordu | Instance/actor/role/method/route/payload kapsamlı transient coordinator: in-flight coalescing, başarısız retry'da aynı key, başarı/logout temizliği. Unit testleri |
| MOB-4/5 | Resource istekleri reaktif 401 refresh yolunu kullanmıyordu | JSON ve binary aynı authenticated request + generation + single-flight refresh wrapper'ından geçer |
| MOB-5 | Native UI PDF/10 MiB seçebiliyor, backend yalnız image/5 MiB kabul ediyordu | Project asset 10 MiB ve PDF; diğer türler 5 MiB; PNG-only icon. PDF header/EOF doğrulaması, attachment response, metadataSanitized=false |
| MOB-5 | File ve appearance retry duplicate upload yapabiliyordu | Raw byte SHA-256 dahil persistent idempotency; aynı key/payload aynı file ID, farklı payload 409; native upload busy/cancel/key handling |
| MOB-5 | Portal dosya butonu cookie URL'yi dış tarayıcıda açıyordu; owner indirme aksiyonu yoktu | Yetkili binary fetch, origin/id/MIME/size kontrolü, cache'e yazma, native sharing ve finally temizliği |
| MOB-5 | Owner ayarlarda logout aksiyonu yoktu | Busy/error handling ile normal session.logout düğmesi |
| MOB-2/5/7 | Auth guard'ları belirsiz `/` hedefine döngü yapıyordu; rol dışı portal formu bu hedefe geri dönüyordu | Login ve rol-grubu hedefleri açık; portal ve owner form gruplarının mevcut client/freelancer ayrımı korunur |
| MOB-2/5 | Production auth native sign-in/sign-out isteğinde Origin yoktu; “Missing or null Origin” ile reddediliyordu | Doğrulanmış selected instance origin'i native auth header'ına eklenir; backend CSRF kontrolü korunur |
| MOB-3/5 | Relation picker, proje plan/revizyon/görev/dosya ve aylık finance alt listeleri ilk sayfada kalıyordu | Cursor takip eden collector; overlap dedup, stale kanıtı ve ilerlemeyen cursor reddi. Relation seçenekleri bütün sayfalardan gelir |
| MOB-2/4 | Async cache yazısı logout/account switch temizliğiyle yarışabiliyordu | Flat SecureStore actor ID/role binding + bütün operasyon için generation; cache yazısı auth write queue içinde, logout clear ile sıralı. Actor ve coordinator unit testleri |
| MOB-2 | Implicit native cookie jar saklanan instance cookie'sine karışabiliyor; geç kalan bootstrap/foreground sonucu logout sonrası session'ı geri açabiliyordu | Auth taşıması Expo fetch ve credentials=omit kullanır; yalnız scoped SecureStore Cookie/Bearer gönderilir. Sign-in user ID ile /me ID eşleşir; provider operasyon epoch'u geç kalan sonuçları reddeder. Android owner→logout→client geçişi ayrıca kontrol edilir |
| MOB-2/5 | Native cookie sign-out JSON başlığıyla boş body gönderiyor; Better Auth Invalid JSON ile reddediyor ve portal callback'i unhandled promise oluşturuyordu | Sign-out POST boş JSON nesnesi gönderir; portal logout hatası yakalanır ve düğme profile yükleme şartından bağımsızdır. Lokal credential/cache temizliği finally içinde sürer |
| MOB-5 | Portal ayar/parola ekranları owner-only me/sessions ve me/password uçlarına gidiyordu; ayar yüklenmezse çıkış düğmesi yoktu | Sadece bilinen hesap self-service route'ları freelancer/client için context.user.id kapsamında ortak; workspace uçları owner-only. İki gerçek client için own-only session listesi, yabancı revoke 404/no side effect, current revoke 409 ve parola değişimi izolasyonu HTTP kabulünde. Portal logout veri yüklemesinden bağımsız |
| MOB-5 | Legacy native file upload iOS cookie deposunu ve otomatik redirect'i kullanabiliyordu | File + FormData + Expo fetch, credentials=omit, redirect reddi, gerçek dosya boyutu, actor/generation binding, AbortController iptali ve aynı retry key. Byte acknowledgement sunulmadığı için sahte yüzde yerine belirsiz yükleme göstergesi; redirect/cancel unit testleri |
| MOB-5 | Eski web image upload metadataSanitized=false olduğu için owner asset listesi tümden reddediliyordu | Eski dosyanın gerçek metadata durumu korunarak okuma kabul edilir; yeni native image upload yanıtında sanitation zorunluluğu sürer |
| MOB-4/5 | Next standalone iç request URL'si localhost olduğunda file/appearance/portal asset ve davet URL'leri yanlış origin üretiyordu | Dış URL'ler discovery/me ile aynı canonical APP_URL'den üretilir; request/proxy header'ı authority değildir. File/portal/invitation HTTP origin assertion'ları ve standalone Android dosya turu |

Gerçek backend HTTP kabulü owner Bearer ile image/PDF upload/download, idempotency replay/conflict, forged PDF reddi, unauthenticated/invalid Bearer ve missing scope; iki portal client için eski/versioned file route ve hesap self-service izolasyonunu kapsar. `pnpm mobile:security:check`, app build, mobile unit/type/lint ve API boundary bu değişikliklerin otomatik kapılarıdır. Mobil unit suite 129 testtir.

`mobile:check` lint/type/unit/i18n/a11y ve source boundary kapılarını geçti; bu Windows checkout'unda `ios/Podfile.lock` bulunmadığı için native release gate `ENOENT` ile durdu. Son Android production JavaScript export'u geçti. Bu sonuç signed native build kabulü değildir; eksik lock dosyası yapay olarak üretilmedi.

## Açık kapsam ve çıkış sınırı

Android debug development client'ta sentetik fixture üzerinde gerçek owner login, proje plan/görev/revizyon/dosya sekmeleri, yetkili indirme, Android paylaşım chooser'ını iptal ve geçici download temizliği, document picker ile private/sanitized avatar upload ve backend session'ı sonlandıran logout geçti. Kanıt: `bilgi/assets-pipeline/reports/native-file-smoke.json` ve ilgili sayfa screenshot manifest'leri. Chooser'dan başka bir uygulamaya dosya gönderilmedi. Bu tur signed/iOS veya bütün cancel/timeout durumlarının kabulü değildir.

Signed iOS/Android, iki canlı HTTPS instance, native background/foreground/abort/timeout, picker/share sistem davranışı, bütün form/conflict/offline durumları ve restore runtime kabulü ayrı release işleridir. Android debug screenshot arşivi signed kabul değildir.

Core list pagination ve relation/project/finance alt-list cursor takibi açıldı. Collector döngü veya 1000 sayfa sınırında sessiz eksiltme yerine hata verir. Yüksek hacimli performans ve bütün UX durumları ayrıca günlük kullanım turunda incelenir. File ve appearance upload aynı generation-aware authenticated wrapper'ı kullanır; yönlendirme takip edilmez. iOS ve signed/native picker/share/cancel kabulü açık kalır.

UI/UX güncelleme hattı [assets pipeline](../ui-assets-pipeline.md) altında hazırlanır; görsel yeniden tasarım en son yapılır.
