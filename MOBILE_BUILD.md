# Building APK for Mobile

This guide explains how to package the Mobile 3D Viewer as a native Android APK.

## Option 1: Using Capacitor (Recommended)

Capacitor allows you to wrap your web app as a native mobile app.

### Setup Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init mobile-3d-viewer com.threejs.viewer
```

### Build Web App

```bash
npm run build
```

### Add Android Platform

```bash
npx cap add android
```

### Build APK

```bash
cd android
./gradlew assembleDebug
```

The APK will be available at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build

```bash
cd android
./gradlew assembleRelease
```

## Option 2: Using Cordova

```bash
npm install -g cordova
cordova create mobile-3d-viewer-app com.threejs.viewer "Mobile 3D Viewer"
cd mobile-3d-viewer-app
cordova platform add android
cordova build android
```

## Option 3: React Native with Expo

For better mobile integration:

```bash
npm install -g eas-cli
npx create-expo-app mobile-3d-viewer-app
eas build --platform android
```

## GitHub Actions Workflow

See `.github/workflows/build-apk.yml` for automated APK builds.

Trigger builds by:
1. Pushing to main branch
2. Creating a release
3. Manually via GitHub Actions UI

## Android Requirements

- Android 8.0 (API 26) or higher
- OpenGL ES 3.0 support
- Minimum 2GB RAM
- 100MB free storage

## App Signing

Before publishing to Google Play Store:

1. Generate keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

2. Configure signing in `android/app/build.gradle`

3. Build signed APK:
```bash
cd android
./gradlew assembleRelease
```

## Testing APK

```bash
adb install app-debug.apk
adb shell am start -n com.threejs.viewer/.MainActivity
```

## Troubleshooting

- **WebGL not supported**: Ensure target device has OpenGL ES 3.0
- **Large APK size**: Enable ProGuard minification in release builds
- **Performance issues**: Profile with Chrome DevTools via `chrome://inspect`

## References

- [Capacitor Documentation](https://capacitorjs.com)
- [Android Studio Guide](https://developer.android.com/studio)
- [Three.js WebGL Requirements](https://threejs.org)
