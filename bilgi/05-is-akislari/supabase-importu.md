---
tur: is-akisi
durum: legacy
guncellendi: 2026-09-02
guven: yuksek
kaynaklar:
  - apps/neta-app/scripts/import-supabase.mjs
  - apps/neta-app/scripts/lib/supabase-import.mjs
  - docs/self-hosted-redesign/phase-8-import-release.md
ilgili:
  - "[[03-mimari/veri-kaliciigi|Veri kalıcılığı]]"
  - "[[08-operasyon/yayin-hazirligi|Yayın hazırlığı]]"
etiketler:
  - neta
  - is-akisi
  - legacy
  - supabase
---

# Legacy Supabase importu

## Amaç

Eski Neta kurulumundan hazırlanmış offline export bundle'ını Supabase'e runtime bağlantısı kurmadan yeni SQLite/local-filesystem instance'a taşımak.

## Önkoşullar

Yeni instance'ta owner Better Auth hesabı oluşturulmuştur. Export bundle canonical formata ve checksum manifestine sahiptir. Production cutover öncesi mevcut instance backup'ı alınır.

## Akış

1. Legacy sistemi backup/read-only hazırlığına al.
2. Export bundle'ı güvenli disk alanına üret ve checksum'ları doğrula.
3. `db:import:supabase -- --from ... --owner-user-id ... --dry-run` çalıştır.
4. Normalization, satır/file sayısı, eşleme ve hata raporunu incele.
5. Yeni instance'ın pre-import backup'ını al.
6. Aynı komutu dry-run olmadan çalıştır.
7. Idempotent tekrar, kayıt/file/checksum ve kritik owner/client akışlarını doğrula.
8. Cutover sonrası rollback penceresi boyunca legacy sistemi read-only koru.

## Bilinçli olarak taşınmayanlar

Supabase Auth password hash'leri ve session'ları. Client hesapları yeniden davet edilir.

## Güvenlik

Bundle PII ve dosya içerir; geçici export alanı, loglar ve raporlar secret/PII minimizasyonu ile korunmalıdır. Source path dışına kaçış ve checksum mismatch reddedilir.

## Durum açıklaması

Bu bir legacy migration capability'sidir; Supabase aktif runtime dependency'si değildir.

## Kaynaklar

- [[docs/self-hosted-redesign/phase-8-import-release]]
- `apps/neta-app/scripts/lib/supabase-import.mjs`
