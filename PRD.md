# 📊 Mood Tracker App — Product Requirements Document (PRD)

## 1. 🧩 Ürün Tanımı (Overview)
Mood Tracker, kullanıcıların günlük ruh hali ve enerji seviyelerini kaydetmelerini sağlayan, bu verileri anlamlı ve estetik grafiklere dönüştüren minimal bir veri görselleştirme uygulamasıdır.

Amaç:  
Kullanıcının duygu durumunu zaman içinde analiz etmesini sağlamak ve veri görselleştirme tekniklerini şık bir UI ile sunmak.

---

## 2. 🎯 Hedefler (Goals)

### Ana Hedefler
- Günlük mood verisi toplamak
- Veriyi görselleştirmek (trend + dağılım + yoğunluk)
- Basit ama estetik bir dashboard sunmak

### Başarı Kriterleri
- Kullanıcı 5 saniye içinde veri girişi yapabilmeli
- Grafikler anında güncellenmeli
- UI “clean & modern” hissi vermeli

---

## 3. 👤 Hedef Kullanıcı (Target User)

- Öğrenciler (veri görselleştirme dersi)
- Kendi alışkanlıklarını takip etmek isteyen bireyler
- Minimal uygulama deneyimi isteyen kullanıcılar

---

## 4. ✨ Özellikler (Features)

### 4.1 Günlük Mood Girişi
Kullanıcı:
- Gün seçer (default: bugün)
- Mood seçer:
  - 🙂 Mutlu
  - 😐 Nötr
  - 😞 Üzgün
  - 😡 Sinirli
- Enerji seviyesi seçer (1–5)

#### UI:
- Büyük emoji butonlar
- Slider veya pill selector (enerji)

---

### 4.2 Dashboard (Veri Görselleştirme)

#### 📈 Line Chart (Zaman Serisi)
- X: Gün
- Y: Mood değeri (sayısal map)
  - 🙂 = 4
  - 😐 = 3
  - 😞 = 2
  - 😡 = 1

Ek:
- Enerji seviyesi secondary line olabilir

---

#### 🔥 Heatmap (Haftalık Yoğunluk)
- X: Günler (Pzt–Paz)
- Y: Haftalar
- Renk: Mood yoğunluğu

Örnek:
- Yeşil = pozitif
- Kırmızı = negatif

---

#### 🥧 Pie Chart (Genel Dağılım)
- Mood yüzdelik dağılımı
- Kaç gün hangi mood seçilmiş

---

### 4.3 Insight (Basit AI hissi)
Sistem otomatik yorum üretir:

Örnek:
- “Son 7 günde genelde mutlusun 🙂”
- “Enerjin hafta ortasında düşüyor”
- “En stresli günün Pazartesi 😡”

---

## 5. 🧱 Veri Modeli (Data Model)

```json
{
  "id": "uuid",
  "date": "2026-04-27",
  "mood": "happy",
  "mood_score": 4,
  "energy": 3
}