# Assets Directory

This directory contains application assets such as icons and images.

## Required Icons

For proper distribution builds, you'll need to add the following icon files:

- `icon.png` - 512x512 PNG icon for Linux
- `icon.ico` - Windows ICO file (multiple sizes: 16, 32, 48, 256)
- `icon.icns` - macOS ICNS file (multiple sizes)

## Creating Icons

You can create these icons from a single high-resolution PNG (1024x1024 recommended) using tools like:

- **Online converters**: favicon.io, convertio.co
- **Command line**: ImageMagick, electron-icon-maker
- **Design tools**: GIMP, Photoshop, Figma

## Example Commands

Using ImageMagick to create icons from a source PNG:

```bash
# Create Windows ICO
convert icon-source.png -resize 256x256 icon.ico

# Create macOS ICNS (requires additional tools)
png2icns icon.icns icon-source.png

# Create Linux PNG
convert icon-source.png -resize 512x512 icon.png
```

## Automatic Icon Generation

You can also use electron-icon-maker:

```bash
npm install -g electron-icon-maker
electron-icon-maker --input=icon-source.png --output=./assets
```

This will generate all required icon formats automatically.
