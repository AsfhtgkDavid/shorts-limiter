#!/bin/bash

# YouTube Shorts Limiter - Build Script

set -e

ICON_SIZES=(16 32 48 96 128)
ICON_SRC="src/images/icon.png"

echo "Generating icons of required sizes..."

# Генерируем иконки нужных размеров
for size in "${ICON_SIZES[@]}"; do
  if [ ! -f "src/images/icon-${size}.png" ]; then
    ffmpeg -y -i "$ICON_SRC" -vf scale=${size}:${size} "src/images/icon-${size}.png" 2>/dev/null || echo "ffmpeg not found, skipping icon generation"
  fi
done

echo "Creating ZIP archive for extension..."

# Создаем временную папку
rm -rf dist
mkdir -p dist

deno -A build.ts

# Создаем ZIP архив
cd dist
zip -r ../youtube-shorts-limiter.zip * 2>/dev/null
cd ..

echo "Done! Created file: youtube-shorts-limiter.zip"
echo ""
echo "For Firefox installation:"
echo "1. Rename .zip to .xpi"
echo "2. Open about:addons in Firefox"
echo "3. Click the gear icon and select 'Install Add-on From File'"
echo "4. Select the created .xpi file" 