# MindSpace Proje Yol Haritası (Roadmap)

Bu doküman, `PRD.md` gereksinimlerinin **Supabase**, **Gemini API** ve **Shadcn UI** kullanılarak uygulanması için detaylı, faz bazlı geliştirme planını içermektedir.

---

## Faz 1: Proje Kurulumu ve Altyapı
**Amacı:** Geliştirme ortamının hazırlanması, UI bileşen sisteminin kurulması ve veritabanı / yetkilendirme (Auth) altyapısının Supabase ile entegre edilmesi.

1. **Next.js Kurulumu**
   - Next.js (App Router), React 19, TypeScript ve Tailwind CSS kullanılarak projenin başlatılması.
   - Dizin yapısının oluşturulması (`src/app`, `src/components`, `src/lib`, `src/hooks`).
2. **Shadcn UI ve Stil Entegrasyonu**
   - Shadcn UI CLI ile başlatılması.
   - Temel bileşenlerin (Button, Card, Input, Label, Dialog, Form, Toast vb.) eklenmesi.
   - `next-themes` kullanılarak Dark/Light mod geçişinin ayarlanması (Varsayılan olarak Dark Mode ağırlıklı tasarım).
3. **Supabase Proje Kurulumu**
   - Supabase projesinin oluşturulması ve API key'lerin `.env.local` dosyasına eklenmesi.
   - `@supabase/ssr` veya `@supabase/supabase-js` ile client ve server bileşenleri için istemcilerin oluşturulması.
4. **Veritabanı Şemasının Oluşturulması (Supabase SQL)**
   - `users` tablosu (Supabase Auth ile senkronize çalışacak yapı).
   - `journals` tablosu: Kullanıcının günlükleri (id, user_id, date, mood, energy, content, ai_tags, ai_sentiment_score, ai_summary vb.).
   - `tasks` tablosu: Görev yönetimi (id, user_id, title, description, status, source_journal_id).
   - `chat_sessions` ve `chat_messages` tabloları (Geçmiş sohbetleri tutmak için).
5. **Kimlik Doğrulama (Authentication)**
   - Supabase Auth kullanılarak Email/Şifre ile kayıt olma (Register) ve giriş yapma (Login) sayfalarının geliştirilmesi.
   - Auth middleware ile yetkisiz kullanıcıların Dashboard'a erişiminin engellenmesi.

---

## Faz 2: Dashboard ve Temel Düzen (Layout)
**Amacı:** Kullanıcının giriş yaptığında karşılaşacağı ana navigasyon ve dashboard iskeletinin modern bir görünümle inşa edilmesi.

1. **Ana Layout ve Navigasyon**
   - Masaüstü için sol veya üst menü bar (Sidebar/Navbar).
   - Menü linkleri: Dashboard, Günlük, Görevler, Sohbet, Ayarlar.
   - Responsive tasarım ile mobilde hamburger menü yapısı.
2. **Dashboard İskeleti**
   - CSS Grid/Flexbox kullanarak kartların yerleşimi.
   - Profil bilgisi ve Çıkış Yap butonu içeren bir üst bilgi (header) alanı.
3. **Boş Durum (Empty State) Yönetimi**
   - Kullanıcının henüz günlüğü, görevi veya AI analizi yoksa gösterilecek yönlendirici ve estetik bileşenlerin tasarlanması (örn. "Henüz veri yok, ilk günlüğünü yaz").

---

## Faz 3: Günlük (Journal) ve Görev (Task) Modülleri
**Amacı:** Kullanıcının duygu, enerji ve günlük notlarını yazabilmesi, ayrıca manuel olarak görev ekleyip takip edebilmesi.

1. **Günlük (Journal) Modülü**
   - **Oluşturma Ekranı:** Günlük yazma formu. Shadcn form bileşenleriyle validasyon sağlanması.
   - **Mood & Enerji Seçimi:** Buton grupları veya slider kullanılarak duygu durumu ve enerji (1-5) seçimi.
   - **Listeleme:** Kaydedilen günlüklerin tarih sırasına göre listelenmesi.
   - **Detay Görünümü:** Seçilen günlüğün tam sayfa veya modal içinde okunması, silinmesi ve düzenlenmesi.
2. **Görev (Task) Modülü**
   - **Görev Ekleme:** Basit başlık ve detay içeren görev ekleme formu.
   - **Görev Durumu:** "Todo", "In Progress", "Completed" durumlarının listelenmesi ve checkbox veya sürükle bırak tarzında güncellenmesi.
   - **Günlükle İlişkilendirme:** Görevlerin varsa kaynak günlük ID'sini göstermesi.

---

## Faz 4: Gemini API Entegrasyonu (AI Analizi)
**Amacı:** Kullanıcının girdiği günlük metninin Google Gemini API ile analiz edilip etiketler, duygu skoru, özet ve görev önerileri üretmesi.

1. **Gemini API Kurulumu**
   - `@google/generative-ai` SDK'sının projeye dahil edilmesi.
   - API Key'in `.env.local` içinde güvenli yapılandırılması.
2. **Analiz Endpoint'inin Geliştirilmesi**
   - `POST /api/analyze-journal` gibi bir route oluşturularak, kullanıcının günlüğünün modele gönderilmesi.
   - **Prompt Engineering:** Gemini'ye gönderilecek prompt'un, yanıtın stabil bir JSON formatında (tags, sentiment_score, summary, reflection, suggested_tasks) dönmesini garantileyecek şekilde tasarlanması.
3. **Veritabanı ve UI Entegrasyonu**
   - Dönen AI analiz sonuçlarının Supabase'deki `journals` tablosuna (ai_tags, ai_summary vb.) Update edilmesi.
   - Günlük detay ekranında AI analiz sonucunun görsel bir kart olarak sunulması.
4. **Görev Önerileri (Suggested Tasks) Akışı**
   - AI'ın günlüğe bakarak çıkardığı görev önerilerinin kullanıcıya sunulması ("Bunu görev listene eklemek ister misin?").
   - Onaylanan önerilerin `tasks` tablosuna kaydedilmesi.

---

## Faz 5: Dashboard Veri Görselleştirme
**Amacı:** Toplanan verilerin (mood, enerji, etiketler) grafikler yardımıyla analiz edilmesi ve özetlerin sunulması.

1. **Recharts Entegrasyonu ve Veri Hazırlama**
   - Recharts kütüphanesinin eklenmesi.
   - Supabase'den son 7 ve 30 güne ait verilerin çekilip grafiklere uygun formata dönüştürülmesi.
2. **Mood ve Enerji Trend Grafikleri**
   - Günlere göre duygu skorları ve enerji (1-5) seviyesini gösteren çizgi veya bar grafikleri.
3. **Etiket Dağılımı Grafiği**
   - AI tarafından en çok oluşturulan etiketlerin pasta (Pie) veya yatay çubuk (Bar) grafik ile gösterilmesi.
4. **Dashboard Özet Kartları**
   - "Son Günlüklerin", "Aktif Görevlerin" ve "Haftalık AI İçgörüsünün" özet widget'lar halinde Dashboard ekranında sergilenmesi.

---

## Faz 6: AI Chat Modülü (Sohbet)
**Amacı:** Kullanıcının geçmiş günlüklerini bağlam olarak sunup, bir "Dijital Yansıma Asistanı" (Gemini) ile sohbet etmesi.

1. **Sohbet UI Tasarımı**
   - Shadcn UI ile scrollable mesaj listesi, kullanıcı giriş alanı ve mesaj baloncuklarının tasarlanması.
2. **Bağlam (Context) Yönetimi**
   - Kullanıcı bir soru sorduğunda, Supabase'den son X günlüğün veya içeriğe uygun günlüklerin çekilerek Gemini API'ye sistem mesajı/context olarak verilmesi.
3. **Sohbet Akışı ve Veri Kaydı**
   - Gemini API üzerinden yanıtların tercihen "stream" (akış) yöntemiyle hızlıca UI'da gösterilmesi.
   - Tamamlanan konuşmaların `chat_sessions` ve `chat_messages` tablolarına kaydedilerek, sayfa yenilendiğinde eski sohbetin görünmesinin sağlanması.
4. **Güvenlik ve Sınırlar**
   - Prompt seviyesinde Gemini'ye "Tıbbi veya klinik tavsiye verme, sadece yansıtıcı ol" komutunun sıkıca verilmesi.
