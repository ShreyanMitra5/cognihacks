#!/bin/bash

# Spotify Tab Player Chrome Extension Installer
# This script helps you install the extension in Chrome

echo "🎵 Spotify Tab Player Chrome Extension Installer"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found!"
    echo "Please run this script from the extension directory."
    exit 1
fi

echo "✅ Found extension files"
echo ""

# Check if Chrome is installed
if command -v google-chrome &> /dev/null; then
    CHROME_CMD="google-chrome"
elif command -v chromium-browser &> /dev/null; then
    CHROME_CMD="chromium-browser"
elif command -v chrome &> /dev/null; then
    CHROME_CMD="chrome"
else
    echo "❌ Error: Chrome/Chromium not found!"
    echo "Please install Google Chrome or Chromium first."
    exit 1
fi

echo "✅ Found Chrome/Chromium: $CHROME_CMD"
echo ""

# Get the current directory
EXTENSION_PATH=$(pwd)
echo "📁 Extension path: $EXTENSION_PATH"
echo ""

echo "📋 Installation Instructions:"
echo "============================"
echo ""
echo "1. Open Chrome and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select this directory: $EXTENSION_PATH"
echo "5. The extension should appear in your extensions list"
echo "6. Click the extension icon in your toolbar"
echo "7. Click 'Connect Spotify' to authenticate"
echo ""

# Ask if user wants to open Chrome extensions page
read -p "Would you like to open the Chrome extensions page now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Opening Chrome extensions page..."
    $CHROME_CMD "chrome://extensions/"
fi

echo ""
echo "🎉 Installation guide complete!"
echo ""
echo "📚 For more information, see README.md"
echo "🐛 For troubleshooting, check the console in Chrome DevTools"
echo ""
echo "Happy listening! 🎧"
