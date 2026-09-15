---
tur: bilesen
durum: mevcut
guncellendi: 2026-09-02
guven: orta
kaynaklar:
  - tools/desktop-assistant/main.pyw
  - tools/desktop-assistant/requirements.txt
ilgili:
  - "[[03-mimari/monorepo|Monorepo]]"
etiketler:
  - neta
  - bilesen
  - arac
---

# desktop-assistant

## Rol

`tools/desktop-assistant`, pnpm ürün workspace'inin dışında tutulan Python masaüstü yardımcı aracıdır. `requests`, clipboard/input automation, SymPy, Pillow ve PyMuPDF gibi bağımlılıklar kullanır.

## Güven seviyesi notu

Bu bileşenin ürün sözleşmesi ve bakım sahibi hakkında ayrı README/ADR bulunmadığı için amaç ayrıntısı orta güvenlidir. Kod incelemesi yapılmadan ana Neta runtime veya desteklenen ürün capability'si kabul edilmemelidir.

## Sınırlar

- `apps/*` veya `packages/*` pnpm workspace'ine dahil değildir.
- Self-hosted app Docker image'ına girmez.
- Canonical backend değildir.
- OS input/clipboard automation kullandığı için çalıştırıldığı hostta ayrı güven değerlendirmesi gerekir.

## Açık ihtiyaç

Araç aktif olarak dağıtılıyorsa amacı, desteklenen platformları, veri/telemetry davranışını ve güvenli kullanımını anlatan kısa bir canonical README eklenmelidir.

## Kaynaklar

- `tools/desktop-assistant/main.pyw`
- `tools/desktop-assistant/requirements.txt`
