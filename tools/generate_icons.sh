#!/bin/bash
set -e

ICON_SIZES=(16 32 48 96 128)
ICON_SRC="src/images/icon.png"

echo "Generating icons of required sizes..."

# Генерируем иконки нужных размеров
for size in "${ICON_SIZES[@]}"; do
  if [ ! -f "src/images/icon-${size}.png" ]; then
    ffmpeg -y -i "$ICON_SRC" -vf scale=${size}:${size} "src/images/icon-${size}.png" 2> /dev/null || echo "ffmpeg not found, skipping icon generation"
  fi
done

echo "Generated"
