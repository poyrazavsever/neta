---
title: Mobil native form odak ve klavye kabulü
status: android-development-verified-live-backend-open
last_updated: 2026-09-18
---

# Mobil native form odak ve klavye kabulü

## Bulgu ve düzeltme

React Native 0.86 Fabric `measureLayout` hedefi gerçek native component ref'i
ister. `findNodeHandle(scrollRef.current)` sayısal handle'ı bu sözleşmeyi
karşılamıyor; alan odaklandığında `ref.measureLayout must be called with a ref
to a native component` uyarısı veriyordu.

`FormSheet` artık `collapsable={false}` native içerik View'ını zorunlu
`contentRef` üzerinden açar. `useKeyboardForm`, alanı bu View'a göre ölçer;
böylece kaydırılmış viewport yerine sabit içerik koordinatını kullanır.
Generation ve ref kimliği kontrolü, yeni odak veya unmount sonrasında eski
ölçüm callback'inin formu kaydırmasını engeller. İlk hatalı alan hem odaklanır
hem görünür konuma kaydırılır. Hook kullanan 17 owner/portal formu ve ayrı
project-risk formu aynı primitive sözleşmesine bağlandı.

Gerçek ekran klavyesi testi ayrıca Android uzun form alt alanlarının klavyenin
arkasında kaldığını gösterdi. Android `KeyboardAvoidingView` davranışı `height`
olarak ayarlandı; iOS `padding` ve otomatik keyboard inset davranışı korundu.
Bu değişiklik yeni native modül veya backend değişikliği gerektirmez.
Klavye ilk açıldığında eski viewport boyutuyla yapılan scroll clamp'ini
düzeltmek için `keyboardDidShow` sonrası bir animation frame'de halen odaklı
alan yeniden ölçülür. Arkada kalan ekranın alanı yeniden kaydırılmaz;
listener ve bekleyen frame unmount'ta temizlenir.
ScrollView viewport'unun `onLayout` olayı da halen odaklı alanı yeniden ölçer;
normal/secure/numeric klavye arasında hızlı geçişte değişen klavye yüksekliği
sonrasında alanın küçülmüş viewport içinde kalması böylece doğrulanır.

## Otomatik kabul

- Altı yeni regresyon testi: native ref kimliği, tekrarlı odakta sabit offset,
  negatif offset clamp, geç kalan callback, eksik ref ve başarısız/non-finite ölçüm.
- 150 mobil unit testi, TypeScript ve sıfır uyarı toleranslı ESLint.
- `pnpm mobile:release:check`: i18n/a11y, redesign/source/config/autolinking,
  production guard ve beş release evidence testi dahil kalite kapıları.
- `pnpm --filter @neta/app mobile:ai:check`: dört backend unit testi ve izole
  SQLite/loopback provider ile gerçek HTTP catchall/settings/stream kabulü.
  Bu yerel kabul, canlı demo deployment'ının sağlıklı olduğunu kanıtlamaz.

## Android development kabulü

Ortam: Android 16 / API 36 emülatör, Expo SDK 57, React Native 0.86.2,
mevcut development client, demo instance'a yetkili owner oturumu.

14 owner formundaki 34 native TextInput için toplam 82 focus denemesi:
task, client, project, calendar-event, finance-record, journal-entry,
owner-profile, owner-security, owner-preferences, workspace-settings,
appearance-settings, ai-settings, invitation ve client-activity.
34 alanın 33'ü düzenlenebilirdir; owner-profile e-posta alanı salt okunurdur.
Salt okunur e-posta için görünürlük kontrol edildi, klavye açılması beklenmedi.

Her alanın native `measureInWindow` sınırları ScrollView viewport'u ve
`Keyboard.metrics().screenY` ile karşılaştırıldı. Tekrarlı son alan odağı,
`scrollToEnd` sonrası odağa dönüş ve hızlı ardışık odak da sınandı.
Task/client/project boş zorunlu alan gönderiminde ilk hata odağı kontrol edildi;
veri oluşturulmadı, kaydedilmedi veya parola değiştirilmedi.

Donanım klavyesi/toolbar koşulunda ve tam ekran Gboard açıkken ayrı test yapıldı.
Android 16 Gboard'un fiziksel klavye ve stylus tercihleri test sırasında UI'dan
geçici değiştirildi ve sonra önceki değerlere döndürüldü. Tam ekran klavyesinin
yüksekliği native Keyboard metriklerinde pozitif olarak doğrulandı; yalnız
`mInputShown=true` veya toolbar görünmesi tam klavye kabulü sayılmadı.

Son ekran klavyesi koşusunda bütün alanlar görünür; tekrarlı/hızlı odak ve
üç ilk hata odağı başarılıdır. Yakalanan `measureLayout`, diğer console error
ve console warning sayıları sıfırdır. Logger uyarıları bastırmadı; sayaçla
birlikte orijinal logger çağrıldı ve test sonrası geri yüklendi.
Client-activity ilk odak denemesinde otomasyonun blur/focus sırası klavyeyi
kapatmıştı; bu alan ayrıca gerçek native dokunuşla tekrar sınandı ve pozitif
klavye yüksekliğiyle görünürlük doğrulandı. Ek dört focus denemesinde de
konsol sayaçları sıfırdır. Salt okunur e-posta kontrolü bu ek denemelere dahildir.

Yerel ayrıntılı rapor/loglar ignored `.artifacts/keyboard-form/` altında tutulur;
credential, alan değeri ve müşteri içeriği raporlanmaz.

## Açık hata ve kabul sınırı

2026-09-18 canlı demo kontrolünde beş form veri yükleme hatası gösterdi:
journal-entry, owner-security, workspace-settings, appearance-settings ve
ai-settings. Aşağıdaki altı GET, giriş bilgisi gönderilmeden de 500/text/plain
döndü; `/api/v1/clients` aynı koşulda beklenen 401/JSON verdi:

- `/api/v1/settings/general`
- `/api/v1/settings/appearance`
- `/api/v1/settings/ai`
- `/api/v1/journal/entries?from=2026-09-18&to=2026-09-18`
- `/api/v1/me/sessions`
- `/api/v1/device-sessions`

Bu, mobil odak uyarısından bağımsız canlı backend sorunudur. Yerel canonical
catchall HTTP kabulü geçer; remote runtime logu/deployment bilgisi olmadan
500'ün nedeni veya düzeldiği iddia edilmez. Demo erişimi/DB değiştirilmedi.

Portal'ın üç formu aynı ref sözleşmesini ve otomatik kontrolleri geçer;
bu koşuda client oturumuyla native portal testi yapılmadı. iOS, farklı
ekran/font/rotation, gerçek cihaz ve signed store kabulü bu emülatör koşusunun
kapsamı dışındadır. Tüm uygulamada hiç hata kalmadığı iddiası yoktur.

## Kaynaklar

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [React Native 0.86 ScrollView](https://reactnative.dev/docs/0.86/scrollview)
- [React Native 0.86 KeyboardAvoidingView](https://reactnative.dev/docs/0.86/keyboardavoidingview)
- `apps/neta-mobile/src/components/forms/use-keyboard-form.ts`
- `apps/neta-mobile/src/components/forms/keyboard-form-scroll.ts`
- `apps/neta-mobile/src/components/forms/form-sheet.tsx`
