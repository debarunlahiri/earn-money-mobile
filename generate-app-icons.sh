#!/bin/bash

# Generate app icons using Expo CLI
echo "Generating app icons for Property Lead Finder..."

# Check if logo file exists
if [ ! -f "./assets/logo/logo.jpg" ]; then
    echo "Error: Logo file not found at ./assets/logo/logo.jpg"
    echo "Please ensure the logo file exists before running this script."
    exit 1
fi

# Generate icons using Expo CLI
npx expo-cli generate-icons

echo "Icon generation complete!"
echo "The app icons have been generated for both Android and iOS."
echo "You may need to rebuild your app to see the changes:"
echo "  - For development: npx expo start --clear"
echo "  - For production: npx eas build --platform all"
