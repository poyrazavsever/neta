# 📊 Mood Tracker App — Product Requirements Document (PRD)

## 1. Ürün Tanımı
Mood Tracker, kullanıcıların günlük ruh hali ve enerji seviyelerini kaydetmesini sağlayan, bu verileri grafiklere dönüştüren minimal bir veri görselleştirme uygulamasıdır.

## 2. Hedefler
- Günlük mood verisi toplamak
- Veriyi line chart, heatmap ve pie chart ile görselleştirmek
- Basit ama şık bir dashboard sunmak

## 3. Hedef Kullanıcı
- Veri görselleştirme dersi öğrencileri
- Ruh hali takibi yapmak isteyen kullanıcılar
- Minimal dashboard uygulamalarını seven kullanıcılar

## 4. Özellikler

### 4.1 Günlük Mood Girişi
Kullanıcı her gün:
- Tarih seçer
- Ruh hali seçer:
  - 🙂 Mutlu
  - 😐 Nötr
  - 😞 Üzgün
  - 😡 Sinirli
- Enerji seviyesini 1-5 arasında belirler

### 4.2 Dashboard
Dashboard üzerinde:
- Ruh hali zaman içindeki değişimi
- Haftalık duygu yoğunluğu
- Genel mood dağılımı gösterilir

## 5. Veri Modeli

```json
{
  "id": "uuid",
  "date": "2026-04-27",
  "mood": "happy",
  "mood_score": 4,
  "energy": 3
}
```

## 6. Mood Mapping

```json
{
  "happy": 4,
  "neutral": 3,
  "sad": 2,
  "angry": 1
}
```

## 7. Görselleştirme Yapısı

### Line Chart
- X ekseni: Gün
- Y ekseni: Mood score
- Ek çizgi: Enerji seviyesi

### Heatmap
- X ekseni: Haftanın günleri
- Y ekseni: Haftalar
- Renk yoğunluğu: Mood score

### Pie Chart
- Mood kategorilerinin yüzdelik dağılımı

## 8. Insight Alanı
Uygulama basit analiz cümleleri üretir:

'''txt
Son 7 günde genel ruh halin pozitif görünüyor.
Enerji seviyen hafta ortasında düşüş gösteriyor.
En mutlu olduğun günler hafta sonları.
'''

## 9. Teknik Gereksinimler

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion

### Chart Library
- Recharts veya Chart.js

### Veri Saklama
- MVP için LocalStorage
- Gelişmiş sürüm için Supabase

## 10. MVP Kapsamı

Dahil:
- Mood seçimi
- Enerji seviyesi seçimi
- LocalStorage kayıt
- Line chart
- Pie chart
- Basit insight

Dahil değil:
- Kullanıcı girişi
- Cloud sync
- Bildirim sistemi
- Sosyal paylaşım

## 11. Kullanıcı Akışı

1. Kullanıcı uygulamayı açar
2. Günlük ruh halini seçer
3. Enerji seviyesini belirler
4. Kaydet butonuna basar
5. Dashboard grafiklerle güncellenir
6. Insight mesajı gösterilir

## 12. Gelecek Geliştirmeler

- AI destekli yorumlama
- Haftalık PDF rapor
- Dark mode
- Bildirim sistemi
- Takvim görünümü

## 13. Projenin Veri Görselleştirme Değeri

Bu proje:
- Zaman serisi analizi
- Kategorik dağılım analizi
- Yoğunluk haritası

gibi temel veri görselleştirme tekniklerini içerir.

## 14. Sonuç

Mood Tracker; basit veri yapısı, estetik arayüzü ve anlamlı grafik çıktılarıyla veri görselleştirme dersi için ideal bir mini uygulamadır.