#!/bin/bash

# Icon generation script for Property Lead Finder
# This script creates all required icon sizes from the source logo

SOURCE_LOGO="./assets/logo/logo.jpg"
ANDROID_DIR="./android/app/src/main/res/"
IOS_DIR="./ios/PropertyLeadFinder/Images.xcassets/AppIcon.appiconset/"

# Create directories if they don't exist
mkdir -p "$ANDROID_DIR/mipmap-hdpi"
mkdir -p "$ANDROID_DIR/mipmap-mdpi"
mkdir -p "$ANDROID_DIR/mipmap-xhdpi"
mkdir -p "$ANDROID_DIR/mipmap-xxhdpi"
mkdir -p "$ANDROID_DIR/mipmap-xxxhdpi"
mkdir -p "$IOS_DIR"

echo "Generating Android icons..."

# Android mipmap icons (adaptive icons use foregroundImage)
convert "$SOURCE_LOGO" -resize 36x36 "$ANDROID_DIR/mipmap-mdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 48x48 "$ANDROID_DIR/mipmap-hdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 72x72 "$ANDROID_DIR/mipmap-xhdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 96x96 "$ANDROID_DIR/mipmap-xxhdpi/ic_launcher.png"
convert "$SOURCE_LOGO" -resize 144x144 "$ANDROID_DIR/mipmap-xxxhdpi/ic_launcher.png"

echo "Generating iOS icons..."

# iOS icons (different sizes required)
convert "$SOURCE_LOGO" -resize 57x57 "$IOS_DIR/icon.png"
convert "$SOURCE_LOGO" -resize 114x114 "$IOS_DIR/icon@2x.png"
convert "$SOURCE_LOGO" -resize 20x20 "$IOS_DIR/icon-20.png"
convert "$SOURCE_LOGO" -resize 40x40 "$IOS_DIR/icon-20@2x.png"
convert "$SOURCE_LOGO" -resize 60x60 "$IOS_DIR/icon-20@3x.png"
convert "$SOURCE_LOGO" -resize 29x29 "$IOS_DIR/icon-29.png"
convert "$SOURCE_LOGO" -resize 58x58 "$IOS_DIR/icon-29@2x.png"
convert "$SOURCE_LOGO" -resize 87x87 "$IOS_DIR/icon-29@3x.png"
convert "$SOURCE_LOGO" -resize 40x40 "$IOS_DIR/icon-40.png"
convert "$SOURCE_LOGO" -resize 80x80 "$IOS_DIR/icon-40@2x.png"
convert "$SOURCE_LOGO" -resize 120x120 "$IOS_DIR/icon-40@3x.png"
convert "$SOURCE_LOGO" -resize 50x50 "$IOS_DIR/icon-50.png"
convert "$SOURCE_LOGO" -resize 100x100 "$IOS_DIR/icon-50@2x.png"
convert "$SOURCE_LOGO" -resize 512x512 "$IOS_DIR/icon-512@2x.png"

echo "Creating iOS Contents.json..."

# Create iOS Contents.json
cat > "$IOS_DIR/Contents.json" << EOF
{
  "images" : [
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20",
      "filename" : "icon-20@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20",
      "filename" : "icon-20@3x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29",
      "filename" : "icon-29@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29",
      "filename" : "icon-29@3x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40",
      "filename" : "icon-40@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40",
      "filename" : "icon-40@3x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "50x50",
      "filename" : "icon-50@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "57x57",
      "filename" : "icon@2x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60",
      "filename" : "icon-20@3x.png"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "512x512",
      "filename" : "icon-512@2x.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "20x20",
      "filename" : "icon-20.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "20x20",
      "filename" : "icon-20@2x.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "29x29",
      "filename" : "icon-29.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "29x29",
      "filename" : "icon-29@2x.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "40x40",
      "filename" : "icon-40.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "40x40",
      "filename" : "icon-40@2x.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "50x50",
      "filename" : "icon-50@2x.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "76x76",
      "filename" : "icon-76@2x.png"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "83.5x83.5",
      "filename" : "icon-83.5@2x.png"
    },
    {
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024",
      "filename" : "icon-1024.png"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "Icon generation complete!"
echo "Please rebuild your app to see the new icons."
