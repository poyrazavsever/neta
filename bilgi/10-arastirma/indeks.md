---
tur: arastirma
durum: arastirma
guncellendi: 2026-09-03
guven: yuksek
kaynaklar:
  - docs/roadmaps/platform-master-plan.md
  - bilgi/00-sistem/acik-sorular.md
ilgili:
  - "[[00-sistem/acik-sorular|Açık sorular]]"
  - "[[06-kararlar/karar-kaydi|Karar kaydı]]"
etiketler:
  - neta
  - arastirma
---

# Araştırma indeksi

Bu alan henüz Neta ürün/mimari kararı olmayan incelemeler içindir. Araştırma bulgusu sessizce “mevcut”e dönüşmez; kabul edilirse [[06-kararlar/karar-kaydi|karar indeksine]] eklenen bağımsız bir ADR'ye ve ilgili domain/mimari sayfasına bağlanır.

## Öncelikli araştırma kuyrukları

1. **Mobil auth karşılaştırması:** Dynamic-origin Better Auth native cookie ile ADR-0018 pairing'in revoke, restore, CSRF/origin, client role ve store operasyonu karşılaştırması.
2. **SQLite operasyon limiti:** Gerçek Neta workload'unda concurrency, backup süresi, DB büyümesi ve disk doluluğu eşikleri.
3. **Backup standardı:** Age/SOPS/restic benzeri host-level encryption, off-site target, RPO/RTO ve doğrulanabilir restore.
4. **Mobil instance UX:** Domain/QR onboarding, TLS hatası, instance identity değişimi ve phishing önleme.
5. **AI veri güvenliği:** Provider bazlı retention/privacy, prompt minimizasyonu, secret rotation ve local Ollama isolation.
6. **Upload hardening:** Decode/re-encode, metadata stripping, image bomb ve AV/content-disarm tradeoff'u.
7. **Self-host dağıtım platformları:** Docker Compose, Coolify ve Dokploy için volume/TLS/backup güvenlik matrisi.

## Yeni araştırma eklerken

`bilgi/sablonlar/arastirma.md` kullan. Soruyu, kapsam dışını, kanıtı, Neta'ya etkisini, belirsizliği ve karar önerisini ayrı tut. Dış varlık varsa önce `bilgi/ham/`, sonra [[11-kaynaklar/indeks|kaynak notu]] oluştur.

## Mevcut durum

İlk bootstrap'ta dış araştırma yapılmadı; bu sayfa repository içindeki doğrulanmış karar açıklarından üretilmiş araştırma backlog'udur.
