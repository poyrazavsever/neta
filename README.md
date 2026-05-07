<div align="center">
  <img src="public/logo/logo.png" alt="Cognis Logo" width="160" />

  # Cognis

  AI Destekli Kişisel Yaşam ve Planlama Dashboard'u. Premium ve modern bir deneyim ile günlüklerinizi tutun, görevlerinizi planlayın ve yapay zeka ile sohbet edin.

  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-111827?style=for-the-badge&logo=nextdotjs" />
    <img alt="React" src="https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
    <img alt="Supabase" src="https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  </p>
</div>

## Proje Özeti

Cognis, kullanıcıların yaşamlarını organize edebilecekleri ve yapay zeka entegrasyonuyla kişisel analizler elde edebilecekleri yeni nesil bir yaşam kontrol panelidir. 

Önceki "Mood Tracker MVP" yapısı temel alınarak; tam kimlik doğrulama (Supabase), premium dark mode arayüzü ve akıllı görev yönetimi ile baştan aşağı modern bir şekilde yeniden geliştirilmiştir.

## Temel Özellikler

- **Güvenli Kimlik Doğrulama:** Supabase entegrasyonu ile korunan Kayıt Ol / Giriş Yap sistemi.
- **Kişiselleştirilmiş Dashboard:** Ruh hali, enerji durumu ve yapay zeka etiketlerini görselleştiren interaktif grafikler (Recharts).
- **Akıllı Günlük (Journal):** Yapay zeka ile günlüklerinizden duygu durumu analizi ve içgörüler çıkarma.
- **Görev Yönetimi:** Günlüklerinizden otomatik olarak yapay zeka yardımıyla görevler oluşturabilme.
- **Kişisel AI Asistan:** Hedefleriniz ve duygusal durumunuz hakkında yapay zeka ile konuşabileceğiniz özel sohbet arayüzü.
- **Premium Dark Mode:** Göz yormayan, derin siyah-mor tonlarıyla harmanlanmış şık, modern ve "Glassmorphism" destekli arayüz tasarımı.

## Kullanılan Teknolojiler

| Teknoloji | Amaç |
| --- | --- |
| **Next.js 15 (App Router)** | Tam full-stack React framework'ü ve yönlendirme mimarisi |
| **Supabase** | Veritabanı (PostgreSQL), Auth, Row Level Security (RLS) ve Storage (Profil fotoğrafları) |
| **Tailwind CSS & Shadcn UI** | Gelişmiş, esnek stil yönetimi ve modern UI bileşenleri |
| **Yapay Zeka API'leri** | (Groq / Gemini) AI analizleri, metin özetleme ve kişisel asistan özellikleri |
| **Dexie.js** | Tarayıcı tarafı hızlı lokal veritabanı önbelleklemesi |

## Kurulum

Projeyi bilgisayarınızda çalıştırmak için Node.js ve pnpm (veya npm) kurulu olmalıdır.

1. Bağımlılıkları yükleyin:
```bash
pnpm install
```

2. `.env.local` dosyasını oluşturun ve Supabase ile AI anahtarlarınızı girin:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GROQ_API_KEY=your-groq-key
```

3. Geliştirme ortamını başlatın:
```bash
pnpm dev
```

Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

## Veritabanı Yapısı (Supabase)

Cognis, veri güvenliği için katı **Row Level Security (RLS)** kuralları kullanır. Kullanıcılar sadece kendi verilerine erişebilir.
Ana tablolar:
- `profiles`: Kullanıcı ayarları, isim, soyisim ve avatar URL bilgileri.
- `journals`: Kullanıcıya ait ruh hali ve enerji metrikli günlük kayıtları.
- `tasks`: Kullanıcının manuel olarak eklediği veya AI ile otomatik oluşturulan görevler.
- `chats`: AI ile yapılan geçmiş sohbet oturumları.

Veritabanını projenize entegre etmek için `supabase/schema.sql` dosyasındaki SQL kodlarını Supabase Dashboard > SQL Editor üzerinden çalıştırmanız yeterlidir.
