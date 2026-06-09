#!/bin/bash

# Neta - Freelancer Operating System Installation Script

set -e

echo "🚀 Neta kurulumu başlıyor..."

# 1. Check for Git
if ! [ -x "$(command -v git)" ]; then
  echo "Hata: Git yüklü değil. Lütfen önce Git'i kurun." >&2
  exit 1
fi

# 2. Check for Docker
if ! [ -x "$(command -v docker)" ]; then
  echo "Hata: Docker yüklü değil. Lütfen önce Docker'ı kurun." >&2
  exit 1
fi

# 3. Target directory
TARGET_DIR="neta-os"

if [ -d "$TARGET_DIR" ]; then
  echo "Hata: '$TARGET_DIR' dizini zaten var. Lütfen farklı bir dizinde deneyin veya mevcut dizini silin." >&2
  exit 1
fi

# 4. Clone repository
echo "📦 GitHub'dan kodlar indiriliyor..."
git clone https://github.com/poyrazavsever/neta.git "$TARGET_DIR"
cd "$TARGET_DIR"

# 5. Setup environment variables
echo "⚙️ Çevresel değişkenler ayarlanıyor..."
if [ -f ".env.example" ]; then
  cp .env.example .env.local
else
  echo "Uyarı: .env.example dosyası bulunamadı."
fi

# 6. Start with Docker Compose
echo "🐳 Docker container'ları inşa ediliyor ve başlatılıyor..."
if docker compose version > /dev/null 2>&1; then
  docker compose up -d --build
elif docker-compose version > /dev/null 2>&1; then
  docker-compose up -d --build
else
  echo "Hata: docker-compose komutu bulunamadı." >&2
  exit 1
fi

echo ""
echo "✅ Kurulum tamamlandı!"
echo "Neta başarıyla ayağa kaldırıldı."
echo "Tarayıcınızdan http://localhost:3000 adresine giderek Neta'yı kullanmaya başlayabilirsiniz."
echo "İlk girişte oluşturacağınız hesap, sistemin tek yöneticisi (admin) olacaktır."
