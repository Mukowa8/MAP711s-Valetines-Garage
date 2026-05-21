# Valentine Garage - Android Run Notes

This project is still an Expo React Native app, and it now also includes a generated `android/` folder so it can be opened in Android Studio.

## First time setup

Run this once from the project root:

```bash
npm install
```

## Run with Android Studio

1. Open Android Studio.
2. Choose **Open**.
3. Select the `android` folder inside this project.
4. Let Gradle sync finish.
5. Start an Android emulator or connect a physical Android phone with USB debugging enabled.
6. Press **Run**.

## Run from terminal

```bash
npm run android
```

## What changed

- Updated the GUI to a modern light garage-dashboard design.
- Updated app icon, adaptive icon, splash icon, and favicon in the `assets/` folder.
- Added Android package name: `com.valentinesgarage.app`.
- Added the generated `android/` project so Android Studio can open it.
- Kept the existing Expo/React Native dependencies; no new dependency was added.
