#!/bin/bash

# Build DMG installers on macOS
# This script should be run on a Mac to create proper DMG files

echo "🍎 Building macOS DMG installers..."
echo "Note: This script must be run on macOS"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script must be run on macOS to build DMG files"
    echo "💡 On other platforms, use the ZIP files instead"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "💡 Install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building macOS DMG installers..."
npm run build:mac

echo "✅ Build complete!"
echo ""
echo "📁 Generated files:"
echo "   • My Electron App-1.0.0-mac.zip (Intel Macs)"
echo "   • My Electron App-1.0.0-arm64-mac.zip (Apple Silicon)"
echo "   • My Electron App-1.0.0.dmg (Intel DMG - if successful)"
echo "   • My Electron App-1.0.0-arm64.dmg (Apple Silicon DMG - if successful)"
echo ""
echo "🚀 Ready for distribution!"
