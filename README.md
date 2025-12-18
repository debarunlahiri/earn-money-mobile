# Earn Money Mobile

A React Native mobile application for managing property enquiries and transactions.

## Prerequisites

- Node.js >= 18
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

### Start the development server:

```bash
npm start
```

### Run on Android:

```bash
npm run android
```

### Run on iOS:

```bash
npm run ios
```

### Run on Web:

```bash
npm run web
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run the app on Android emulator/device
- `npm run ios` - Run the app on iOS simulator/device
- `npm run web` - Run the app in web browser
- `npm run lint` - Run ESLint for code quality checks
- `npm test` - Run Jest tests

## Tech Stack

- **React Native**: 0.73.0
- **React**: 18.2.0
- **Expo**: ~52.0.0
- **TypeScript**: 5.0.4
- **React Navigation**: 6.x

## Key Dependencies

- **@react-navigation/native** - Navigation library
- **@react-navigation/native-stack** - Native stack navigator
- **@react-navigation/bottom-tabs** - Bottom tab navigator
- **@react-native-async-storage/async-storage** - Local storage
- **react-native-vector-icons** - Icon library
- **expo-image-picker** - Image picker functionality
- **expo-linear-gradient** - Gradient support
- **react-native-document-picker** - Document picker functionality

## Project Structure

```
earn-money-mobile/
├── src/
│   ├── assets/          # Static assets
│   ├── components/      # Reusable components (Button, Card, FAB, Input)
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   ├── theme/           # Theme and styling
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── android/             # Android native code
├── assets/              # Root level assets
└── App.tsx              # App entry point
```

## Features

- User authentication (Login, Register, OTP Verification)
- Property enquiry management
- Add new enquiries
- View past enquiries
- Property form submission
- Status tracking
- Buy/Sell property selection
- Theme support (Light/Dark mode)

## Development

The app uses TypeScript for type safety and includes ESLint for code quality.

To check for linting errors:

```bash
npm run lint
```

## Building for Production

### Option 1: EAS Build (Recommended - Cloud Build)

This builds your APK on Expo's cloud servers, avoiding all local environment issues:

```bash
# Install EAS CLI globally if not installed
npm install -g eas-cli

# Login to Expo (if not already)
eas login

# Build APK using the "preview" profile
eas build --platform android --profile preview
```

This will take ~15-20 minutes but **it just works**. You'll get a download link when it's done.

> **Note:** The `preview` profile is configured in `eas.json` to output an APK. The `production` profile outputs an AAB (App Bundle) for Play Store.

---

### Option 2: Local Build (Clean Build)

If you prefer a local build, do a **complete clean** first to avoid cached issues:

```bash
# Step 1: Clean everything
rm -rf node_modules
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build

# Step 2: Reinstall dependencies
npm install

# Step 3: Regenerate the native android folder using Expo prebuild
npx expo prebuild --clean --platform android

# Step 4: Build the APK
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

### iOS:

```bash
cd ios
xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -configuration Release
```

Or use EAS Build:

```bash
eas build --platform ios --profile preview
```

## License

Private
