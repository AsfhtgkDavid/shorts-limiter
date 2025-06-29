#!/bin/bash

# YouTube Shorts Limiter - Build Script

set -e

echo "Creating CRX archive for extension..."

rm -rf dist
mkdir -p dist

deno -A build.ts

cd dist
rm manifest.firefox.json
mv manifest.chrome.json manifest.json
zip -r ../youtube-shorts-limiter.zip * 2>/dev/null
cd ..

echo "Done! Created file: youtube-shorts-limiter.zip"
echo ""
echo "For Chromium installation:"
echo "1. Open chrome:extensions"
echo "2. Enable developer mode"
echo "3. Click load unpacked"
echo "4. Select dist folder"
echo ""