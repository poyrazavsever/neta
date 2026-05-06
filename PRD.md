# MindSpace — AI Destekli Kişisel Yaşam ve Planlama Dashboard’u

## Product Requirements Document / PRD

---

## 1. Doküman Bilgileri

**Proje Adı:** MindSpace  
**Önceki Proje Adı:** Mood Tracker  
**Doküman Türü:** Product Requirements Document  
**Versiyon:** v1.0  
**Ürün Tipi:** Open-source, local-first, AI destekli kişisel yaşam ve planlama dashboard’u  
**Hedef Platform:** Web uygulaması  
**Ana Teknoloji Yaklaşımı:** Client-side ağırlıklı, gizlilik odaklı, yerel veri saklama  
**Ana Kullanıcı Değeri:** Kullanıcının günlüklerini, ruh halini, enerji seviyesini, görevlerini, aktivitelerini ve AI destekli kişisel içgörülerini tek bir güvenli alanda toplamak.

---

## 2. Ürün Özeti

MindSpace, kullanıcıların günlük düşüncelerini, ruh hallerini, enerji seviyelerini, görevlerini ve kişisel planlarını tek bir dashboard üzerinden yönetmesini sağlayan AI destekli bir kişisel yaşam alanıdır.

Uygulama yalnızca bir mood tracker değildir. MindSpace; kullanıcının yazdığı günlükleri analiz eden, bu yazılardan anlamlı etiketler çıkaran, duygu durumu skorları oluşturan, ruh hali ve enerji trendlerini görselleştiren, gerektiğinde kullanıcıya görev öneren ve geçmiş günlükler üzerinden AI ile sohbet etmeyi mümkün kılan kapsamlı bir kişisel farkındalık aracıdır.

MindSpace’in temel yaklaşımı privacy-first ve local-first mimaridir. Kullanıcının yazdığı günlükler, ruh hali verileri, görevleri ve sohbet geçmişi mümkün olduğunca kullanıcının cihazında tutulmalıdır. Bu nedenle ilk aşamada veri saklama için IndexedDB, IndexedDB yönetimi için Dexie.js, AI entegrasyonu için ise öncelikli olarak Ollama gibi yerel LLM çözümleri hedeflenir.

İsteğe bağlı olarak kullanıcı, OpenAI API anahtarı girerek harici AI sağlayıcılarını da kullanabilir. Ancak bu seçenek varsayılan değil, kullanıcı tarafından bilinçli şekilde etkinleştirilen opsiyonel bir yapı olarak sunulmalıdır.

---

## 3. Problem Tanımı

Günlük tutmak, ruh hali takibi yapmak, görev planlamak ve kişisel farkındalık kazanmak isteyen kullanıcılar genellikle farklı araçlar arasında bölünmek zorunda kalır.

Kullanıcı günlük için ayrı bir not uygulaması, görevler için ayrı bir to-do uygulaması, ruh hali takibi için ayrı bir mood tracker, AI ile konuşmak için ayrı bir chatbot, grafiksel analizler için ise farklı bir dashboard kullanabilir.

Bu da şu problemlere yol açar:

- Kişisel veriler dağılır.
- Kullanıcı davranış kalıplarını bütünsel olarak göremez.
- Günlükler, görevler ve ruh hali verileri birbiriyle ilişkilendirilemez.
- AI analizleri geçmiş verilerden kopuk kalır.
- Kullanıcı alışkanlığı sürdürülebilir olmaz.
- Hassas kişisel veriler farklı platformlarda saklanır.
- Mahremiyet konusunda güven problemi oluşur.

MindSpace bu problemi, kullanıcının kişisel yaşam verilerini tek bir güvenli ve sade dashboard altında toplayarak çözmeyi hedefler.

---

## 4. Ürün Vizyonu

MindSpace’in vizyonu, kullanıcının kendi zihinsel, duygusal ve günlük yaşam verilerini güvenli bir şekilde takip edebileceği, anlayabileceği ve AI desteğiyle üzerine düşünebileceği açık kaynaklı bir kişisel alan oluşturmaktır.

Bu ürün, kullanıcının yalnızca “Bugün nasıl hissediyorum?” sorusuna cevap vermesini değil, zaman içinde daha derin sorulara yanıt bulmasını da sağlamalıdır.

Örnek sorular:

- Hangi konular ruh halimi olumsuz etkiliyor?
- Enerjim hangi günlerde düşüyor?
- Hangi aktivitelerden sonra daha iyi hissediyorum?
- Günlüklerimde tekrar eden stres kaynakları neler?
- Hangi insan ilişkileri beni yoruyor veya güçlendiriyor?
- Hangi alışkanlıklar ruh halimi olumlu etkiliyor?
- AI, yazdığım düşüncelerden bana faydalı görevler çıkarabilir mi?
- Geçmiş günlüklerim üzerinden kendimi daha iyi anlayabilir miyim?
- Kendimle daha şefkatli ve düzenli bir şekilde konuşabilir miyim?

MindSpace, kullanıcının dijital psikoloğu gibi konumlanabilir; ancak gerçek bir klinik uzman, terapist veya tıbbi danışman olarak davranmamalıdır.

---

## 5. Ürün Amaçları

### 5.1 Ana Amaçlar

MindSpace’in ana ürün amaçları şunlardır:

1. Kullanıcının günlük yazabileceği sade, güvenli ve odaklı bir alan sunmak.
2. Günlük kayıtlarına ruh hali ve enerji seviyesi eklenmesini sağlamak.
3. Günlük metinlerinden AI yardımıyla otomatik etiketler üretmek.
4. AI ile duygu skoru, özet ve kişisel içgörü oluşturmak.
5. Mood ve enerji gelişimini grafiklerle görselleştirmek.
6. Günlüklerden görev ve plan önerileri çıkarmak.
7. Kullanıcının geçmiş günlükleriyle bağlamlı şekilde AI sohbeti yapmasını sağlamak.
8. Tüm verileri varsayılan olarak kullanıcının cihazında tutmak.
9. Open-source geliştiriciler için kurulabilir ve özelleştirilebilir bir yapı sunmak.
10. Minimal, modern, karanlık mod ağırlıklı ve dikkat dağıtmayan bir kullanıcı deneyimi oluşturmak.

### 5.2 İkincil Amaçlar

- AI sağlayıcısını değiştirilebilir yapmak.
- Kullanıcıya AI kullanımını açma / kapama kontrolü vermek.
- AI analizleri başarısız olsa bile temel uygulama işlevlerinin çalışmasını sağlamak.
- Kullanıcının verilerini export edebilmesini mümkün kılmak.
- İleride gelişmiş RAG, takvim, alışkanlık takibi ve bulut yedekleme gibi özelliklere uygun bir altyapı hazırlamak.

---

## 6. Başarı Kriterleri

### 6.1 Ürün Başarı Kriterleri

MindSpace’in başarılı sayılabilmesi için ilk aşamada şu kriterleri karşılaması gerekir:

- Kullanıcı ilk günlük kaydını kolayca oluşturabilmelidir.
- Kullanıcı ruh hali ve enerji seviyesini kayda ekleyebilmelidir.
- Dashboard, kullanıcının genel durumunu anlaşılır şekilde sunmalıdır.
- AI, günlüklerden anlamlı etiketler çıkarabilmelidir.
- AI, duygu skoru ve kısa özet oluşturabilmelidir.
- Kullanıcı, AI tarafından önerilen görevleri kabul veya reddedebilmelidir.
- Chat arayüzü, kullanıcının geçmiş günlüklerini bağlam olarak kullanabilmelidir.
- Kullanıcı verileri varsayılan olarak cihazda saklanmalıdır.
- Harici AI kullanımı kullanıcı kontrolünde olmalıdır.
- Proje açık kaynak geliştiriciler tarafından kurulabilir olmalıdır.

### 6.2 Teknik Başarı Kriterleri

- IndexedDB kayıtları stabil çalışmalıdır.
- Dexie.js ile veri yönetimi sürdürülebilir olmalıdır.
- TypeScript veri tipleri açık şekilde tanımlanmalıdır.
- AI provider sistemi adapter mantığıyla kurulmalıdır.
- Ollama entegrasyonu çalışabilir ve dokümante edilebilir olmalıdır.
- OpenAI entegrasyonu opsiyonel kalmalıdır.
- AI servisleri başarısız olduğunda uygulama çökmemelidir.
- Kullanıcı günlükleri ve görevleri AI’dan bağımsız şekilde çalışmaya devam etmelidir.
- Grafikler doğru ve güncel veriden beslenmelidir.
- Proje component bazlı geliştirilebilir olmalıdır.

---

## 7. Kapsam

### 7.1 İlk Aşamada Kapsama Dahil Olanlar

İlk aşamada geliştirilecek ana kapsam şunlardır:

- Dashboard ekranı
- Günlük yazma modülü
- Mood seçimi
- Enerji seviyesi seçimi
- Günlük kayıtlarını listeleme
- Günlük kayıtlarını detaylı görüntüleme
- Günlük kayıtlarını düzenleme
- Günlük kayıtlarını silme
- Basit görev yönetimi
- AI destekli otomatik etiketleme
- AI destekli sentiment analizi
- AI destekli günlük özeti
- AI destekli görev önerisi
- AI sohbet ekranı
- IndexedDB tabanlı veri saklama
- Dexie.js veritabanı katmanı
- Ollama entegrasyon ayarı
- Opsiyonel OpenAI API ayarı
- Ayarlar ekranı
- Dark mode odaklı UI
- Open-source kurulum dokümantasyonu

### 7.2 İlk Aşamada Kapsam Dışında Olanlar

İlk aşamada aşağıdaki özellikler kapsam dışında tutulabilir:

- Mobil uygulama
- Kullanıcı hesabı sistemi
- Login / register
- Bulut senkronizasyonu
- Çok kullanıcılı yapı
- Sosyal paylaşım
- Profesyonel terapi hizmeti
- Klinik teşhis
- Medikal değerlendirme
- Takvim entegrasyonu
- Push notification
- E-posta bildirimleri
- Wearable cihaz entegrasyonu
- Gelişmiş alışkanlık takibi
- Ekip / aile paylaşımı
- Uçtan uca şifreli cloud backup
- Plugin marketplace
- Çoklu dil desteği
- Gelişmiş mobil responsive deneyim

Bu özellikler sonraki fazlarda değerlendirilebilir.

---

## 8. Hedef Kullanıcılar

### 8.1 Birincil Kullanıcı Kitlesi

MindSpace’in hedef kullanıcıları şunlardır:

- Günlük tutmayı seven kişiler
- Mood ve enerji takibi yapmak isteyen kullanıcılar
- Kendi davranış kalıplarını anlamak isteyen kişiler
- Kişisel gelişim ve farkındalıkla ilgilenen kullanıcılar
- AI destekli analizlerden faydalanmak isteyen kullanıcılar
- Kişisel verilerinin mahremiyetine önem veren kullanıcılar
- Open-source araçları tercih eden teknik kullanıcılar
- Kendi local AI asistanını kurmak isteyen geliştiriciler
- Minimal ve modern arayüzleri seven kullanıcılar

---

## 9. Kullanıcı Personaları

### 9.1 Persona 1 — Gizlilik Odaklı Kullanıcı

**Profil:**  
Kişisel günlüklerinin, ruh hali verilerinin ve düşüncelerinin üçüncü taraf servislerde saklanmasını istemeyen kullanıcıdır.

**Motivasyonları:**

- Verilerinin kendi cihazında kalması
- Harici AI servislerini kullanmadan analiz alabilmek
- Açık kaynak kodu inceleyebilmek
- Mahremiyetinden ödün vermeden AI desteği almak

**Problemleri:**

- Mevcut AI uygulamalarının çoğu verileri buluta gönderir.
- Kişisel günlükler hassas veri içerir.
- Kapalı kaynak uygulamalara güvenmek zordur.

**MindSpace’in Çözümü:**

- Local-first veri saklama
- IndexedDB kullanımı
- Ollama ile yerel AI desteği
- Open-source proje yapısı
- Harici API kullanımını opsiyonel hale getirme

---

### 9.2 Persona 2 — Günlük ve Farkındalık Kullanıcısı

**Profil:**  
Düzenli günlük tutan, duygularını anlamaya çalışan ve kendisiyle ilgili farkındalık kazanmak isteyen kullanıcıdır.

**Motivasyonları:**

- Günlük yazma alışkanlığı kazanmak
- Ruh hali değişimlerini takip etmek
- Stres kaynaklarını anlamak
- Yazılarından anlamlı içgörüler almak

**Problemleri:**

- Günlükler zamanla çok birikir ve analiz etmek zorlaşır.
- Kullanıcı kendi tekrar eden duygu kalıplarını fark edemeyebilir.
- Mood tracker uygulamaları genellikle yüzeysel kalır.

**MindSpace’in Çözümü:**

- Günlük modülü
- AI destekli etiketleme
- Sentiment analizi
- Haftalık içgörü kartları
- Mood ve enerji grafikleri

---

### 9.3 Persona 3 — Planlama ve Üretkenlik Kullanıcısı

**Profil:**  
Günlük yazarken yapılacak işleri, hedefleri ve rutinlerini de yönetmek isteyen kullanıcıdır.

**Motivasyonları:**

- Düşüncelerini aksiyona dönüştürmek
- Günlüklerden görev çıkarabilmek
- Ruh haliyle görev yönetimi arasında ilişki kurmak
- Üretkenliğini daha sürdürülebilir hale getirmek

**Problemleri:**

- Günlükte yazılan önemli aksiyonlar unutulabilir.
- To-do uygulamaları kullanıcının duygusal bağlamını bilmez.
- Kullanıcı motivasyonu düşükken doğru görevleri seçmek zorlaşabilir.

**MindSpace’in Çözümü:**

- AI görev önerileri
- Manuel görev yönetimi
- Görevlerin kaynak günlüklerle ilişkilendirilmesi
- Dashboard’da aktif görevlerin gösterilmesi

---

### 9.4 Persona 4 — Geliştirici / Open-source Kullanıcısı

**Profil:**  
Projeyi kendi cihazında çalıştırmak, özelleştirmek veya katkı sağlamak isteyen teknik kullanıcıdır.

**Motivasyonları:**

- Kendi local AI yaşam asistanını kurmak
- Kod yapısını incelemek
- AI promptlarını özelleştirmek
- Yeni providerlar eklemek
- Açık kaynak katkısı yapmak

**Problemleri:**

- Mevcut kişisel asistan uygulamaları kapalı kaynak olabilir.
- Local AI entegrasyonu çoğu üründe desteklenmez.
- Kendi verisiyle çalışan basit bir AI dashboard kurmak zor olabilir.

**MindSpace’in Çözümü:**

- Açık kaynak mimari
- README ve kurulum rehberi
- Ollama entegrasyonu
- AI provider adapter yapısı
- Modüler component yapısı

---

## 10. Kullanıcı İhtiyaçları

| Kullanıcı İhtiyacı | Ürün Karşılığı |
|---|---|
| Günlük yazmak istiyorum | Journaling modülü |
| Günlüklerime ruh hali eklemek istiyorum | Mood seçimi |
| Enerji seviyemi takip etmek istiyorum | Energy score |
| Zaman içindeki değişimimi görmek istiyorum | Dashboard grafikleri |
| Yazdıklarımdan etiketler oluşsun istiyorum | AI tagging |
| Yazılarımın duygu yoğunluğu analiz edilsin istiyorum | Sentiment analysis |
| Günlüklerimden görev önerilsin istiyorum | AI task extraction |
| Geçmiş günlüklerimle konuşmak istiyorum | AI chat |
| Verilerim cihazımda kalsın istiyorum | IndexedDB |
| AI’ı lokal çalıştırmak istiyorum | Ollama entegrasyonu |
| İstersem harici AI kullanmak istiyorum | OpenAI API ayarı |
| Projeyi kendim kurmak istiyorum | Open-source dokümantasyon |

---

## 11. Ürün Modülleri

---

# 11.1 Dashboard Modülü

## Amaç

Dashboard, kullanıcının uygulamaya girdiğinde kendi genel durumunu hızlıca anlayabileceği ana ekrandır. Bu ekran, güncel ruh hali, enerji seviyesi, son günlükler, aktif görevler, haftalık trendler ve AI içgörüleri gibi verileri tek bir yerde sunmalıdır.

## Kullanıcı Hikayeleri

- Kullanıcı olarak uygulamayı açtığımda bugünkü genel durumumu görmek istiyorum.
- Kullanıcı olarak son ruh halimi ve enerji seviyemi hızlıca görmek istiyorum.
- Kullanıcı olarak son 7 gündeki mood değişimimi görmek istiyorum.
- Kullanıcı olarak son 7 gündeki enerji değişimimi görmek istiyorum.
- Kullanıcı olarak AI’ın benimle ilgili çıkardığı içgörüleri görmek istiyorum.
- Kullanıcı olarak aktif görevlerimi dashboard üzerinde görmek istiyorum.
- Kullanıcı olarak son günlük kayıtlarıma hızlıca erişmek istiyorum.

## Fonksiyonel Gereksinimler

Dashboard aşağıdaki alanları içermelidir:

- Günlük özet kartı
- Bugünkü mood kartı
- Bugünkü enerji kartı
- Son 7 gün mood grafiği
- Son 7 gün enerji grafiği
- AI etiket dağılımı
- AI insight kartı
- Aktif görevler listesi
- Son günlükler listesi
- Boş durum ekranı

## Dashboard Kartları

### Bugünkü Durum Kartı

Bu kartta kullanıcının bugünkü son mood ve enerji değeri gösterilir.

Eğer kullanıcı bugün hiç kayıt girmediyse şu tarz bir boş mesaj gösterilebilir:

“Bugün henüz bir kayıt oluşturmadın. Nasıl hissettiğini yazarak başlayabilirsin.”

### Mood Trend Grafiği

Son 7 veya 30 güne ait mood değişimini gösterir.

Mood değerleri sayısal temsile dönüştürülebilir:

- very_happy: 5
- happy: 4
- neutral: 3
- sad: 2
- angry: 2
- anxious: 2
- tired: 2
- stressed: 1
- calm: 4
- excited: 5

### Energy Trend Grafiği

Enerji seviyesi 1-5 arasında gösterilir.

### Etiket Dağılımı

AI tarafından çıkarılan etiketlerin dağılımı pasta grafik veya bar chart olarak gösterilir.

Örnek etiketler:

- #iş_stresi
- #spor
- #uykusuzluk
- #özgüven
- #ilişkiler
- #üretkenlik

### AI Insight Kartı

Kullanıcıya son verilerinden çıkarılan anlamlı bir içgörü gösterilir.

Örnek:

“Son birkaç günlük kaydında #iş_stresi etiketi sık görülüyor. Bu kayıtların çoğunda enerji seviyen 2 veya daha düşük. Bu hafta iş sonrası toparlanma rutinleri planlamak faydalı olabilir.”

## Kabul Kriterleri

- Kullanıcı dashboard ekranını uygulama açıldığında görebilmelidir.
- Veri yoksa boş durum mesajları gösterilmelidir.
- Mood ve enerji grafikleri en az son 7 günü gösterebilmelidir.
- AI insight yoksa kullanıcı günlük yazmaya yönlendirilmelidir.
- Aktif görevler dashboard’da listelenmelidir.
- Son günlüklerden detay sayfasına gidilebilmelidir.
- Dashboard responsive çalışmalıdır.

---

# 11.2 Journaling / Günlük Modülü

## Amaç

Günlük modülü, kullanıcının gün içinde düşüncelerini, duygularını, yaşadıklarını ve zihinsel yükünü yazabileceği temel veri giriş alanıdır. MindSpace’in AI analizleri, görev önerileri ve chat bağlamı büyük ölçüde bu günlük kayıtlarından beslenecektir.

## Kullanıcı Hikayeleri

- Kullanıcı olarak gün içinde hissettiklerimi yazmak istiyorum.
- Kullanıcı olarak birden fazla günlük kaydı oluşturmak istiyorum.
- Kullanıcı olarak her kayda ruh hali eklemek istiyorum.
- Kullanıcı olarak her kayda enerji seviyesi eklemek istiyorum.
- Kullanıcı olarak eski günlüklerimi görüntülemek istiyorum.
- Kullanıcı olarak eski günlüklerimi düzenlemek istiyorum.
- Kullanıcı olarak istemediğim günlükleri silmek istiyorum.
- Kullanıcı olarak yazdığım günlüklerin AI tarafından analiz edilmesini istiyorum.

## Fonksiyonel Gereksinimler

- Kullanıcı yeni günlük kaydı oluşturabilmelidir.
- Günlük kaydına tarih otomatik atanmalıdır.
- Kullanıcı mood seçebilmelidir.
- Kullanıcı enerji seviyesi seçebilmelidir.
- Kullanıcı uzun metin yazabilmelidir.
- Günlük içeriği boşsa kayıt engellenmelidir.
- Günlükler IndexedDB’ye kaydedilmelidir.
- Kullanıcı günlükleri listeleyebilmelidir.
- Kullanıcı bir günlük kaydının detayını açabilmelidir.
- Kullanıcı günlük kaydını düzenleyebilmelidir.
- Kullanıcı günlük kaydını silebilmelidir.
- Kayıt sonrası AI analiz süreci tetiklenmelidir.

## Mood Seçenekleri

Mood seçenekleri ilk aşamada şu şekilde olabilir:

- very_happy
- happy
- neutral
- sad
- angry
- anxious
- tired
- excited
- stressed
- calm

## Energy Seçenekleri

Enerji seviyesi 1 ile 5 arasında seçilmelidir.

| Değer | Açıklama |
|---|---|
| 1 | Çok düşük enerji |
| 2 | Düşük enerji |
| 3 | Orta enerji |
| 4 | İyi enerji |
| 5 | Çok yüksek enerji |

## Günlük Kayıt Modeli

"""
{
  "id": "uuid-123",
  "date": "2026-05-06T14:30:00Z",
  "mood": "sad",
  "energy": 2,
  "content": "Bugün toplantıda işler ters gitti, kendimi çok yetersiz hissettim...",
  "ai_tags": ["#kariyer", "#stres", "#özgüven"],
  "ai_sentiment_score": -0.8,
  "ai_summary": "Kullanıcı iş ortamında yaşadığı bir durum nedeniyle yetersizlik hissi yaşamış.",
  "ai_reflection": "Bu deneyim iş yerindeki beklentiler ve özgüven algısıyla ilişkili olabilir.",
  "analysis_status": "completed",
  "created_at": "2026-05-06T14:30:00Z",
  "updated_at": "2026-05-06T14:30:00Z"
}
"""

## Analysis Status Değerleri

- pending
- processing
- completed
- failed
- disabled

## Kabul Kriterleri

- Kullanıcı boş günlük kaydı oluşturamamalıdır.
- Mood seçimi yapılmasa bile kayıt oluşturulabilir, ancak kullanıcı seçim yapmaya teşvik edilmelidir.
- Enerji değeri 1-5 aralığında olmalıdır.
- Kayıt IndexedDB’ye başarıyla yazılmalıdır.
- Kayıt sonrası AI analizi başlatılmalıdır.
- AI başarısız olursa günlük verisi kaybolmamalıdır.
- Kullanıcı geçmiş kayıtlarını listeleyebilmelidir.
- Kullanıcı kayıtları düzenleyip silebilmelidir.

---

# 11.3 Görev ve Planlama Modülü

## Amaç

Görev ve planlama modülü, kullanıcının yapılacaklarını takip edebileceği basit ama etkili bir alan sunar. Bu modülün farkı, görevlerin yalnızca manuel oluşturulmaması; AI’ın günlüklerden aksiyon çıkararak kullanıcıya görev önerileri sunabilmesidir.

## Kullanıcı Hikayeleri

- Kullanıcı olarak manuel görev oluşturmak istiyorum.
- Kullanıcı olarak görevlerimi listelemek istiyorum.
- Kullanıcı olarak görevlerimi tamamlandı olarak işaretlemek istiyorum.
- Kullanıcı olarak görevleri düzenlemek veya silmek istiyorum.
- Kullanıcı olarak AI’ın günlüklerimden görev önermesini istiyorum.
- Kullanıcı olarak AI görev önerilerini kabul etmek veya reddetmek istiyorum.
- Kullanıcı olarak bir görevin hangi günlükten üretildiğini görmek istiyorum.

## Fonksiyonel Gereksinimler

- Kullanıcı manuel görev oluşturabilmelidir.
- Kullanıcı görevleri listeleyebilmelidir.
- Kullanıcı görev detayını görüntüleyebilmelidir.
- Kullanıcı görev düzenleyebilmelidir.
- Kullanıcı görev silebilmelidir.
- Kullanıcı görev durumunu değiştirebilmelidir.
- Görevler tarih bazlı filtrelenebilmelidir.
- Görevler durum bazlı filtrelenebilmelidir.
- AI görev önerileri ayrı bir öneri alanında gösterilmelidir.
- AI görev önerileri kullanıcı onayı olmadan aktif görevlere eklenmemelidir.
- Kabul edilen AI önerileri task listesine eklenmelidir.
- Reddedilen AI önerileri kaydedilebilir veya silinebilir.

## Görev Durumları

- todo
- in_progress
- completed
- skipped
- archived

## Görev Modeli

"""
{
  "id": "uuid-999",
  "date": "2026-05-06",
  "title": "Stresi azaltmak için gece yürüyüşü yap",
  "description": "Bugünkü stres seviyesini azaltmak için kısa ve hafif bir yürüyüş önerildi.",
  "status": "todo",
  "ai_generated": true,
  "source_journal_id": "uuid-123",
  "created_at": "2026-05-06T15:00:00Z",
  "updated_at": "2026-05-06T15:00:00Z"
}
"""

## AI Görev Önerisi Örneği

Kullanıcı günlükte şöyle yazarsa:

“Bugün maalesef sporu yine ektim, çok motive hissedemiyorum.”

AI şu görev önerisini üretebilir:

“Yarın için 15 dakikalık hafif bir esneme rutini planlayalım mı?”

Bu öneri doğrudan görev listesine eklenmez. Kullanıcıya onay ekranında gösterilir. Kullanıcı kabul ederse görev oluşturulur.

## Kabul Kriterleri

- Kullanıcı manuel görev ekleyebilmelidir.
- Kullanıcı görev durumunu değiştirebilmelidir.
- AI görev önerileri kullanıcı onayı olmadan aktif listeye düşmemelidir.
- Görevler IndexedDB üzerinde saklanmalıdır.
- Dashboard aktif görevleri göstermelidir.
- Görevler ilgili günlük kaydıyla ilişkilendirilebilmelidir.

---

# 11.4 AI Analiz Modülü

## Amaç

AI analiz modülü, günlük metinlerinden anlamlı veriler çıkarmak için kullanılır. Bu modül; otomatik etiketleme, duygu skoru, kısa özet, kişisel yansıma ve görev önerisi gibi çıktılar üretmelidir.

## AI Analiz Çıktıları

Bir günlük kaydı analiz edildiğinde AI şu çıktıları üretebilir:

- ai_tags
- ai_sentiment_score
- ai_summary
- ai_reflection
- suggested_tasks
- risk_flags

## Fonksiyonel Gereksinimler

- Günlük kaydı oluşturulduktan sonra AI analizi tetiklenmelidir.
- Kullanıcı AI özelliğini açıp kapatabilmelidir.
- Kullanıcı AI provider seçebilmelidir.
- Ollama varsayılan local provider olarak desteklenmelidir.
- OpenAI opsiyonel provider olarak desteklenmelidir.
- AI çıktıları JSON formatında alınmaya çalışılmalıdır.
- AI çıktıları doğrulanmalıdır.
- Bozuk AI çıktısı uygulamayı çökertmemelidir.
- AI analizi başarısız olursa kayıt korunmalıdır.
- Kullanıcı isterse yeniden analiz başlatabilmelidir.

## AI Analiz Response Örneği

"""
{
  "tags": ["#iş_stresi", "#özgüven", "#yorgunluk"],
  "sentiment_score": -0.72,
  "summary": "Kullanıcı iş yerindeki bir durum nedeniyle özgüven kaybı ve yorgunluk hissetmiş.",
  "reflection": "Bu kayıt, kullanıcının iş performansı ve öz değer algısı arasında güçlü bir bağ kurduğunu gösteriyor olabilir.",
  "suggested_tasks": [
    {
      "title": "Bugün 10 dakikalık kısa bir yürüyüş yap",
      "description": "Düşük enerjiyi dengelemek ve zihni boşaltmak için hafif bir aktivite önerildi."
    }
  ],
  "risk_flags": []
}
"""

## Otomatik Etiketleme

AI, kullanıcının günlük metnindeki ana temaları etiketlere dönüştürmelidir.

Örnek etiketler:

- #iş_stresi
- #spor
- #uykusuzluk
- #aile
- #özgüven
- #üretkenlik
- #motivasyon
- #ilişkiler
- #sağlık
- #finans
- #yalnızlık
- #kaygı
- #dinlenme
- #başarı
- #odak

## Sentiment Score

AI, günlük metnine -1 ile +1 arasında duygu skoru verebilir.

| Skor Aralığı | Anlam |
|---|---|
| -1.0 / -0.6 | Yoğun negatif duygu |
| -0.6 / -0.2 | Negatif duygu |
| -0.2 / +0.2 | Nötr |
| +0.2 / +0.6 | Pozitif duygu |
| +0.6 / +1.0 | Yoğun pozitif duygu |

## AI Insight Örneği

“Son birkaç gündür #iş_stresi etiketiyle ilişkili günlüklerinde enerji seviyenin düştüğü görülüyor. Bu hafta iş sonrası kısa toparlanma rutinleri planlamak iyi gelebilir.”

## Kabul Kriterleri

- AI analizi yapılandırılabilir olmalıdır.
- AI çıktıları günlük kaydıyla ilişkilendirilmelidir.
- AI çıktısı bozuk gelirse uygulama hata vermemelidir.
- Kullanıcı AI analizini tekrar çalıştırabilmelidir.
- AI provider çalışmıyorsa kullanıcı bilgilendirilmelidir.
- AI analizi kapalıysa günlük modülü normal çalışmaya devam etmelidir.

---

# 11.5 AI Psikolog / Sohbet Modülü

## Amaç

Chat modülü, kullanıcının geçmiş günlükleri ve ruh hali verileri üzerinden AI ile güvenli bir şekilde sohbet etmesini sağlar. Bu modül profesyonel terapi hizmeti değildir. Kişisel yansıma, düşünme, farkındalık ve destekleyici sohbet alanı olarak tasarlanmalıdır.

## Kullanıcı Hikayeleri

- Kullanıcı olarak AI ile günüm hakkında konuşmak istiyorum.
- Kullanıcı olarak geçmiş günlüklerim üzerinden yorum almak istiyorum.
- Kullanıcı olarak belirli bir olay hakkında AI’dan yansıtıcı sorular almak istiyorum.
- Kullanıcı olarak AI’ın beni yargılamadan dinlemesini istiyorum.
- Kullanıcı olarak AI’ın kesin teşhis koymamasını istiyorum.
- Kullanıcı olarak hangi günlüklerin AI bağlamına dahil edileceğini kontrol etmek istiyorum.

## Fonksiyonel Gereksinimler

- Kullanıcı chat ekranında mesaj yazabilmelidir.
- AI yanıtları mesajlaşma arayüzünde gösterilmelidir.
- Chat geçmişi IndexedDB üzerinde saklanabilmelidir.
- Chat, seçili günlükleri bağlam olarak kullanabilmelidir.
- Tüm geçmiş doğrudan AI’a gönderilmemelidir.
- İlgili günlükler filtrelenerek context oluşturulmalıdır.
- Local LLM desteklenmelidir.
- OpenAI opsiyonel olarak desteklenmelidir.
- Kullanıcı chat geçmişini silebilmelidir.
- AI medikal veya klinik teşhis koymamalıdır.
- AI kriz durumlarında profesyonel destek önermelidir.

## Chat Message Modeli

"""
{
  "id": "uuid-chat-1",
  "session_id": "uuid-session-1",
  "role": "user",
  "content": "Dünkü tartışmayı sence nasıl telafi etmeliyim?",
  "context_journal_ids": ["uuid-123", "uuid-456"],
  "created_at": "2026-05-06T16:00:00Z"
}
"""

## Chat Session Modeli

"""
{
  "id": "uuid-session-1",
  "title": "Dünkü tartışma üzerine konuşma",
  "created_at": "2026-05-06T16:00:00Z",
  "updated_at": "2026-05-06T16:15:00Z"
}
"""

## AI Persona

Varsayılan AI persona şu niteliklere sahip olmalıdır:

- Şefkatli
- Yargılamayan
- Sakin
- Destekleyici
- Kullanıcıyı düşünmeye teşvik eden
- Kesin hükümler vermeyen
- Medikal tanı koymayan
- Manipülatif olmayan
- Kullanıcıyı bağımlı hale getirmeyen
- Gerektiğinde profesyonel destek öneren

## Güvenli Yanıt Sınırları

AI şu davranışlardan kaçınmalıdır:

- Klinik teşhis koymak
- İlaç tavsiyesi vermek
- Kullanıcıya kesin psikolojik tanımlar yapmak
- Kriz durumlarını hafife almak
- Kullanıcıyı profesyonel destekten uzaklaştırmak
- “Kesinlikle şöylesin” gibi iddialı ifadeler kullanmak
- Geçmiş günlükleri gereğinden fazla ifşa etmek

## Kabul Kriterleri

- Kullanıcı chat ekranından AI ile konuşabilmelidir.
- AI geçmiş günlüklerden bağlam alabilmelidir.
- Kullanıcı context kullanımını anlayabilmelidir.
- AI medikal veya klinik teşhis iddiasında bulunmamalıdır.
- Chat çalışmadığında kullanıcıya açık hata mesajı gösterilmelidir.
- Chat geçmişi silinebilmelidir.

---

# 11.6 Ayarlar Modülü

## Amaç

Ayarlar modülü, kullanıcının AI provider, veri yönetimi, görünüm ve gizlilik tercihlerini yönetmesini sağlar.

## Fonksiyonel Gereksinimler

Ayarlar ekranında şu alanlar bulunmalıdır:

- AI açık / kapalı
- AI provider seçimi
- Ollama base URL
- Ollama model adı
- OpenAI API key alanı
- OpenAI model seçimi
- Veri export
- Veri import
- Tüm verileri sil
- Tema seçimi
- Gizlilik bilgilendirmesi

## AI Provider Settings Modeli

"""
{
  "id": "settings-ai",
  "provider": "ollama",
  "ollama_base_url": "http://localhost:11434",
  "ollama_model": "llama3",
  "openai_api_key": "",
  "openai_model": "gpt-4o-mini",
  "ai_enabled": true
}
"""

## Kabul Kriterleri

- Kullanıcı AI özelliğini kapatabilmelidir.
- Kullanıcı Ollama ayarlarını düzenleyebilmelidir.
- Kullanıcı OpenAI API anahtarı girebilmelidir.
- API anahtarı kullanıcı cihazında saklanmalıdır.
- Kullanıcı tüm verilerini silebilmelidir.
- Kullanıcı verilerini export edebilmelidir.

---

## 12. Kullanıcı Akışları

---

# 12.1 İlk Kullanım Akışı

1. Kullanıcı uygulamayı açar.
2. Karşılama ekranı gösterilir.
3. Uygulamanın local-first çalıştığı anlatılır.
4. Kullanıcıya AI kullanımı hakkında bilgi verilir.
5. Kullanıcı AI provider seçebilir:
   - Ollama
   - OpenAI
   - AI kapalı
6. Kullanıcı ilk günlük kaydını oluşturur.
7. Kayıt IndexedDB’ye yazılır.
8. Eğer AI aktifse analiz başlatılır.
9. Dashboard ilk verilerle oluşmaya başlar.

---

# 12.2 Günlük Kaydı Oluşturma Akışı

1. Kullanıcı “Günlük” sekmesine gider.
2. Yeni kayıt oluştur butonuna tıklar.
3. Mood seçer.
4. Enerji seviyesini seçer.
5. Günlük metnini yazar.
6. Kaydet butonuna basar.
7. Sistem içeriğin boş olup olmadığını kontrol eder.
8. Kayıt IndexedDB’ye kaydedilir.
9. AI aktifse analiz işlemi başlar.
10. AI etiket, sentiment, özet ve görev önerisi üretir.
11. Kullanıcı analiz sonucunu görüntüler.

---

# 12.3 AI Görev Önerisi Akışı

1. Kullanıcı günlük kaydı oluşturur.
2. AI günlük metnini analiz eder.
3. AI aksiyona dönüşebilecek öneriler çıkarır.
4. Öneriler kullanıcıya ayrı bir alanda gösterilir.
5. Kullanıcı öneriyi kabul eder veya reddeder.
6. Kabul edilen öneri görev listesine eklenir.
7. Reddedilen öneri aktif göreve dönüşmez.

---

# 12.4 Dashboard Görüntüleme Akışı

1. Kullanıcı uygulamayı açar.
2. Dashboard ekranı yüklenir.
3. IndexedDB’den günlükler ve görevler okunur.
4. Mood ve enerji trendleri hesaplanır.
5. Etiket dağılımı hesaplanır.
6. Son günlükler listelenir.
7. Aktif görevler listelenir.
8. AI insight varsa gösterilir.
9. Veri yoksa boş durum gösterilir.

---

# 12.5 AI Chat Akışı

1. Kullanıcı “Sohbet” sekmesine gider.
2. Yeni mesaj yazar.
3. Sistem ilgili günlükleri context olarak seçer.
4. Context AI provider’a gönderilir.
5. AI yanıt üretir.
6. Yanıt chat ekranında gösterilir.
7. Mesaj geçmişi IndexedDB’ye kaydedilir.

---

## 13. Veri Modeli

---

# 13.1 Journal Entry

"""
{
  "id": "string",
  "date": "string",
  "mood": "string",
  "energy": "number",
  "content": "string",
  "ai_tags": "string[]",
  "ai_sentiment_score": "number",
  "ai_summary": "string",
  "ai_reflection": "string",
  "analysis_status": "pending | processing | completed | failed | disabled",
  "created_at": "string",
  "updated_at": "string"
}
"""

---

# 13.2 Task

"""
{
  "id": "string",
  "date": "string",
  "title": "string",
  "description": "string",
  "status": "todo | in_progress | completed | skipped | archived",
  "ai_generated": "boolean",
  "source_journal_id": "string | null",
  "created_at": "string",
  "updated_at": "string"
}
"""

---

# 13.3 Suggested Task

"""
{
  "id": "string",
  "journal_id": "string",
  "title": "string",
  "description": "string",
  "status": "pending | accepted | rejected",
  "created_at": "string"
}
"""

---

# 13.4 Chat Session

"""
{
  "id": "string",
  "title": "string",
  "created_at": "string",
  "updated_at": "string"
}
"""

---

# 13.5 Chat Message

"""
{
  "id": "string",
  "session_id": "string",
  "role": "user | assistant | system",
  "content": "string",
  "context_journal_ids": "string[]",
  "created_at": "string"
}
"""

---

# 13.6 App Settings

"""
{
  "id": "settings",
  "theme": "dark | light | system",
  "ai_enabled": "boolean",
  "provider": "ollama | openai | none",
  "created_at": "string",
  "updated_at": "string"
}
"""

---

# 13.7 AI Provider Settings

"""
{
  "id": "settings-ai",
  "provider": "ollama",
  "ollama_base_url": "http://localhost:11434",
  "ollama_model": "llama3",
  "openai_api_key": "",
  "openai_model": "gpt-4o-mini",
  "ai_enabled": true
}
"""

---

## 14. Teknik Gereksinimler

### 14.1 Frontend Teknolojileri

Projede önerilen frontend teknolojileri şunlardır:

- Next.js
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Dexie.js
- IndexedDB

### 14.2 Mimari Yaklaşım

MindSpace client-side ağırlıklı bir mimariye sahip olmalıdır.

Temel mimari prensipler:

- Local-first veri saklama
- Server-side bağımlılıkları minimumda tutma
- IndexedDB tabanlı kalıcı veri
- AI provider adapter yapısı
- Modüler component yapısı
- Type-safe veri modelleri
- Reusable hook ve service katmanları
- UI ile business logic ayrımı
- Open-source geliştirilebilirlik

### 14.3 Önerilen Klasör Yapısı

"""
src/
  app/
    dashboard/
    journal/
    tasks/
    chat/
    settings/
  components/
    ui/
    dashboard/
    journal/
    tasks/
    chat/
    settings/
  lib/
    db/
    ai/
    utils/
  hooks/
  types/
  constants/
  styles/
"""

### 14.4 Veri Saklama

Veriler kullanıcının tarayıcısındaki IndexedDB üzerinde saklanmalıdır.

Saklanacak veri türleri:

- Günlük kayıtları
- Görevler
- AI analiz çıktıları
- AI görev önerileri
- Chat session kayıtları
- Chat mesajları
- Kullanıcı ayarları
- AI provider ayarları

### 14.5 AI Provider Adapter Yapısı

AI servisleri tek bir ortak interface üzerinden yönetilmelidir.

Provider örnekleri:

- OllamaProvider
- OpenAIProvider
- MockProvider

Örnek interface:

"""
interface AIProvider {
  analyzeJournal(input: AnalyzeJournalInput): Promise<AnalyzeJournalOutput>;
  chat(input: ChatInput): Promise<ChatOutput>;
}
"""

---

## 15. Gizlilik ve Güvenlik Gereksinimleri

### 15.1 Temel Gizlilik İlkeleri

MindSpace’in gizlilik yaklaşımı şu prensiplere dayanmalıdır:

- Kullanıcı verileri varsayılan olarak cihazda kalmalıdır.
- Kullanıcı izni olmadan veri harici servise gönderilmemelidir.
- Harici AI provider kullanımı açıkça belirtilmelidir.
- OpenAI gibi servisler varsayılan olarak kapalı olmalıdır.
- Kullanıcı AI provider seçimini değiştirebilmelidir.
- Kullanıcı tüm verilerini silebilmelidir.
- Kullanıcı verilerini dışa aktarabilmelidir.
- Uygulama, kişisel günlük verilerinin hassas olduğunu kabul etmelidir.

### 15.2 Hassas Veri Yaklaşımı

Günlük kayıtları yüksek hassasiyetli kişisel veri kabul edilmelidir. Bu yüzden uygulama şu ilkelere uymalıdır:

- Kullanıcıya verilerinin nerede saklandığı açıklanmalıdır.
- AI provider seçimi sırasında veri paylaşım riski anlatılmalıdır.
- Harici API’ye gönderilecek veri kullanıcı tarafından bilinmelidir.
- Chat context’inde kullanılacak günlükler mümkün olduğunca sınırlı tutulmalıdır.
- Kullanıcı chat geçmişini silebilmelidir.
- Kullanıcı tüm verilerini temizleyebilmelidir.

### 15.3 AI Güvenlik İlkeleri

AI şu sınırlar içinde davranmalıdır:

- Medikal teşhis koymamalıdır.
- Psikolojik rahatsızlık tanısı vermemelidir.
- İlaç önerisi vermemelidir.
- Kullanıcıyı profesyonel destekten uzaklaştırmamalıdır.
- Kriz veya kendine zarar verme riski algılanırsa profesyonel destek yönlendirmesi yapmalıdır.
- Tavsiyelerini kesin hüküm şeklinde sunmamalıdır.
- Kullanıcının hassas verilerini gereksiz tekrar etmemelidir.

---

## 16. UI / UX Gereksinimleri

### 16.1 Tasarım Dili

MindSpace modern, sakin, minimal ve karanlık mod ağırlıklı bir tasarım diline sahip olmalıdır.

Tasarım; kullanıcının zihinsel yükünü azaltmalı, yazma deneyimini kolaylaştırmalı ve grafiksel verileri anlaşılır şekilde sunmalıdır.

### 16.2 Görsel Stil

- Dark mode öncelikli
- Soft gradient arka planlar
- Yuvarlatılmış kartlar
- Hafif blur efektleri
- Akıcı geçişler
- Minimal ikon kullanımı
- Geniş boşluklar
- Okunabilir tipografi
- Dikkat dağıtmayan yazı alanları
- Mood durumlarına göre küçük renk varyasyonları

### 16.3 Ana Navigasyon

Ana navigasyon şu sekmelerden oluşabilir:

- Dashboard
- Günlük
- Planlar
- Sohbet
- Ayarlar

### 16.4 Boş Durumlar

Veri olmayan ekranlarda kullanıcıya yönlendirici mesajlar gösterilmelidir.

Örnek boş durum mesajları:

- “Henüz günlük kaydı yok. Bugün nasıl hissettiğini yazarak başlayabilirsin.”
- “Henüz görev oluşturmadın. Küçük bir adımla başlamak ister misin?”
- “AI içgörüleri için birkaç günlük kaydı oluşturman gerekiyor.”
- “Sohbete başlamak için AI sağlayıcını ayarlayabilirsin.”

### 16.5 Hata Durumları

AI provider bağlantısı başarısız olursa kullanıcıya teknik olmayan, anlaşılır mesaj gösterilmelidir.

Örnek:

“Ollama bağlantısı kurulamadı. Lütfen Ollama’nın çalıştığından ve model adının doğru olduğundan emin ol.”

---

## 17. MVP Kapsamı

### 17.1 MVP’de Mutlaka Olmalı

İlk MVP sürümünde mutlaka bulunması gereken özellikler:

- Dashboard ekranı
- Günlük oluşturma
- Mood seçimi
- Enerji seviyesi seçimi
- Günlük listeleme
- Günlük detay görüntüleme
- IndexedDB’ye kayıt
- Dexie.js database katmanı
- Görev oluşturma
- Görev listeleme
- Görev tamamlandı işaretleme
- Basit AI tagging
- Basit sentiment analizi
- AI analiz sonucu gösterimi
- Ollama bağlantı ayarı
- AI kapatma seçeneği
- Temel chat ekranı
- Dark mode tasarım
- README
- Kurulum dokümantasyonu

### 17.2 MVP’de Olmasa da Olur

İlk MVP’de zorunlu olmayan özellikler:

- Zengin metin editörü
- Gelişmiş RAG sistemi
- Veri export / import
- Gelişmiş grafikler
- Çoklu AI persona
- Tema özelleştirme
- Bildirimler
- Takvim entegrasyonu
- Mobil uygulama
- Bulut yedekleme
- Çoklu dil desteği

---

## 18. Roadmap

### Faz 1 — Altyapı ve Temel UI

Amaç: Uygulamanın temel sayfa yapısını, tasarım sistemini ve local database altyapısını oluşturmak.

İşler:

- Next.js proje kurulumu
- Tailwind CSS kurulumu
- Framer Motion kurulumu
- Temel layout yapısı
- Ana navigasyon
- Dashboard iskeleti
- Günlük sayfası iskeleti
- Görev sayfası iskeleti
- Sohbet sayfası iskeleti
- Ayarlar sayfası iskeleti
- Dexie.js kurulumu
- IndexedDB schema tanımı

### Faz 2 — Günlük ve Görev Yönetimi

Amaç: Kullanıcının günlük ve görev oluşturmasını sağlamak.

İşler:

- Günlük oluşturma formu
- Mood seçici
- Enerji seçici
- Günlük listeleme
- Günlük detay
- Günlük düzenleme
- Günlük silme
- Görev oluşturma
- Görev listeleme
- Görev durum güncelleme
- Görev silme

### Faz 3 — AI Analiz Entegrasyonu

Amaç: Günlük metinlerini AI ile analiz etmek.

İşler:

- AI provider interface
- Ollama provider
- OpenAI provider
- Mock provider
- Analyze journal prompt
- AI tagging
- Sentiment score
- AI summary
- AI reflection
- Suggested tasks
- AI analiz durum yönetimi

### Faz 4 — Dashboard Görselleştirme

Amaç: Kullanıcı verilerini anlamlı grafiklerle sunmak.

İşler:

- Mood trend grafiği
- Energy trend grafiği
- Tag dağılım grafiği
- Aktif görevler kartı
- Son günlükler kartı
- AI insight kartı
- Haftalık özet hesaplama

### Faz 5 — AI Chat

Amaç: Kullanıcının geçmiş günlükleriyle AI destekli sohbet yapmasını sağlamak.

İşler:

- Chat UI
- Chat session yönetimi
- Chat message modeli
- Context seçimi
- Basit RAG mantığı
- AI chat prompt
- Chat geçmişi saklama
- Chat geçmişi silme

### Faz 6 — Open-source Paketleme

Amaç: Projeyi dış geliştiricilerin kurabileceği hale getirmek.

İşler:

- README yazımı
- Installation guide
- Development setup
- Ollama setup guide
- AI provider guide
- Contribution guide
- License
- Changelog
- Release checklist

---

## 19. Riskler ve Önlemler

### Risk 1 — AI’ın Fazla İddialı Psikolojik Yorum Yapması

**Açıklama:**  
AI, kullanıcının yazılarını analiz ederken psikolojik tanı koyuyormuş gibi davranabilir.

**Önlem:**  
Promptlarda AI’ın teşhis koymaması, destekleyici ve yansıtıcı bir dil kullanması açıkça belirtilmelidir.

---

### Risk 2 — Kullanıcı Verilerinin Yanlışlıkla Harici Servise Gitmesi

**Açıklama:**  
Kullanıcı local-first yapı beklerken OpenAI gibi harici provider’a veri gönderilebilir.

**Önlem:**  
Harici provider kullanımı açık rıza ve ayar değişikliği gerektirmelidir. UI’da veri paylaşımı açıkça anlatılmalıdır.

---

### Risk 3 — AI Provider Bağlantı Hataları

**Açıklama:**  
Ollama çalışmıyor olabilir, model yüklü olmayabilir veya bağlantı adresi yanlış olabilir.

**Önlem:**  
Ayarlar ekranında test connection butonu bulunmalıdır. Hata mesajları kullanıcı dostu olmalıdır.

---

### Risk 4 — IndexedDB Veri Kaybı

**Açıklama:**  
Tarayıcı verileri temizlenirse kullanıcı günlüklerini kaybedebilir.

**Önlem:**  
Export / backup özelliği ilerleyen fazlarda eklenmelidir. Kullanıcıya verilerin cihazda tutulduğu anlatılmalıdır.

---

### Risk 5 — MVP Kapsamının Fazla Büyümesi

**Açıklama:**  
AI, chat, dashboard, görev, günlük gibi çok sayıda modül MVP’yi büyütebilir.

**Önlem:**  
Öncelik sırası net tutulmalıdır. İlk MVP’de günlük, mood, enerji, IndexedDB ve temel AI analiz yeterli kabul edilebilir.

---

## 20. Kabul Kriterleri Genel Özeti

MVP tamamlandığında aşağıdaki kriterler karşılanmalıdır:

- Kullanıcı günlük oluşturabilir.
- Kullanıcı mood seçebilir.
- Kullanıcı enerji seviyesi seçebilir.
- Veriler IndexedDB’ye kaydedilir.
- Kullanıcı geçmiş günlükleri görebilir.
- Kullanıcı görev oluşturabilir.
- Dashboard temel özet gösterir.
- AI aktifse günlük analiz edilir.
- AI etiket ve sentiment üretir.
- AI başarısız olsa bile uygulama çalışır.
- Ollama ayarlanabilir.
- AI kapatılabilir.
- Chat ekranı temel seviyede çalışır.
- Proje lokal ortamda kurulabilir.
- README ile geliştirici projeyi ayağa kaldırabilir.

---

## 21. Açık Sorular

Bu PRD sonrasında netleştirilmesi gereken bazı sorular:

1. Uygulama ilk sürümde tamamen tek kullanıcılı mı kalacak?
2. Zengin metin editörü MVP’ye dahil edilecek mi?
3. AI analizleri otomatik mi çalışacak, manuel tetikleme de olacak mı?
4. Chat geçmişi varsayılan olarak saklanacak mı?
5. OpenAI API key IndexedDB’de mi saklanacak?
6. Export formatı JSON mu olacak?
7. Mood seçenekleri sabit mi olacak, kullanıcı özelleştirebilecek mi?
8. AI task önerileri ayrı tabloda mı tutulacak?
9. Dashboard ilk sürümde 7 günlük mü, 30 günlük mü gösterim yapacak?
10. Kriz durumları için nasıl bir güvenlik metni kullanılacak?

---

## 22. Sonuç

MindSpace; günlük, mood tracking, görev yönetimi, AI analizleri ve kişisel sohbet deneyimini local-first ve privacy-first bir yaklaşımla bir araya getiren açık kaynaklı bir kişisel yaşam dashboard’u olarak konumlanır.

İlk aşamada ürünün temel değeri; kullanıcının günlüklerini güvenli şekilde saklaması, bu günlüklerden AI destekli etiketler ve içgörüler alması, mood / enerji trendlerini takip etmesi ve geçmiş verileriyle daha anlamlı bir kişisel farkındalık deneyimi yaşamasıdır.

Bu PRD, ürünün ilk geliştirme fazları için temel referans dokümanı olarak kullanılabilir.