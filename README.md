# Mood Tracker MVP

Mood Tracker, gunluk ruh hali ve enerji seviyesini kaydedip basit grafiklerle
gorsellestiren minimal bir veri gorsellestirme uygulamasidir.

## Ozellikler

- Gunluk tarih, ruh hali ve enerji seviyesi girisi
- Ayni tarih icin mevcut kaydi guncelleme
- Tarayici `localStorage` uzerinde veri saklama
- Mood score ve enerji icin line chart
- Mood kategorileri icin pie chart
- Basit kuralli insight mesajlari
- Mobil uyumlu tek sayfalik dashboard

## Teknolojiler

- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion

## Kurulum

```bash
npm install
```

## Gelistirme

```bash
npm run dev
```

Uygulama varsayilan olarak `http://localhost:3000` adresinde calisir.

## Production Build

```bash
npm run build
npm run start
```

## MVP Kapsami

Dahil:

- Mood secimi
- Enerji seviyesi secimi
- LocalStorage kayit
- Line chart
- Pie chart
- Basit insight

Dahil degil:

- Kullanici girisi
- Cloud sync
- Bildirim sistemi
- Sosyal paylasim
- PDF rapor
- AI destekli yorumlama
- Dark mode
- Heatmap

## Veri Modeli

```ts
type MoodEntry = {
  id: string;
  date: string;
  mood: "happy" | "neutral" | "sad" | "angry";
  mood_score: 4 | 3 | 2 | 1;
  energy: 1 | 2 | 3 | 4 | 5;
};
```
