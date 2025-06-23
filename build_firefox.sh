#!/bin/bash

# YouTube Shorts Limiter - Build Script

set -e

echo "Creating XPI archive for extension..."

# Создаем временную папку
rm -rf dist
mkdir -p dist

deno -A build.ts

# Создаем ZIP архив
cd dist
rm manifest.chrome.json
mv manifest.firefox.json manifest.json
zip -r ../youtube-shorts-limiter.xpi * 2>/dev/null
cd ..

echo "Done! Created file: youtube-shorts-limiter.xpi"
echo ""
echo "For Firefox installation:"
echo "1. Open about:addons in Firefox"
echo "2. Click the gear icon and select 'Install Add-on From File'"
echo "3. Select the created .xpi file"