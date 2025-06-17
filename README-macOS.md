# My Electron App - macOS Installation Guide

## 📦 Available Downloads

Your macOS app is available in two formats:

### 🔄 ZIP Files (Ready to Use)
- **Intel Macs (x64)**: `My Electron App-1.0.0-mac.zip` (94MB)
- **Apple Silicon (M1/M2/M3)**: `My Electron App-1.0.0-arm64-mac.zip` (89MB)

### 💿 DMG Installers (macOS Only)
DMG files can only be built on macOS. To create DMG installers:

1. Download this project on a Mac
2. Run: `npm install`
3. Run: `npm run build:mac`

## 🚀 Installation Instructions

### Option 1: ZIP Installation (Recommended)
1. Download the appropriate ZIP file for your Mac:
   - **Intel Mac**: Download `My Electron App-1.0.0-mac.zip`
   - **Apple Silicon Mac**: Download `My Electron App-1.0.0-arm64-mac.zip`

2. Double-click the ZIP file to extract it
3. Drag `My Electron App.app` to your Applications folder
4. Launch the app from Applications or Launchpad

### Option 2: Direct Launch
1. Extract the ZIP file
2. Right-click on `My Electron App.app`
3. Select "Open" (you may need to do this twice for unsigned apps)

## 🔒 Security Notes

Since the app is not code-signed, macOS may show security warnings:

1. **"App can't be opened"**: Right-click → Open → Open
2. **Gatekeeper warning**: System Preferences → Security & Privacy → Allow
3. **First launch**: You may need to right-click and select "Open"

## ✨ Features

- ✅ Universal app (works on Intel and Apple Silicon Macs)
- ✅ Auto-updates (when connected to update server)
- ✅ Native macOS integration
- ✅ Retina display support
- ✅ macOS menu bar integration

## 🔄 Auto-Updates

The app includes auto-update functionality:
- Checks for updates automatically on startup
- Downloads updates in the background
- Notifies you when updates are ready
- One-click update installation

## 📋 System Requirements

- macOS 10.15 (Catalina) or later
- 200MB free disk space
- Internet connection for updates

## 🛠️ For Developers

To build DMG installers on macOS:

```bash
# Install dependencies
npm install

# Build for macOS (creates both ZIP and DMG)
npm run build:mac

# Build specific architecture
npx electron-builder --mac --x64
npx electron-builder --mac --arm64
```

## 📞 Support

If you encounter issues:
1. Check System Preferences → Security & Privacy
2. Try right-clicking and selecting "Open"
3. Ensure you downloaded the correct architecture version
4. Contact support with your macOS version and Mac model

---

**Note**: For the best user experience on macOS, consider code-signing the app for distribution through the Mac App Store or direct download.
