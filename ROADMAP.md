# Freelancer OS Roadmap

Bu dokuman, uygulamanin temel urun yonunu ve MVP kapsamını tanımlar.

Uygulamanin cikis noktasi: Freelancer'larin gundelik hayatlarini, musterilerini, projelerini, side project'lerini, finansal durumlarini ve kisisel performanslarini tek bir self-host edilebilir dashboard uzerinden yonetebilmesi.

MVP, tek kullanici odakli olacak. Ekip, ajans, CRM otomasyonlari, gelismis AI modulleri ve mobil uygulama MVP sonrasi fazlara birakilir.

---

## Urun Vizyonu

Freelancer icin tek merkezli bir operasyon paneli:

- Bugun ne yapacagim?
- Hangi musteride hangi is var?
- Hangi proje gecikiyor?
- Side project'lerimde ilerleme var mi?
- Bu ay ne kadar kazandim, ne kadar harcadim?
- Enerjim ve ruh halim is performansimi nasil etkiliyor?
- Tum bu verilerden hangi raporu okuyabilirim?

Uygulama, klasik gorev takip aracindan daha genis; freelancer'in is, finans ve kisisel performans alanlarini birlestiren bir "Freelancer OS" olarak konumlanir.

---

## MVP Ilkeleri

1. **Tek kullanici**
   - MVP'de ekip, rol, yetki, assignee, ortak calisma yok.
   - Tum veriler tek kullanicinin kendi calisma alani icindir.

2. **Self-host ve open-source uyumlu**
   - Kurulum dokumani net olmali.
   - Veritabani migration'lari repo icinde olmali.
   - Harici servisler opsiyonel olmali.

3. **Gercek veri, sade akis**
   - Mock dashboard yerine kullanicinin girdigi gercek verilerden rapor uretilecek.
   - Her modulde minimum CRUD ve minimum rapor yeterli.

4. **AI destekleyici, cekirdek degil**
   - MVP'de AI sadece genel chatbot olarak konumlanir.
   - Chatbot, kayitli gorev/proje/musteri/finans/gunluk verileri hakkinda soru cevap yapabilir.
   - Modul icindeki otomatik oneriler, scoring, akilli otomasyonlar MVP sonrasi.

5. **Ekranda rapor yeterli**
   - MVP'de PDF/PNG export sart degil.
   - Dashboard ve modul rapor ekranlari yeterli kabul edilir.

---

## MVP Kapsami

### 1. Dashboard

**Amac:** Freelancer'in gunluk ve haftalik durumunu tek bakista gostermek.

MVP icerigi:

- Bugunku gorevler
- Yaklasan takvim etkinlikleri
- Aktif musterilerden acik isler
- Aktif projeler ve side project'ler
- Bu ay gelir/gider ozeti
- Haftalik gorev tamamlama grafigi
- Mood/energy trend grafigi
- Geciken isler ve yaklasan deadline'lar

Raporlar:

- Haftalik is yuklemesi
- Proje ilerleme ozeti
- Aylik finans ozeti
- Kisisel enerji/mood ozeti

---

### 2. Musteriler

**Amac:** Freelancer'in calistigi musterileri ve o musterilerle iliskili isleri takip etmesi.

MVP alanlari:

- Musteri adi
- Firma/marka adi
- E-posta
- Telefon veya iletisim notu
- Durum: active, paused, archived
- Notlar

MVP aksiyonlari:

- Musteri ekleme
- Musteri duzenleme
- Musteri arsivleme
- Musteriye bagli projeleri/gorevleri gorme

Raporlar:

- Aktif musteri sayisi
- Musteri bazli proje sayisi
- Musteri bazli gelir ozeti

MVP disi:

- Gelismis CRM pipeline
- E-posta entegrasyonu
- Otomatik takip hatirlatmalari
- Musteri sentiment analizi

---

### 3. Projeler ve Side Project'ler

**Amac:** Musteri projeleri ve kisisel side project'leri ayni mantikta ama ayri turlerle takip etmek.

MVP alanlari:

- Proje adi
- Tur: client_project, side_project
- Bagli musteri, sadece client_project icin opsiyonel/zorunlu
- Aciklama
- Durum: planning, active, paused, completed, cancelled
- Baslangic tarihi
- Deadline
- Butce veya beklenen gelir
- Ilerleme yuzdesi, gorevlerden otomatik hesaplanabilir

MVP aksiyonlari:

- Proje ekleme
- Proje duzenleme
- Projeye gorev baglama
- Proje durumunu guncelleme

Raporlar:

- Aktif proje sayisi
- Geciken proje sayisi
- Proje bazli gorev tamamlama orani
- Musteri projeleri / side project dagilimi

MVP disi:

- Ekip uyeleri
- Dosya yonetimi
- Kanban sprint sistemi
- Gelismis risk analizi

---

### 4. Gorevler

**Amac:** Freelancer'in gunluk operasyonunu yonetmek.

MVP alanlari:

- Baslik
- Aciklama
- Durum: todo, in_progress, done
- Oncelik: low, medium, high, urgent
- Son tarih
- Bagli proje
- Bagli musteri, proje uzerinden de turetilebilir
- Tahmini sure
- Gerceklesen sure, basit manuel giris olarak

MVP aksiyonlari:

- Gorev ekleme
- Gorev duzenleme
- Gorev tamamlama
- Liste ve basit kanban gorunumu
- Geciken gorevleri filtreleme

Raporlar:

- Haftalik tamamlanan gorev sayisi
- Duruma gore gorev dagilimi
- Oncelige gore gorev dagilimi
- Proje bazli acik gorevler

MVP disi:

- Team assignee
- Otomatik AI onceliklendirme
- Gelismis time tracking timer

---

### 5. Takvim

**Amac:** Deadline, toplanti, odak blogu ve kisisel etkinlikleri planlamak.

MVP alanlari:

- Baslik
- Baslangic tarihi/saati
- Bitis tarihi/saati
- Tur: meeting, focus, deadline, personal, finance
- Bagli musteri/proje/gorev
- Not

MVP aksiyonlari:

- Etkinlik ekleme
- Etkinlik duzenleme
- Aylik gorunum
- Yaklasan etkinlik listesi

Raporlar:

- Haftalik etkinlik dagilimi
- Odak bloklari / toplantilar orani
- Yaklasan deadline listesi

MVP disi:

- Google Calendar entegrasyonu
- Iki yonlu sync
- AI schedule optimization

---

### 6. Finans

**Amac:** Freelancer'in temel gelir, gider ve nakit akis durumunu takip etmesi.

MVP alanlari:

- Islem tipi: income, expense
- Tutar
- Para birimi
- Tarih
- Kategori
- Bagli musteri
- Bagli proje
- Aciklama
- Odeme durumu: planned, pending, paid, cancelled

MVP aksiyonlari:

- Gelir ekleme
- Gider ekleme
- Islem duzenleme
- Islem silme/arsivleme
- Aylik filtreleme

Raporlar:

- Aylik gelir
- Aylik gider
- Net kazanc
- Musteri bazli gelir
- Proje bazli gelir
- Kategori bazli gider

MVP disi:

- Fatura olusturma
- Vergi hesaplama
- Banka entegrasyonu
- Subscription tracking
- Coklu sirket/hesap

---

### 7. Gunluk Mood / Energy

**Amac:** Freelancer'in kisisel kapasitesini ve is performansiyla iliskisini takip etmek.

MVP alanlari:

- Tarih
- Mood skoru
- Energy skoru
- Kisa not
- Calisma memnuniyeti skoru, opsiyonel

MVP aksiyonlari:

- Gunluk kayit ekleme
- Kayit duzenleme
- Haftalik/aylik trend izleme

Raporlar:

- Mood trend
- Energy trend
- Energy ile tamamlanan gorev iliskisi
- Dusuk enerji gunlerinde geciken gorevler

MVP disi:

- AI duygu analizi
- Otomatik etiketleme
- Klinik/terapötik yorumlar

---

### 8. AI Chatbot

**Amac:** Kullanici, kendi kayitli verileri hakkinda genel sorular sorabilsin.

MVP davranisi:

- Son 7/30 gun gorevleri, projeleri, takvim etkinlikleri, finans kayitlari ve mood/energy verileri context olarak hazırlanır.
- Kullanici basit sorular sorar:
  - "Bu hafta en cok hangi projeye zaman harcamisim?"
  - "Hangi musterilerden odeme bekliyorum?"
  - "Bu ay finansal durumum nasil?"
  - "Geciken islerim neler?"
  - "Enerjim dusukken hangi isler aksamis?"

Teknik yaklasim:

- MVP'de tam vector RAG sart degil.
- Ilk asama: veritabanindan ilgili ozet context olusturup modele gondermek.
- Provider opsiyonlari: Ollama local, OpenAI, Gemini, Groq.

MVP disi:

- Embedding tabanli gelismis RAG
- Modul ici AI butonlari
- Otomatik gorev/proje onerisinde bulunma
- Otomatik finans yorumu
- Otonom aksiyon alma

---

## MVP Disi Birakilacaklar

Asagidaki ozellikler ilk surume alinmayacak:

- Ekip ve rol yonetimi
- Gelismis CRM pipeline
- Teklif ve sozlesme sistemi
- Fatura olusturma
- Banka veya odeme entegrasyonlari
- Dokuman/drive yonetimi
- PDF/PNG export
- Mobil uygulama
- Google Calendar sync
- Modul bazli AI otomasyonlari
- Gelismis RAG/vector search
- Bildirim sistemi

---

## Teknik Mimari Karari

### Onerilen MVP Stack

- **Frontend:** Next.js App Router, React, TypeScript
- **UI:** Poyraz UI, Tailwind CSS v4, Recharts
- **Database:** PostgreSQL
- **Backend/Auth:** Supabase veya self-host edilebilir Supabase alternatifi
- **Local AI opsiyonu:** Ollama
- **Cloud AI opsiyonlari:** OpenAI, Gemini, Groq

### UI Karari

MVP tasarimi Poyraz UI ile light design olarak kurulacak.

Mevcut dark shadcn/Radix agirlikli prototip tasarim sistemi MVP icin referans alinmayacak. Sayfalar Poyraz UI bilesenleri, `poyraz-ui/preset.css` token sistemi ve Poyraz UI semantic renkleri uzerinden yeniden insa edilecek.

Gecis prensipleri:

- Ilk hedef login, register ve sidebar gibi uygulama kabugu ekranlari.
- Daha sonra Faz 2'de her modul kendi CRUD akisi gelistirilirken Poyraz UI'a tasinacak.
- Light design varsayilan olacak.
- Dark mode MVP icin zorunlu degil; Poyraz UI destekledigi icin sonraki fazlarda eklenebilir.
- Eski UI bilesenleri sadece gecici olarak kullanilabilir; yeni sayfa ve moduller Poyraz UI ile yazilacak.

### Neden Server-first?

Mobil uygulama sonraki hedef oldugu icin verinin senkronize olabilecegi merkezi bir backend gerekir. Bu nedenle MVP'de ana kaynak PostgreSQL/Supabase olmali.

Offline/local-first destek daha sonra eklenebilir:

- IndexedDB cache
- Offline draft kayitlari
- Sync queue
- Conflict resolution

MVP'de bu alan mimaride dusunulur, fakat ana risk haline getirilmez.

---

## MVP Veri Modeli

Minimum tablolar:

- `profiles`
- `clients`
- `projects`
- `tasks`
- `calendar_events`
- `finance_transactions`
- `daily_logs`
- `chat_sessions`
- `chat_messages`
- `app_settings`

Temel iliskiler:

- `clients` -> `projects`
- `projects` -> `tasks`
- `clients` -> `finance_transactions`
- `projects` -> `finance_transactions`
- `calendar_events` -> `clients`, `projects`, `tasks` opsiyonel
- `daily_logs` -> kullanici ve tarih
- `chat_messages` -> `chat_sessions`

---

## Faz Plani

### Faz 0: Stabilizasyon

Amac: Mevcut prototipi build edilebilir ve gelistirilebilir hale getirmek.

Isler:

- Build hatalarini gidermek.
- Urun adini netlestirmek: `Cognis`.
- Encoding bozukluklarini temizlemek.
- Mock veri kullanan ekranlari isaretlemek.
- `user_settings` yerine `app_settings` semasini netlestirmek.
- Supabase SQL dosyalarini sira, dokumantasyon ve calistirma kaydi olan bir sisteme oturtmak.
- Mevcut `supabase/schema.sql` dosyasini ilk database baseline olarak kaydetmek.
- Her yeni SQL ekinde ilgili dokumani ve query log kaydini zorunlu hale getirmek.
- MVP disi ekranlari sidebar'dan gecici olarak kaldirmak veya "coming later" durumuna almak.

Kabul kriteri:

- `npm run build` basarili.
- Ana layout, auth ve dashboard sorunsuz acilir.
- MVP kapsamindaki moduller net gorunur.
- Database query sirasi `docs/database/query-order.md` icinde kayitlidir.
- Calistirilan SQL dosyalari `docs/database/query-log.md` icinde takip edilir.
- Ilk baseline olan `supabase/schema.sql` icin aciklayici dokuman vardir.

---

### Faz 1: Veritabani ve Auth

Amac: Freelancer OS icin gercek veri modelini kurmak.

Isler:

- `clients`, `projects`, `tasks`, `calendar_events`, `finance_transactions`, `daily_logs`, `app_settings` tablolarini olusturmak.
- RLS politikalari eklemek.
- Supabase migration dosyalarini repo icine almak.
- Seed/demo data script'i hazirlamak.
- Tek kullanici akisina uygun auth'u sade tutmak.

Kabul kriteri:

- Yeni tablolar Supabase'de calisir.
- Kullanici sadece kendi verisini gorur.
- Demo data ile dashboard beslenebilir.

Faz 1 repo ciktisi:

- Core schema migration: `supabase/migrations/0002_add_freelancer_os_core_tables.sql`
- Demo seed dosyasi: `supabase/seeds/0001_demo_freelancer_os_data.sql`
- Migration dokumani: `docs/database/0002-freelancer-os-core-tables.md`
- Seed dokumani: `docs/database/seed-0001-demo-freelancer-os-data.md`
- Query sirasi kaydi: `docs/database/query-order.md`

Not: SQL dosyalari repo icinde hazirdir. Supabase ortaminda calistirildiktan sonra `docs/database/query-log.md` guncellenmelidir.

---

### Faz 1.5: Poyraz UI Tasarim Sistemi Gecisi

Amac: Mevcut koyu prototip tasarimindan ayrilip uygulama kabugunu Poyraz UI tabanli light design sistemine tasimak.

Isler:

- `poyraz-ui` paketini projeye eklemek.
- Global CSS icinde Poyraz UI preset importunu yapmak: `@import "poyraz-ui/preset.css";`
- Tailwind CSS v4 gereksinimini ve mevcut Tailwind yapisiyla uyumlulugu netlestirmek.
- Poyraz UI light tokenlarini varsayilan tasarim dili olarak ayarlamak.
- Mevcut shadcn/Radix agirlikli dark auth tasarimini Poyraz UI ile degistirmek.
- Login sayfasini Poyraz UI atoms/molecules ile yeniden kurmak.
- Register sayfasini Poyraz UI atoms/molecules ile yeniden kurmak.
- Dashboard shell ve sidebar'i Poyraz UI navigation/organism yaklasimina gore yeniden kurmak.
- Eski dark background, gradient, glow ve agir motion desenlerini uygulama kabugundan kaldirmak.
- Poyraz UI kullanim notlarini proje dokumantasyonuna baglamak.

Kabul kriteri:

- Login light design ile Poyraz UI bilesenleri kullanarak calisir.
- Register light design ile Poyraz UI bilesenleri kullanarak calisir.
- Sidebar ve temel dashboard shell Poyraz UI tasarim diliyle uyumludur.
- Uygulama varsayilan olarak light gorunur.
- `npm run build` basarili olur.

Notlar:

- Bu fazda modul ic sayfalarinin tamamini yeniden tasarlamak zorunlu degildir.
- Modul sayfalari Faz 2'de CRUD gelistirme sirasinda Poyraz UI'a tasinir.
- Poyraz UI rehberi: `poyraz-ui-usage-guide.md`

---

### Faz 2: Core CRUD Modulleri

Amac: Freelancer'in temel operasyon verilerini girebilmesi.

Isler:

- Musteriler CRUD
  - Liste, bos durum, ekleme/duzenleme formu ve detay gorunumu Poyraz UI ile kurulur.
  - Eski CRM/prototip gorsel dili kaldirilir.
- Projeler/side project CRUD
  - Proje kartlari, filtreler, detay paneli ve form akislari Poyraz UI ile kurulur.
  - Musteri projesi ve side project ayrimi UI'da net gosterilir.
- Gorevler CRUD
  - Liste ve basit kanban Poyraz UI bilesenleriyle yeniden tasarlanir.
  - Durum, oncelik, deadline ve proje iliskisi icin Poyraz UI Badge/Form/Select kullanilir.
- Takvim etkinlikleri CRUD
  - Aylik gorunum ve yaklasan etkinlik listesi light design ile kurulur.
  - Etkinlik formu Poyraz UI form bilesenleriyle yazilir.
- Finans islemleri CRUD
  - Gelir/gider listesi, finans kartlari ve islem formu Poyraz UI ile kurulur.
  - Rapor kartlari Poyraz UI StatsCard/Card yaklasimina uygun olur.
- Daily mood/energy CRUD
  - Gunluk kayit formu, trend ozeti ve kayit listesi Poyraz UI ile kurulur.
  - Mood/energy secimleri light, sade ve form odakli olur.

Kabul kriteri:

- Mock data yerine gercek veriler kullanilir.
- Her modulde liste, ekleme, duzenleme ve temel silme/arsivleme vardir.
- Bos durumlar kullaniciyi dogru aksiyona yonlendirir.
- Faz 2 kapsamindaki her yeni/yenilenen modul Poyraz UI bilesenleriyle yazilir.

---

### Faz 3: Dashboard ve Raporlama

Amac: Girilen verileri anlamli grafiklere ve rapor kartlarina donusturmek.

Isler:

- Dashboard KPI kartlari
- Gorev tamamlama grafikleri
- Proje ilerleme grafikleri
- Musteri/proje bazli gelir ozeti
- Gelir/gider/net kazanc grafigi
- Mood/energy trendleri
- Yaklasan deadline ve odeme listeleri

Kabul kriteri:

- Dashboard tamamen gercek veriden beslenir.
- Her MVP modulu en az bir anlamli rapor/grafik sunar.
- Tarih filtresi: bugun, bu hafta, bu ay.

---

### Faz 4: Basit AI Chatbot

Amac: Kullanici kendi freelancer verileri hakkinda soru sorabilsin.

Isler:

- Chat UI'i stabil hale getirmek.
- Provider secimi: Ollama, OpenAI, Gemini, Groq.
- Son 7/30 gun verilerinden context builder yazmak.
- Chat mesajlarini kaydetmek.
- AI cevaplarini "danisma/asistan" sinirinda tutmak.

Kabul kriteri:

- Kullanici kayitli verileri hakkinda soru sorabilir.
- Chatbot en az gorev, proje, musteri, finans ve daily log ozetlerini context olarak kullanir.
- AI calismasa bile uygulamanin temel modulleri calismaya devam eder.

---

### Faz 5: Self-host Hazirligi

Amac: Projeyi acik kaynak ve self-host edilebilir hale getirmek.

Isler:

- `.env.example` hazirlamak.
- Kurulum dokumani yazmak.
- Migration calistirma adimlarini belgelemek.
- Docker Compose opsiyonunu degerlendirmek.
- Demo kullanici/demo data akisi eklemek.

Kabul kriteri:

- Yeni bir gelistirici dokumana bakarak projeyi ayaga kaldirabilir.
- Harici AI servisleri opsiyonel kalir.
- Local Ollama ile temel AI deneyimi mumkundur.

---

## MVP Sonrasi Fazlar

### Faz 6: Freelancer Business OS

- Teklifler
- Sozlesmeler
- Fatura olusturma
- Odeme takip otomasyonlari
- Vergi/kar tahmini
- Abonelik ve masraf yonetimi

### Faz 7: Gelismis CRM

- Lead pipeline
- Musteri aktiviteleri
- Follow-up hatirlatmalari
- Musteri degeri ve risk raporlari

### Faz 8: Gelismis AI

- Embedding tabanli RAG
- Modul ici AI onerileri
- Akilli onceliklendirme
- Finansal yorumlama
- Takvim optimizasyonu
- Proje risk tahmini

### Faz 9: Mobil ve Sync

- Mobil uygulama
- Offline cache
- Push notification
- Takvim ve gorev sync
- Local-first deneyim iyilestirmeleri

---

## MVP Basari Kriterleri

MVP basarili sayilirsa:

- Freelancer gunluk islerini, musterilerini, projelerini, side project'lerini ve temel finansini tek yerde takip edebilir.
- Dashboard gercek verilerle anlamli haftalik/aylik raporlar sunar.
- Kullanici uygulamayi self-host edebilir.
- AI chatbot opsiyonel ama kullanisli bir danisma katmani olarak calisir.
- Uygulama tek kullanici icin guvenilir ve build edilebilir durumdadir.
